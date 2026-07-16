const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Word = require('../models/Word');
const geminiService = require('../services/geminiService');

const upload = multer({ storage: multer.memoryStorage() });

// GET all words (with optional filter query params)
router.get('/', async (req, res) => {
  try {
    const { search, partOfSpeech, status } = req.query;
    let query = {};

    if (search) {
      query.word = { $regex: search, $options: 'i' };
    }
    if (partOfSpeech) {
      query.partOfSpeech = partOfSpeech;
    }
    if (status) {
      query.status = status;
    }

    const words = await Word.find(query).sort({ createdAt: -1 });
    res.json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET lookup/search for a word in the dictionary (Gemini API fallback)
router.get('/lookup/:word', async (req, res) => {
  const wordParam = req.params.word.trim();
  try {
    // 1. Check if word already exists in the local database
    const localMatch = await Word.findOne({ word: { $regex: `^${wordParam}$`, $options: 'i' } });
    if (localMatch) {
      // Return with a flag indicating it is already in library
      const matchedObj = localMatch.toObject();
      matchedObj.alreadyInLibrary = true;
      return res.json(matchedObj);
    }

    // 2. Fetch rich details from Gemini API
    console.log(`Generating rich vocabulary entry for: ${wordParam}`);
    const richDetails = await geminiService.getRichWordDetails(wordParam);

    // Add default values for library status
    richDetails.alreadyInLibrary = false;
    richDetails.status = 'learning';
    richDetails.starred = false;
    richDetails.imageUrl = '';

    res.json(richDetails);
  } catch (error) {
    res.status(500).json({ message: 'Failed to lookup word: ' + error.message });
  }
});

// POST a new word
router.post('/', async (req, res) => {
  try {
    const existing = await Word.findOne({ word: { $regex: `^${req.body.word.trim()}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ message: 'Word already exists in library' });
    }

    const wordData = { ...req.body, imageUrl: '' };
    const newWord = new Word(wordData);
    const savedWord = await newWord.save();
    res.status(201).json(savedWord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST bulk upload / import words
router.post('/bulk', async (req, res) => {
  const wordsList = req.body;
  if (!Array.isArray(wordsList)) {
    return res.status(400).json({ message: 'Request body must be an array of words' });
  }

  try {
    const results = [];
    for (const item of wordsList) {
      if (!item.word || !item.definition || !item.partOfSpeech) continue;

      const updated = await Word.findOneAndUpdate(
        { word: { $regex: `^${item.word.trim()}$`, $options: 'i' } },
        { $set: item },
        { upsert: true, new: true }
      );
      results.push(updated);
    }
    res.json({ message: `Successfully processed ${results.length} words`, count: results.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update a word by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedWord = await Word.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedWord) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json(updatedWord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE all words
router.delete('/', async (req, res) => {
  try {
    await Word.deleteMany({});
    res.json({ message: 'All vocabulary library words deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a word by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedWord = await Word.findByIdAndDelete(req.params.id);
    if (!deletedWord) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const https = require('https');

// Helper to fetch definition from public dictionary API
function getPublicDefinition(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      timeout: 3000
    };
    const req = https.get(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const data = JSON.parse(body);
            if (data && data[0] && data[0].meanings && data[0].meanings[0] && data[0].meanings[0].definitions && data[0].meanings[0].definitions[0]) {
              resolve(data[0].meanings[0].definitions[0].definition);
              return;
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

// GET quick meaning for hover tooltip
router.get('/quick-meaning/:word', async (req, res) => {
  const targetWord = req.params.word.trim();
  try {
    // 1. Check local database
    const localMatch = await Word.findOne({ word: { $regex: `^${targetWord}$`, $options: 'i' } });
    if (localMatch) {
      return res.json({ definition: localMatch.definition });
    }

    // 2. Fetch from public API
    const publicDef = await getPublicDefinition(targetWord);
    if (publicDef) {
      return res.json({ definition: publicDef });
    }

    // 3. Fallback: Fetch a single sentence definition using Gemini
    try {
      const geminiDef = await geminiService.getQuickDefinition(targetWord);
      if (geminiDef) {
        return res.json({ definition: geminiDef });
      }
    } catch (err) {
      console.error('Gemini quick definition fallback failed:', err);
    }

    res.json({ definition: 'Quick definition not found.' });
  } catch (error) {
    res.json({ definition: 'Quick definition not available.' });
  }
});

// POST generate reading comprehension passage
router.post('/generate-comprehension', async (req, res) => {
  const { topicOrText, difficulty } = req.body;
  if (!topicOrText || !topicOrText.trim()) {
    return res.status(400).json({ message: 'topicOrText is required' });
  }

  try {
    const comprehension = await geminiService.getReadingComprehension(topicOrText, difficulty || 'Hard');
    res.json(comprehension);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate reading comprehension: ' + error.message });
  }
});

// GET generate daily task
router.get('/daily-task', async (req, res) => {
  const { date, dayIndex } = req.query;
  const parsedDayIndex = dayIndex !== undefined ? parseInt(dayIndex) : new Date().getDay();
  const todayStr = date || new Date().toISOString().slice(0, 10);

  try {
    // 1. Get all words from database
    const allWords = await Word.find({});
    if (!allWords || allWords.length < 10) {
      return res.status(400).json({ message: 'Not enough words in library' });
    }

    // 2. Select 20 words with balanced difficulties (5 per tier if possible)
    const getTier = (diff) => {
      const d = (diff || 'B2').toUpperCase();
      if (d.includes('C2')) return 4;
      if (d.includes('C1')) return 3;
      if (d.includes('B2')) return 2;
      return 1; // B1, A2, A1
    };

    const wordsByTier = { 1: [], 2: [], 3: [], 4: [] };
    allWords.forEach(w => {
      const tier = getTier(w.difficulty);
      wordsByTier[tier].push(w);
    });

    const getSeededRandom = (seedStr) => {
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      return () => {
        hash = (hash * 16807) % 2147483647;
        return (hash - 1) / 2147483646;
      };
    };

    const rand = getSeededRandom(todayStr);
    const shuffle = (arr) => {
      const newArr = [...arr];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    const shuffledTiers = {
      1: shuffle(wordsByTier[1]),
      2: shuffle(wordsByTier[2]),
      3: shuffle(wordsByTier[3]),
      4: shuffle(wordsByTier[4])
    };

    let targetWords = [];
    const targetCounts = { 1: 5, 2: 5, 3: 5, 4: 5 };
    Object.keys(targetCounts).forEach(tier => {
      const count = targetCounts[tier];
      const pulled = shuffledTiers[tier].splice(0, count);
      targetWords = targetWords.concat(pulled);
    });

    let allRemaining = [];
    Object.keys(shuffledTiers).forEach(tier => {
      allRemaining = allRemaining.concat(shuffledTiers[tier]);
    });
    const shuffledRemaining = shuffle(allRemaining);

    while (targetWords.length < 20 && shuffledRemaining.length > 0) {
      targetWords.push(shuffledRemaining.pop());
    }

    if (targetWords.length < 10) {
      targetWords = allWords.slice(0, 10);
    }

    // 3. Determine archetype (Forced to Vocabulary-in-Context 'vic' for high-difficulty context challenges)
    let archetype = 'vic';

    // 4. Call geminiService to generate questions
    console.log(`Generating Gemini daily task questions of type "${archetype}" (pool: ${targetWords.length} words) for date: ${todayStr}`);
    const questions = await geminiService.getGeminiDailyTask(targetWords, archetype, allWords);

    // 5. Attach word details (difficulty and original CEFR level) to each question
    const targetWordsMap = {};
    targetWords.forEach(w => {
      targetWordsMap[w.word.toLowerCase()] = {
        difficulty: w.difficulty || 'B2',
        tier: getTier(w.difficulty)
      };
    });

    questions.forEach(q => {
      const details = targetWordsMap[q.word.toLowerCase()] || { difficulty: 'B2', tier: 2 };
      q.difficulty = details.difficulty;
      q.tier = details.tier;
    });

    res.json({ questions });
  } catch (error) {
    console.error('Failed to generate Gemini daily task:', error.message);
    res.status(500).json({ message: 'Failed to generate daily task: ' + error.message });
  }
});

// POST parse words from a PDF file
router.post('/parse-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Uploaded file must be a PDF' });
    }

    const base64Data = req.file.buffer.toString('base64');

    // Extract words from PDF using Gemini multimodal vision/OCR
    const wordsArray = await geminiService.extractWordsFromPdf(base64Data);

    console.log(`Extracted ${wordsArray.length} unique words from PDF using Gemini OCR.`);
    res.json({ words: wordsArray });

  } catch (error) {
    console.error('Error parsing PDF with Gemini:', error);
    res.status(500).json({ message: 'Failed to parse PDF file: ' + error.message });
  }
});

module.exports = router;


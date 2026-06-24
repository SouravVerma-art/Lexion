const express = require('express');
const router = express.Router();
const Word = require('../models/Word');

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

// POST a new word
router.post('/', async (req, res) => {
  try {
    // Check if word already exists to avoid duplication errors
    const existing = await Word.findOne({ word: { $regex: `^${req.body.word.trim()}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ message: 'Word already exists in library' });
    }

    const newWord = new Word(req.body);
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

module.exports = router;

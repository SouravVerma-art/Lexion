const https = require('https');

function postRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse response body as JSON: ' + body));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function queryGeminiModel(word, modelName, apiKey) {
  const prompt = `You are a professional academic lexicographer.
Validate the input string: "${word}".
If "${word}" is not a real English word, is a random string of characters (e.g. keyboard smash like "gkwhjei", "asdfgh"), or is completely meaningless gibberish, you MUST return ONLY a JSON object with this exact error property:
{
  "error": "Word not found",
  "invalid": true
}

Otherwise, if it is a real English word or a common established academic/scientific term, generate a comprehensive vocabulary dictionary entry for it.
Return ONLY a valid JSON object matching this schema:
{
  "word": "${word}",
  "partOfSpeech": "adjective/noun/verb/adverb/etc.",
  "definition": "Detailed, clear definition of the word.",
  "difficulty": "CEFR Level: A1, A2, B1, B2, C1, or C2",
  "pronunciation": "Syllable phonics guide and the IPA phonetic transcription separated by ' - ' (e.g. prag-MAT-ik - /præɡˈmæt.ɪk/)",
  "frequency": 1 to 5,
  "context": "Short summary statement of usage context.",
  "rootOrigin": "Etymological root and origin description.",
  "wordFamily": [{"word": "derivative word", "partOfSpeech": "derivative POS"}],
  "collocations": ["collocation 1", "collocation 2", "collocation 3"],
  "synonyms": ["synonym 1", "synonym 2", "synonym 3"],
  "antonyms": ["antonym 1", "antonym 2", "antonym 3"],
  "examples": ["detailed sentence 1", "detailed sentence 2"],
  "imageUrl": "Provide a high-quality visual association image URL from Unsplash. For example, for 'pragmatic' you could use 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80'. Make sure it's a real, accessible photo URL representing the concept.",
  "memoryTrick": "A creative memory trick or mnemonic to remember this word.",
  "commonMistake": "Common mistake or confusion with other words."
}
Return ONLY the raw JSON string. Do not include markdown code block formatting (like \`\`\`json).`;

  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  const response = await postRequest(url, payload);

  if (response.error) {
    throw new Error(`Gemini API Error: ${response.error.message} (Status: ${response.error.status}, Code: ${response.error.code})`);
  }

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Gemini API returned no candidates.');
  }

  let resultText = response.candidates[0].content.parts[0].text.trim();

  const startIdx = resultText.indexOf('{');
  const endIdx = resultText.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Failed to locate JSON object boundaries. Output: ' + resultText);
  }

  const jsonString = resultText.substring(startIdx, endIdx + 1);
  const parsed = JSON.parse(jsonString);
  if (parsed.error || parsed.invalid) {
    throw new Error(`Word "${word}" was not found in the dictionary. Please check your spelling.`);
  }
  return parsed;
}

async function queryGeminiQuickDef(word, modelName, apiKey) {
  const prompt = `Explain the meaning of the word or phrase "${word}" in one clear, concise sentence (maximum 15 words) for a vocabulary learner. Return ONLY the explanation text, without any introductory words, quotes, or markdown format.`;

  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  const response = await postRequest(url, payload);

  if (response.error) {
    throw new Error(`Gemini API Error: ${response.error.message}`);
  }

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Gemini API returned no candidates.');
  }

  return response.candidates[0].content.parts[0].text.trim().replace(/^["']|["']$/g, '');
}

async function getQuickDefinition(word) {
  const apiKeyRaw = process.env.GEMINI_PASSAGE_API_KEY || process.env.GEMINI_API_KEY || "";
  const apiKey = apiKeyRaw.replace(/^["']|["']$/g, '').trim();
  if (!apiKey || apiKey.startsWith('AQ') || apiKey.length < 15) {
    throw new Error('Valid Gemini API Key not found in environment variables.');
  }

  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Attempting quick definition generation for "${word}" using model: ${model}`);
      const def = await queryGeminiQuickDef(word, model, apiKey);
      if (def) return def;
    } catch (error) {
      console.warn(`Model ${model} quick definition failed: ${error.message}`);
      lastError = error;
    }
  }

  throw lastError || new Error('All models failed to generate quick definition.');
}

async function getRichWordDetails(word) {
  const apiKeyRaw = process.env.GEMINI_PASSAGE_API_KEY || process.env.GEMINI_API_KEY || "";
  const apiKey = apiKeyRaw.replace(/^["']|["']$/g, '').trim();
  if (!apiKey || apiKey.startsWith('AQ') || apiKey.length < 15) {
    throw new Error('Valid Gemini API Key not found in environment variables.');
  }

  // Iterate over supported models as fallback options if quota/limits are hit
  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Attempting dictionary generation for "${word}" using model: ${model}`);
      const data = await queryGeminiModel(word, model, apiKey);
      return data;
    } catch (error) {
      console.warn(`Model ${model} failed: ${error.message}`);
      lastError = error;
      // Continue to try the next model
    }
  }

  // If all models failed, throw the last error
  throw lastError;
}

async function queryGeminiComprehension(topicOrText, difficulty, modelName, apiKey) {
  let styleInstruction = "";
  if (difficulty === 'Very Hard') {
    styleInstruction = "The reading passage must be written in an extremely dense, academic research paper style (e.g., from advanced epistemology, theoretical physics, cognitive linguistics, or neurobiology) with highly complex, multi-clause sentences, and challenging abstractions.";
  } else if (difficulty === 'Impossible') {
    styleInstruction = "The reading passage must be intellectually punishing, dense, and highly convoluted (resembling deep philosophical treaties like Kant or Hegel, advanced quantum metaphysics, or high-level mathematical theory). The vocabulary must be extremely sophisticated, and the multiple-choice questions must test extremely subtle logical inferences, nuanced arguments, or minute details, making them incredibly difficult or nearly impossible to answer without multiple slow readings.";
  } else if (difficulty === 'Easy') {
    styleInstruction = "The reading passage should be written in a simple, straightforward academic style suitable for early high-school or beginner English learners, using clear sentence structures and accessible vocabulary.";
  } else if (difficulty === 'Medium') {
    styleInstruction = "The reading passage should be written in a standard academic/news style suitable for general college-level or SAT reading, with moderate vocabulary complexity and clear arguments.";
  } else {
    // Default to 'Hard'
    styleInstruction = "The reading passage must be in a challenging academic style suitable for advanced GRE, GMAT, or SAT reading exams, employing sophisticated vocabulary and complex sentence structures.";
  }

  const prompt = `You are a professional academic examiner. Generate a reading comprehension exercise based on this topic or text: "${topicOrText}".
Toughness Level constraint: "${difficulty}".
Style Requirement: ${styleInstruction}

The exercise must contain a title, a topic, a difficulty level (exactly "${difficulty}"), a reading passage of 2-3 paragraphs (approx 200-350 words total), and 3 multiple-choice questions about the passage.
Return ONLY a valid JSON object matching this schema:
{
  "title": "Passage Title",
  "topic": "Topic Name",
  "difficulty": "${difficulty}",
  "paragraphs": [
    "Paragraph 1 text...",
    "Paragraph 2 text...",
    "Paragraph 3 text..."
  ],
  "questions": [
    {
      "text": "Question 1 text?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why Option A is correct."
    },
    {
      "text": "Question 2 text?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctIndex": 1,
      "explanation": "Detailed explanation of why Option B is correct."
    },
    {
      "text": "Question 3 text?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctIndex": 2,
      "explanation": "Detailed explanation of why Option C is correct."
    }
  ]
}
Return ONLY the raw JSON string. Do not include markdown code block formatting (like \`\`\`json).`;

  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  const response = await postRequest(url, payload);

  if (response.error) {
    throw new Error(`Gemini API Error: ${response.error.message} (Status: ${response.error.status}, Code: ${response.error.code})`);
  }

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Gemini API returned no candidates.');
  }

  let resultText = response.candidates[0].content.parts[0].text.trim();

  const startIdx = resultText.indexOf('{');
  const endIdx = resultText.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Failed to locate JSON object boundaries. Output: ' + resultText);
  }

  const jsonString = resultText.substring(startIdx, endIdx + 1);
  return JSON.parse(jsonString);
}

function generateLocalFallbackPassage(topic, difficulty = 'Hard') {
  const cleanTopic = topic.trim();

  let paragraphs = [];
  let questions = [];

  const lowerTopic = cleanTopic.toLowerCase();

  // Custom text complexity based on difficulty
  let complexityPrefix = "";
  let complexitySuffix = "";
  if (difficulty === 'Very Hard') {
    complexityPrefix = "Within the epistemological paradigms of contemporary academic inquiry, ";
    complexitySuffix = " This dynamic necessitates a profound hermeneutic analysis of nested systemic variables, thereby complicating any simplistic reductionist interpretations.";
  } else if (difficulty === 'Impossible') {
    complexityPrefix = "Manifesting as a hyper-dense nexus of transcendental metaphysics and complex systemic recursion, ";
    complexitySuffix = " Consequently, the ontological state of this phenomenon resides at the absolute periphery of cognitive comprehensibility, demanding a multi-layered heuristic synthesis to decouple its dialectical structures.";
  }

  if (lowerTopic.includes('egypt') || lowerTopic.includes('history') || lowerTopic.includes('rome') || lowerTopic.includes('renaissance') || lowerTopic.includes('war') || lowerTopic.includes('revolution')) {
    paragraphs = [
      `${complexityPrefix}The historical evolution of ${cleanTopic} represents a pivotal chapter in human civilization. From its early origins to its golden age, the cultural, social, and political systems established during this era laid the groundwork for future societies. Historians analyze these structures to understand how governance, art, and daily life adapted to changing environments and external pressures.${complexitySuffix}`,
      `Key monuments, artifacts, and written records from the time of ${cleanTopic} provide invaluable insights into the values of its people. Despite centuries of research, many questions remain unanswered, sparking ongoing debates among archaeological communities. The legacy of this period continues to influence modern architecture, legal philosophy, and artistic expression.`
    ];
    questions = [
      {
        text: `What is the primary focus of the passage regarding ${cleanTopic}?`,
        options: [
          "The military tactics and expansion strategies.",
          "The historical evolution and lasting cultural legacy.",
          "A comparison with modern industrial economies.",
          "The biographies of specific historical rulers."
        ],
        correctIndex: 1,
        explanation: `The passage explores the historical evolution, social structures, and enduring legacy of ${cleanTopic}.`
      },
      {
        text: "What continues to spark debates among archaeologists?",
        options: [
          "Whether the era actually existed.",
          "Unresolved questions despite centuries of research and records.",
          "The exact names of all citizens of the period.",
          "The cost of building ancient monuments."
        ],
        correctIndex: 1,
        explanation: "The text states that 'despite centuries of research, many questions remain unanswered, sparking ongoing debates'."
      }
    ];
  } else if (lowerTopic.includes('quantum') || lowerTopic.includes('computer') || lowerTopic.includes('tech') || lowerTopic.includes('ai') || lowerTopic.includes('physics') || lowerTopic.includes('science') || lowerTopic.includes('space') || lowerTopic.includes('energy')) {
    paragraphs = [
      `${complexityPrefix}The emergence of ${cleanTopic} has revolutionized the scientific landscape, challenging classical concepts and enabling new technological paradigms. By manipulating fundamental properties and utilizing advanced computational algorithms, researchers have unlocked capabilities that were once considered theoretical limits. This field sits at the intersection of advanced mathematics, engineering, and physical sciences.${complexitySuffix}`,
      `In practical terms, the applications of ${cleanTopic} are expanding rapidly, from secure communications to complex data modeling. However, significant engineering bottlenecks and scalability challenges must be overcome before widespread commercialization is realized. Collaborative research efforts globally are focused on stabilizing these systems to achieve a reliable operational framework.`
    ];
    questions = [
      {
        text: `According to the passage, what has ${cleanTopic} challenged?`,
        options: [
          "Classical scientific concepts.",
          "The need for research funding.",
          "The laws of thermodynamics.",
          "Modern political systems."
        ],
        correctIndex: 0,
        explanation: `The first sentence states that the emergence of ${cleanTopic} has 'challenged classical concepts'.`
      },
      {
        text: "What must be achieved before widespread commercialization can occur?",
        options: [
          "The complete elimination of physical computing systems.",
          "Overcoming engineering bottlenecks and stabilizing systems.",
          "A global consensus on spelling standards.",
          "The development of new mineral extraction methods."
        ],
        correctIndex: 1,
        explanation: "The passage notes that 'significant engineering bottlenecks and scalability challenges must be overcome before widespread commercialization is realized'."
      }
    ];
  } else {
    // General default template
    paragraphs = [
      `${complexityPrefix}The study of ${cleanTopic} has emerged as an essential area of modern inquiry, bridging theoretical frameworks with real-world applications. By investigating its core components and underlying principles, researchers are able to explain complex systems and predict future developments. Understanding this subject requires a multidisciplinary approach that integrates historical perspectives with empirical data.${complexitySuffix}`,
      `As interest in ${cleanTopic} continues to grow, practitioners face new challenges regarding implementation and public awareness. Solving these issues requires collaborative partnerships across academic, industrial, and public sectors. The future of ${cleanTopic} holds immense promise, with the potential to drive innovation and address pressing societal challenges in the coming years.`
    ];
    questions = [
      {
        text: `Which of the following best states the main idea of the passage?`,
        options: [
          `The historical decline of interest in ${cleanTopic}.`,
          `The growing importance, challenges, and future potential of ${cleanTopic}.`,
          `A step-by-step tutorial on how to practice ${cleanTopic}.`,
          "A collection of statistical anomalies in modern research."
        ],
        correctIndex: 1,
        explanation: `The passage outlines the rise, key principles, current implementation challenges, and future promise of ${cleanTopic}.`
      },
      {
        text: `What is required to address implementation challenges in ${cleanTopic}?`,
        options: [
          "Isolating researchers from external industries.",
          "Collaborative partnerships across academic, industrial, and public sectors.",
          "A complete redesign of classical mathematics.",
          "Reducing public interest in the subject."
        ],
        correctIndex: 1,
        explanation: "The text notes that addressing these issues 'requires collaborative partnerships across academic, industrial, and public sectors'."
      }
    ];
  }

  return {
    title: `Exploring the Wonders of ${cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1)} (${difficulty})`,
    topic: cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1),
    difficulty: difficulty,
    paragraphs,
    questions
  };
}

async function getReadingComprehension(topicOrText, difficulty = 'Hard') {
  // Prioritize GEMINI_PASSAGE_API_KEY, fallback to GEMINI_API_KEY
  const apiKeyRaw = process.env.GEMINI_PASSAGE_API_KEY || process.env.GEMINI_API_KEY || "";
  // Strip quotes if they were loaded literally
  const apiKey = apiKeyRaw.replace(/^["']|["']$/g, '').trim();

  // If apiKey is missing or placeholder/dummy, bypass and return local generator directly
  if (!apiKey || apiKey.startsWith('AQ') || apiKey.length < 15) {
    console.log("Gemini API key is placeholder or missing. Triggering local fallback generator immediately.");
    return generateLocalFallbackPassage(topicOrText, difficulty);
  }

  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Attempting reading comprehension generation for "${topicOrText}" (${difficulty}) using model: ${model}`);
      const data = await queryGeminiComprehension(topicOrText, difficulty, model, apiKey);
      return data;
    } catch (error) {
      console.warn(`Model ${model} failed to generate comprehension: ${error.message}`);
      lastError = error;
    }
  }

  console.warn("All Gemini models failed. Triggering local fallback generator.");
  return generateLocalFallbackPassage(topicOrText, difficulty);
}

async function queryGeminiDailyTask(targetWords, archetype, allWords, modelName, apiKey) {
  let prompt = "";

  if (archetype === 'vic') {
    prompt = `You are a ruthless GRE/GMAT Standard English Conventions examiner known for writing the hardest questions on the exam.
Generate a daily Grammar & Logic Sentence Completion challenge at VERY HARD, mind-bending difficulty.
For each of the following ${targetWords.length} words, create a sentence completion question where the sentence has a blank ("_______") and the user must choose the word that grammatically and logically fits the blank based on syntax and context clues.

List of words:
${targetWords.map((w, i) => `${i + 1}. Word: "${w.word}", POS: "${w.partOfSpeech}", Definition: "${w.definition}"`).join('\n')}

Each question must match this JSON schema:
{
  "archetype": "vic",
  "word": "target_word_here",
  "correctAnswer": "The correct target word itself (exactly one word).",
  "options": ["word_1", "word_2", "word_3", "word_4"],
  "title": "Question X of X: Sentence Completion",
  "sentence": "The sentence with the target word replaced by '_______' (e.g., 'The professor's remarks were so _______ that students left the lecture more confused than enlightened.')."
}

Difficulty requirements:
1. Sentences must be long (25-40 words), dense, multi-clause, with subtle contrast, concession, or cause/effect logic that requires careful parsing, not a quick skim.
2. The 'options' array must consist of exactly 4 single-word choices (no phrases, no clauses). One is the correct target word. The other 3 must be near-synonyms or words that fit grammatically but subtly violate the sentence's logic, so guessing without reading closely leads to a wrong answer.
3. Avoid simple, obvious clue words; bury the logical signal inside subordinate clauses.
Return ONLY a valid JSON array of these ${targetWords.length} question objects. Do not include markdown code block formatting (like \`\`\`json).`;
  } else if (archetype === 'crypt') {
    prompt = `You are a professional lexicographer who writes deliberately tricky riddles.
Generate a daily Crypt Clue vocabulary challenge at VERY HARD difficulty.
For each of the following 10 words:
${targetWords.map((w, i) => `${i + 1}. Word: "${w.word}", POS: "${w.partOfSpeech}", Pronunciation: "${w.pronunciation}", Context: "${w.context}", Definition: "${w.definition}"`).join('\n')}

Generate exactly 10 questions. Each question MUST match this JSON schema:
{
  "archetype": "crypt",
  "word": "target_word_here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "title": "Question X of 10: Crypt Clue",
  "clues": [
    "Blueprint Clue: It is a [partOfSpeech]. Pronunciation: [pronunciation]",
    "Vibe Clue: An oblique, cryptic clue hinting at usage context/connotation without giving it away directly.",
    "Definition Clue: A deliberately abstract paraphrase of the definition, avoiding the most common keywords, so it takes real thought to connect it to the word."
  ]
}

Difficulty requirements: the 3 distractor options must be plausible, high-level words in the same semantic neighborhood as the target word, so the clues (not elimination by absurdity) must do the work.
Return ONLY a valid JSON array of these 10 question objects. Do not include markdown code block formatting (like \`\`\`json).`;
  } else if (archetype === 'weaver') {
    prompt = `You are an academic vocabulary teacher who designs challenging exercises.
Generate a Sentence Weaver challenge at VERY HARD difficulty.
For each of the following 10 words, pair them into 10 questions. For each question, pair the word at index i with the word at index (i+1)%10.
List of words:
${targetWords.map((w, i) => `${i + 1}. Word: "${w.word}", Definition: "${w.definition}"`).join('\n')}

Each question MUST match this JSON schema:
{
  "archetype": "weaver",
  "words": ["word_1", "word_2"],
  "title": "Question X of 10: Sentence Weaver",
  "requirements": [
    "Word 1: word_1 (first 50 characters of word_1 definition...)",
    "Word 2: word_2 (first 50 characters of word_2 definition...)"
  ]
}
Difficulty requirement: pick word pairs whose meanings are hard to reconcile in one coherent, logically sound sentence, forcing the user to think carefully about how the two concepts relate.
Return ONLY a valid JSON array of these 10 question objects. Do not include markdown code block formatting (like \`\`\`json).`;
  } else if (archetype === 'blitz') {
    prompt = `You are a vocabulary game developer who designs unforgiving challenges.
Generate a Blitz Speed Match challenge at VERY HARD difficulty.
Split the following 10 words into two rounds of 5 words each:
Round 1 words: ${targetWords.slice(0, 5).map(w => w.word).join(', ')}
Round 2 words: ${targetWords.slice(5, 10).map(w => w.word).join(', ')}

For each round, generate a matching question. The output MUST be a JSON array of exactly 2 objects (representing Round 1 and Round 2) matching this JSON schema:
[
  {
    "archetype": "blitz",
    "title": "Round 1 of Blitz Speed Match",
    "leftWords": ["word1", "word2", "word3", "word4", "word5"],
    "rightWords": ["def1", "def2", "def3", "def4", "def5"],
    "correctPairs": {
      "word1": "def1",
      "word2": "def2",
      "word3": "def3",
      "word4": "def4",
      "word5": "def5"
    }
  },
  {
    "archetype": "blitz",
    "title": "Round 2 of Blitz Speed Match",
    "leftWords": ["word6", "word7", "word8", "word9", "word10"],
    "rightWords": ["def6", "def7", "def8", "def9", "def10"],
    "correctPairs": {
      "word6": "def6",
      "word7": "def7",
      "word8": "def8",
      "word9": "def9",
      "word10": "def10"
    }
  }
]

Difficulty requirement: write each definition (max 55 characters) in a terse, abstract way that avoids obvious keyword overlap with the word itself, so matching requires real understanding, not surface pattern-matching.
Note that:
- 'leftWords' must be a shuffled array of the 5 words for that round.
- 'rightWords' must be a shuffled array of the 5 definitions (each max 55 characters) for that round.
- 'correctPairs' must be a key-value mapping linking the correct word (key) to its corresponding correct definition (value).
Return ONLY the raw JSON array. Do not include markdown code block formatting (like \`\`\`json).`;
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  const response = await postRequest(url, payload);

  if (response.error) {
    throw new Error(`Gemini API Error: ${response.error.message} (Status: ${response.error.status}, Code: ${response.error.code})`);
  }

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Gemini API returned no candidates.');
  }

  let resultText = response.candidates[0].content.parts[0].text.trim();

  const startIdx = resultText.indexOf('[');
  const endIdx = resultText.lastIndexOf(']');

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Failed to locate JSON array boundaries. Output: ' + resultText);
  }

  const jsonString = resultText.substring(startIdx, endIdx + 1);
  return JSON.parse(jsonString);
}

async function getGeminiDailyTask(targetWords, archetype, allWords) {
  const apiKeyRaw = process.env.GEMINI_PASSAGE_API_KEY || process.env.GEMINI_API_KEY || "";
  const apiKey = apiKeyRaw.replace(/^["']|["']$/g, '').trim();

  if (!apiKey || apiKey.startsWith('AQ') || apiKey.length < 15) {
    throw new Error('Valid Gemini API Key not found in environment variables.');
  }

  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Attempting daily task generation using model: ${model}`);
      const data = await queryGeminiDailyTask(targetWords, archetype, allWords, model, apiKey);
      return data;
    } catch (error) {
      console.warn(`Model ${model} failed daily task generation: ${error.message}`);
      lastError = error;
    }
  }

  throw lastError || new Error('All models failed to generate daily task.');
}

async function queryGeminiForPdfWords(base64Pdf, modelName, apiKey) {
  const prompt = `You are an expert OCR and document analysis assistant.
Analyze this PDF document and extract all the English words listed in it.
If the PDF contains a list of vocabulary words, extract those words.
Return ONLY a valid JSON array of strings, containing the unique extracted words in Title Case (e.g. ["Catalyst", "Resilient", "Meticulous"]).
Do not include any other text, explanation, or markdown code block formatting (like \`\`\`json).`;

  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      parts: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Pdf
          }
        },
        {
          text: prompt
        }
      ]
    }]
  };

  const response = await postRequest(url, payload);

  if (response.error) {
    throw new Error(`Gemini API Error: ${response.error.message} (Status: ${response.error.status}, Code: ${response.error.code})`);
  }

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Gemini API returned no candidates.');
  }

  let resultText = response.candidates[0].content.parts[0].text.trim();

  const startIdx = resultText.indexOf('[');
  const endIdx = resultText.lastIndexOf(']');

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Failed to locate JSON array boundaries. Output: ' + resultText);
  }

  const jsonString = resultText.substring(startIdx, endIdx + 1);
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini did not return a JSON array.');
  }
  return parsed;
}

async function extractWordsFromPdf(base64Pdf) {
  const apiKeyRaw = process.env.GEMINI_PASSAGE_API_KEY || process.env.GEMINI_API_KEY || "";
  const apiKey = apiKeyRaw.replace(/^["']|["']$/g, '').trim();
  if (!apiKey || apiKey.startsWith('AQ') || apiKey.length < 15) {
    throw new Error('Valid Gemini API Key not found in environment variables.');
  }

  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Attempting PDF word extraction using model: ${model}`);
      const data = await queryGeminiForPdfWords(base64Pdf, model, apiKey);
      return data;
    } catch (error) {
      console.warn(`Model ${model} PDF word extraction failed: ${error.message}`);
      lastError = error;
    }
  }

  throw lastError || new Error('All models failed to extract words from PDF.');
}

module.exports = { getRichWordDetails, getQuickDefinition, getReadingComprehension, getGeminiDailyTask, extractWordsFromPdf };
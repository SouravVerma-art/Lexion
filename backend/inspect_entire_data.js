const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'data.json');

const rawData = fs.readFileSync(dataPath, 'utf8');
const words = JSON.parse(rawData);

const uniqueWords = new Set(words.map(w => w.word.toLowerCase().trim()));
console.log('Total entries in data.json:', words.length);
console.log('Total unique words in data.json:', uniqueWords.size);

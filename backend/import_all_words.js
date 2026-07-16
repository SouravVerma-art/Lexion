require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Word = require('./models/Word');

const dataPath = path.join(__dirname, '..', 'data.json');

async function importAllWords() {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lexicon');
    console.log('Connected to MongoDB successfully.');

    // 2. Read and parse data.json
    console.log('Reading data.json...');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const words = JSON.parse(rawData);
    console.log(`Loaded ${words.length} total word entries from data.json.`);

    console.log('Starting import of all words...');
    const wordsToProcess = words;

    let insertedCount = 0;
    let skippedDbCount = 0;
    let skippedDuplicateCount = 0;
    let errorCount = 0;

    const seenInBatch = new Set();

    // 3. Iterate and insert
    for (let i = 0; i < wordsToProcess.length; i++) {
      const item = wordsToProcess[i];
      if (!item.word || !item.definition || !item.partOfSpeech) {
        console.warn(`[Warning] Skipping invalid entry at index ${i}:`, item);
        errorCount++;
        continue;
      }

      const wordNormalized = item.word.trim().toLowerCase();

      // Check duplicate in this batch
      if (seenInBatch.has(wordNormalized)) {
        skippedDuplicateCount++;
        continue;
      }
      seenInBatch.add(wordNormalized);

      // Check if already in the database
      const existing = await Word.findOne({ word: { $regex: `^${item.word.trim()}$`, $options: 'i' } });
      if (existing) {
        skippedDbCount++;
        continue;
      }

      // Prepare word object according to Schema
      try {
        const newWord = new Word({
          word: item.word.trim(),
          partOfSpeech: item.partOfSpeech.trim().toLowerCase(),
          definition: item.definition.trim(),
          difficulty: item.difficulty || 'B2',
          status: item.status || 'learning',
          starred: item.starred || false,
          pronunciation: item.pronunciation ? item.pronunciation.trim() : '',
          frequency: item.frequency || 3,
          context: item.context ? item.context.trim() : '',
          rootOrigin: item.rootOrigin ? item.rootOrigin.trim() : '',
          wordFamily: item.wordFamily || [],
          collocations: item.collocations || [],
          synonyms: item.synonyms || [],
          antonyms: item.antonyms || [],
          examples: item.examples || [],
          imageUrl: item.imageUrl ? item.imageUrl.trim() : '',
          memoryTrick: item.memoryTrick ? item.memoryTrick.trim() : '',
          retentionStrength: item.retentionStrength || 0,
          revisionSchedule: item.revisionSchedule || [
            { label: 'Day 1', checked: false },
            { label: 'Day 3', checked: false },
            { label: 'Day 7', checked: false },
            { label: 'Day 15', checked: false }
          ],
          commonMistake: item.commonMistake ? item.commonMistake.trim() : ''
        });

        await newWord.save();
        insertedCount++;
        if (insertedCount % 50 === 0 || insertedCount === 1) {
          console.log(`  Inserted ${insertedCount} words so far...`);
        }
      } catch (err) {
        console.error(`Error saving word "${item.word}":`, err.message);
        errorCount++;
      }
    }

    console.log('\n--- Import Summary ---');
    console.log(`Total entries scanned: ${wordsToProcess.length}`);
    console.log(`Successfully imported: ${insertedCount}`);
    console.log(`Skipped (already in database): ${skippedDbCount}`);
    console.log(`Skipped (duplicates within the new list): ${skippedDuplicateCount}`);
    console.log(`Skipped (invalid/error): ${errorCount}`);
    
    // Get new database count
    const newDbCount = await Word.countDocuments();
    console.log(`Total words now in database: ${newDbCount}`);

  } catch (err) {
    console.error('Fatal error during import:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

importAllWords();

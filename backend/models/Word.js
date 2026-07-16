const mongoose = require('mongoose');

const wordFamilySchema = new mongoose.Schema({
  word: { type: String, trim: true },
  partOfSpeech: { type: String, trim: true }
}, { _id: false });

const revisionItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  checked: { type: Boolean, default: false }
}, { _id: false });

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  partOfSpeech: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  definition: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    default: 'B2',
    trim: true,
  },
  status: {
    type: String,
    enum: ['learning', 'review', 'mastered'],
    default: 'learning',
  },
  starred: {
    type: Boolean,
    default: false,
  },
  pronunciation: {
    type: String,
    trim: true,
  },
  frequency: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  context: {
    type: String,
    trim: true,
  },
  rootOrigin: {
    type: String,
    trim: true,
  },
  wordFamily: [wordFamilySchema],
  collocations: [String],
  synonyms: [String],
  antonyms: [String],
  examples: [String],
  imageUrl: {
    type: String,
    trim: true,
  },
  memoryTrick: {
    type: String,
    trim: true,
  },
  retentionStrength: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  revisionSchedule: {
    type: [revisionItemSchema],
    default: () => [
      { label: 'Day 1', checked: false },
      { label: 'Day 3', checked: false },
      { label: 'Day 7', checked: false },
      { label: 'Day 15', checked: false }
    ]
  },
  commonMistake: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Word', wordSchema);

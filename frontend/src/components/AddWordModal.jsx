import React, { useState } from 'react';

export default function AddWordModal({ isOpen, onClose, onAddWord, initialWord = '' }) {
  const [word, setWord] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [definition, setDefinition] = useState('');
  const [difficulty, setDifficulty] = useState('B2');
  const [status, setStatus] = useState('learning');

  React.useEffect(() => {
    if (isOpen) {
      setWord(initialWord);
    }
  }, [isOpen, initialWord]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word || !definition) {
      alert('Please fill out Word and Definition fields');
      return;
    }
    onAddWord({
      word,
      partOfSpeech,
      definition,
      difficulty,
      status
    });
    // Reset state
    setWord('');
    setPartOfSpeech('noun');
    setDefinition('');
    setDifficulty('B2');
    setStatus('learning');
    onClose();
  };

  return (
    <div class="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-md overflow-hidden">
        <div class="bg-surface p-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h3 class="font-h1-academic text-[20px] font-bold text-primary">Add New Vocabulary Word</h3>
          <button onClick={onClose} class="text-outline-variant hover:text-primary transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} class="p-6 space-y-4">
          <div>
            <label class="block font-label-mono text-label-mono text-outline uppercase mb-1">Word</label>
            <input 
              type="text" 
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. Ephemeral" 
              class="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary"
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-label-mono text-label-mono text-outline uppercase mb-1">Part of Speech</label>
              <select 
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                class="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
              </select>
            </div>
            <div>
              <label class="block font-label-mono text-label-mono text-outline uppercase mb-1">CEFR Level</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                class="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-label-mono text-label-mono text-outline uppercase mb-1">Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              class="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="learning">Learning</option>
              <option value="review">Needs Review</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>
          <div>
            <label class="block font-label-mono text-label-mono text-outline uppercase mb-1">Definition</label>
            <textarea 
              rows="3"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Enter word definition and usage..." 
              class="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary"
              required
            ></textarea>
          </div>
          <div class="pt-4 flex justify-end gap-2 border-t border-[#E2E8F0]">
            <button 
              type="button" 
              onClick={onClose} 
              class="px-4 py-2 border border-outline-variant text-on-surface-variant font-button-text text-button-text rounded-lg hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-secondary text-on-secondary font-button-text text-button-text rounded-lg hover:bg-[#3a31c5] transition-colors"
            >
              Save Word
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

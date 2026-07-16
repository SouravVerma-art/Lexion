import React, { useState, useEffect } from 'react';

// Seed vocabulary for writers
const WRITING_VOCAB = [
  {
    id: 'w_vocab_1',
    word: 'Ameliorate',
    partOfSpeech: 'Verb',
    meaning: 'To make something bad or unsatisfactory better.',
    synonyms: ['alleviate', 'mitigate', 'improve', 'amend'],
    antonyms: ['exacerbate', 'worsen', 'aggravate'],
    example: 'The governor proposed a series of social initiatives to ameliorate conditions in the impoverished district.',
    difficulty: 'Hard',
    pronunciation: '/əˈmiːliəreɪt/',
    examRelevance: 'GRE / GMAT (High frequency transition verb)'
  },
  {
    id: 'w_vocab_2',
    word: 'Cogent',
    partOfSpeech: 'Adjective',
    meaning: 'Clear, logical, and convincing.',
    synonyms: ['persuasive', 'compelling', 'valid', 'sound'],
    antonyms: ['unconvincing', 'flawed', 'weak', 'invalid'],
    example: 'She presented a cogent argument for centralization, utilizing detailed cost-benefit projections.',
    difficulty: 'Medium',
    pronunciation: '/ˈkəʊdʒənt/',
    examRelevance: 'GMAT AWA (Critical for logical analysis)'
  },
  {
    id: 'w_vocab_3',
    word: 'Obfuscate',
    partOfSpeech: 'Verb',
    meaning: 'To render obscure, unclear, or unintelligible.',
    synonyms: ['bewilder', 'confuse', 'muddy', 'cloud'],
    antonyms: ['clarify', 'elucidate', 'simplify'],
    example: 'The corporate report was drafted to obfuscate the company\'s declining profits.',
    difficulty: 'Hard',
    pronunciation: '/ˈɒbfʌsˌkeɪt/',
    examRelevance: 'GRE Issue / TOEFL (Excellent word for analytical criticism)'
  },
  {
    id: 'w_vocab_4',
    word: 'Pernicious',
    partOfSpeech: 'Adjective',
    meaning: 'Having a harmful effect, especially in a gradual or subtle way.',
    synonyms: ['detrimental', 'deleterious', 'noxious', 'destructive'],
    antonyms: ['beneficial', 'salutary', 'harmless'],
    example: 'Fake news campaigns have a pernicious effect on democratic trust over time.',
    difficulty: 'Hard',
    pronunciation: '/pəˈnɪʃəs/',
    examRelevance: 'XAT / IELTS (Powerful replacement for "bad effect")'
  },
  {
    id: 'w_vocab_5',
    word: 'Synthesize',
    partOfSpeech: 'Verb',
    meaning: 'To combine a number of things into a coherent whole.',
    synonyms: ['amalgamate', 'integrate', 'unify', 'blend'],
    antonyms: ['dissect', 'separate', 'divide'],
    example: 'A competent GRE essay must synthesize both opposing arguments before declaring a final thesis.',
    difficulty: 'Medium',
    pronunciation: '/ˈsɪnθɪsaɪz/',
    examRelevance: 'IELTS / CAT WAT (Fundamental academic action verb)'
  },
  {
    id: 'w_vocab_6',
    word: 'Anachronistic',
    partOfSpeech: 'Adjective',
    meaning: 'Belonging or appropriate to a period other than that in which it exists.',
    synonyms: ['archaic', 'outdated', 'obsolete', 'antiquated'],
    antonyms: ['contemporary', 'modern', 'futuristic'],
    example: 'Consolidating operations in a physical office is anachronistic in our era of remote distribution.',
    difficulty: 'Hard',
    pronunciation: '/əˌnæk rəˈnɪs tɪk/',
    examRelevance: 'GMAT / GRE (Highly effective for critiquing corporate logic)'
  }
];

export default function VocabBuilder() {
  const vocabList = WRITING_VOCAB;
  const [bookmarks, setBookmarks] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  // Load bookmarks
  useEffect(() => {
    const saved = localStorage.getItem('lexicon_writing_vocab_bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  const toggleBookmark = (wordId) => {
    let updated;
    if (bookmarks.includes(wordId)) {
      updated = bookmarks.filter(id => id !== wordId);
    } else {
      updated = [...bookmarks, wordId];
    }
    setBookmarks(updated);
    localStorage.setItem('lexicon_writing_vocab_bookmarks', JSON.stringify(updated));

    // Optional: Simulating saving directly into Lexicon core library API
    // We display a notification
    const wordObj = vocabList.find(v => v.id === wordId);
    if (wordObj && !bookmarks.includes(wordId)) {
      console.log(`Word ${wordObj.word} simulated as added to Lexicon Library.`);
    }
  };

  // Text to speech speech synthesizer
  const handlePlayPronunciation = (wordText, id) => {
    if ('speechSynthesis' in window) {
      setPlayingId(id);
      window.speechSynthesis.cancel();
      const utterance = new Utterance(wordText);
      utterance.rate = 0.85;
      utterance.onend = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text to speech is not supported in this browser.');
    }
  };

  // Utility fallback for SpeechUtterance
  const Utterance = window.SpeechSynthesisUtterance || function(txt) {
    this.text = txt;
  };

  return (
    <div className="space-y-6">
      {/* Overview stats header */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <h4 className="font-h1-academic text-base font-bold text-primary">Advanced Writing Vocabulary</h4>
          <p className="text-xs text-on-surface-variant">Daily curated vocabulary words to raise your essay Lexical Score.</p>
        </div>
        <div className="bg-secondary/15 text-secondary text-xs px-3 py-1.5 rounded-lg font-label-mono font-bold">
          Bookmarked: {bookmarks.length} words
        </div>
      </div>

      {/* Grid of Word cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vocabList.map((item) => {
          const isBookmarked = bookmarks.includes(item.id);
          const isPlaying = playingId === item.id;
          const diffColor = item.difficulty === 'Hard' ? 'text-error bg-error-container/20' : 'text-amber-800 bg-amber-100';

          return (
            <div 
              key={item.id}
              className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-secondary transition-colors space-y-4 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-h1-academic text-lg font-bold text-primary">{item.word}</h5>
                    <span className="text-[10px] text-outline font-body-main italic">{item.partOfSpeech}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${diffColor}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  
                  {/* Pronunciation block */}
                  <div className="flex items-center gap-1">
                    <span className="font-label-mono text-[10px] text-on-surface-variant">{item.pronunciation}</span>
                    <button
                      onClick={() => handlePlayPronunciation(item.word, item.id)}
                      className={`p-1 rounded-full hover:bg-surface-container text-outline-variant hover:text-primary transition-all flex items-center ${
                        isPlaying ? 'text-secondary animate-pulse-badge' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isPlaying ? 'volume_up' : 'volume_mute'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bookmark trigger */}
                <button
                  onClick={() => toggleBookmark(item.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    isBookmarked 
                      ? 'border-secondary/40 bg-secondary/15 text-secondary' 
                      : 'border-outline-variant/60 text-outline-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Word'}
                >
                  <span className="material-symbols-outlined text-[16px] fill">
                    {isBookmarked ? 'bookmark' : 'bookmark_border'}
                  </span>
                </button>
              </div>

              {/* Word description */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Definition:</span>
                  <p className="text-xs text-on-surface leading-relaxed font-body-main">{item.meaning}</p>
                </div>

                {/* Synonyms / Antonyms */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[9px] text-emerald-800 font-bold uppercase block">Synonyms:</span>
                    <p className="text-[11px] text-on-surface-variant font-body-main truncate">{item.synonyms.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-error font-bold uppercase block">Antonyms:</span>
                    <p className="text-[11px] text-on-surface-variant font-body-main truncate">{item.antonyms.join(', ')}</p>
                  </div>
                </div>

                {/* Example sentence */}
                <div className="pt-2 border-t border-outline-variant/20 italic text-xs text-on-surface-variant leading-relaxed">
                  "{item.example}"
                </div>
              </div>

              {/* Exam Relevance footer */}
              <div className="flex justify-between items-center pt-2 text-[9px] text-outline font-label-mono border-t border-outline-variant/10">
                <span>RELEVANCE:</span>
                <span className="text-secondary font-bold">{item.examRelevance}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

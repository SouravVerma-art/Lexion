import React, { useState, useEffect, useRef } from 'react';

// Web Audio API Retro Synth Sound Engine
const playSynthSound = (type) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'correct') {
      // Happy upward digital chime (C5 -> E5 -> G5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'incorrect') {
      // Low sawtooth sliding buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'streak') {
      // High energetic synth laser sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'gameover') {
      // Sad minor downward arpeggio
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(220.00, now); // A3
      osc.frequency.setValueAtTime(196.00, now + 0.2); // G3
      osc.frequency.setValueAtTime(164.81, now + 0.4); // E3
      osc.frequency.setValueAtTime(130.81, now + 0.6); // C3
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
      
      osc.start(now);
      osc.stop(now + 0.9);
    } else if (type === 'victory') {
      // Classic triumphant retro 8-bit scale
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      
      osc.start(now);
      osc.stop(now + 0.7);
    }
  } catch (e) {
    console.error('AudioContext failed:', e);
  }
};

export default function QuizView({ words, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  
  // Timer State (starts at 180 seconds = 3 minutes)
  const [timeLeft, setTimeLeft] = useState(180);
  const timerRef = useRef(null);

  // Streak state (loaded from localStorage)
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('lexicon_quiz_streak') || '4', 10);
  });

  // Creative Gamification States
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [shakeCard, setShakeCard] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [lastPointsAwarded, setLastPointsAwarded] = useState(0);
  const hasTrackedEndRef = useRef(false);


  // Quiz Configuration Dashboard states
  const [isConfigured, setIsConfigured] = useState(false);
  const [configSource, setConfigSource] = useState('library'); // 'library' or 'custom'
  const [configLength, setConfigLength] = useState(10);
  const [configDifficulty, setConfigDifficulty] = useState('All');
  const [customWordsRaw, setCustomWordsRaw] = useState(
    "commence:to begin or start\npragmatic:dealing with things sensibly and realistically\nubiquitous:present, appearing, or found everywhere\nephemeral:lasting for a very short time"
  ); // Pre-populated custom example

  const startQuiz = () => {
    let quizSourceWords = [];

    if (configSource === 'library') {
      let filtered = [...words];
      if (configDifficulty !== 'All') {
        filtered = words.filter(w => w.difficulty?.toLowerCase().includes(configDifficulty.toLowerCase()));
      }
      
      if (filtered.length < 4) {
        alert(`You need at least 4 words in the library matching the "${configDifficulty}" difficulty to generate a quiz. Please add more words first, or select "All Difficulties".`);
        return;
      }
      quizSourceWords = filtered;
    } else {
      // Parse custom words textarea
      const parsed = [];
      const lines = customWordsRaw.split('\n');
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const w = parts[0].trim();
          const def = parts.slice(1).join(':').trim();
          if (w && def) {
            parsed.push({
              word: w,
              definition: def,
              difficulty: 'Medium',
              examples: [],
              synonyms: []
            });
          }
        }
      }

      if (parsed.length < 4) {
        alert('Please enter at least 4 valid custom word:definition pairs (one per line) to start the quiz!');
        return;
      }
      quizSourceWords = parsed;
    }

    // Generate questions from quizSourceWords
    const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
    const generatedQuestions = [];
    const shuffledWords = shuffle(quizSourceWords);
    const limit = Math.min(shuffledWords.length, configLength);

    for (let i = 0; i < limit; i++) {
      const target = shuffledWords[i];
      let qType = 'definition';
      let sentence = '';
      
      const hasExamples = target.examples && target.examples.length > 0;
      const hasSynonyms = target.synonyms && target.synonyms.length > 0;

      // Select question type
      if (hasExamples && Math.random() > 0.5) {
        qType = 'blank';
        sentence = target.examples[0];
      } else if (hasSynonyms && Math.random() > 0.5) {
        qType = 'synonym';
      }

      if (qType === 'blank') {
        const regex = new RegExp(`\\b${target.word}\\b`, 'gi');
        const blankedSentence = sentence.replace(regex, '_______');
        
        generatedQuestions.push({
          type: 'blank',
          targetWord: target.word,
          questionText: `Fill in the blank: "${blankedSentence}"`,
          correctAnswer: target.word,
          originalSentence: sentence,
          difficulty: target.difficulty
        });
      } else if (qType === 'synonym') {
        const correctSynonym = target.synonyms[0];
        
        const otherWords = quizSourceWords.filter(w => w.word !== target.word);
        const distractors = shuffle(otherWords)
          .slice(0, 3)
          .map(w => w.word);

        while (distractors.length < 3) {
          distractors.push('learning');
        }

        const options = shuffle([correctSynonym, ...distractors]);

        generatedQuestions.push({
          type: 'mcq',
          targetWord: target.word,
          questionText: `Which word is a synonym for "${target.word}"?`,
          correctAnswer: correctSynonym,
          options,
          difficulty: target.difficulty
        });
      } else {
        const correctDefinition = target.definition;
        
        const otherWords = quizSourceWords.filter(w => w.word !== target.word);
        const distractors = shuffle(otherWords)
          .slice(0, 3)
          .map(w => w.definition);

        while (distractors.length < 3) {
          distractors.push('An alternative vocabulary meaning');
        }

        const options = shuffle([correctDefinition, ...distractors]);

        generatedQuestions.push({
          type: 'mcq',
          targetWord: target.word,
          questionText: `What is the correct meaning of the word "${target.word}"?`,
          correctAnswer: correctDefinition,
          options,
          difficulty: target.difficulty
        });
      }
    }

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setPoints(0);
    setCombo(0);
    setBestCombo(0);
    setShakeCard(false);
    setQuestionStartTime(Date.now());
    hasTrackedEndRef.current = false;
    setIsSubmitted(false);
    setSelectedOptionIdx(null);
    setTypedAnswer('');
    setTimeLeft(limit * 18);
    setQuizEnded(false);
    setIsConfigured(true);
  };

  // Start timer when configured
  useEffect(() => {
    if (!isConfigured || quizEnded) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setQuizEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConfigured, quizEnded]);


  // Update question start time when question changes
  useEffect(() => {
    if (questions.length > 0) {
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex, questions]);

  // Handle quiz end triggers once
  useEffect(() => {
    if (quizEnded && !hasTrackedEndRef.current) {
      hasTrackedEndRef.current = true;
      const percentage = Math.round((score / questions.length) * 100);
      if (percentage >= 80) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('lexicon_quiz_streak', newStreak.toString());
        playSynthSound('victory');
      } else {
        playSynthSound('gameover');
      }
    }
  }, [quizEnded, score, questions.length, streak]);


  if (!isConfigured) {
    const isLibraryLocked = words.length < 4;
    // Auto toggle to custom source if library is empty/locked
    if (isLibraryLocked && configSource === 'library') {
      setConfigSource('custom');
    }

    return (
      <div className="w-full max-w-xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-combo-pulse">
        <div className="flex justify-between items-center border-b border-outline-variant pb-4">
          <div>
            <h2 className="font-h1-academic text-2xl text-primary font-bold">Quiz Setup</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Configure your vocabulary quiz options below.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-secondary hover:underline font-button-text text-button-text"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          {/* Source Selector */}
          <div className="space-y-2">
            <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Quiz Vocabulary Source</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                disabled={isLibraryLocked}
                onClick={() => setConfigSource('library')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  configSource === 'library'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 font-semibold'
                    : 'border-outline-variant bg-surface hover:border-secondary'
                } ${isLibraryLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">local_library</span>
                  Library Words
                </span>
                <span className="text-[11px] text-outline leading-tight mt-1">
                  {isLibraryLocked 
                    ? 'Locked (need at least 4 words in library)' 
                    : `Generate questions from your ${words.length} saved words.`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConfigSource('custom')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  configSource === 'custom'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 font-semibold'
                    : 'border-outline-variant bg-surface hover:border-secondary'
                }`}
              >
                <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">edit_note</span>
                  Custom Word List
                </span>
                <span className="text-[11px] text-outline leading-tight mt-1">
                  Input custom word and definition pairs to generate a test deck.
                </span>
              </button>
            </div>
          </div>

          {/* Setup Options based on source */}
          {configSource === 'library' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Length Selection */}
              <div className="space-y-1">
                <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Quiz Size</label>
                <select
                  value={configLength}
                  onChange={(e) => setConfigLength(parseInt(e.target.value, 10))}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-1">
                <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">CEFR Difficulty</label>
                <select
                  value={configDifficulty}
                  onChange={(e) => setConfigDifficulty(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy (A1-A2)</option>
                  <option value="Medium">Medium (B1-B2)</option>
                  <option value="Hard">Hard (C1-C2)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Length Selection for Custom */}
              <div className="space-y-1">
                <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Max Quiz Size</label>
                <select
                  value={configLength}
                  onChange={(e) => setConfigLength(parseInt(e.target.value, 10))}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf] max-w-xs"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              {/* Custom words raw input */}
              <div className="space-y-1">
                <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">
                  Enter Custom Words (Format: word:definition, one per line)
                </label>
                <textarea
                  value={customWordsRaw}
                  onChange={(e) => setCustomWordsRaw(e.target.value)}
                  rows={5}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-xs focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf] leading-relaxed"
                  placeholder="e.g.&#10;commence:to start or begin&#10;pragmatic:sensible and realistic"
                ></textarea>
                <p className="text-[10px] text-outline leading-tight">
                  Enter at least 4 words. We will automatically build multiple-choice options and fill-in-the-blank statements using the vocab and meanings you supply.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-outline-variant text-on-surface-variant font-button-text text-button-text rounded-lg hover:bg-surface transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={startQuiz}
            className="px-8 py-2.5 bg-indigo-600 text-white font-button-text text-button-text rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2 font-bold"
          >
            Start Quiz 🎮
          </button>
        </div>
      </div>
    );
  }


  const currentQuestion = questions[currentIndex];

  // Format timer values
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle MCQ option selection
  const handleOptionClick = (idx) => {
    if (isSubmitted) return;
    setSelectedOptionIdx(idx);
    setIsSubmitted(true);

    const chosenOption = currentQuestion.options[idx];
    const isCorrect = chosenOption === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > bestCombo) {
        setBestCombo(nextCombo);
      }

      const timeSpent = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 8;
      const speedBonus = Math.max(0, Math.round(50 - (timeSpent * 7)));
      
      const addedPoints = Math.round((100 + speedBonus) * (1 + nextCombo * 0.1));
      setPoints(prev => prev + addedPoints);
      setLastPointsAwarded(addedPoints);

      playSynthSound(nextCombo >= 3 ? 'streak' : 'correct');
    } else {
      setCombo(0);
      setLastPointsAwarded(0);
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
      playSynthSound('incorrect');
    }
  };

  // Handle Fill in the blank submit
  const handleBlankSubmit = (e) => {
    e.preventDefault();
    if (isSubmitted || !typedAnswer.trim()) return;
    setIsSubmitted(true);

    const isCorrect = typedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    if (isCorrect) {
      setScore(prev => prev + 1);

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > bestCombo) {
        setBestCombo(nextCombo);
      }

      const timeSpent = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 8;
      const speedBonus = Math.max(0, Math.round(50 - (timeSpent * 7)));
      
      const addedPoints = Math.round((100 + speedBonus) * (1 + nextCombo * 0.1));
      setPoints(prev => prev + addedPoints);
      setLastPointsAwarded(addedPoints);

      playSynthSound(nextCombo >= 3 ? 'streak' : 'correct');
    } else {
      setCombo(0);
      setLastPointsAwarded(0);
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
      playSynthSound('incorrect');
    }
  };

  // Next question
  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedOptionIdx(null);
    setTypedAnswer('');

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setQuizEnded(true);
    }
  };

  // Skip question
  const handleSkip = () => {
    handleNext();
  };

  if (quizEnded) {
    const percentage = Math.round((score / questions.length) * 100);
    
    let rankTitle = "Vocab Apprentice";
    let rankIcon = "school";
    let rankBadgeClass = "bg-slate-50 text-slate-700 border-slate-200";
    
    if (percentage === 100) {
      rankTitle = "Lexicon Sovereign";
      rankIcon = "emoji_events";
      rankBadgeClass = "gold-shine-gradient text-[#78350f] border-[#d97706] font-extrabold shadow-md";
    } else if (percentage >= 80) {
      rankTitle = "Vocabulary Wizard";
      rankIcon = "auto_awesome";
      rankBadgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold shadow-sm";
    } else if (percentage >= 50) {
      rankTitle = "Word Warrior";
      rankIcon = "military_tech";
      rankBadgeClass = "bg-amber-50 text-amber-700 border-amber-200 font-bold shadow-sm";
    }

    return (
      <div className="w-full max-w-xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-md text-center space-y-6 animate-combo-pulse">
        <span className="material-symbols-outlined text-6xl text-amber-500 fill">workspace_premium</span>
        <h2 className="font-h1-academic text-2xl text-primary font-bold">Quiz Session Completed!</h2>
        
        <div className="flex flex-col items-center gap-2 pt-1 pb-3">
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${rankBadgeClass}`}>
            <span className="material-symbols-outlined fill text-lg">{rankIcon}</span>
            <span className="font-label-mono uppercase tracking-wider text-xs">{rankTitle}</span>
          </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 max-w-lg mx-auto">
          {/* Points Card */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 p-5 rounded-xl border border-indigo-100 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.04)]">
            <span className="material-symbols-outlined text-indigo-500 text-2xl mb-1 fill">workspace_premium</span>
            <div className="text-3xl font-extrabold text-indigo-950 font-h1-academic">{points}</div>
            <div className="text-xs text-indigo-600/80 uppercase font-label-mono font-bold tracking-wider mt-1">Total Score</div>
          </div>
          
          {/* Accuracy Card */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 p-5 rounded-xl border border-emerald-100 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.04)]">
            <span className="material-symbols-outlined text-emerald-500 text-2xl mb-1 fill">check_circle</span>
            <div className="text-3xl font-extrabold text-emerald-950 font-h1-academic">{percentage}%</div>
            <div className="text-xs text-emerald-600/80 uppercase font-label-mono font-bold tracking-wider mt-1">{score} of {questions.length} Correct</div>
          </div>

          {/* Best Streak Card */}
          <div className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 p-5 rounded-xl border border-orange-100 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(249,115,22,0.04)]">
            <span className="material-symbols-outlined text-orange-500 text-2xl mb-1 fill">local_fire_department</span>
            <div className="text-3xl font-extrabold text-orange-950 font-h1-academic">{bestCombo}x</div>
            <div className="text-xs text-orange-600/80 uppercase font-label-mono font-bold tracking-wider mt-1">Best Streak</div>
          </div>

          {/* Time Remaining Card */}
          <div className="bg-gradient-to-br from-amber-50/50 to-amber-100/30 p-5 rounded-xl border border-amber-100 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(245,158,11,0.04)]">
            <span className="material-symbols-outlined text-amber-500 text-2xl mb-1">timer</span>
            <div className="text-3xl font-extrabold text-amber-950 font-h1-academic">{formatTime(timeLeft)}</div>
            <div className="text-xs text-amber-600/80 uppercase font-label-mono font-bold tracking-wider mt-1">Time Remaining</div>
          </div>
        </div>

        <p className="font-body-main text-body-sm text-on-surface-variant leading-relaxed">
          {percentage >= 80 
            ? `Fantastic job! Your retention strength is looking extremely solid. Streak updated to ${streak} days!`
            : "Good effort! Keep reviewing your vocabulary cards to improve your score."}
        </p>

        <div className="pt-4 flex flex-wrap gap-3 justify-center">
          <button 
            onClick={startQuiz}
            className="px-5 py-2.5 bg-indigo-600 text-white font-button-text text-button-text rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold"
          >
            Retry Quiz
          </button>
          <button 
            onClick={() => setIsConfigured(false)}
            className="px-5 py-2.5 border border-outline-variant text-on-surface-variant font-button-text text-button-text rounded-lg hover:bg-surface transition-colors shadow-sm"
          >
            Quiz Setup
          </button>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-secondary text-on-secondary font-button-text text-button-text rounded-lg hover:bg-[#3a31c5] transition-colors shadow-sm"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }


  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];
  const isCorrectAnswer = currentQuestion.type === 'mcq'
    ? (selectedOptionIdx !== null && currentQuestion.options[selectedOptionIdx] === currentQuestion.correctAnswer)
    : (typedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase());

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4">
      
      {/* Quiz Header & Progress */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </span>
            {combo > 0 && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-label-mono ${
                combo >= 3 
                  ? 'bg-orange-50 text-orange-600 border border-orange-200 animate-flame-glow' 
                  : 'bg-amber-50 text-amber-600 border border-amber-200 animate-combo-pulse'
              }`}>
                <span className="material-symbols-outlined text-sm fill">local_fire_department</span>
                {combo}x COMBO
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-label-mono text-xs font-bold shadow-sm">
              <span className="material-symbols-outlined text-sm fill">workspace_premium</span>
              {points} PTS
            </div>
            <div className="flex items-center gap-1 text-secondary font-label-mono text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px]">timer</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar Track */}
        <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Quiz Card */}
      <div className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-[0_4px_12px_rgba(11,28,48,0.04)] flex flex-col gap-6 relative transition-all duration-300 ${shakeCard ? 'animate-shake' : ''}`}>
        <div className="flex items-start gap-4">
          <span className="font-h1-academic text-[24px] text-primary/30 mt-1 font-bold">Q.</span>
          <h2 className="font-h1-academic text-xl md:text-2xl text-primary leading-tight font-bold">
            {currentQuestion.type === 'blank' ? (
              <span>
                {currentQuestion.questionText.split('_______')[0]}
                <span className="italic text-secondary border-b-2 border-outline-variant px-4">
                  {isSubmitted ? currentQuestion.correctAnswer : '_______'}
                </span>
                {currentQuestion.questionText.split('_______')[1]}
              </span>
            ) : (
              <span>
                {currentQuestion.questionText.split(`"${currentQuestion.targetWord}"`)[0]}
                <span className="italic text-secondary">"{currentQuestion.targetWord}"</span>
                {currentQuestion.questionText.split(`"${currentQuestion.targetWord}"`)[1]}
              </span>
            )}
          </h2>
        </div>

        {/* Render question interactions */}
        {currentQuestion.type === 'mcq' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isCorrectOption = option === currentQuestion.correctAnswer;
              const isSelectedOption = idx === selectedOptionIdx;
              
              let btnClass = 'border-outline-variant bg-surface hover:border-[#3f38cf] hover:bg-[#eeeffc]/30 hover:shadow-sm transform hover:-translate-y-[0.5px] choice-btn-transition';
              let iconName = 'radio_button_unchecked';
              let fillState = false;

              if (isSubmitted) {
                if (isCorrectOption) {
                  btnClass = 'border-2 border-tertiary-fixed-dim bg-tertiary-fixed-dim/10';
                  iconName = 'check_circle';
                  fillState = true;
                } else if (isSelectedOption) {
                  btnClass = 'border-2 border-error bg-error-container/20';
                  iconName = 'cancel';
                  fillState = true;
                } else {
                  btnClass = 'border-outline-variant bg-surface opacity-60';
                }
              }

              const letter = letters[idx] || '';

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isSubmitted}
                  className={`text-left p-4 rounded-lg border flex items-center justify-between font-body-main text-body-sm md:text-body-main ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-label-mono border ${
                      isSubmitted 
                        ? isCorrectOption 
                          ? 'bg-tertiary-fixed-dim text-white border-tertiary-fixed-dim' 
                          : isSelectedOption 
                            ? 'bg-error text-white border-error'
                            : 'bg-surface-variant text-outline border-outline-variant'
                        : 'bg-[#eeeffc] text-[#3f38cf] border-[#3f38cf]/15'
                    } transition-colors`}>
                      {letter}
                    </span>
                    <span className={`${isSubmitted && isCorrectOption ? 'font-semibold font-h1-academic text-primary' : 'text-on-surface'}`}>
                      {option}
                    </span>
                  </div>
                  <span 
                    className={`material-symbols-outlined ${isSubmitted ? (isCorrectOption ? 'text-tertiary-fixed-dim' : 'text-error') : 'text-outline-variant/60'} text-[20px]`}
                    style={fillState ? { font_variation_settings: "'FILL' 1" } : {}}
                  >
                    {iconName}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleBlankSubmit} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={isSubmitted}
                placeholder="Type your answer here..."
                className="flex-1 bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                required
              />
              {!isSubmitted && (
                <button
                  type="submit"
                  className="bg-primary text-on-primary font-button-text text-button-text px-6 py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        )}

        {/* Global Submitted Feedback Banner (both MCQ and Blank) */}
        {isSubmitted && (
          <div className={`p-4 rounded-lg border font-body-main text-body-sm animate-combo-pulse ${
            isCorrectAnswer 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {isCorrectAnswer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined fill text-emerald-600">check_circle</span>
                  <span>Correct! Great job.</span>
                </div>
                <span className="font-label-mono font-bold text-emerald-700 bg-emerald-100/50 px-2.5 py-0.5 rounded text-xs">
                  +{lastPointsAwarded} PTS
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined fill text-red-600">cancel</span>
                <span>
                  Incorrect. The correct answer was <strong className="font-semibold">{currentQuestion.correctAnswer}</strong>.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Skip and Next Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/50 mt-4">
          <button 
            onClick={handleSkip}
            className="font-button-text text-button-text text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Skip
          </button>
          
          {isSubmitted && (
            <button 
              onClick={handleNext}
              className="bg-primary text-on-primary font-button-text text-button-text px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
            >
              Next
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


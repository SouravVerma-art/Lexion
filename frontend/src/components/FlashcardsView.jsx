import React, { useState, useEffect } from 'react';
import PronunciationPlayer from './PronunciationPlayer';

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
    } else if (type === 'lifeline') {
      // Sparkle ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    console.error('AudioContext failed:', e);
  }
};

export default function FlashcardsView({ words, onUpdateWord, onClose }) {
  const [deckType, setDeckType] = useState('all'); // 'all', 'learning', 'review'
  const [deck, setDeck] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  // Gamification States
  const [gameMode, setGameMode] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answerStatus, setAnswerStatus] = useState('unanswered'); // 'unanswered', 'correct', 'incorrect'
  const [shakeCard, setShakeCard] = useState(false);
  const [hasAnsweredCurrentCard, setHasAnsweredCurrentCard] = useState(false);

  // Game Pro States
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [clueUsed, setClueUsed] = useState(false);
  const [eliminatedIdx, setEliminatedIdx] = useState(null);

  // Initialize deck based on filter settings
  useEffect(() => {
    let filtered = [...words];
    if (deckType === 'learning') {
      filtered = words.filter(w => w.status === 'learning');
    } else if (deckType === 'review') {
      filtered = words.filter(w => w.status === 'review');
    }
    // Shuffle the deck initially
    setDeck(filtered.sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setMasteredCount(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setErrorsCount(0);
    setLives(3);
    setTimeLeft(15);
    setClueUsed(false);
    setEliminatedIdx(null);
  }, [deckType, words]);

  // Generate options for game mode
  const generateOptions = (currentWord, fullDeck) => {
    if (!currentWord) return;
    const correctDef = currentWord.definition;

    // Get other definitions from deck
    const distractors = fullDeck
      .filter(w => w.word.toLowerCase() !== currentWord.word.toLowerCase())
      .map(w => w.definition);

    // Pick 2 random unique distractors
    let selectedDistractors = [];
    if (distractors.length >= 2) {
      const shuffledDistractors = [...distractors].sort(() => Math.random() - 0.5);
      selectedDistractors = shuffledDistractors.slice(0, 2);
    } else {
      // fallback distractors if library has less than 3 words
      const fallbacks = [
        "Present, appearing, or found everywhere.",
        "Lasting for a very short time; transient.",
        "Make less severe, serious, or painful.",
        "To begin or start something, especially a formal event or process."
      ].filter(d => d !== correctDef);
      selectedDistractors = fallbacks.slice(0, 2);
    }

    // Mix and shuffle
    const allOptions = [correctDef, ...selectedDistractors].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelectedIdx(null);
    setAnswerStatus('unanswered');
    setHasAnsweredCurrentCard(false);

    // Reset timer and lifeline for new card
    setTimeLeft(15);
    setClueUsed(false);
    setEliminatedIdx(null);
  };

  useEffect(() => {
    if (gameMode && deck.length > 0 && deck[currentIdx]) {
      generateOptions(deck[currentIdx], words);
    }
  }, [currentIdx, deck, gameMode, words]);

  // Active Countdown Timer Loop
  useEffect(() => {
    if (!gameMode || sessionCompleted || isFlipped || answerStatus === 'correct') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired! Lose a heart
          playSynthSound('incorrect');
          setCombo(0);
          setErrorsCount(e => e + 1);

          setLives(l => {
            const nextLives = l - 1;
            if (nextLives <= 0) {
              setSessionCompleted(true);
              playSynthSound('gameover');
            }
            return nextLives;
          });

          // Trigger card shake
          setShakeCard(true);
          setTimeout(() => setShakeCard(false), 400);

          // Auto-advance to next card on time-out
          handleNext();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, sessionCompleted, currentIdx, isFlipped, answerStatus]);

  if (words.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-12 space-y-6">
        <span className="material-symbols-outlined text-6xl text-outline-variant">style</span>
        <h3 className="font-h1-academic text-xl text-primary font-bold">Library Empty</h3>
        <p className="font-body-main text-body-sm text-on-surface-variant leading-relaxed">
          Add some vocabulary words to your library first to start a revision session.
        </p>
        <button
          onClick={onClose}
          className="bg-secondary text-on-secondary hover:bg-[#3a31c5] px-6 py-2.5 rounded-lg font-button-text text-button-text transition-colors shadow-sm"
        >
          Go to Library
        </button>
      </div>
    );
  }

  const handleCardFlip = () => {
    // In game mode, card flipping by clicking body is only allowed after correct answer
    if (gameMode && answerStatus !== 'correct') return;
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx + 1 < deck.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setSessionCompleted(true);
        if (lives > 0) playSynthSound('victory');
      }
    }, 200);
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIdx(prev => prev - 1);
      }, 200);
    }
  };

  const handleMarkMastered = async (wordId) => {
    onUpdateWord(wordId, { status: 'mastered' });
    setMasteredCount(prev => prev + 1);
    handleNext();
  };

  const handleStillLearning = () => {
    handleNext();
  };

  const handleAnswerSelect = (optionIdx) => {
    if (answerStatus === 'correct' || optionIdx === eliminatedIdx) return;

    setSelectedIdx(optionIdx);
    const chosenDef = options[optionIdx];
    const correctDef = deck[currentIdx].definition;

    if (chosenDef === correctDef) {
      setAnswerStatus('correct');
      if (!hasAnsweredCurrentCard) {
        const points = 100 * (combo + 1);

        // Speed bonus if answered in first 5 seconds
        const speedBonus = timeLeft >= 10 ? 50 : 0;
        setScore(prev => prev + points + speedBonus);

        // Recover 1 life on 5x combo (max 3 lives)
        setCombo(prev => {
          const nextCombo = prev + 1;
          if (nextCombo > maxCombo) setMaxCombo(nextCombo);

          if (nextCombo > 0 && nextCombo % 5 === 0) {
            setLives(l => Math.min(3, l + 1));
            playSynthSound('lifeline');
          } else {
            playSynthSound(nextCombo >= 3 ? 'streak' : 'correct');
          }

          return nextCombo;
        });
      } else {
        playSynthSound('correct');
      }

      // Auto flip to back of card after 1 second
      setTimeout(() => {
        setIsFlipped(true);
      }, 1000);
    } else {
      setAnswerStatus('incorrect');
      setCombo(0);
      setErrorsCount(prev => prev + 1);
      setHasAnsweredCurrentCard(true);
      playSynthSound('incorrect');

      // Deduct life
      setLives(l => {
        const nextLives = l - 1;
        if (nextLives <= 0) {
          setSessionCompleted(true);
          playSynthSound('gameover');
        }
        return nextLives;
      });

      // Trigger card shake
      setShakeCard(true);
      setTimeout(() => {
        setShakeCard(false);
      }, 400);
    }
  };

  const handleUseClue = () => {
    if (clueUsed || answerStatus === 'correct') return;

    const correctDef = deck[currentIdx].definition;
    const incorrectIdxs = [];
    options.forEach((opt, idx) => {
      if (opt !== correctDef) {
        incorrectIdxs.push(idx);
      }
    });

    if (incorrectIdxs.length > 0) {
      const randomIncorrectIdx = incorrectIdxs[Math.floor(Math.random() * incorrectIdxs.length)];
      setEliminatedIdx(randomIncorrectIdx);
      setClueUsed(true);
      playSynthSound('lifeline');
    }
  };

  const resetGame = () => {
    setDeck(deck.sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setMasteredCount(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setErrorsCount(0);
    setLives(3);
    setTimeLeft(15);
    setClueUsed(false);
    setEliminatedIdx(null);
  };

  const getRankInfo = (scoreValue, currentLives) => {
    if (currentLives <= 0) {
      return { title: 'Knockout! 💔', desc: 'You ran out of lives. Study your definitions and try again to unlock higher ranks!' };
    }
    if (scoreValue >= 3000) {
      return { title: 'Lexicon Legend 🏆', desc: 'Flawless academic performance. You master definitions like a dictionary editor!' };
    }
    if (scoreValue >= 1500) {
      return { title: 'Word Wizard 🧙‍♂️', desc: 'Incredible vocabulary range. You wield complex words with professional ease!' };
    }
    if (scoreValue >= 500) {
      return { title: 'Vocab Squire ⚔️', desc: 'Solid word retention. Keep building your daily study streak!' };
    }
    return { title: 'Lexicon Initiate 🔰', desc: 'Every grand library begins with a single card. Keep learning!' };
  };

  const rankInfo = getRankInfo(score, lives);
  const accuracy = Math.max(0, Math.round((deck.length / (deck.length + errorsCount)) * 100));

  if (sessionCompleted) {
    return (
      <div className="w-full max-w-md mx-auto relative">
        {gameMode ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center space-y-6 shadow-md text-on-surface">
            {lives <= 0 ? (
              <span className="material-symbols-outlined text-6xl text-red-500 fill animate-pulse drop-shadow-sm">heart_broken</span>
            ) : (
              <span className="material-symbols-outlined text-6xl text-amber-500 fill animate-bounce drop-shadow-sm">emoji_events</span>
            )}
            <h2 className="font-h1-academic text-2xl text-primary font-extrabold tracking-tight font-bold">
              {lives <= 0 ? 'Session Failed!' : 'Game Complete!'}
            </h2>

            {/* Game Ranking Badge */}
            <div className="gold-shine-gradient p-[1px] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col items-center">
                <span className="text-[9px] font-label-mono text-outline uppercase tracking-widest">Earned Rank</span>
                <span className="text-base font-extrabold text-amber-700 mt-1 font-h1-academic tracking-wide font-bold">
                  {rankInfo.title}
                </span>
                <p className="text-[10px] text-on-surface-variant italic mt-2 max-w-xs leading-relaxed">
                  "{rankInfo.desc}"
                </p>
              </div>
            </div>

            {/* Game Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant">
                <div className="text-[9px] font-label-mono text-outline uppercase tracking-wider">Final Score</div>
                <div className="text-xl font-extrabold text-secondary font-h1-academic mt-1 font-bold">{score}</div>
              </div>
              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant">
                <div className="text-[9px] font-label-mono text-outline uppercase tracking-wider">Max Combo</div>
                <div className="text-xl font-extrabold text-orange-600 font-h1-academic mt-1 font-bold">{maxCombo} 🔥</div>
              </div>
              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant">
                <div className="text-[9px] font-label-mono text-outline uppercase tracking-wider">Accuracy</div>
                <div className="text-xl font-extrabold text-cyan-600 font-h1-academic mt-1 font-bold">{accuracy}%</div>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed italic">
              Successfully mastered {masteredCount} active words during this gamified session.
            </p>

            <div className="pt-4 flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-6 py-2.5 border border-outline-variant text-on-surface-variant font-button-text text-button-text rounded-lg hover:bg-surface transition-colors flex-1"
              >
                Play Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-secondary text-on-secondary font-button-text text-button-text rounded-lg hover:bg-[#3a31c5] transition-colors shadow-md flex-1 active:scale-[0.98]"
              >
                Back to Library
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-md text-center space-y-6">
            <span className="material-symbols-outlined text-6xl text-tertiary-fixed-dim fill animate-pulse">celebration</span>
            <h2 className="font-h1-academic text-2xl text-primary font-bold">Revision Complete!</h2>

            <div className="bg-surface p-6 rounded-lg border border-outline-variant space-y-2">
              <div className="text-sm font-label-mono text-outline uppercase">Mastered this session</div>
              <div className="text-4xl font-bold text-secondary">{masteredCount} / {deck.length}</div>
              <p className="text-xs text-on-surface-variant pt-2">
                These words have been updated in your library and removed from active learning decks.
              </p>
            </div>

            <div className="pt-4 flex gap-4 justify-center">
              <button
                onClick={() => {
                  setDeck(deck.sort(() => Math.random() - 0.5));
                  setCurrentIdx(0);
                  setIsFlipped(false);
                  setSessionCompleted(false);
                  setMasteredCount(0);
                }}
                className="px-6 py-2.5 border border-outline-variant text-on-surface-variant font-button-text text-button-text rounded-lg hover:bg-surface transition-colors flex-1"
              >
                Revise Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-secondary text-on-secondary font-button-text text-button-text rounded-lg hover:bg-[#3a31c5] transition-colors shadow-sm flex-1"
              >
                Back to Library
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4">
      {/* Settings Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-h1-academic text-2xl text-primary font-bold">
            Flashcard Revision
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Flip cards or play the multiple-choice game to revise words.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/60">
            <button
              onClick={() => {
                setGameMode(false);
                setIsFlipped(false);
              }}
              className={`px-3 py-1 rounded-md text-[10px] font-label-mono uppercase transition-all ${
                !gameMode
                  ? 'bg-secondary text-on-secondary font-bold shadow-sm'
                  : 'text-outline hover:text-primary'
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => {
                setGameMode(true);
                setIsFlipped(false);
              }}
              className={`px-3 py-1 rounded-md text-[10px] font-label-mono uppercase transition-all flex items-center gap-1 ${
                gameMode
                  ? 'bg-secondary text-on-secondary font-bold shadow-sm'
                  : 'text-outline hover:text-primary'
              }`}
            >
              Game
            </button>
          </div>

          {/* Deck Filters */}
          <div className="flex gap-1.5">
            {['all', 'learning', 'review'].map((type) => (
              <button
                key={type}
                onClick={() => setDeckType(type)}
                className={`px-3.5 py-1 rounded-full font-label-mono text-[10px] uppercase tracking-wider transition-all border ${
                  deckType === type
                    ? 'bg-surface-container-highest border-secondary text-primary font-bold shadow-sm'
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-secondary'
                }`}
              >
                {type === 'all' ? 'All' : type === 'review' ? 'Needs Review' : 'Learning'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {gameMode && (
        <div className="w-full max-w-md mx-auto bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-3.5 flex justify-between items-center shadow-inner text-on-surface">
          {/* Score info */}
          <div className="flex items-center gap-2">
            <div>
              <div className="font-label-mono text-[9px] uppercase tracking-wider text-outline leading-none">Score</div>
              <div className="font-bold text-primary font-h1-academic text-base mt-0.5 leading-none">{score}</div>
            </div>
          </div>

          {/* Hearts Life bar */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="font-label-mono text-[9px] uppercase tracking-wider text-outline leading-none mb-1">Lives</div>
            <div className="flex gap-1">
              {[1, 2, 3].map((hVal) => (
                <span
                  key={hVal}
                  className={`material-symbols-outlined text-sm transition-all duration-300 ${
                    lives >= hVal ? 'text-red-500 fill scale-110' : 'text-slate-300 scale-90'
                  }`}
                >
                  favorite
                </span>
              ))}
            </div>
          </div>

          {/* Combo streak info */}
          <div className="min-w-[80px] flex justify-end">
            {combo > 0 ? (
              <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-700 px-3 py-1 rounded-full text-xs font-bold animate-combo-pulse border border-orange-500/20 shadow-sm">
                <span className="material-symbols-outlined text-xs fill">local_fire_department</span>
                <span>{combo} streak</span>
              </div>
            ) : (
              <span className="text-[10px] text-outline font-label-mono italic">no streak</span>
            )}
          </div>
        </div>
      )}

      {deck.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant font-body-main border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
          No words found matching the selected revision filter. Try another settings deck!
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8">
          {/* Progress Indicator */}
          <div className="w-full max-w-md flex justify-between items-center text-on-surface-variant font-label-mono text-xs">
            <span>Card {currentIdx + 1} of {deck.length}</span>
            <span className="bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full font-bold">
              {deck[currentIdx].difficulty || 'B2'}
            </span>
          </div>

          {/* 3D Flashcard Deck Container */}
          <div
            onClick={handleCardFlip}
            className={`w-full max-w-md h-[520px] cursor-pointer relative perspective-1000`}
          >
            <div className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            } ${shakeCard ? 'animate-shake' : ''}`}>

              {/* FRONT OF CARD */}
              <div className={`w-full h-full absolute inset-0 backface-hidden rounded-xl p-6 pb-4 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.03)] border ${
                gameMode
                  ? `game-light-card text-on-surface game-card-shadow ${combo >= 3 ? 'animate-flame-glow' : ''}`
                  : 'bg-surface-container-lowest border-outline-variant'
              }`}>
                {/* Visual decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 pointer-events-none rounded-tr-xl rounded-bl-full ${
                  gameMode
                    ? 'bg-gradient-to-bl from-secondary/5 to-transparent'
                    : 'bg-gradient-to-bl from-secondary-fixed/20 to-transparent'
                }`}></div>

                {/* Timer Line Indicator */}
                {gameMode && !isFlipped && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden rounded-t-xl">
                    <div
                      className={`h-full transition-all duration-1000 ease-linear ${
                        timeLeft <= 5 ? 'bg-red-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${(timeLeft / 15) * 100}%` }}
                    ></div>
                  </div>
                )}

                <div className="flex justify-between items-start pt-2">
                  <span className={`font-label-mono text-[10px] uppercase tracking-widest ${gameMode ? 'text-secondary font-bold' : 'text-outline'}`}>
                    {deck[currentIdx].partOfSpeech}
                  </span>
                  {gameMode && !isFlipped && (
                    <span className={`font-label-mono text-xs font-bold flex items-center gap-1 ${
                      timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-slate-500'
                    }`}>
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {timeLeft}s
                    </span>
                  )}
                </div>

                <div className="text-center py-1 flex flex-col items-center">
                  <h3 className="font-display-word text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-primary">
                    {deck[currentIdx].word}
                  </h3>
                  <PronunciationPlayer
                    word={deck[currentIdx].word}
                    pronunciation={deck[currentIdx].pronunciation}
                    className="justify-center"
                    isDarkMode={false}
                  />
                </div>

                {gameMode ? (
                  <div className="space-y-2 w-full mt-1.5" onClick={(e) => e.stopPropagation()}>
                    {options.map((opt, oIdx) => {
                      const isEliminated = oIdx === eliminatedIdx;

                      let btnClass = "w-full text-left py-2.5 px-3.5 rounded-lg border text-[10.5px] leading-snug choice-btn-transition hover:scale-[1.01] flex items-start gap-2.5 ";
                      let icon = null;

                      if (isEliminated) {
                        btnClass += "bg-slate-55 border-slate-200/40 text-slate-300 pointer-events-none italic opacity-40";
                        icon = <span className="material-symbols-outlined text-base text-slate-300 mt-0.5">visibility_off</span>;
                      } else if (selectedIdx === oIdx) {
                        if (answerStatus === 'correct') {
                          btnClass += "bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/10 pointer-events-none";
                          icon = <span className="material-symbols-outlined text-base text-emerald-600 mt-0.5 fill">check_circle</span>;
                        } else if (answerStatus === 'incorrect') {
                          btnClass += "bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/10 pointer-events-none";
                          icon = <span className="material-symbols-outlined text-base text-rose-600 mt-0.5 fill">cancel</span>;
                        }
                      } else {
                        if (answerStatus === 'correct') {
                          btnClass += "bg-slate-50 border-outline-variant/30 text-outline pointer-events-none";
                        } else {
                          btnClass += "bg-white hover:bg-slate-50/60 border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-950 cursor-pointer active:scale-[0.99]";
                        }
                        icon = <span className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-400 mt-0.5 bg-slate-50">{String.fromCharCode(65 + oIdx)}</span>;
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswerSelect(oIdx)}
                          disabled={answerStatus === 'correct' || isEliminated}
                          className={btnClass}
                        >
                          {icon}
                          <span className="flex-1 leading-snug">{isEliminated ? "Eliminated by lifeline" : opt}</span>
                        </button>
                      );
                    })}

                    <div className="flex justify-between items-center mt-2 px-1">
                      <button
                        onClick={handleUseClue}
                        disabled={clueUsed || answerStatus === 'correct'}
                        className={`text-[9px] font-label-mono uppercase tracking-wider flex items-center gap-1 transition-colors ${
                          clueUsed
                            ? 'text-slate-300 cursor-default'
                            : 'text-amber-600 hover:text-amber-800'
                        }`}
                        title="Eliminate 1 wrong option"
                      >
                        <span className="material-symbols-outlined text-xs">lightbulb</span>
                        {clueUsed ? 'Lifeline Used' : 'Use Clue (50/50)'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped(true);
                        }}
                        className="text-outline hover:text-primary transition-colors text-[9px] font-label-mono uppercase tracking-widest hover:underline"
                      >
                        Skip to Reveal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-outline-variant text-[11px] font-label-mono flex items-center justify-center gap-1 py-4">
                    <span className="material-symbols-outlined text-sm">flip</span>
                    Click card to reveal meaning
                  </div>
                )}
              </div>

              {/* BACK OF CARD */}
              <div className={`w-full h-full absolute inset-0 backface-hidden rotate-y-180 rounded-xl p-8 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.03)] border bg-surface-container-low border-outline-variant`}>
                <div className="space-y-4 overflow-y-auto max-h-[300px] scrollbar pr-1">
                  <div>
                    <span className="font-label-mono text-[9px] uppercase tracking-wider text-outline">Meaning</span>
                    <p className="font-body-main text-body-main font-semibold mt-1 text-primary">
                      {deck[currentIdx].definition}
                    </p>
                  </div>

                  {deck[currentIdx].examples && deck[currentIdx].examples.length > 0 && (
                    <div>
                      <span className="font-label-mono text-[9px] uppercase tracking-wider text-outline">Example</span>
                      <p className="font-body-main text-body-sm italic mt-1 leading-relaxed text-on-surface-variant">
                        "{deck[currentIdx].examples[0]}"
                      </p>
                    </div>
                  )}

                  {deck[currentIdx].memoryTrick && (
                    <div className="p-3 rounded-lg border bg-surface-container-lowest border-outline-variant/30">
                      <span className="font-label-mono text-[9px] font-bold uppercase tracking-wider text-secondary">Memory Trick</span>
                      <p className="font-body-sm text-xs italic mt-0.5 text-on-surface-variant">
                        {deck[currentIdx].memoryTrick}
                      </p>
                    </div>
                  )}
                </div>

                {/* Revision Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-outline-variant/30" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleStillLearning}
                    className="flex-1 font-button-text text-xs py-2.5 rounded-lg transition-colors border bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface"
                  >
                    Still Learning
                  </button>
                  <button
                    onClick={() => handleMarkMastered(deck[currentIdx]._id)}
                    className="flex-1 font-button-text text-xs py-2.5 rounded-lg transition-colors shadow-sm font-bold bg-secondary text-on-secondary hover:bg-[#3a31c5]"
                  >
                    Mark Mastered
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Simple Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="p-3 border rounded-full transition-colors border-outline-variant text-on-surface-variant hover:text-primary hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none"
              title="Previous Card"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <button
              onClick={handleNext}
              className="p-3 border rounded-full transition-colors border-outline-variant text-on-surface-variant hover:text-primary hover:bg-surface-container"
              title="Next Card"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

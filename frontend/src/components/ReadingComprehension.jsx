import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_PASSAGES = [
  {
    id: 'goldbach',
    title: 'The Goldbach Conjecture',
    topic: 'Mathematics',
    difficulty: 'Hard',
    paragraphs: [
      "An interesting example of a theorem of the theory of numbers that has been neither proven nor disproven is the so-called Goldbach conjecture, proposed in the year 1742. It states that each even number can be represented as the sum of two primes. One can easily find that it is true as applied to some simple examples, thus: 12=7+5, 24=17+7, and 32=29+3. But, in spite of the immense amount of work done in this line, mathematicians have never been able either to give conclusive proof of the infallibility of this statement or to find an example that would disprove it.",
      "As recently as 1931, a Russian mathematician, Schnirelman, succeeded in taking the first constructive step towards securing the desired proof. He was able to show that each even number is the sum of not more than 300,000 primes. Still more recently the gap between Schnirelman's \"sum of three hundred thousand primes\" and the desired \"sum of two primes\" was considerably narrowed by another Russian mathematician, Vinogradoff, who was able to reduce it to \"the sum of four primes\". But the last two steps from Vinogradoff's four to Goldbach's two primes seem to be the toughest of all and nobody can tell whether another few years or another few centuries will be required to prove or disprove this difficult proposition."
    ],
    questions: [
      {
        text: "Which of the following most accurately states the main idea in the passage?",
        options: [
          "Goldbach conjecture is a fundamental theorem of the theory of numbers.",
          "Goldbach was a mathematical genius unparalleled since his time.",
          "Goldbach conjecture can be verified with simple examples.",
          "Goldbach conjecture is wanting a mathematical verification.",
          "A significant portion of Goldbach conjecture has been proven."
        ],
        correctIndex: 3,
        explanation: "The passage centers on the fact that despite simple examples and centuries of work, the Goldbach conjecture has never been fully proven or disproven; it is still wanting a final verification."
      },
      {
        text: "What is the status of the Goldbach conjecture today?",
        options: [
          "It has been completely proven.",
          "It has been disproven by Schnirelman.",
          "It remains neither proven nor disproven.",
          "It has been proven for all numbers except four."
        ],
        correctIndex: 2,
        explanation: "As stated in the first sentence, the theorem 'has been neither proven nor disproven'."
      },
      {
        text: "What was Schnirelman's contribution to the Goldbach conjecture?",
        options: [
          "He proved that every even number is the sum of two primes.",
          "He proved that every even number is the sum of not more than 300,000 primes.",
          "He found a counterexample that disproves the conjecture.",
          "He reduced the problem to the sum of four primes."
        ],
        correctIndex: 1,
        explanation: "The passage states Schnirelman showed that 'each even number is the sum of not more than 300,000 primes'."
      }
    ]
  },
  {
    id: 'ai-linguistics',
    title: 'The Ephemeral Evolution of Language',
    topic: 'Linguistics',
    difficulty: 'Medium',
    paragraphs: [
      "Language is a living entity, its words ephemeral creations that rise, flourish, and fade. While some words endure for centuries, others appear briefly in response to cultural trends and vanish just as quickly. The digital age has accelerated this lifecycle, introducing neologisms through internet culture that become ubiquitous within weeks, only to become outdated slangs within months.",
      "Linguists trace these shifts to capture the values and technologies of different epochs. For example, words like 'facsimile' or 'telegram' have shifted from daily vocabulary to historical references. Understanding the transient nature of words helps lexicographers compile dictionaries that are not static archives, but dynamic reflections of human communication."
    ],
    questions: [
      {
        text: "According to the passage, how has the digital age affected the lifecycle of language?",
        options: [
          "It has preserved old slangs from dying out.",
          "It has slowed down the creation of new words.",
          "It has accelerated the rise and fall of new vocabulary terms.",
          "It has made all language permanent and unchangeable."
        ],
        correctIndex: 2,
        explanation: "The text states the digital age has 'accelerated this lifecycle, introducing neologisms... only to become outdated within months.'"
      },
      {
        text: "Which word used in the passage is synonym for 'existing everywhere'?",
        options: [
          "Ephemeral",
          "Ubiquitous",
          "Transient",
          "Neologisms"
        ],
        correctIndex: 1,
        explanation: "Ubiquitous means present or found everywhere, which matches the description."
      }
    ]
  },
  {
    id: 'dark-matter',
    title: 'The Mystery of Dark Matter',
    topic: 'Physics',
    difficulty: 'Hard',
    paragraphs: [
      "In astrophysics, dark matter is a hypothetical form of matter thought to account for approximately 85% of the matter in the universe. Dark matter is called 'dark' because it does not appear to interact with the electromagnetic field, meaning it does not absorb, reflect, or emit light, making it extremely difficult to detect directly. Its presence is implied by a variety of astrophysical observations, including gravitational effects that cannot be explained by accepted theories of gravity unless more matter is present than can be seen.",
      "The primary candidate for dark matter has historically been some new kind of elementary particle, such as Weakly Interacting Massive Particles (WIMPs). Despite massive search efforts using highly sensitive underground detectors and particle colliders like the Large Hadron Collider, no such particles have been observed. Alternative hypotheses, such as modified gravity theories (like MOND) or primordial black holes, continue to be explored, leaving dark matter as one of the greatest unsolved mysteries in modern science."
    ],
    questions: [
      {
        text: "Why is dark matter referred to as 'dark'?",
        options: [
          "It only exists in black holes where light cannot escape.",
          "It does not interact with the electromagnetic field and is invisible.",
          "It absorbs all light that hits it, creating dark spots in space.",
          "It was discovered during a solar eclipse."
        ],
        correctIndex: 1,
        explanation: "The passage notes that dark matter is called 'dark' because it does not interact with the electromagnetic field, meaning it does not absorb, reflect, or emit light."
      },
      {
        text: "Which of the following describes WIMPs?",
        options: [
          "A type of celestial black hole.",
          "A theory of modified gravity.",
          "A hypothetical elementary particle candidate for dark matter.",
          "A satellite used to measure cosmic background radiation."
        ],
        correctIndex: 2,
        explanation: "The passage defines WIMPs as 'Weakly Interacting Massive Particles', which are a candidate for some new kind of elementary particle."
      }
    ]
  },
  {
    id: 'anchoring-effect',
    title: 'The Anchoring Effect in Decision Making',
    topic: 'Psychology',
    difficulty: 'Medium',
    paragraphs: [
      "The anchoring effect is a cognitive bias where an individual depends too heavily on an initial piece of information offered (considered the 'anchor') when making decisions. Once the value of this anchor is set, all future negotiations, arguments, or estimates are made in relation to it, causing a systematic bias toward the anchor value.",
      "For instance, in retail sales, if a customer is first shown a watch priced at $500, and then shown a second watch priced at $150, the second watch appears significantly cheaper than if it had been shown first. Advertisers and negotiators frequently exploit this heuristic, setting high initial prices or extreme starting positions to pull the final outcome in their favor, regardless of the objective value of the item."
    ],
    questions: [
      {
        text: "What is the 'anchor' in the context of the anchoring effect?",
        options: [
          "The final price agreed upon in a negotiation.",
          "An objective assessment of an item's true worth.",
          "The initial piece of information that influences subsequent choices.",
          "A mathematical average of all prices shown."
        ],
        correctIndex: 2,
        explanation: "The passage states that the 'anchor' is the 'initial piece of information offered' that individuals depend too heavily on when making decisions."
      },
      {
        text: "How do negotiators exploit the anchoring effect?",
        options: [
          "By remaining quiet and letting the other party speak first.",
          "By setting extreme initial prices or positions to pull final results in their favor.",
          "By discounting items to their absolute minimum price.",
          "By avoiding any initial numbers until the very end."
        ],
        correctIndex: 1,
        explanation: "As stated, negotiators 'set high initial prices or extreme starting positions to pull the final outcome in their favor'."
      }
    ]
  }
];

export default function ReadingComprehension({ onClose }) {
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Custom Passages persisted in localStorage
  const [customPassages, setCustomPassages] = useState(() => {
    try {
      const saved = localStorage.getItem('lexicon_custom_passages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Creator Modal UI States
  const [showCreator, setShowCreator] = useState(false);
  const [creatorMode, setCreatorMode] = useState('ai'); // 'ai' or 'manual'
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('Hard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // Manual passage builder states
  const [manualTitle, setManualTitle] = useState('');
  const [manualTopic, setManualTopic] = useState('');
  const [manualDifficulty, setManualDifficulty] = useState('Medium');
  const [manualPassage, setManualPassage] = useState('');
  const [manualQuestions, setManualQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
  ]);

  // Passage Setup / Optimizable Timer States
  const [setupPassage, setSetupPassage] = useState(null);
  const [rcTimerEnabled, setRcTimerEnabled] = useState(() => {
    return localStorage.getItem('lexicon_rc_timer_enabled') !== 'false';
  });
  const [rcTimerLimit, setRcTimerLimit] = useState(() => {
    return parseInt(localStorage.getItem('lexicon_rc_timer_limit') || '180', 10);
  });
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const passages = [...DEFAULT_PASSAGES, ...customPassages];

  // Active Timer Effect
  useEffect(() => {
    if (!selectedPassage || timeLeft === null || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setSubmitted(true);
          // Play synthesized timeout buzz
          try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sawtooth';
              osc.connect(gain);
              gain.connect(ctx.destination);
              const now = ctx.currentTime;
              osc.frequency.setValueAtTime(220, now);
              osc.frequency.setValueAtTime(130.81, now + 0.3);
              gain.gain.setValueAtTime(0.12, now);
              gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
              osc.start(now);
              osc.stop(now + 0.6);
            }
          } catch (e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedPassage, timeLeft, submitted]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (seconds === null) return 'No Limit';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle option select
  const handleSelectOption = (qIdx, optIdx) => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: optIdx
    });
  };

  // Navigate questions
  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleNext = (totalQuestions) => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitted(true);
    }
  };

  // Calculate score
  const getScore = () => {
    let score = 0;
    selectedPassage.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  // AI Generate Passage
  const handleAIGenerate = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setGenError('');
    try {
      const response = await fetch('/api/words/generate-comprehension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicOrText: aiTopic, difficulty: aiDifficulty })
      });
      if (!response.ok) {
        throw new Error('Failed to generate passage. Please verify connection and Gemini API key.');
      }
      const data = await response.json();
      data.id = 'custom-' + Date.now();
      
      const updated = [data, ...customPassages];
      setCustomPassages(updated);
      localStorage.setItem('lexicon_custom_passages', JSON.stringify(updated));
      
      // Open Setup view for the newly generated passage
      setSetupPassage(data);
      setShowCreator(false);
      setAiTopic('');
    } catch (err) {
      setGenError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Manual Builder Handlers
  const handleQuestionChange = (qIdx, field, val) => {
    const updated = [...manualQuestions];
    updated[qIdx][field] = val;
    setManualQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const updated = [...manualQuestions];
    updated[qIdx].options[optIdx] = val;
    setManualQuestions(updated);
  };

  const addManualQuestion = () => {
    if (manualQuestions.length >= 5) return;
    setManualQuestions([
      ...manualQuestions,
      { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    ]);
  };

  const removeManualQuestion = (idx) => {
    if (manualQuestions.length <= 1) return;
    const updated = manualQuestions.filter((_, i) => i !== idx);
    setManualQuestions(updated);
  };

  const handleManualSave = (e) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualTopic.trim() || !manualPassage.trim() || manualQuestions.some(q => !q.text.trim() || q.options.some(opt => !opt.trim()))) {
      alert('Please fill out all fields, questions, and option texts!');
      return;
    }

    const paragraphs = manualPassage.split('\n').map(p => p.trim()).filter(Boolean);
    const newPassage = {
      id: 'custom-' + Date.now(),
      title: manualTitle.trim(),
      topic: manualTopic.trim(),
      difficulty: manualDifficulty,
      paragraphs,
      questions: manualQuestions.map(q => ({
        ...q,
        correctIndex: parseInt(q.correctIndex, 10)
      }))
    };

    const updated = [newPassage, ...customPassages];
    setCustomPassages(updated);
    localStorage.setItem('lexicon_custom_passages', JSON.stringify(updated));

    // Open Setup view for the manually written passage
    setSetupPassage(newPassage);
    setShowCreator(false);

    // Reset Form
    setManualTitle('');
    setManualTopic('');
    setManualDifficulty('Medium');
    setManualPassage('');
    setManualQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
  };

  // Delete Custom Passage
  const handleDeletePassage = (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this custom reading passage?')) return;
    const updated = customPassages.filter(p => p.id !== id);
    setCustomPassages(updated);
    localStorage.setItem('lexicon_custom_passages', JSON.stringify(updated));
  };

  if (!selectedPassage) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center border-b border-outline-variant pb-4">
          <div>
            <h2 className="font-h1-academic text-2xl text-primary font-bold">Reading Comprehension</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Select or create an academic passage to practice reading and comprehension skills.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreator(true)}
              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg font-button-text text-button-text transition-all duration-200 border border-indigo-100 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Create Passage
            </button>
            <button 
              onClick={onClose}
              className="text-secondary hover:underline font-button-text text-button-text"
            >
              Back to Menu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {passages.map((passage) => {
            const isCustom = customPassages.some(cp => cp.id === passage.id);
            return (
              <div 
                key={passage.id}
                onClick={() => setSetupPassage(passage)}
                className="bg-surface-container-lowest border border-outline-variant hover:border-secondary hover:shadow-md rounded-xl p-6 cursor-pointer transition-all duration-200 group relative"
              >
                <div className="flex justify-between items-start">
                  <span className="font-label-mono text-[10px] text-secondary font-bold uppercase tracking-wider bg-secondary/10 px-2 py-0.5 rounded">
                    {passage.topic}
                  </span>
                  {isCustom && (
                    <button
                      onClick={(e) => handleDeletePassage(e, passage.id)}
                      className="text-outline hover:text-error transition-colors p-1 rounded hover:bg-red-50 -mt-1"
                      title="Delete Passage"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
                <h3 className="font-h1-academic text-xl text-primary font-bold mt-3 group-hover:text-secondary transition-colors">
                  {passage.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                  {passage.paragraphs[0]}
                </p>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-surface-container">
                  <span className="font-body-sm text-xs text-outline">Difficulty: {passage.difficulty}</span>
                  <span className="font-button-text text-xs text-secondary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Start Reading <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optimizable Passage Setup Modal */}
        {setupPassage && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-combo-pulse">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
              <div className="border-b border-outline-variant pb-3 flex justify-between items-center">
                <h3 className="font-h1-academic text-xl text-primary font-bold">Configure Study Session</h3>
                <button 
                  onClick={() => setSetupPassage(null)}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="font-label-mono text-[9px] text-secondary font-bold uppercase tracking-wider bg-secondary/10 px-2 py-0.5 rounded">
                    {setupPassage.topic}
                  </span>
                  <h4 className="font-h1-academic text-lg text-primary font-bold mt-2 leading-tight">
                    {setupPassage.title}
                  </h4>
                  <p className="text-xs text-outline mt-1 font-body-main">Difficulty: {setupPassage.difficulty}</p>
                </div>

                <div className="border-t border-outline-variant/50 pt-4 space-y-4">
                  {/* Timer toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5 pr-2">
                      <span className="text-sm font-semibold text-primary font-body-main">Enable Reading Timer</span>
                      <span className="text-[11px] text-outline leading-snug">Submit automatically when time runs out</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={rcTimerEnabled} 
                        onChange={(e) => {
                          setRcTimerEnabled(e.target.checked);
                          localStorage.setItem('lexicon_rc_timer_enabled', e.target.checked ? 'true' : 'false');
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Timer limit selector */}
                  {rcTimerEnabled && (
                    <div className="space-y-1.5 animate-combo-pulse">
                      <label className="block font-label-mono text-[10px] uppercase text-on-surface-variant font-bold">
                        Timer Duration
                      </label>
                      <select
                        value={rcTimerLimit}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setRcTimerLimit(val);
                          localStorage.setItem('lexicon_rc_timer_limit', val.toString());
                        }}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                      >
                        <option value={60}>1 Minute (Fast Practice)</option>
                        <option value={120}>2 Minutes</option>
                        <option value={180}>3 Minutes (Standard Exam)</option>
                        <option value={300}>5 Minutes</option>
                        <option value={600}>10 Minutes (Deep Study)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/50">
                <button
                  onClick={() => setSetupPassage(null)}
                  className="px-5 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-button-text text-xs hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedPassage(setupPassage);
                    setTimeLeft(rcTimerEnabled ? rcTimerLimit : null);
                    setSetupPassage(null);
                    setSelectedAnswers({});
                    setSubmitted(false);
                    setCurrentQuestionIdx(0);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white font-button-text text-xs rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  Start Passage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Creator Modal Overlay */}
        {showCreator && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-combo-pulse">
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <h3 className="font-h1-academic text-xl text-primary font-bold">Create Comprehension Passage</h3>
                <button 
                  onClick={() => setShowCreator(false)}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Selector Tabs */}
              <div className="flex border border-outline-variant rounded-lg overflow-hidden p-1 bg-surface-container-low max-w-xs">
                <button
                  onClick={() => setCreatorMode('ai')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded transition-colors ${
                    creatorMode === 'ai' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  AI Generate 🤖
                </button>
                <button
                  onClick={() => setCreatorMode('manual')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded transition-colors ${
                    creatorMode === 'manual' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Manual Builder ✍️
                </button>
              </div>

              {creatorMode === 'ai' ? (
                /* AI Generation view */
                <form onSubmit={handleAIGenerate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Comprehension Topic / Theme</label>
                      <input
                        type="text"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g. Ancient Rome, Quantum Computing, Climate Change"
                        disabled={isGenerating}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Toughness Level</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        disabled={isGenerating}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-3 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Very Hard">Very Hard</option>
                        <option value="Impossible">Impossible 💀</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-outline">
                      Gemini will construct a comprehensive reading passage of 200–350 words matching the selected toughness level, draft 3 multiple-choice questions, mark correct index guides, and supply educational explanations.
                    </p>
                  </div>

                  {genError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">error</span>
                      <span>{genError}</span>
                    </div>
                  )}

                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-on-surface-variant font-medium animate-pulse">
                        Gemini is writing the passage and crafting questions... Please wait.
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreator(false)}
                        className="px-5 py-2.5 border border-outline-variant rounded-lg text-on-surface-variant text-button-text font-button-text hover:bg-surface transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-button-text font-button-text hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Generate Passage
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                /* Manual Builder Form */
                <form onSubmit={handleManualSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Passage Title</label>
                      <input
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder="e.g. The Discovery of Radium"
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Topic / Domain</label>
                      <input
                        type="text"
                        value={manualTopic}
                        onChange={(e) => setManualTopic(e.target.value)}
                        placeholder="e.g. Chemistry, Space, Economics"
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Difficulty</label>
                      <select
                        value={manualDifficulty}
                        onChange={(e) => setManualDifficulty(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Very Hard">Very Hard</option>
                        <option value="Impossible">Impossible 💀</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-label-mono text-xs uppercase text-on-surface-variant font-bold">Passage Paragraphs</label>
                    <textarea
                      value={manualPassage}
                      onChange={(e) => setManualPassage(e.target.value)}
                      placeholder="Type or paste the passage paragraphs here. Press Enter to start a new paragraph."
                      rows={5}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-[#3f38cf] focus:border-[#3f38cf]"
                      required
                    ></textarea>
                  </div>

                  {/* Manual Questions list */}
                  <div className="space-y-4 border-t border-outline-variant/50 pt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-h1-academic text-sm font-bold text-primary">Questions ({manualQuestions.length})</h4>
                      <button
                        type="button"
                        onClick={addManualQuestion}
                        disabled={manualQuestions.length >= 5}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span> Add Question
                      </button>
                    </div>

                    {manualQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-3 relative">
                        <div className="flex justify-between items-center">
                          <span className="font-label-mono text-xs text-secondary font-bold">Question #{qIdx + 1}</span>
                          {manualQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeManualQuestion(qIdx)}
                              className="text-xs text-error hover:underline flex items-center gap-0.5"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                          placeholder="Type question query here..."
                          className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-on-surface font-body-main text-xs focus:outline-none"
                          required
                        />

                        {/* 4 Choices */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <input
                              key={optIdx}
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-on-surface font-body-main text-xs focus:outline-none"
                              required
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] uppercase font-bold text-on-surface-variant font-label-mono">Correct Answer</label>
                            <select
                              value={q.correctIndex}
                              onChange={(e) => handleQuestionChange(qIdx, 'correctIndex', e.target.value)}
                              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1 text-xs focus:outline-none"
                            >
                              <option value={0}>Option A</option>
                              <option value={1}>Option B</option>
                              <option value={2}>Option C</option>
                              <option value={3}>Option D</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] uppercase font-bold text-on-surface-variant font-label-mono">Explanation / Review Detail</label>
                            <input
                              type="text"
                              value={q.explanation}
                              onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                              placeholder="Explanation for the correct choice..."
                              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreator(false)}
                      className="px-5 py-2.5 border border-outline-variant rounded-lg text-on-surface-variant text-button-text font-button-text hover:bg-surface transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-button-text font-button-text hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Save Passage
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const questions = selectedPassage.questions;
  const currentQuestion = questions[currentQuestionIdx];

  if (submitted) {
    const score = getScore();
    const pct = Math.round((score / questions.length) * 100);

    return (
      <div className="w-full max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-md text-center space-y-6 animate-combo-pulse">
        <span className="material-symbols-outlined text-6xl text-tertiary-fixed-dim fill">menu_book</span>
        <h2 className="font-h1-academic text-2xl text-primary font-bold">Comprehension Complete!</h2>
        
        <div className="grid grid-cols-2 gap-4 py-4 max-w-sm mx-auto">
          <div className="bg-surface p-4 rounded-lg border border-outline-variant">
            <div className="text-2xl font-bold text-primary">{score}/{questions.length}</div>
            <div className="text-xs text-outline uppercase font-label-mono mt-1">Correct Answers</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-outline-variant">
            <div className="text-2xl font-bold text-secondary">{pct}%</div>
            <div className="text-xs text-outline uppercase font-label-mono mt-1">Passing Grade</div>
          </div>
        </div>

        <div className="text-left space-y-4 pt-4">
          <h3 className="font-h1-academic text-lg font-bold text-primary">Review Answers:</h3>
          {questions.map((q, idx) => {
            const isCorrect = selectedAnswers[idx] === q.correctIndex;
            return (
              <div key={idx} className={`p-4 rounded-lg border ${isCorrect ? 'border-tertiary-fixed-dim bg-tertiary-fixed-dim/5' : 'border-error bg-error-container/10'} space-y-2`}>
                <p className="font-body-main text-body-sm font-bold text-primary">{idx + 1}. {q.text}</p>
                <p className="text-xs text-on-surface-variant">
                  <span className="font-semibold">Your Answer:</span> {q.options[selectedAnswers[idx]] || "Skipped"}
                </p>
                {!isCorrect && (
                  <p className="text-xs text-error font-semibold">
                    <span className="font-semibold">Correct Answer:</span> {q.options[q.correctIndex]}
                  </p>
                )}
                {q.explanation && (
                  <p className="text-xs italic text-on-surface-variant/80 bg-surface-bright p-2.5 rounded border border-outline-variant/30">
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-6 flex gap-4 justify-center">
          <button 
            onClick={() => {
              setSelectedAnswers({});
              setSubmitted(false);
              setCurrentQuestionIdx(0);
              setTimeLeft(rcTimerEnabled ? rcTimerLimit : null);
            }}
            className="px-6 py-2.5 border border-outline-variant text-on-surface-variant font-button-text text-button-text rounded-lg hover:bg-surface transition-colors"
          >
            Retry Passage
          </button>
          <button 
            onClick={() => setSelectedPassage(null)}
            className="px-6 py-2.5 bg-secondary text-on-secondary font-button-text text-button-text rounded-lg hover:bg-[#3a31c5] transition-colors shadow-sm"
          >
            Other Passages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden min-h-[500px]">
      {/* Left Column: Reading Passage */}
      <section className="flex-1 md:w-1/2 h-full overflow-y-auto border-r border-outline-variant bg-surface-container-lowest p-8 lg:p-12 scrollbar">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 border-b border-outline-variant/50 pb-4 flex justify-between items-end">
            <div>
              <span className="font-label-mono text-xs text-secondary tracking-widest uppercase mb-1 block">Reading Comprehension</span>
              <h2 className="font-h1-academic text-2xl text-primary font-bold">Passage: {selectedPassage.title}</h2>
            </div>
            <button 
              onClick={() => setSelectedPassage(null)}
              className="text-xs text-outline hover:text-primary underline font-body-sm shrink-0 mb-1"
            >
              Exit Passage
            </button>
          </div>
          <div className="prose prose-slate max-w-none font-h1-academic text-[17px] leading-[30px] text-on-surface font-light space-y-6">
            {selectedPassage.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Right Column: Quiz Panel */}
      <section className="flex-1 md:w-1/2 h-full bg-background flex flex-col p-8 lg:p-12 overflow-y-auto">
        {/* Progress / Meta */}
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </div>
            <span className="font-label-mono text-label-mono text-on-surface-variant font-bold">
              Question {currentQuestionIdx + 1} of {questions.length}
            </span>
          </div>
          
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-label-mono text-xs font-bold border transition-colors ${
              timeLeft < 30 
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className="material-symbols-outlined text-[16px]">timer</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Quiz Question */}
        <div className="flex-1 max-w-xl mx-auto w-full flex flex-col justify-center">
          <h3 className="font-h1-academic text-xl md:text-2xl leading-relaxed text-primary mb-8 font-medium">
            {currentQuestion.text}
          </h3>

          {/* Options List */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, optIdx) => {
              const isChecked = selectedAnswers[currentQuestionIdx] === optIdx;
              return (
                <label 
                  key={optIdx} 
                  onClick={() => handleSelectOption(currentQuestionIdx, optIdx)}
                  className="block relative group cursor-pointer"
                >
                  <div className={`p-4 bg-surface border rounded-xl flex items-start gap-4 transition-all duration-200 hover:border-secondary hover:shadow-sm ${
                    isChecked 
                      ? 'border-secondary bg-surface-container-low ring-1 ring-secondary' 
                      : 'border-outline-variant'
                  }`}>
                    <div className={`w-6 h-6 mt-0.5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isChecked ? 'border-secondary' : 'border-outline-variant group-hover:border-secondary'
                    }`}>
                      <div className={`w-3 h-3 rounded-full bg-secondary transition-transform duration-200 ${
                        isChecked ? 'scale-100' : 'scale-0'
                      }`}></div>
                    </div>
                    <span className="font-body-main text-body-sm md:text-body-main text-on-surface leading-snug">
                      {option}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 pt-6 border-t border-outline-variant/50 flex justify-between items-center max-w-xl mx-auto w-full">
          <button 
            onClick={handlePrevious}
            disabled={currentQuestionIdx === 0}
            className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-button-text text-button-text hover:bg-surface-container-low hover:text-primary transition-colors flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Previous
          </button>
          
          <button 
            onClick={() => handleNext(questions.length)}
            disabled={selectedAnswers[currentQuestionIdx] === undefined}
            className="px-8 py-2.5 rounded-lg bg-secondary text-on-secondary font-button-text text-button-text shadow-sm hover:bg-secondary/90 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            {currentQuestionIdx === questions.length - 1 ? 'Finish' : 'Next'}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
}

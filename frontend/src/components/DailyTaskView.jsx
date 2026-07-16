import React, { useState, useEffect, useRef } from 'react';

// Seeded random number generator for deterministic daily choices
const getSeededRandom = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    hash = (hash * 16807) % 2147483647;
    return (hash - 1) / 2147483646;
  };
};

const getContextSentence = (target) => {
  if (target.examples && target.examples.length > 0) {
    const exactMatch = target.examples.find(ex => new RegExp(`\\b${target.word}\\b`, 'i').test(ex));
    if (exactMatch) return exactMatch;
    return target.examples[0];
  }
  
  if (target.context && target.context.trim()) {
    if (new RegExp(`\\b${target.word}\\b`, 'i').test(target.context)) {
      return target.context;
    }
    return `Her approach was remarkably ${target.word}, resembling ${target.context.charAt(0).toLowerCase()}${target.context.slice(1)}.`;
  }
  
  const fallbacks = [
    `The scholar's work was so ${target.word} that it became a standard reference in the field.`,
    `We need to remain ${target.word} if we want to navigate these challenging times.`,
    `His ${target.word} nature was apparent to everyone in the room.`,
    `She handled the situation in a ${target.word} manner, earning praise from her peers.`
  ];
  const index = target.word.length % fallbacks.length;
  return fallbacks[index];
};

const getAnswerRep = (w) => {
  if (w.synonyms && w.synonyms.length > 0) {
    const syn = w.synonyms[0].trim();
    return syn.charAt(0).toUpperCase() + syn.slice(1);
  }
  let def = w.definition.trim();
  if (def.endsWith('.')) {
    def = def.slice(0, -1);
  }
  return def.charAt(0).toUpperCase() + def.slice(1);
};

const highlightTargetWord = (sentence, word) => {
  const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`\\b(${escapedWord})(es|s|ed|d|ing|ly)?\\b`, 'gi');
  return sentence.replace(regex, (match) => `<span class="text-secondary underline decoration-2 font-bold">${match}</span>`);
};

const selectDailyWords = (libraryWords, seedStr) => {
  const rand = getSeededRandom(seedStr);
  const shuffle = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const defaultWords = [
    { word: 'perspicacious', partOfSpeech: 'adjective', definition: 'Having a ready insight into and understanding of things.', pronunciation: 'ˌpɜː.spɪˈkeɪ.ʃəs', context: 'A detective noticing details others missed.', rootOrigin: 'Latin perspicax "sharp-sighted".' },
    { word: 'recondite', partOfSpeech: 'adjective', definition: 'Little known; abstruse.', pronunciation: 'ˈrek.ən.daɪt', context: 'Ancient hermetic philosophy documents.', rootOrigin: 'Latin reconditus "hidden away".' },
    { word: 'grandiloquent', partOfSpeech: 'adjective', definition: 'Pompous or extravagant in language, style, or manner.', pronunciation: 'ɡrænˈdɪl.ə.kwənt', context: 'A politician delivering a florid, empty speech.', rootOrigin: 'Latin grandis "grand" + loqui "speak".' },
    { word: 'pulchritude', partOfSpeech: 'noun', definition: 'Physical beauty.', pronunciation: 'ˈpʌl.krɪ.tjuːd', context: 'The countenance of Helen of Troy.', rootOrigin: 'Latin pulcher "beautiful".' },
    { word: 'obdurate', partOfSpeech: 'adjective', definition: 'Stubbornly refusing to change one\'s opinion or course of action.', pronunciation: 'ˈɒb.dʒə.rət', context: 'A witness refusing to cooperate despite jail time.', rootOrigin: 'Latin obduratus "hardened".' },
    { word: 'anachronism', partOfSpeech: 'noun', definition: 'A thing belonging or appropriate to a period other than that in which it exists.', pronunciation: 'əˈnæk.rə.nɪ.zəm', context: 'A wrist watch worn by an actor in a movie set in ancient Rome.', rootOrigin: 'Greek ana- "backwards" + khronos "time".' },
    { word: 'laconic', partOfSpeech: 'adjective', definition: 'Using very few words.', pronunciation: 'ləˈkɒn.ɪk', context: 'A soldier replying with a single word "No".', rootOrigin: 'Greek Lakonikos "Spartan".' },
    { word: 'nefarious', partOfSpeech: 'adjective', definition: 'Wicked, villainous, or criminal.', pronunciation: 'nɪˈfeə.ri.əs', context: 'A supervillain hatching a plot to block the sun.', rootOrigin: 'Latin nefas "divine law transgression".' },
    { word: 'parsimonious', partOfSpeech: 'adjective', definition: 'Very unwilling to spend money or use resources.', pronunciation: 'ˌpɑː.sɪˈməʊ.ni.əs', context: 'A millionaire who refuses to turn on the home heating in winter.', rootOrigin: 'Latin parsimonia "thrift".' },
    { word: 'recalcitrant', partOfSpeech: 'adjective', definition: 'Having an obstinately uncooperative attitude toward authority or discipline.', pronunciation: 'rɪˈkæl.sɪ.trənt', context: 'A mule refusing to budge from the pathway.', rootOrigin: 'Latin recalcitrare "kick back".' },
    { word: 'taciturn', partOfSpeech: 'adjective', definition: 'Reserved or uncommunicative in speech; saying little.', pronunciation: 'ˈtæs.ɪ.tɜːn', context: 'A quiet cowboy staring silently into the campfire.', rootOrigin: 'Latin tacitus "silent".' },
    { word: 'vacillate', partOfSpeech: 'verb', definition: 'Alternate or waver between different opinions or actions; be indecisive.', pronunciation: 'ˈvæs.ɪ.leɪt', context: 'Spending two hours deciding what to order for dinner.', rootOrigin: 'Latin vacillare "sway".' },
    { word: 'alacrity', partOfSpeech: 'noun', definition: 'Brisk and cheerful readiness.', pronunciation: 'əˈlæk.rə.ti', context: 'A dog jumping up instantly when the leash is held.', rootOrigin: 'Latin alacer "lively".' },
    { word: 'ebullient', partOfSpeech: 'adjective', definition: 'Cheerful and full of energy.', pronunciation: 'ɪˈbʌl.i.ənt', context: 'A lottery winner jumping up and down screaming.', rootOrigin: 'Latin ebullire "boil over".' },
    { word: 'garrulous', partOfSpeech: 'adjective', definition: 'Excessively talkative, especially on trivial matters.', pronunciation: 'ˈɡær.əl.əs', context: 'A passenger telling you their entire life story in the taxi.', rootOrigin: 'Latin garrire "chatter".' },
    { word: 'indefatigable', partOfSpeech: 'adjective', definition: 'Persisting tirelessly.', pronunciation: 'ˌɪn.dɪˈfæt.ɪ.ɡə.bəl', context: 'A researcher working 18-hour days to find a cure.', rootOrigin: 'Latin in- "not" + defatigare "tire out".' },
    { word: 'magnanimous', partOfSpeech: 'adjective', definition: 'Generous or forgiving, especially toward a rival or less powerful person.', pronunciation: 'mæɡˈnæn.ɪ.məs', context: 'A king pardoning rebels who tried to overthrow him.', rootOrigin: 'Latin magnus "great" + animus "soul".' },
    { word: 'bellicose', partOfSpeech: 'adjective', definition: 'Demonstrating aggression and willingness to fight.', pronunciation: 'ˈbel.ɪ.kəʊs', context: 'A country building up military forces at the border.', rootOrigin: 'Latin bellicosus from bellum "war".' },
    { word: 'desultory', partOfSpeech: 'adjective', definition: 'Lacking a plan, purpose, or enthusiasm.', pronunciation: 'ˈdes.əl.tər.i', context: 'Flipping through channels on TV without watching anything.', rootOrigin: 'Latin desultorius "haphazard".' },
    { word: 'fastidious', partOfSpeech: 'adjective', definition: 'Very attentive to and concerned about accuracy and detail.', pronunciation: 'fæsˈtɪd.i.əs', context: 'A chef using tweezers to arrange microgreens on a plate.', rootOrigin: 'Latin fastidiosus "disdainful".' },
    { word: 'insouciant', partOfSpeech: 'adjective', definition: 'Showing a casual lack of concern; indifferent.', pronunciation: 'ɪnˈsuː.si.ənt', context: 'Shrugging and walking away from a minor fender bender.', rootOrigin: 'French in- "not" + soucier "to care".' },
    { word: 'mendacious', partOfSpeech: 'adjective', definition: 'Not telling the truth; lying.', pronunciation: 'menˈdeɪ.ʃəs', context: 'A witness giving false testimony under oath.', rootOrigin: 'Latin mendax "lying".' },
    { word: 'perfunctory', partOfSpeech: 'adjective', definition: 'Carried out with a minimum of effort or reflection.', pronunciation: 'pəˈfʌŋk.tər.i', context: 'A quick, half-hearted handshake with a colleague.', rootOrigin: 'Latin perfunctorius "negligent".' },
    { word: 'sanguine', partOfSpeech: 'adjective', definition: 'Optimistic or positive, especially in an apparently bad or difficult situation.', pronunciation: 'ˈsæŋ.ɡwɪn', context: 'Remaining hopeful that sales will recover despite a recession.', rootOrigin: 'Latin sanguineus "bloody".' },
    { word: 'trenchant', partOfSpeech: 'adjective', definition: 'Vigorous or incisive in expression or style.', pronunciation: 'ˈtren.tʃənt', context: 'A sharp, cutting critique of a movie.', rootOrigin: 'Old French trenchier "to cut".' },
    { word: 'equivocal', partOfSpeech: 'adjective', definition: 'Open to more than one interpretation; ambiguous or undecided, especially in a way that is intended to deceive or mislead.', pronunciation: 'ɪˈkwɪv.ə.kəl', context: 'A politician giving a deliberately vague answer.', rootOrigin: 'Latin aequi- "equally" + vocare "to call".', synonyms: ['Ambiguous'], examples: ["The professor's remarks were so equivocal that students left the lecture more confused than enlightened."] },
    { word: 'esoteric', partOfSpeech: 'adjective', definition: 'Intended for or likely to be understood by only a small number of people with a specialized knowledge or interest.', pronunciation: 'ˌes.əˈter.ɪk', context: 'Highly specialized academic discussions.', rootOrigin: 'Greek esōterikos "belonging to an inner circle".', synonyms: ['Abstruse'], examples: ["The conference featured papers on esoteric aspects of quantum geometry that baffled all but a handful of attendees."] },
    { word: 'capricious', partOfSpeech: 'adjective', definition: 'Given to sudden and unaccountable changes of mood or behavior.', pronunciation: 'kəˈprɪʃ.əs', context: 'Unstable, unpredictable weather patterns or human behavior.', rootOrigin: 'Italian capriccio "sudden start, whim".', synonyms: ['Fickle'], examples: ["The administration of justice became capricious, dependent entirely on the whim of the ruling monarch."] },
    { word: 'pernicious', partOfSpeech: 'adjective', definition: 'Having a harmful effect, especially in a gradual or subtle way.', pronunciation: 'pəˈnɪʃ.əs', context: 'A silent, slow-acting poison or ideology.', rootOrigin: 'Latin perniciosus "ruinous, destructive".', synonyms: ['Deleterious'], examples: ["The pernicious influence of disinformation campaigns slowly eroded public trust in democratic institutions."] },
    { word: 'assiduous', partOfSpeech: 'adjective', definition: 'Showing great care, attention, and persistent effort.', pronunciation: 'əˈsɪd.ju.əs', context: 'A student preparing meticulously for a career-defining exam.', rootOrigin: 'Latin assiduus "busy, constant, attending".', synonyms: ['Diligent'], examples: ["Through assiduous research in the dusty archives, the historian uncovered the long-forgotten treaty."] },
    { word: 'loquacious', partOfSpeech: 'adjective', definition: 'Tending to talk a great deal; extremely talkative.', pronunciation: 'ləʊˈkweɪ.ʃəs', context: 'An energetic speaker who dominates the conversation.', rootOrigin: 'Latin loqui "to speak".', synonyms: ['Talkative'], examples: ["Usually loquacious, the normally chatty host was rendered completely speechless by the surprise announcement."] },
    { word: 'pusillanimous', partOfSpeech: 'adjective', definition: 'Showing a lack of courage or determination; timid or cowardly.', pronunciation: 'ˌpjuː.sɪˈlæn.ɪ.məs', context: 'An advisor refusing to speak truth to power out of fear.', rootOrigin: 'Latin pusillus "very small" + animus "spirit, mind".', synonyms: ['Cowardly'], examples: ["The senate's pusillanimous decision to capitulate rather than stand up to the dictator shocked the nation."] },
    { word: 'inimical', partOfSpeech: 'adjective', definition: 'Tending to obstruct or harm; unfriendly or hostile.', pronunciation: 'ɪˈnɪm.ɪ.kəl', context: 'An environment or policy that actively prevents growth.', rootOrigin: 'Latin inimicus "enemy".', synonyms: ['Hostile'], examples: ["The harsh, arid conditions of the desert are inimical to the survival of most plant species."] },
    { word: 'epistemic', partOfSpeech: 'adjective', definition: 'Relating to knowledge or to the degree of its validation.', pronunciation: 'ˌep.ɪˈstiː.mɪk', context: 'Philosophical debates concerning the limits of human knowledge.', rootOrigin: 'Greek epistēmē "knowledge".', synonyms: ['Cognitive'], examples: ["Scientific inquiry is driven by epistemic curiosity, a deep desire to understand the underlying principles of the universe."] },
    { word: 'specious', partOfSpeech: 'adjective', definition: 'Superficially plausible, but actually wrong or misleading.', pronunciation: 'ˈspiː.ʃəs', context: 'A logical fallacy that seems correct on the surface.', rootOrigin: 'Latin speciosus "fair, beautiful, plausible".', synonyms: ['Fallacious'], examples: ["The defense attorney's specious argument initially sounded convincing, but it fell apart under cross-examination."] }
  ];

  const pool = [...defaultWords];
  const poolWordStrings = new Set(pool.map(w => w.word.toLowerCase()));
  libraryWords.forEach(lw => {
    if (!poolWordStrings.has(lw.word.toLowerCase())) {
      pool.push(lw);
    }
  });

  return shuffle(pool);
};

// Web Audio API retro sound player
const playSynthSound = (type) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'stamp') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'match') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    console.warn("Audio Context blocked/unsupported:", e.message);
  }
};

export default function DailyTaskView({ words, onComplete }) {
  const currentDayIndex = new Date().getDay();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Array of 10 questions compiled for today
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsPool, setQuestionsPool] = useState([]);
  const [currentTier, setCurrentTier] = useState(2); // 1 = Easy, 2 = Medium, 3 = Hard, 4 = Very Hard/Impossible

  const [completed, setCompleted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [monthlyScore, setMonthlyScore] = useState(0);

  const now = new Date();
  const currentMonthKey = todayStr.slice(0, 7); // "YYYY-MM"
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthlyTarget = daysInCurrentMonth * 10;
  const [floatingPoints, setFloatingPoints] = useState(null); // { text: '+1' / '-1', isPositive: boolean }
  const [shake, setShake] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [clueCount, setClueCount] = useState(1);

  // Time remaining per question (10 seconds ticking)
  const [timeLeft, setTimeLeft] = useState(10);
  const [hasStarted, setHasStarted] = useState(false);

  // Sentence weaver state
  const [weaverSentence, setWeaverSentence] = useState('');

  // Antonym matching Blitz state
  const [blitzLeftShuffled, setBlitzLeftShuffled] = useState([]);
  const [blitzRightShuffled, setBlitzRightShuffled] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [blitzMatches, setBlitzMatches] = useState({});
  const [blitzStatus, setBlitzStatus] = useState('playing'); // 'playing', 'failed', 'won'

  // Seeded routine & activity stats
  const [completionDates, setCompletionDates] = useState({});
  const [activityLog, setActivityLog] = useState({});

  const timerRef = useRef(null);

  // Load scores, streaks, weekly completions log, and activity contribution logs
  useEffect(() => {
    // Score
    const savedScore = Number(localStorage.getItem('lexicon_score') || 0);
    setScore(savedScore);

    // Monthly Score
    const currentMonthKey = todayStr.slice(0, 7);
    const savedMonthlyScore = Number(localStorage.getItem(`lexicon_monthly_points_${currentMonthKey}`) || 0);
    setMonthlyScore(savedMonthlyScore);

    // Streak
    const savedStreak = Number(localStorage.getItem('lexicon_daily_streak') || 0);
    setStreak(savedStreak);

    // Max Streak
    const savedMaxStreak = Number(localStorage.getItem('lexicon_max_streak') || 0);
    setMaxStreak(savedMaxStreak);

    // Completions dates map: "YYYY-MM-DD" -> "completed" or "missed"
    const savedCompletions = JSON.parse(localStorage.getItem('lexicon_completion_dates') || '{}');
    const today = new Date();
    const tempCompletions = { ...savedCompletions };
    const rand = getSeededRandom("completions_mock_seed");
    for (let i = 1; i <= 30; i++) {
      const prevDate = new Date(today);
      prevDate.setDate(today.getDate() - i);
      const dateStr = prevDate.toISOString().slice(0, 10);
      if (!tempCompletions[dateStr]) {
        tempCompletions[dateStr] = rand() > 0.45 ? 'completed' : 'missed';
      }
    }
    localStorage.setItem('lexicon_completion_dates', JSON.stringify(tempCompletions));
    setCompletionDates(tempCompletions);

    // Activity graph log (53 weeks contribution graph data)
    const savedActivity = localStorage.getItem('lexicon_activity_log');
    let actLog = {};
    if (savedActivity) {
      actLog = JSON.parse(savedActivity);
    } else {
      const randAct = getSeededRandom("activity_mock_seed_53");
      for (let i = 0; i < 371; i++) { // 53 weeks
        const prevDate = new Date(today);
        prevDate.setDate(today.getDate() - i);
        const dateStr = prevDate.toISOString().slice(0, 10);
        if (randAct() > 0.5) {
          actLog[dateStr] = Math.floor(randAct() * 8); // 0 to 7 activities
        }
      }
      localStorage.setItem('lexicon_activity_log', JSON.stringify(actLog));
    }
    setActivityLog(actLog);
  }, []);

  // Dynamically compile a queue of questions matching today's game archetype safely and adaptively
  useEffect(() => {
    if (!words || words.length === 0) return;

    const initializeDailyTask = (allQuestions) => {
      setQuestionsPool(allQuestions);
      
      // Start with Tier 2 (Medium) difficulty
      const startingTier = 2;
      let firstQIndex = allQuestions.findIndex(q => q.tier === startingTier);
      if (firstQIndex === -1) {
        firstQIndex = 0;
      }
      
      const firstQ = { ...allQuestions[firstQIndex] };
      firstQ.title = "Question 0 of 10: Sentence Completion";
      
      setQuestions([firstQ]);
      setCurrentQuestionIndex(0);
      setCurrentTier(firstQ.tier || startingTier);
    };

    const compileLocalFallback = () => {
      const todayPool = selectDailyWords(words, todayStr);
      if (todayPool.length === 0) return;

      const getTier = (diff) => {
        const d = (diff || 'B2').toUpperCase();
        if (d.includes('C2')) return 4;
        if (d.includes('C1')) return 3;
        if (d.includes('B2')) return 2;
        return 1;
      };

      const compiledQuestions = [];

      for (let idx = 0; idx < todayPool.length; idx++) {
        const target = todayPool[idx];
        const poolWithoutTarget = todayPool.filter(w => w.word !== target.word);

        const questionRand = getSeededRandom(`${todayStr}_q_${idx}`);
        const shuffleQuestionPool = (arr) => {
          const newArr = [...arr];
          for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(questionRand() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
          }
          return newArr;
        };

        const shuffledDistractors = shuffleQuestionPool(poolWithoutTarget);
        const distractors = shuffledDistractors.slice(0, 3).map(w => w.word);
        
        const correctAnswer = target.word;
        const options = [...distractors, target.word].sort(() => questionRand() - 0.5);

        const rawSentence = getContextSentence(target);
        const sentenceWithBlank = rawSentence.replace(new RegExp('\\b' + target.word + '(es|s|ed|d|ing|ly)?\\b', 'i'), '_______');

        compiledQuestions.push({
          archetype: 'vic',
          word: target.word,
          correctAnswer,
          options: options,
          title: `Question ${idx + 1} of 10: Sentence Completion`,
          sentence: `“${sentenceWithBlank}”`,
          tier: getTier(target.difficulty),
          difficulty: target.difficulty || 'B2'
        });
      }

      initializeDailyTask(compiledQuestions);
    };

    const fetchGeminiDailyTask = async () => {
      try {
        const res = await fetch(`/api/words/daily-task?date=${todayStr}&dayIndex=${currentDayIndex}`);
        if (!res.ok) throw new Error('Backend failed to generate daily task');
        const data = await res.json();
        if (data && data.questions && data.questions.length > 0) {
          console.log("Successfully loaded Gemini-generated daily task questions!");
          initializeDailyTask(data.questions);
        } else {
          throw new Error('Invalid questions format returned from API');
        }
      } catch (err) {
        console.warn("Failed to load Gemini daily task, using local fallback generator:", err.message);
        compileLocalFallback();
      }
    };

    fetchGeminiDailyTask();
  }, [words, currentDayIndex]);

  // Shuffle Blitz columns when a Blitz question displays
  useEffect(() => {
    const currentQ = questions[currentQuestionIndex];
    if (currentQ && currentQ.archetype === 'blitz') {
      setBlitzLeftShuffled([...currentQ.leftWords].sort(() => Math.random() - 0.5));
      setBlitzRightShuffled([...currentQ.rightWords].sort(() => Math.random() - 0.5));
      setBlitzMatches({});
      setBlitzStatus('playing');
    }
  }, [questions, currentQuestionIndex]);

  // 10-Second Countdown timer ticking controller (per question)
  useEffect(() => {
    const active = questions[currentQuestionIndex];
    if (active && hasStarted && !completed && !expired && !showAnswerFeedback) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleQuestionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [questions, currentQuestionIndex, completed, expired, showAnswerFeedback, hasStarted]);

  // Load completion states from localStorage
  useEffect(() => {
    const saveObj = localStorage.getItem('lexicon_daily_task_completed');
    if (saveObj) {
      const parsed = JSON.parse(saveObj);
      if (parsed.date === todayStr) {
        if (parsed.completed) {
          setCompleted(true);
        } else if (parsed.expired) {
          setExpired(true);
        }
      }
    }
  }, [todayStr, questions]);

  // Ticks when the 10-second timer hits 0
  const handleQuestionTimeout = () => {
    updateScore(-1);
    setShake(true);
    playSynthSound('error');
    setShowAnswerFeedback(true);

    const nextTier = Math.max(1, currentTier - 1);
    setCurrentTier(nextTier);

    setTimeout(() => {
      setShake(false);
      advanceQuestion(nextTier);
    }, 1000);
  };

  // Routine failure expiration logic
  const handleRoutineFailure = () => {
    setExpired(true);
    setStreak(0);
    localStorage.setItem('lexicon_daily_streak', '0');

    const updatedDates = { ...completionDates, [todayStr]: 'missed' };
    setCompletionDates(updatedDates);
    localStorage.setItem('lexicon_completion_dates', JSON.stringify(updatedDates));

    localStorage.setItem('lexicon_daily_task_completed', JSON.stringify({ date: todayStr, completed: false, expired: true }));
  };

  // Advance to next question or complete session
  const advanceQuestion = (nextTier = currentTier) => {
    setSelectedOption(null);
    setShowAnswerFeedback(false);
    setWeaverSentence('');
    setClueCount(1);
    setSelectedLeft(null);
    setSelectedRight(null);
    setBlitzMatches({});
    setBlitzStatus('playing');

    if (currentQuestionIndex < 9) { // 10 questions total (indices 0 to 9)
      const usedWords = new Set(questions.map(q => q.word.toLowerCase()));
      const availableQuestions = questionsPool.filter(q => !usedWords.has(q.word.toLowerCase()));

      if (availableQuestions.length === 0) {
        handleSessionSuccess();
        return;
      }

      let candidates = availableQuestions.filter(q => q.tier === nextTier);

      if (candidates.length === 0) {
        for (let offset = 1; offset <= 3; offset++) {
          candidates = availableQuestions.filter(q => q.tier === nextTier + offset || q.tier === nextTier - offset);
          if (candidates.length > 0) break;
        }
      }

      if (candidates.length === 0) {
        candidates = availableQuestions;
      }

      const nextQRaw = candidates[Math.floor(Math.random() * candidates.length)];
      const nextQ = { ...nextQRaw };
      nextQ.title = `Question ${currentQuestionIndex + 1} of 10: Sentence Completion`;

      setQuestions(prev => [...prev, nextQ]);
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(10);
    } else {
      handleSessionSuccess();
    }
  };

  // Called when all 10 questions are answered
  const handleSessionSuccess = () => {
    setCompleted(true);

    // Save date log
    const updatedDates = { ...completionDates, [todayStr]: 'completed' };
    setCompletionDates(updatedDates);
    localStorage.setItem('lexicon_completion_dates', JSON.stringify(updatedDates));

    // Save state
    localStorage.setItem('lexicon_daily_task_completed', JSON.stringify({ date: todayStr, completed: true }));

    // Increment Streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('lexicon_daily_streak', newStreak.toString());

    // Max streak update check
    const savedMaxStreak = Number(localStorage.getItem('lexicon_max_streak') || 0);
    if (newStreak > savedMaxStreak) {
      setMaxStreak(newStreak);
      localStorage.setItem('lexicon_max_streak', newStreak.toString());
    }

    // Update Activity Log
    const updatedActivity = { ...activityLog, [todayStr]: (activityLog[todayStr] || 0) + 1 };
    setActivityLog(updatedActivity);
    localStorage.setItem('lexicon_activity_log', JSON.stringify(updatedActivity));

    playSynthSound('success');
    if (onComplete) {
      onComplete();
    }
  };

  // Points updates (+1 / -1)
  const updateScore = (points) => {
    const newScore = Math.max(0, score + points);
    setScore(newScore);
    localStorage.setItem('lexicon_score', newScore.toString());

    // Update monthly points
    const currentMonthKey = todayStr.slice(0, 7);
    const newMonthlyScore = Math.max(0, monthlyScore + points);
    setMonthlyScore(newMonthlyScore);
    localStorage.setItem(`lexicon_monthly_points_${currentMonthKey}`, newMonthlyScore.toString());

    setFloatingPoints({
      text: points > 0 ? `+${points}` : `${points}`,
      isPositive: points > 0
    });
    setTimeout(() => setFloatingPoints(null), 1000);
  };

  // MCQ option click handler
  const handleSelectOption = (opt) => {
    if (completed || expired || showAnswerFeedback) return;
    setSelectedOption(opt);
    setShowAnswerFeedback(true);

    const activeQ = questions[currentQuestionIndex];
    const isCorrect = activeQ.archetype === 'vic'
      ? opt === activeQ.correctAnswer
      : opt.toLowerCase() === activeQ.word.toLowerCase();

    const nextTier = isCorrect ? Math.min(4, currentTier + 1) : Math.max(1, currentTier - 1);
    setCurrentTier(nextTier);

    if (isCorrect) {
      updateScore(1);
      playSynthSound('match');
    } else {
      setShake(true);
      updateScore(-1);
      playSynthSound('error');
      setTimeout(() => setShake(false), 500);
    }

    // Delay before moving to the next question
    setTimeout(() => {
      advanceQuestion(nextTier);
    }, 1000);
  };

  // Sentence Weaving submit verification
  const handleCheckSentence = (e) => {
    e.preventDefault();
    const activeQ = questions[currentQuestionIndex];
    const txt = weaverSentence.toLowerCase();
    const word1 = activeQ.words[0].toLowerCase();
    const word2 = activeQ.words[1].toLowerCase();

    if (txt.includes(word1) && txt.includes(word2) && txt.split(/\s+/).length >= 6) {
      updateScore(1);
      playSynthSound('match');
      advanceQuestion();
    } else {
      setShake(true);
      updateScore(-1);
      playSynthSound('error');
      setTimeout(() => setShake(false), 500);
      alert("Make sure you write a full sentence containing BOTH words correctly!");
    }
  };

  // Blitz match click handler
  const handleBlitzClick = (val, side) => {
    if (blitzStatus !== 'playing' || expired) return;

    if (side === 'left') {
      if (blitzMatches[val]) return;
      setSelectedLeft(val);
      playSynthSound('stamp');
      if (selectedRight) {
        checkBlitzMatch(val, selectedRight);
      }
    } else {
      const leftKey = Object.keys(blitzMatches).find(k => blitzMatches[k] === val);
      if (leftKey) return;
      setSelectedRight(val);
      playSynthSound('stamp');
      if (selectedLeft) {
        checkBlitzMatch(selectedLeft, val);
      }
    }
  };

  const checkBlitzMatch = (leftVal, rightVal) => {
    const activeQ = questions[currentQuestionIndex];
    const correctRight = activeQ.correctPairs[leftVal];

    if (correctRight === rightVal) {
      const newMatches = { ...blitzMatches, [leftVal]: rightVal };
      setBlitzMatches(newMatches);
      setSelectedLeft(null);
      setSelectedRight(null);
      playSynthSound('match');

      if (Object.keys(newMatches).length === 5) {
        setBlitzStatus('won');
        updateScore(1);
        playSynthSound('success');

        // Blitz round done, move to next round or complete
        setTimeout(() => {
          advanceQuestion();
        }, 1000);
      }
    } else {
      setShake(true);
      updateScore(-1);
      playSynthSound('error');
      setSelectedLeft(null);
      setSelectedRight(null);
      setTimeout(() => setShake(false), 500);
    }
  };

  // Routine Calendar render (Image 1)
  const renderRoutineCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayNum = now.getDate();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const weekLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const cells = [];

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const state = completionDates[dateStr];
      const isToday = d === todayNum;

      let cellContent = (
        <span className="font-body-main text-xs text-outline-variant">{d}</span>
      );

      if (state === 'completed') {
        cellContent = (
          <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
        );
      } else if (isToday) {
        if (completed) {
          cellContent = (
            <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
          );
        } else {
          cellContent = (
            <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shadow">
              {d}
            </div>
          );
        }
      } else if (state === 'missed') {
        cellContent = (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-body-main text-xs text-on-surface-variant">{d}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
          </div>
        );
      }

      cells.push(
        <div key={`day-${d}`} className="h-8 w-8 flex items-center justify-center relative">
          {cellContent}
        </div>
      );
    }

    // Calculate time left to midnight helper
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msToMidnight = midnight - now;
    const hoursLeft = Math.floor(msToMidnight / 3600000);
    const minsLeft = Math.floor((msToMidnight % 3600000) / 60000);
    const timeLeftStr = `${hoursLeft}h ${minsLeft}m left`;

    return (
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-h1-academic text-base text-primary font-bold">Day {streak}</span>
            <span className="text-[10px] text-outline-variant font-label-mono">{timeLeftStr}</span>
          </div>
          <span className="font-label-mono text-[10px] text-secondary font-bold uppercase tracking-wider">
            {now.toLocaleString('default', { month: 'long' })}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center justify-items-center">
          {weekLabels.map((w, idx) => (
            <span key={`label-${idx}`} className="font-label-mono text-[10px] text-outline uppercase font-bold w-8">{w}</span>
          ))}
          {cells}
        </div>
      </div>
    );
  };

  // Activity Heatmap aligned matching LeetCode (Image 2)
  const renderActivityHeatmap = () => {
    const today = new Date();

    // Choose past 12 months ending in the current month
    const monthsData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthsData.push({
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        monthName: d.toLocaleString('default', { month: 'short' })
      });
    }

    const getHeatmapColor = (count, isFuture) => {
      if (isFuture) return 'bg-surface-container-high/20 border-transparent';
      if (!count || count <= 0) return 'bg-surface-container-high border-surface-container-highest/20';
      if (count <= 2) return 'bg-emerald-500/30 border-emerald-500/10';
      if (count <= 4) return 'bg-emerald-500/60 border-emerald-500/20';
      return 'bg-emerald-500 border-emerald-600/30';
    };

    // Helper to calculate exact columns for each month
    const getMonthGridColumns = (yr, mIdx) => {
      const daysInMonth = new Date(yr, mIdx + 1, 0).getDate();
      const firstDayOfWeek = new Date(yr, mIdx, 1).getDay();

      const days = [];
      // Pad beginning
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ isEmpty: true });
      }
      // Active days
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(yr, mIdx, d);
        const dateStr = `${yr}-${String(mIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isFuture = date > today;
        const count = isFuture ? 0 : (activityLog[dateStr] || 0);
        days.push({
          isEmpty: false,
          dateStr,
          count,
          isFuture
        });
      }
      // Pad end
      while (days.length % 7 !== 0) {
        days.push({ isEmpty: true });
      }

      // Chunk columns of 7 days
      const cols = [];
      for (let i = 0; i < days.length; i += 7) {
        cols.push(days.slice(i, i + 7));
      }
      return cols;
    };

    // Calculate total submissions and active days
    const totalSubmissions = Object.values(activityLog).reduce((a, b) => a + b, 0);
    const totalActiveDays = Object.keys(activityLog).filter(k => activityLog[k] > 0).length;

    return (
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm space-y-4 col-span-1 md:col-span-2">
        <div className="border-b border-surface-container pb-2">
          <h3 className="font-h1-academic text-base text-primary font-bold">
            {totalSubmissions} submissions in the past one year
          </h3>
          <p className="font-body-main text-[11px] text-on-surface-variant mt-0.5">
            Total active days: {totalActiveDays} &nbsp;•&nbsp; Max streak: {maxStreak}
          </p>
        </div>

        {/* Heatmap Grid separated strictly by monthly blocks of day squares */}
        <div className="overflow-x-auto py-2 font-sans">
          <div className="flex gap-4 items-start justify-start min-w-max pb-2">
            {monthsData.map((m) => {
              const monthCols = getMonthGridColumns(m.year, m.monthIndex);
              return (
                <div key={`${m.year}-${m.monthIndex}`} className="flex flex-col gap-2 items-center">
                  {/* Month header label above its specific grid */}
                  <span className="font-label-mono text-[9px] text-outline uppercase font-bold select-none">{m.monthName}</span>

                  {/* Month Grid blocks */}
                  <div className="flex gap-[3px] border border-outline-variant/15 p-1.5 rounded-lg bg-surface-container-low/20">
                    {monthCols.map((col, colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-[3px]">
                        {col.map((day, dayIdx) => {
                          if (day.isEmpty) {
                            return (
                              <div key={dayIdx} className="w-[10px] h-[10px] rounded-sm bg-transparent border border-transparent"></div>
                            );
                          }
                          return (
                            <div
                              key={dayIdx}
                              className={`w-[10px] h-[10px] rounded-sm border ${getHeatmapColor(day.count, day.isFuture)}`}
                              title={day.isFuture ? 'Future day' : `${day.count} revisions on ${day.dateStr}`}
                            ></div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 text-[9px] font-label-mono text-outline uppercase tracking-wider">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-surface-container-high border border-surface-container-highest/20"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/10"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60 border border-emerald-500/20"></div>
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-600/30"></div>
          <span>More</span>
        </div>
        <p class="text-lg leading-relaxed italic">
          The secret of
          <strong class="font-bold text-primary"> getting ahead </strong>
          is
          <strong class="font-bold text-primary"> getting started</strong>.
        </p>
        <p class="mt-2 text-sm text-gray-500">— Mark Twain</p>
      </div>
    );
  };

  const activeQ = questions[currentQuestionIndex];

  if (!activeQ) {
    return (
      <div className="w-full text-center py-24 text-on-surface-variant font-body-main italic">
        Compiling daily surprise queue...
      </div>
    );
  }

  const getTimerColorClass = () => {
    const duration = activeQ.archetype === 'blitz' ? 30 : 10;
    if (timeLeft > duration * 0.6) return 'bg-emerald-500';
    if (timeLeft > duration * 0.3) return 'bg-amber-500';
    return 'bg-error animate-pulse';
  };

  const renderMonthlyPointsTargetCard = () => {
    const pct = Math.min(100, Math.floor((monthlyScore / monthlyTarget) * 100));
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });

    return (
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-2">
          <h3 className="font-h1-academic text-base text-primary font-bold">
            {monthName} Points Target
          </h3>
          <span className="font-label-mono text-[10px] text-secondary font-bold uppercase tracking-wider">
            {pct}% Done
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-body-main text-on-surface-variant">
            <span>Points Earned: <strong>{monthlyScore} pts</strong></span>
            <span>Target: <strong>{monthlyTarget} pts</strong></span>
          </div>

          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-500 rounded-full"
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          <p className="font-body-main text-[11px] text-outline leading-normal mt-1 italic">
            {monthlyScore >= monthlyTarget
              ? "🎉 Amazing! You have reached your monthly points target!"
              : `Keep going! You need ${monthlyTarget - monthlyScore} more points to hit your goal.`}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-container-max mx-auto p-4 md:p-8 space-y-8 animate-fadeIn relative">

      {/* Floating score text indicator */}
      {floatingPoints && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 top-20 z-50 px-6 py-2.5 rounded-full font-h1-academic text-xl font-bold shadow-lg animate-bounce transition-all ${floatingPoints.isPositive
              ? 'bg-secondary text-on-secondary border border-secondary/25'
              : 'bg-error text-on-error border border-error/25'
            }`}
        >
          {floatingPoints.text} Points!
        </div>
      )}

      {/* Top Banner Dashboard */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <div>
          <span className="bg-secondary/15 text-secondary font-label-mono text-label-mono px-3 py-1 rounded-full border border-secondary/25 tracking-widest uppercase">
            Daily Surprise Session
          </span>
          <h1 className="font-h1-academic text-h1-academic text-primary mt-3 font-bold">
            {completed ? 'Surprise Complete!' : `Question ${currentQuestionIndex} of 10`}
          </h1>
          <p className="font-body-main text-body-main text-on-surface-variant mt-2 max-w-xl">
            {completed ? 'Outstanding effort today. Check out your routine logs below!' : 'Answer correctly to progress. Watch the ticking timer!'}
          </p>
        </div>

        {/* Points Display Score Board */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 flex items-center gap-4 shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[36px] text-secondary fill animate-stamp p-2 bg-secondary/10 rounded-full">stars</span>
          <div>
            <span className="block font-label-mono text-[10px] text-outline uppercase tracking-wider">Total Score</span>
            <span className="text-2xl font-bold text-primary font-h1-academic">{score} pts</span>
          </div>
        </div>
      </div>

      {/* Main Task View Card */}
      <div className={`bg-surface-container-lowest border border-[#E2E8F0] shadow-sm rounded-xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${shake ? 'animate-clock-shake' : ''}`}>

        {/* Global Progress Timer Bar */}
        {!completed && !expired && hasStarted && (
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${getTimerColorClass()}`}
              style={{ width: `${(timeLeft / (activeQ.archetype === 'blitz' ? 30 : 10)) * 100}%` }}
            ></div>
          </div>
        )}

        {completed ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
            <div className="w-20 h-20 bg-secondary/10 text-secondary border border-secondary/25 rounded-full flex items-center justify-center animate-stamp">
              <span className="material-symbols-outlined text-[44px]">verified</span>
            </div>

            <div>
              <h2 className="font-h1-academic text-2xl text-primary font-bold">10-Question Surprise Complete!</h2>
              <p className="font-body-main text-body-main text-on-surface-variant mt-2 max-w-md">
                Outstanding! You solved all daily questions. Check your routine calendar and contribution blocks below!
              </p>
            </div>
          </div>
        ) : expired ? (
          /* Expired Timer Failed Screen */
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
            <div className="w-20 h-20 bg-error/10 text-error border border-error/25 rounded-full flex items-center justify-center animate-clock-shake">
              <span className="material-symbols-outlined text-[44px]">hourglass_empty</span>
            </div>

            <div>
              <h2 className="font-h1-academic text-2xl text-primary font-bold">Daily Routine Missed!</h2>
              <p className="font-body-main text-body-main text-on-surface-variant mt-2 max-w-md">
                You failed to complete the daily questions before leaving or timing out. This has broken your streak! You can practice again below, but your official streak has reset.
              </p>
            </div>

            <button
              onClick={() => {
                setExpired(false);
                setHasStarted(false);
                setClueCount(1);
                setSelectedLeft(null);
                setSelectedRight(null);
                setBlitzMatches({});
                setBlitzStatus('playing');
                const startDuration = questions[0].archetype === 'blitz' ? 30 : 10;
                setTimeLeft(startDuration);
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setWeaverSentence('');
                playSynthSound('stamp');
              }}
              className="px-6 py-2.5 bg-secondary text-on-secondary font-button-text text-button-text rounded-lg hover:bg-secondary/90 transition-colors shadow"
            >
              Practice Task Again
            </button>
          </div>
        ) : !hasStarted ? (
          /* Splash Start Screen */
          <div className="flex flex-col items-center justify-center text-center py-10 space-y-6 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-secondary/15 text-secondary border border-secondary/25 rounded-full flex items-center justify-center animate-stamp">
              <span className="material-symbols-outlined text-[44px]">local_fire_department</span>
            </div>

            <div>
              <h2 className="font-h1-academic text-2xl text-primary font-bold">Ready for Today's Surprise?</h2>
              <p className="font-body-main text-body-main text-on-surface-variant mt-2">
                You have **10 questions** of collegiate & GRE vocabulary ahead. Good luck!
              </p>
            </div>

            <button
              onClick={() => {
                setHasStarted(true);
                const startDuration = questions[0].archetype === 'blitz' ? 30 : 10;
                setTimeLeft(startDuration);
                playSynthSound('success');
              }}
              className="px-8 py-3.5 bg-secondary hover:bg-secondary/90 text-on-secondary font-button-text text-button-text rounded-xl transition-colors active:scale-95 flex items-center gap-2 shadow cursor-pointer"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              <span>Start Daily Challenge</span>
            </button>
          </div>
        ) : (
          /* Active Question layout */
          <div className="space-y-6 animate-fadeIn">

            {/* Crypt (4 MCQ Options) */}
            {activeQ.archetype === 'crypt' && (
              <div className="space-y-6">
                {/* Hints progressive display */}
                <div className="space-y-4">
                  {[...Array(clueCount)].map((_, i) => (
                    <div key={i} className="bg-surface-container-low border border-surface-container-highest rounded-xl p-5 flex items-start gap-4 animate-fadeIn">
                      <span className="material-symbols-outlined text-secondary text-[24px]">vpn_key</span>
                      <p className="font-body-main text-body-main text-primary font-medium leading-relaxed">
                        {activeQ.clues[i]}
                      </p>
                    </div>
                  ))}
                </div>

                {clueCount < 3 && (
                  <button
                    onClick={() => { setClueCount(prev => prev + 1); playSynthSound('stamp'); }}
                    className="px-4 py-2 border border-secondary text-secondary hover:bg-secondary/5 font-button-text text-button-text rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Reveal Next Hint</span>
                  </button>
                )}

                {/* 4 Multiple Choice Option Cards */}
                <div className="border-t border-[#E2E8F0] pt-6 space-y-3">
                  <span className="font-label-mono text-[9px] text-outline uppercase tracking-wider block mb-2">Select the Correct Word:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeQ.options.map((opt) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect = opt.toLowerCase() === activeQ.word.toLowerCase();

                      let btnStyle = 'bg-surface border-[#E2E8F0] text-primary';
                      if (showAnswerFeedback) {
                        if (isCorrect) btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600';
                        else if (isSelected) btnStyle = 'bg-error/10 border-error text-error';
                      } else if (isSelected) {
                        btnStyle = 'bg-secondary/10 border-secondary text-secondary';
                      }

                      return (
                        <button
                          key={opt}
                          disabled={showAnswerFeedback}
                          onClick={() => handleSelectOption(opt)}
                          className={`py-4 px-5 rounded-xl border text-left font-body-main text-body-main font-semibold transition-all cursor-pointer hover:border-secondary hover:shadow-sm ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Vocabulary in Context (4 MCQ Options) */}
            {activeQ.archetype === 'vic' && (
              <div className="space-y-6">
                <div className="bg-surface-container-low border border-surface-container-highest rounded-xl p-6 text-center">
                  <p 
                    className="font-h1-academic text-xl md:text-2xl text-primary font-bold italic leading-relaxed text-center"
                    dangerouslySetInnerHTML={{ __html: activeQ.sentence }}
                  />
                </div>

                <div className="space-y-3">
                  <span className="font-label-mono text-[9px] text-outline uppercase tracking-wider block mb-2 text-center">
                    What does <span className="font-bold text-secondary">{activeQ.word}</span> most nearly mean in this context?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                    {activeQ.options.map((opt) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect = opt === activeQ.correctAnswer;

                      let btnStyle = 'bg-surface border-[#E2E8F0] text-primary';
                      if (showAnswerFeedback) {
                        if (isCorrect) btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600';
                        else if (isSelected) btnStyle = 'bg-error/10 border-error text-error';
                      } else if (isSelected) {
                        btnStyle = 'bg-secondary/10 border-secondary text-secondary';
                      }

                      return (
                        <button
                          key={opt}
                          disabled={showAnswerFeedback}
                          onClick={() => handleSelectOption(opt)}
                          className={`py-4 px-5 rounded-xl border text-left font-body-main text-body-main font-semibold transition-all cursor-pointer hover:border-secondary hover:shadow-sm ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Context Detective (4 MCQ Options) */}
            {activeQ.archetype === 'cloze' && (
              <div className="space-y-6">
                <div className="bg-surface-container-low border border-surface-container-highest rounded-xl p-6 text-center">
                  <p className="font-h1-academic text-xl md:text-2xl text-primary font-bold italic leading-relaxed">
                    {activeQ.sentence}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="font-label-mono text-[9px] text-outline uppercase tracking-wider block mb-2 text-center">Select the Correct Word:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeQ.options.map((opt) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect = opt.toLowerCase() === activeQ.word.toLowerCase();

                      let btnStyle = 'bg-surface border-[#E2E8F0] text-primary';
                      if (showAnswerFeedback) {
                        if (isCorrect) btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600';
                        else if (isSelected) btnStyle = 'bg-error/10 border-error text-error';
                      } else if (isSelected) {
                        btnStyle = 'bg-secondary/10 border-secondary text-secondary';
                      }

                      return (
                        <button
                          key={opt}
                          disabled={showAnswerFeedback}
                          onClick={() => handleSelectOption(opt)}
                          className={`py-4 px-5 rounded-xl border text-left font-body-main text-body-main font-semibold transition-all cursor-pointer hover:border-secondary hover:shadow-sm ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Etymology Expedition (4 MCQ Options) */}
            {activeQ.archetype === 'etymology' && (
              <div className="space-y-6">
                <div className="bg-surface-container-low border border-surface-container-highest rounded-xl p-6 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/15 rounded-l"></div>
                  <h3 className="font-label-mono text-label-mono text-outline uppercase tracking-wider mb-3">Expedition Log</h3>
                  <p className="font-body-main text-body-main text-primary whitespace-pre-line leading-relaxed">
                    {activeQ.story}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="font-label-mono text-[9px] text-outline uppercase tracking-wider block mb-2 text-center">Select the Correct Word:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeQ.options.map((opt) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect = opt.toLowerCase() === activeQ.word.toLowerCase();

                      let btnStyle = 'bg-surface border-[#E2E8F0] text-primary';
                      if (showAnswerFeedback) {
                        if (isCorrect) btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600';
                        else if (isSelected) btnStyle = 'bg-error/10 border-error text-error';
                      } else if (isSelected) {
                        btnStyle = 'bg-secondary/10 border-secondary text-secondary';
                      }

                      return (
                        <button
                          key={opt}
                          disabled={showAnswerFeedback}
                          onClick={() => handleSelectOption(opt)}
                          className={`py-4 px-5 rounded-xl border text-left font-body-main text-body-main font-semibold transition-all cursor-pointer hover:border-secondary hover:shadow-sm ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Sentence Weaver */}
            {activeQ.archetype === 'weaver' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeQ.requirements.map((req, i) => (
                    <div key={i} className="bg-secondary/5 border border-secondary/15 rounded-xl p-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-[24px]">science</span>
                      <span className="font-body-main text-body-main text-primary font-semibold">{req}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCheckSentence} className="space-y-4">
                  <div>
                    <label class="block font-label-mono text-label-mono text-outline uppercase mb-2 tracking-wider">Your Synthesis Chamber</label>
                    <textarea
                      rows="4"
                      value={weaverSentence}
                      onChange={(e) => setWeaverSentence(e.target.value)}
                      placeholder="Combine both target terms into a single coherent sentence..."
                      class="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 text-on-surface font-body-main text-body-main focus:outline-none focus:ring-1 focus:ring-secondary"
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-on-secondary font-button-text text-button-text rounded-lg transition-colors active:scale-95 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                      <span>Synthesize Words</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Blitz Matching */}
            {activeQ.archetype === 'blitz' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 pt-4">
                  <div className="space-y-3">
                    <span className="font-label-mono text-[9px] text-outline uppercase tracking-wider block mb-2 text-center">Word</span>
                    {blitzLeftShuffled.map((w) => {
                      const isMatched = !!blitzMatches[w];
                      const isSelected = selectedLeft === w;
                      return (
                        <button
                          key={w}
                          onClick={() => handleBlitzClick(w, 'left')}
                          disabled={isMatched}
                          className={`w-full py-4 px-3 rounded-lg border text-center font-body-main text-body-sm font-semibold transition-all cursor-pointer ${isMatched
                              ? 'bg-secondary/5 border-secondary/10 text-secondary/30 cursor-default'
                              : isSelected
                                ? 'bg-secondary/15 border-secondary text-secondary shadow'
                                : 'bg-surface hover:border-secondary border-[#E2E8F0] text-primary hover:shadow-sm'
                            }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <span className="font-label-mono text-[9px] text-outline uppercase tracking-wider block mb-2 text-center">Definition</span>
                    {blitzRightShuffled.map((def) => {
                      const isMatched = Object.values(blitzMatches).includes(def);
                      const isSelected = selectedRight === def;
                      return (
                        <button
                          key={def}
                          onClick={() => handleBlitzClick(def, 'right')}
                          disabled={isMatched}
                          className={`w-full py-4 px-3 rounded-lg border text-center font-body-main text-body-sm font-medium transition-all cursor-pointer min-h-[58px] flex items-center justify-center leading-snug ${isMatched
                              ? 'bg-secondary/5 border-secondary/10 text-secondary/30 cursor-default'
                              : isSelected
                                ? 'bg-secondary/15 border-secondary text-secondary shadow'
                                : 'bg-surface hover:border-secondary border-[#E2E8F0] text-primary hover:shadow-sm'
                            }`}
                        >
                          {def}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Routine Tracker and Heatmap grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-6 col-span-1">
          {renderRoutineCalendar()}
          {renderMonthlyPointsTargetCard()}
        </div>
        {renderActivityHeatmap()}
      </div>

    </div>
  );
}

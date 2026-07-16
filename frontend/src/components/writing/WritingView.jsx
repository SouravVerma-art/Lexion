import React, { useState, useEffect } from 'react';
import WritingDashboard from './WritingDashboard';
import PracticeTopics from './PracticeTopics';
import MockTests from './MockTests';
import WritingEditor from './WritingEditor';
import AIEvaluationReport from './AIEvaluationReport';
import SampleEssays from './SampleEssays';
import VocabBuilder from './VocabBuilder';
import GrammarPractice from './GrammarPractice';
import WritingTemplates from './WritingTemplates';
import ProgressAnalytics from './ProgressAnalytics';
import WritingSettings from './WritingSettings';

// Pre-seeded topics database
export const MOCK_TOPICS = [
  {
    id: 'topic_1',
    title: 'Apogee Company Expansion Memo',
    prompt: 'The following appeared in a memorandum from the business department of the Apogee Company:\n\n"When Apogee Company had all its operations in one location, it was more profitable than it is today. Therefore, Apogee should associate all its operations in one location to increase profitability."',
    difficulty: 'Hard',
    exam: 'GMAT',
    category: 'Business',
    duration: 30, // minutes
    wordCount: 500,
    attempts: 2,
    rating: 8.5,
    type: 'Argument Analysis',
    keywords: ['apogee', 'profit', 'consolidat', 'locat', 'operat']
  },
  {
    id: 'topic_2',
    title: 'Technology and Human Thought',
    prompt: 'As people rely more and more on technology to solve problems, the ability of humans to think for themselves will surely deteriorate.\n\nDiscuss the extent to which you agree or disagree with the statement and explain your reasoning.',
    difficulty: 'Hard',
    exam: 'GRE',
    category: 'Technology',
    duration: 30,
    wordCount: 450,
    attempts: 1,
    rating: 7.8,
    type: 'Issue Task',
    keywords: ['technolog', 'think', 'thought', 'human', 'cognit']
  },
  {
    id: 'topic_3',
    title: 'Universal Free Higher Education',
    prompt: 'Some people believe that university education should be free for everyone. Others argue that students should pay tuition fees since they benefit personally from higher education.\n\nDiscuss both views and give your opinion.',
    difficulty: 'Medium',
    exam: 'IELTS',
    category: 'Education',
    duration: 40,
    wordCount: 250,
    attempts: 0,
    rating: null,
    type: 'Discussion Essay',
    keywords: ['educat', 'free', 'tuition', 'universit', 'colleg', 'school']
  },
  {
    id: 'topic_4',
    title: 'Success and Financial Wealth',
    prompt: 'Do you agree or disagree with the following statement? Only people who earn a lot of money are truly successful in life. Use specific reasons and examples to support your answer.',
    difficulty: 'Medium',
    exam: 'TOEFL',
    category: 'Economy',
    duration: 30,
    wordCount: 300,
    attempts: 3,
    rating: 8.0,
    type: 'Opinion Essay',
    keywords: ['success', 'money', 'wealth', 'financial', 'earn', 'rich']
  },
  {
    id: 'topic_5',
    title: 'AI Regulation and Governance',
    prompt: 'Artificial intelligence presents unprecedented opportunities and existential threats. Should AI algorithms and development be strictly regulated by international coalitions?',
    difficulty: 'Easy',
    exam: 'General',
    category: 'Ethics',
    duration: 25,
    wordCount: 250,
    attempts: 1,
    rating: 9.0,
    type: 'Persuasive Essay',
    keywords: ['ai', 'artificial', 'intelligence', 'regul', 'govern']
  },
  {
    id: 'topic_6',
    title: 'Global Carbon Offsets Validity',
    prompt: 'Many corporations claim carbon neutrality by buying carbon offsets. Critique the effectiveness of corporate carbon offset practices in mitigating global climate change.',
    difficulty: 'Hard',
    exam: 'XAT',
    category: 'Environment',
    duration: 35,
    wordCount: 400,
    attempts: 0,
    rating: null,
    type: 'Analytical Essay',
    keywords: ['carbon', 'offset', 'climat', 'environ', 'emiss']
  },
  {
    id: 'topic_7',
    title: 'Healthcare Funding Priorities',
    prompt: 'In developing nations, public health resources should prioritize preventative hygiene and sanitation over advanced hospital facilities. To what extent do you agree?',
    difficulty: 'Medium',
    exam: 'CAT WAT',
    category: 'Healthcare',
    duration: 20,
    wordCount: 300,
    attempts: 0,
    rating: null,
    type: 'Argumentative Essay',
    keywords: ['health', 'hygiene', 'sanitat', 'prevent', 'hospital']
  }
];

export default function WritingView() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard, topics, mock-tests, sample-essays, vocab-builder, grammar, templates, analytics, settings
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null); // null or { topic, isMockMode }
  const [activeEvaluation, setActiveEvaluation] = useState(null); // null or evaluation object
  const [selectedTopicForSample, setSelectedTopicForSample] = useState(null); // null or topic object
  const [settings, setSettings] = useState({
    rigor: 'strict', // strict (default), moderate, lenient
    fontFamily: 'serif',
    fontSize: 'md',
    audioCue: true,
    keyboardClicks: false
  });

  // Load history from localStorage safely
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('lexicon_writing_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        localStorage.setItem('lexicon_writing_history', JSON.stringify([]));
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to parse writing history from localStorage:", error);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage helper
  const saveEssaySubmission = (newEvaluation) => {
    const updated = [newEvaluation, ...history];
    setHistory(updated);
    localStorage.setItem('lexicon_writing_history', JSON.stringify(updated));
  };

  // Delete essay history entry
  const handleDeleteHistory = (id) => {
    if (!window.confirm('Are you sure you want to delete this essay evaluation record?')) return;
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('lexicon_writing_history', JSON.stringify(updated));
    if (activeEvaluation && activeEvaluation.id === id) {
      setActiveEvaluation(null);
    }
  };

  // Start practicing a topic
  const handleStartPractice = (topic, isMockMode = false) => {
    setActiveSession({ topic, isMockMode });
    setActiveEvaluation(null);
  };

  // Exit editor/practice session
  const handleExitPractice = () => {
    setActiveSession(null);
  };

  // Handle completed essay submission
  const handleSubmitEssay = (topic, draft, timeSpentSeconds, isMockMode) => {
    // strict grader simulator
    const wordCount = draft.trim().split(/\s+/).filter(w => w).length;
    
    // Evaluate spelling & grammar mistakes (strictly checked!)
    const detectedMistakes = [];
    const sentenceCount = (draft.match(/[.!?]+/g) || []).length || 1;
    
    const lowerDraft = draft.toLowerCase();

    // Topic Relevance Check
    const topicKeywords = topic.keywords || [];
    const matchedKeywords = topicKeywords.filter(kw => lowerDraft.includes(kw.toLowerCase()));
    
    // Flag as off-topic if under 2 matches (and not empty)
    const isOffTopic = wordCount > 0 && matchedKeywords.length < 2;
    
    if (lowerDraft.includes('their are')) {
      detectedMistakes.push({
        incorrect: 'their are',
        correct: 'there are',
        explanation: 'Homophone confusion. Use "there" to indicate the existence of something, not the possessive "their".'
      });
    }
    if (lowerDraft.includes('all though')) {
      detectedMistakes.push({
        incorrect: 'all though',
        correct: 'although',
        explanation: 'Incorrect spelling. Conjunction "although" should be a single word.'
      });
    }
    if (lowerDraft.includes('logicly')) {
      detectedMistakes.push({
        incorrect: 'logicly',
        correct: 'logically',
        explanation: 'Spelling error. The adverb form of "logical" is "logically".'
      });
    }
    if (lowerDraft.includes('good') && wordCount > 100) {
      detectedMistakes.push({
        incorrect: 'good',
        correct: 'advantageous / beneficial / effective',
        explanation: 'Lexical stylistic warning. The adjective "good" is colloquial and simplistic for advanced academic essays. Consider replacing it with a more precise academic synonym.'
      });
    }
    if (lowerDraft.includes('bad') && wordCount > 100) {
      detectedMistakes.push({
        incorrect: 'bad',
        correct: 'detrimental / counterproductive',
        explanation: 'Lexical style warning. "bad" is simplistic. Use formal vocabulary to maintain academic rigor.'
      });
    }

    // Dynamic strict scoring based on word count, grammar mistakes, sentence structure, and complexity
    let grammarScore = Math.max(4.0, 9.8 - detectedMistakes.length * 1.5);
    let vocabScore = Math.min(9.5, 5.0 + Math.min(4.0, wordCount / 120));
    
    // Penalty curves for word limits (GRE/GMAT guidelines require detailed analysis)
    if (wordCount < 150) {
      vocabScore -= 2.0;
      grammarScore -= 1.0;
    }
    
    let coherenceScore = wordCount > 200 ? 8.2 : Math.max(4.5, 4.0 + (wordCount / 50));
    let sentenceStructureScore = Math.max(5.0, 9.0 - (detectedMistakes.length * 0.8) - (wordCount < 180 ? 1.5 : 0));
    let argumentStrengthScore = wordCount > 300 ? 8.0 : wordCount > 180 ? 6.5 : 4.5;
    let criticalThinkingScore = wordCount > 300 ? 7.8 : 5.8;
    let organizationScore = wordCount > 250 ? 8.2 : 5.5;
    let creativityScore = wordCount > 200 ? 7.5 : 5.0;
    let readabilityScore = Math.min(9.2, 5.5 + Math.random() * 3);
    let toneScore = detectedMistakes.some(m => m.incorrect === 'good' || m.incorrect === 'bad') ? 6.0 : 8.5;
    let flowScore = coherenceScore * 0.95;
    let wordChoiceScore = vocabScore * 0.98;

    // Apply strict disqualified scores if off-topic
    if (isOffTopic) {
      grammarScore = 0;
      vocabScore = 0;
      coherenceScore = 0;
      sentenceStructureScore = 0;
      argumentStrengthScore = 0;
      criticalThinkingScore = 0;
      organizationScore = 0;
      creativityScore = 0;
      readabilityScore = 0;
      toneScore = 0;
      flowScore = 0;
      wordChoiceScore = 0;
    }

    // Calculate strict average
    let finalScore = parseFloat((
      (grammarScore * 1.5 + 
       vocabScore * 1.5 + 
       coherenceScore * 1.2 + 
       sentenceStructureScore * 1.2 + 
       argumentStrengthScore * 1.3 + 
       criticalThinkingScore * 1.3 + 
       organizationScore * 1.0 + 
       creativityScore * 0.5 + 
       readabilityScore * 0.5 + 
       toneScore * 1.0 + 
       flowScore * 1.0 + 
       wordChoiceScore * 1.0) / 13
    ).toFixed(1));

    if (isOffTopic) {
      finalScore = 0.0;
    }

    // Generate list of repeated words dynamically
    const wordFreq = {};
    const words = draft.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(w => {
      if (w.length > 3 && !['with', 'that', 'this', 'have', 'they', 'their', 'there', 'about', 'would', 'could', 'should', 'some', 'other', 'more'].includes(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });
    
    const repeatedWords = Object.keys(wordFreq)
      .filter(w => wordFreq[w] > 2)
      .map(w => ({
        word: w,
        count: wordFreq[w],
        alternatives: w === 'good' ? ['beneficial', 'advantageous', 'lucrative', 'effective'] :
                      w === 'bad' ? ['detrimental', 'deleterious', 'counterproductive'] :
                      w === 'technology' ? ['technological tools', 'digital automation', 'cybernetic framework'] :
                      w === 'people' ? ['citizens', 'cognitive actors', 'individuals', 'society'] : 
                      ['alternatives', 'varied vocabulary', 'diverse terms']
      }));

    // Structure checklist evaluation
    const introduction = isOffTopic ? false : (lowerDraft.includes('agree') || lowerDraft.includes('disagree') || lowerDraft.includes('opinion') || lowerDraft.includes('conclude') || wordCount > 100);
    const argumentsPresent = isOffTopic ? false : (wordCount > 180);
    const examples = isOffTopic ? false : (lowerDraft.includes('for example') || lowerDraft.includes('such as') || lowerDraft.includes('for instance') || lowerDraft.includes('illustrate'));
    const counterargument = isOffTopic ? false : (lowerDraft.includes('however') || lowerDraft.includes('on the other hand') || lowerDraft.includes('while some') || lowerDraft.includes('opponents'));
    const conclusion = isOffTopic ? false : (lowerDraft.includes('conclud') || lowerDraft.includes('in summary') || lowerDraft.includes('to sum up') || lowerDraft.includes('finally'));

    // Build Evaluation Report
    const report = {
      id: `eval_${Date.now()}`,
      topicId: topic.id,
      topicTitle: topic.title,
      exam: topic.exam,
      date: new Date().toISOString(),
      draft: draft,
      score: finalScore,
      metrics: {
        grammar: parseFloat(grammarScore.toFixed(1)),
        vocabulary: parseFloat(vocabScore.toFixed(1)),
        coherence: parseFloat(coherenceScore.toFixed(1)),
        sentenceStructure: parseFloat(sentenceStructureScore.toFixed(1)),
        argumentStrength: parseFloat(argumentStrengthScore.toFixed(1)),
        criticalThinking: parseFloat(criticalThinkingScore.toFixed(1)),
        organization: parseFloat(organizationScore.toFixed(1)),
        creativity: parseFloat(creativityScore.toFixed(1)),
        readability: parseFloat(readabilityScore.toFixed(1)),
        tone: parseFloat(toneScore.toFixed(1)),
        flow: parseFloat(flowScore.toFixed(1)),
        wordChoice: parseFloat(wordChoiceScore.toFixed(1))
      },
      grammarMistakes: detectedMistakes.map((m, idx) => ({ ...m, index: idx })),
      repeatedWords: isOffTopic ? [] : repeatedWords,
      structureAnalysis: {
        introduction,
        arguments: argumentsPresent,
        examples,
        counterargument,
        conclusion,
        suggestions: isOffTopic
          ? `DISQUALIFIED: Off-topic essay. The response does not address the prompt topic keywords. Please write a response that directly focuses on the assigned topic.`
          : `Your essay has ${wordCount} words. ${!examples ? 'You should integrate concrete empirical examples to validate your claims.' : ''} ${!counterargument ? 'Analyzing opposing perspectives is critical for GRE/GMAT and XAT writing to elevate logical reasoning.' : ''} ${!conclusion ? 'A firm concluding paragraph is required to tie all ideas together.' : 'A conclusion was detected.'}`
      },
      strengths: isOffTopic
        ? ['None - Essay disqualified for off-topic content.']
        : [
            wordCount > 250 ? 'Strong essay length, demonstrating stamina and detail.' : 'Concise explanation of views.',
            'Uses direct active voice in major claims.'
          ],
      improvements: isOffTopic
        ? ['The submitted text does not contain relevant concepts matching the essay topic.', 'Fails basic relevance checkpoints.']
        : [
            detectedMistakes.length > 0 ? `Identified ${detectedMistakes.length} critical spelling/grammar violations.` : 'Requires more complex clause constructions.',
            !examples ? 'Lacks convincing support examples.' : 'Vocabulary tier can be further elevated.',
            wordCount < topic.wordCount ? `Word count (${wordCount}) is below the recommended threshold of ${topic.wordCount} words.` : 'Structure transition words are slightly repetitive.'
          ],
      suggestions: isOffTopic
        ? `Re-write the essay. Address the core prompt instructions and include discussions relating to: ${topicKeywords.join(', ')}.`
        : `Expand argument structures. Replace simple descriptive adjectives with advanced academic synonyms. Focus on eliminating spelling or syntax errors. Try to write at least ${topic.wordCount} words.`,
      wordCount,
      durationSpent: Math.round(timeSpentSeconds / 60)
    };

    saveEssaySubmission(report);
    setActiveEvaluation(report);
    setActiveSession(null);
    setCurrentTab('ai-evaluation');
  };

  // If inside an active editing session, we render ONLY the editor to guarantee distraction-free practice!
  if (activeSession) {
    return (
      <WritingEditor 
        topic={activeSession.topic} 
        isMockMode={activeSession.isMockMode} 
        onExit={handleExitPractice}
        onSubmit={handleSubmitEssay}
        settings={settings}
      />
    );
  }

  // Sidebar navigation options
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'topics', label: 'Practice Topics', icon: 'list_alt' },
    { id: 'mock-tests', label: 'Mock Tests', icon: 'timer' },
    { id: 'ai-evaluation', label: 'AI Evaluation', icon: 'analytics' },
    { id: 'sample-essays', label: 'Sample Essays', icon: 'assignment' },
    { id: 'vocab-builder', label: 'Vocabulary Builder', icon: 'abc' },
    { id: 'grammar', label: 'Grammar Practice', icon: 'spellcheck' },
    { id: 'templates', label: 'Writing Templates', icon: 'schema' },
    { id: 'analytics', label: 'Progress Analytics', icon: 'monitoring' },
    { id: 'settings', label: 'Settings', icon: 'settings_accessibility' },
  ];

  return (
    <div className="w-full max-w-container-max mx-auto space-y-6 py-2 px-1 animate-fadeIn">
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant/60 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">edit_note</span>
            <span className="font-label-mono text-label-mono text-secondary uppercase tracking-widest">Advanced EdTech Prep</span>
          </div>
          <h2 className="font-h1-academic text-3xl font-bold text-primary mt-1">Writing Practice Module</h2>
          <p className="font-body-main text-body-sm text-on-surface-variant max-w-2xl mt-0.5">
            Master GMAT, GRE, IELTS, and TOEFL essay writing with strict AI grading, real mock exams, and structured templates.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-error-container/30 border border-error/20 px-3 py-1.5 rounded-lg">
          <span className="material-symbols-outlined text-[18px] text-error">gavel</span>
          <span className="font-label-mono text-[11px] text-error font-bold tracking-tight">Rigor Level: Strict Human Simulator</span>
        </div>
      </div>

      {/* Main Tabbed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Module Sub-Sidebar (Navigation) */}
        <aside className="lg:col-span-1 flex flex-col bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                // Clear state when switching tabs if needed
                if (item.id !== 'ai-evaluation' && activeEvaluation) setActiveEvaluation(null);
                if (item.id !== 'sample-essays' && selectedTopicForSample) setSelectedTopicForSample(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group font-body-main text-body-sm ${
                currentTab === item.id || (item.id === 'ai-evaluation' && activeEvaluation)
                  ? 'text-secondary bg-surface-container-low font-bold border-l-4 border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] transition-transform group-hover:scale-105 ${
                currentTab === item.id || (item.id === 'ai-evaluation' && activeEvaluation) ? 'text-secondary' : 'text-outline'
              }`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Tab Panel Content */}
        <div className="lg:col-span-3 min-h-[500px]">
          {currentTab === 'dashboard' && (
            <WritingDashboard 
              history={history} 
              onSelectTopic={() => setCurrentTab('topics')} 
              onViewEvaluation={(evalObj) => {
                setActiveEvaluation(evalObj);
                setCurrentTab('ai-evaluation');
              }}
              onStartPractice={handleStartPractice}
            />
          )}

          {currentTab === 'topics' && (
            <PracticeTopics 
              topics={MOCK_TOPICS} 
              history={history}
              onStartPractice={handleStartPractice}
            />
          )}

          {currentTab === 'mock-tests' && (
            <MockTests 
              topics={MOCK_TOPICS} 
              onStartPractice={handleStartPractice}
            />
          )}

          {currentTab === 'ai-evaluation' && (
            <AIEvaluationReport 
              evaluation={activeEvaluation || history[0]} // default to latest evaluated essay
              history={history}
              onViewDetails={(evalObj) => setActiveEvaluation(evalObj)}
              onDelete={handleDeleteHistory}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'sample-essays' && (
            <SampleEssays 
              topics={MOCK_TOPICS}
              history={history}
              selectedTopic={selectedTopicForSample}
              onSelectTopic={setSelectedTopicForSample}
            />
          )}

          {currentTab === 'vocab-builder' && (
            <VocabBuilder />
          )}

          {currentTab === 'grammar' && (
            <GrammarPractice />
          )}

          {currentTab === 'templates' && (
            <WritingTemplates />
          )}

          {currentTab === 'analytics' && (
            <ProgressAnalytics history={history} />
          )}

          {currentTab === 'settings' && (
            <WritingSettings settings={settings} onUpdateSettings={setSettings} />
          )}
        </div>
      </div>
    </div>
  );
}

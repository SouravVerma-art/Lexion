import React, { useState, useEffect, useRef } from 'react';

export default function WritingEditor({ topic, isMockMode, onExit, onSubmit, settings }) {
  const [draft, setDraft] = useState('');
  const [timeLeft, setTimeLeft] = useState(topic.duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const timerRef = useRef(null);
  const editorRef = useRef(null);

  // Word & Character count
  const wordCount = draft.trim().split(/\s+/).filter(w => w).length;
  const charCount = draft.length;

  // Toggle Dark Mode within the editor session (updates document element)
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + S: Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        triggerManualSave();
      }
      // Ctrl + F: Toggle Focus Mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      }
      // Ctrl + Enter: Submit Essay
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draft, timeLeft, isPaused]);

  // Load draft if saved in localStorage for this topic
  useEffect(() => {
    const savedDraft = localStorage.getItem(`lexicon_draft_${topic.id}`);
    if (savedDraft) {
      setDraft(savedDraft);
    }
  }, [topic.id]);

  // Start timer on mount
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit when time runs out
            alert('Time has expired! Your essay is being submitted automatically for AI evaluation.');
            onSubmit(topic, draft, topic.duration * 60, isMockMode);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, draft, topic, isMockMode]);

  // Auto-save effect
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (draft.trim()) {
        localStorage.setItem(`lexicon_draft_${topic.id}`, draft);
        setAutoSaveStatus('Draft auto-saved');
        setTimeout(() => setAutoSaveStatus('All changes saved'), 2000);
      }
    }, 8000); // auto-save every 8 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [draft, topic.id]);

  const triggerManualSave = () => {
    localStorage.setItem(`lexicon_draft_${topic.id}`, draft);
    setAutoSaveStatus('Draft saved manually');
    setTimeout(() => setAutoSaveStatus('All changes saved'), 2000);
  };

  // Timer format (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear your draft? This cannot be undone.')) {
      setDraft('');
      localStorage.removeItem(`lexicon_draft_${topic.id}`);
    }
  };

  const handleSubmitClick = () => {
    if (!draft.trim()) {
      alert('Your essay is empty. Write something before submitting.');
      return;
    }
    if (wordCount < 100) {
      if (!window.confirm('Your essay is extremely short (under 100 words). Standard entrance exams penalize word counts below 250/300 words heavily. Submit anyway?')) {
        return;
      }
    }
    if (window.confirm('Submit essay for strict AI grading and feedback report?')) {
      const timeSpent = topic.duration * 60 - timeLeft;
      onSubmit(topic, draft, timeSpent, isMockMode);
      localStorage.removeItem(`lexicon_draft_${topic.id}`);
    }
  };

  // Essay structure analysis in real-time
  const lowerDraft = draft.toLowerCase();
  const structureChecklist = {
    introduction: lowerDraft.includes('agree') || lowerDraft.includes('disagree') || lowerDraft.includes('opinion') || lowerDraft.includes('conclude') || wordCount > 120,
    thesis: lowerDraft.includes('argue that') || lowerDraft.includes('believe that') || lowerDraft.includes('my view') || lowerDraft.includes('in my opinion'),
    arguments: wordCount > 150,
    examples: lowerDraft.includes('for example') || lowerDraft.includes('such as') || lowerDraft.includes('for instance') || lowerDraft.includes('illustrate'),
    counterargument: lowerDraft.includes('however') || lowerDraft.includes('on the other hand') || lowerDraft.includes('opponents') || lowerDraft.includes('while some'),
    conclusion: lowerDraft.includes('conclud') || lowerDraft.includes('in summary') || lowerDraft.includes('to sum up') || lowerDraft.includes('finally')
  };

  // Vocabulary replacements recommendations (disabled in mock exam mode)
  const getVocabularyReplacements = () => {
    const suggestions = [];
    if (lowerDraft.includes('good')) {
      suggestions.push({ word: 'good', replacements: ['beneficial', 'advantageous', 'lucrative', 'effective'] });
    }
    if (lowerDraft.includes('bad')) {
      suggestions.push({ word: 'bad', replacements: ['detrimental', 'deleterious', 'counterproductive'] });
    }
    if (lowerDraft.includes('very')) {
      suggestions.push({ word: 'very', replacements: ['exceedingly', 'profoundly', 'substantially'] });
    }
    if (lowerDraft.includes('get')) {
      suggestions.push({ word: 'get', replacements: ['acquire', 'procure', 'attain', 'derive'] });
    }
    if (lowerDraft.includes('think')) {
      suggestions.push({ word: 'think', replacements: ['hypothesize', 'surmise', 'reckon', 'postulate'] });
    }
    return suggestions.slice(0, 3);
  };

  const vocabReplacements = getVocabularyReplacements();
  const timerLow = timeLeft < 300; // under 5 minutes

  return (
    <div className={`fixed inset-0 z-50 flex flex-col w-full h-full bg-surface text-on-surface ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Distraction-Free Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/60 bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          {/* Locked navigation indicators in mock test */}
          {isMockMode ? (
            <div className="flex items-center gap-2 bg-error-container/40 text-error font-label-mono text-[10px] px-2.5 py-1 rounded border border-error/20 font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[12px] animate-clock-shake">lock</span>
              Real Exam Lock
            </div>
          ) : (
            <button
              onClick={onExit}
              className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 font-button-text text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Exit Practice
            </button>
          )}

          <div className="h-4 w-[1px] bg-outline-variant/40 hidden sm:block"></div>
          
          <div>
            <h3 className="font-h1-academic text-base font-bold text-primary max-w-xs sm:max-w-md md:max-w-lg truncate leading-tight">
              {topic.title}
            </h3>
            <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30 font-body-main">
              {topic.exam} • {topic.type}
            </span>
          </div>
        </div>

        {/* Counter Indicators */}
        <div className="flex items-center gap-4">
          {/* Auto-save status */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-on-surface-variant font-body-main">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-badge"></span>
            <span>{autoSaveStatus}</span>
          </div>

          {/* Counts */}
          <div className="bg-surface-container border border-outline-variant/30 px-3 py-1.5 rounded-lg flex items-center gap-4 text-xs font-label-mono font-bold text-primary">
            <div>
              Words: <span className="text-secondary">{wordCount}</span>
            </div>
            <div className="hidden sm:block">
              Chars: <span>{charCount}</span>
            </div>
          </div>

          {/* Time Remaining */}
          <div className={`px-4 py-1.5 rounded-lg border font-label-mono text-sm font-bold flex items-center gap-1.5 ${
            timerLow 
              ? 'bg-error-container text-on-error-container border-error/30 animate-clock-shake' 
              : 'bg-surface-container border-outline-variant/30 text-primary'
          }`}>
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Editor Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left editor typing zone */}
        <main className={`flex-1 flex flex-col p-6 overflow-y-auto ${isFocusMode ? 'max-w-3xl mx-auto w-full' : ''}`}>
          
          {/* Text Area styling toolbar */}
          {!isMockMode && (
            <div className="flex items-center gap-2 mb-3 bg-surface-container/60 border border-outline-variant/40 rounded-lg p-1.5 text-on-surface-variant">
              <button 
                onClick={() => setIsFocusMode(prev => !prev)}
                className={`p-1.5 rounded hover:bg-surface-container hover:text-primary transition-all ${isFocusMode ? 'bg-secondary/15 text-secondary' : ''}`}
                title="Toggle Focus Mode (Ctrl+F)"
              >
                <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
              </button>
              <button 
                onClick={toggleDarkMode}
                className="p-1.5 rounded hover:bg-surface-container hover:text-primary transition-all"
                title="Toggle Light/Dark Theme"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
              <button 
                onClick={() => setShowShortcuts(prev => !prev)}
                className="p-1.5 rounded hover:bg-surface-container hover:text-primary transition-all ml-auto"
                title="Keyboard Shortcuts"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_info</span>
              </button>
            </div>
          )}

          {/* Actual textarea inputs */}
          <textarea
            ref={editorRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isPaused}
            placeholder={
              isPaused 
                ? 'Session is paused. Click Resume Timer to write.' 
                : 'Write your essay response here. Use academic paragraphs and analytical logic...\n\nStrict human-like evaluation rules are active; avoid slang, colloquialisms, and simple repetitive words.'
            }
            className={`flex-1 w-full bg-surface-container-lowest text-on-surface border border-outline-variant/40 rounded-xl p-6 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none shadow-inner leading-relaxed text-base font-body-main focus:outline-none ${
              isPaused ? 'opacity-40 select-none' : ''
            }`}
            style={{ fontSize: settings.fontSize === 'lg' ? '18px' : settings.fontSize === 'sm' ? '14px' : '16px' }}
          />

          {/* Essay actions footer */}
          <footer className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              {!isMockMode && (
                <button
                  onClick={() => setIsPaused(prev => !prev)}
                  className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container rounded-lg font-button-text text-xs text-on-surface-variant hover:text-primary transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isPaused ? 'play_arrow' : 'pause'}
                  </span>
                  {isPaused ? 'Resume Timer' : 'Pause Timer'}
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-outline-variant/60 hover:bg-red-50 text-red-700 hover:border-red-300 rounded-lg font-button-text text-xs transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Clear Draft
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={triggerManualSave}
                className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container rounded-lg font-button-text text-xs text-on-surface-variant hover:text-primary transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Save Draft
              </button>
              <button
                onClick={handleSubmitClick}
                className="px-6 py-2 bg-secondary text-white hover:bg-secondary-container font-button-text text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                Submit Essay
                <span className="material-symbols-outlined text-xs">send</span>
              </button>
            </div>
          </footer>
        </main>

        {/* Right sidebar instructions/structure help (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <aside className="w-80 border-l border-outline-variant/60 bg-surface-container-lowest p-5 overflow-y-auto space-y-6 hidden lg:block shrink-0">
            {/* Prompt Instructions */}
            <div className="space-y-2">
              <h4 className="font-button-text text-xs text-secondary font-bold uppercase tracking-wider">Prompt Prompt</h4>
              <div className="bg-surface-container-low/40 border border-outline-variant/30 rounded-lg p-3 max-h-48 overflow-y-auto text-xs text-on-surface leading-relaxed">
                {topic.prompt}
              </div>
            </div>

            {/* Structure Checklist */}
            <div className="space-y-3 pt-3 border-t border-outline-variant/30">
              <h4 className="font-button-text text-xs text-primary font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Structure Checklist</span>
                <span className="text-[10px] text-on-surface-variant font-normal normal-case">Keyword checks</span>
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'introduction', label: 'Introduction Paragraph' },
                  { key: 'thesis', label: 'Core Thesis Claim' },
                  { key: 'arguments', label: 'Logical Arguments' },
                  { key: 'examples', label: 'Supporting Examples' },
                  { key: 'counterargument', label: 'Counterargument / Pivot' },
                  { key: 'conclusion', label: 'Conclusion Paragraph' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                    <span className={`material-symbols-outlined text-[16px] shrink-0 ${
                      structureChecklist[item.key] ? 'text-emerald-600 font-bold' : 'text-outline-variant'
                    }`}>
                      {structureChecklist[item.key] ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={structureChecklist[item.key] ? 'text-primary font-bold' : ''}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Vocabulary Replacements suggestions (Disabled in real exam mode) */}
            {!isMockMode && (
              <div className="space-y-3 pt-3 border-t border-outline-variant/30">
                <h4 className="font-button-text text-xs text-primary font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Vocabulary Helper</span>
                  <span className="text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-bold">Active</span>
                </h4>
                
                {vocabReplacements.length > 0 ? (
                  <div className="space-y-2.5">
                    {vocabReplacements.map((item, idx) => (
                      <div key={idx} className="bg-surface-container-low/40 p-2.5 rounded border border-outline-variant/30 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-error font-bold line-through">{item.word}</span>
                          <span className="text-emerald-700 font-bold font-label-mono">Synonyms:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.replacements.map((r, rIdx) => (
                            <span 
                              key={rIdx}
                              onClick={() => {
                                // Simple replacement assistance
                                const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
                                setDraft(prev => prev.replace(regex, r));
                              }}
                              className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 hover:border-emerald-300 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              title="Click to replace"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-on-surface-variant italic">
                    Type words like "good", "bad", "very" to see advanced academic synonyms recommendations here.
                  </p>
                )}
              </div>
            )}

            {/* Mock exam mode notification panel */}
            {isMockMode && (
              <div className="bg-error-container/20 border border-error/25 p-4 rounded-xl space-y-2 pt-3 border-t border-outline-variant/30">
                <h5 className="font-button-text text-xs text-error font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">lock_clock</span>
                  Mock Strictures Active
                </h5>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  Real exam mock settings are enabled. Vocabulary suggestions, essay layout hints, and dictionary components are blocked. Concentrate on argument development.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Keyboard shortcuts modal overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 max-w-xs w-full shadow-lg space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
              <h4 className="font-h1-academic text-base font-bold text-primary">Keyboard Shortcuts</h4>
              <button onClick={() => setShowShortcuts(false)} className="text-outline-variant hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-3 font-label-mono text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Save Draft:</span>
                <kbd className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Focus Mode:</span>
                <kbd className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50">Ctrl + F</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Submit Essay:</span>
                <kbd className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50">Ctrl + Enter</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

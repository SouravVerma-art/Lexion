import React, { useState } from 'react';

export default function MockTests({ topics, onStartPractice }) {
  const [selectedMock, setSelectedMock] = useState(null);

  // Group mock exam configurations
  const mockConfig = [
    {
      id: 'mock_gmat',
      name: 'GMAT AWA Exam Simulation',
      desc: 'Analytical Writing Assessment: critique the logical reasoning of a business-oriented argument prompt.',
      duration: 30,
      wordTarget: 500,
      rules: [
        'Strict 30-minute countdown timer.',
        'Zero spelling assistance, grammar highlighting, or structure hints.',
        'Autosaved but cannot be paused; closing tab triggers immediate partial score grading.',
        'Requires analytical reasoning of logical fallacies.'
      ],
      topic: topics[0] // Apogee Company memo
    },
    {
      id: 'mock_gre',
      name: 'GRE Analytical Writing: Issue Task',
      desc: 'Analyze an issue: formulate a persuasive, cohesive critique of a philosophical or societal perspective.',
      duration: 30,
      wordTarget: 450,
      rules: [
        'Strict 30-minute timer.',
        'Spellcheck and formatting helper utilities are completely disabled.',
        'Requires balanced synthesis of counterarguments and supporting data.'
      ],
      topic: topics[1] // Technology and Human Thought
    },
    {
      id: 'mock_ielts',
      name: 'IELTS Academic Writing Task 2',
      desc: 'Discussion / Opinion: formulate a structured argument discussing tuition fees or public policies.',
      duration: 40,
      wordTarget: 250,
      rules: [
        'Strict 40-minute timer.',
        'Simulates official pen-and-paper equivalent interface layout.',
        'Strict structure checks: Introduction, Body, Examples, and Synthesis.'
      ],
      topic: topics[3] // Success and wealth (or similar IELTS topic)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Alert Warning banner */}
      <div className="bg-surface-container border-l-4 border-error p-5 rounded-r-xl shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-error">
          <span className="material-symbols-outlined fill text-[20px]">warning</span>
          <h4 className="font-button-text font-bold text-sm uppercase tracking-wider">Exam Simulation Rules</h4>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Launching a Mock Test enters **Real Exam Mode**. The navigation menu will lock, spelling check highlights will hide, and the timer will run continuously. If you exit or close the browser, your incomplete essay will be auto-submitted to the strict AI grader.
        </p>
      </div>

      {/* Grid of Mock Tests */}
      {!selectedMock ? (
        <div className="grid grid-cols-1 gap-4">
          {mockConfig.map((mock) => (
            <div 
              key={mock.id}
              className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-error/45 transition-colors group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-error-container text-on-error-container font-label-mono text-[9px] font-bold px-2 py-0.5 rounded">
                    MOCK EXAM
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-body-main">
                    Target: ~{mock.wordTarget} words
                  </span>
                </div>
                
                <h4 className="font-h1-academic text-lg font-bold text-primary group-hover:text-error transition-colors">
                  {mock.name}
                </h4>
                
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {mock.desc}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-outline pt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">timer</span>
                    {mock.duration} minutes
                  </span>
                  <span>•</span>
                  <span>Strict AI human grading scale</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMock(mock)}
                className="w-full md:w-auto shrink-0 bg-error hover:bg-red-800 text-white font-button-text text-xs px-5 py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                Configure Session
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Configuration Detail panel before launching fullscreen */
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedMock(null)}
                className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <h4 className="font-h1-academic text-lg font-bold text-primary">{selectedMock.name} Setup</h4>
            </div>
            <span className="text-xs font-label-mono text-error font-bold">Rigorous Mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="font-button-text text-xs text-on-surface-variant uppercase tracking-wider">Assigned Essay Topic</h5>
                <h6 className="font-h1-academic text-base text-primary font-bold mt-1">{selectedMock.topic?.title}</h6>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed italic bg-surface-container-low/40 p-3 rounded-lg">
                  "{selectedMock.topic?.prompt.slice(0, 180)}..."
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-on-surface-variant font-body-main">Time Limit</span>
                  <span className="block font-label-mono text-lg font-bold text-primary">{selectedMock.duration} mins</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant font-body-main">Recommended Size</span>
                  <span className="block font-label-mono text-lg font-bold text-primary">{selectedMock.wordTarget} words</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30">
              <h5 className="font-button-text text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-error">gavel</span>
                Lock Constraints
              </h5>
              
              <ul className="space-y-2">
                {selectedMock.rules.map((rule, idx) => (
                  <li key={idx} className="text-xs text-on-surface-variant flex items-start gap-1.5 leading-relaxed">
                    <span className="material-symbols-outlined text-[14px] text-error shrink-0 mt-0.5">remove_circle_outline</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-outline-variant/30 pt-5">
            <button
              onClick={() => setSelectedMock(null)}
              className="px-5 py-2.5 border border-outline-variant/60 hover:bg-surface-container-low rounded-lg font-button-text text-xs text-on-surface-variant hover:text-primary transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onStartPractice(selectedMock.topic, true)}
              className="px-6 py-2.5 bg-error hover:bg-red-800 text-white font-button-text text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm font-bold"
            >
              <span className="material-symbols-outlined text-xs">fullscreen</span>
              Launch Full Exam Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

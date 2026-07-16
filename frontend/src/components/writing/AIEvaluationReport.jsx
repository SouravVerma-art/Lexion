import React, { useState } from 'react';

export default function AIEvaluationReport({ evaluation, history, onViewDetails, onDelete, onBackToDashboard }) {
  const [activeSubTab, setActiveSubTab] = useState('scores'); // scores, grammar, vocabulary, structure, feedback

  if (!evaluation) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-8 text-center space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <span className="material-symbols-outlined text-4xl text-outline-variant">analytics</span>
        <h4 className="font-h1-academic text-lg font-bold text-primary">No Evaluations Available</h4>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
          You haven't submitted any essays yet. Go to 'Practice Topics' or 'Mock Tests' to complete your first essay and view AI grading feedback.
        </p>
      </div>
    );
  }

  // Text highlighting simulator for grammar mistakes
  const renderGrammarHighlightedText = () => {
    let text = evaluation.draft;
    if (!evaluation.grammarMistakes || evaluation.grammarMistakes.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed text-sm text-primary font-body-main">{text}</p>;
    }

    // Sort mistakes by descending length or index if needed to prevent indexing clashes
    // For simplicity, we split the text and wrap matches with style classes
    
    // Simple replacement/mark rendering
    let workingText = text;
    evaluation.grammarMistakes.forEach((mistake, index) => {
      const parts = workingText.split(new RegExp(`(${mistake.incorrect})`, 'i'));
      // Find position
      workingText = parts.map(part => {
        if (part.toLowerCase() === mistake.incorrect.toLowerCase()) {
          return `__MISTAKE_${index}__`;
        }
        return part;
      }).join('');
    });

    const finalParts = workingText.split(/(__MISTAKE_\d+__)/);
    
    return (
      <p className="whitespace-pre-wrap leading-relaxed text-sm text-primary font-body-main">
        {finalParts.map((part, idx) => {
          const match = part.match(/__MISTAKE_(\d+)__/);
          if (match) {
            const mistakeIdx = parseInt(match[1]);
            const mistake = evaluation.grammarMistakes[mistakeIdx];
            return (
              <span 
                key={idx}
                className="bg-error-container text-on-error-container border-b-2 border-error font-bold px-1.5 py-0.5 rounded cursor-pointer relative group inline-block"
                title="Click to see correction"
              >
                {part.replace(/__MISTAKE_\d+__/, mistake.incorrect)}
                
                {/* Popover Hover tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-surface-container border border-error/20 p-2.5 rounded-lg shadow-md hidden group-hover:block z-20 text-[10px] text-on-surface font-normal normal-case leading-normal select-none">
                  <span className="text-error font-bold block">Incorrect: {mistake.incorrect}</span>
                  <span className="text-emerald-700 font-bold block">Correct: {mistake.correct}</span>
                  <span className="text-on-surface-variant block mt-1">{mistake.explanation}</span>
                </span>
              </span>
            );
          }
          return part;
        })}
      </p>
    );
  };

  // Metric breakdown listing details
  const metricItems = [
    { key: 'grammar', label: 'Grammar Accuracy' },
    { key: 'vocabulary', label: 'Vocabulary Tier' },
    { key: 'coherence', label: 'Logical Coherence' },
    { key: 'sentenceStructure', label: 'Sentence Structures' },
    { key: 'argumentStrength', label: 'Argument Strength' },
    { key: 'criticalThinking', label: 'Critical Thinking' },
    { key: 'organization', label: 'Organization Flow' },
    { key: 'creativity', label: 'Creativity / Style' },
    { key: 'readability', label: 'Readability Index' },
    { key: 'tone', label: 'Academic Tone' },
    { key: 'flow', label: 'Syntactic Flow' },
    { key: 'wordChoice', label: 'Precise Word Choice' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: Selected evaluation report details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Essay Score Card Header */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-label-mono text-[9px] bg-secondary/15 text-secondary px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {evaluation.exam} AI Grader Report
            </span>
            <h4 className="font-h1-academic text-lg font-bold text-primary">{evaluation.topicTitle}</h4>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-on-surface-variant">
              <span>{new Date(evaluation.date).toLocaleDateString()}</span>
              <span>•</span>
              <span>{evaluation.wordCount} words</span>
              <span>•</span>
              <span>{evaluation.durationSpent} mins spent</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Massive overall score gauge */}
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex flex-col items-center justify-center border border-secondary/25">
              <span className="font-label-mono text-xl font-bold text-secondary">{evaluation.score}</span>
              <span className="text-[9px] text-on-surface-variant font-medium -mt-1">/10</span>
            </div>
            <button 
              onClick={() => onDelete(evaluation.id)}
              className="p-2 text-outline-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
              title="Delete Evaluation Record"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-outline-variant/30 text-xs">
          {[
            { id: 'scores', label: 'Scores Breakdown' },
            { id: 'grammar', label: 'Grammar & Corrections' },
            { id: 'vocabulary', label: 'Lexical Vocabulary' },
            { id: 'structure', label: 'Outline Structure' },
            { id: 'feedback', label: 'AI Synthesis' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 pb-3 text-center transition-all font-button-text ${
                activeSubTab === tab.id
                  ? 'border-b-2 border-secondary text-secondary font-bold font-button-text'
                  : 'text-on-surface-variant hover:text-primary font-button-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="min-h-[300px]">
          {/* SubTab 1: Scores Breakdown */}
          {activeSubTab === 'scores' && (
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
              <h5 className="font-button-text text-sm text-primary font-bold uppercase tracking-wider">Evaluation Criteria Breakdown</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Essays are evaluated using 12 specialized metrics. Scoring curves are strict to challenge high-achieving GRE/GMAT and IELTS candidates.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metricItems.map(item => {
                  const score = evaluation.metrics[item.key];
                  const scoreColor = 
                    score >= 8.0 ? 'text-emerald-700' :
                    score >= 6.5 ? 'text-amber-700' :
                    'text-error';
                  
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-body-main">
                        <span className="text-on-surface-variant">{item.label}</span>
                        <span className={`font-label-mono font-bold ${scoreColor}`}>{score} / 10</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full transition-all duration-300"
                          style={{ 
                            width: `${score * 10}%`,
                            backgroundColor: score >= 8.0 ? '#059669' : score >= 6.5 ? '#f59e0b' : 'var(--color-secondary)'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SubTab 2: Grammar & Corrections */}
          {activeSubTab === 'grammar' && (
            <div className="space-y-4">
              {/* Highlighted text */}
              <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
                <h5 className="font-button-text text-xs text-secondary font-bold uppercase tracking-wider">Draft Correction Overlay</h5>
                <div className="bg-surface-container-low/30 border border-outline-variant/30 rounded-lg p-4 leading-relaxed">
                  {renderGrammarHighlightedText()}
                </div>
                <p className="text-[10px] text-on-surface-variant">
                  Hover over red highlighted segments to examine spelling and grammar corrections.
                </p>
              </div>

              {/* Mistakes List */}
              <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
                <h5 className="font-button-text text-xs text-primary font-bold uppercase tracking-wider">Corrections List</h5>
                
                {evaluation.grammarMistakes && evaluation.grammarMistakes.length > 0 ? (
                  <div className="space-y-3">
                    {evaluation.grammarMistakes.map((mistake, idx) => (
                      <div key={idx} className="p-3 border border-outline-variant/40 rounded-lg flex items-start gap-3 text-xs leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-error-container text-on-error-container font-label-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-error font-bold line-through">{mistake.incorrect}</span>
                            <span className="material-symbols-outlined text-[12px] text-outline">arrow_forward</span>
                            <span className="text-emerald-700 font-bold">{mistake.correct}</span>
                          </div>
                          <p className="text-on-surface-variant">{mistake.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-on-surface-variant font-body-main text-xs flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    Outstanding! No critical spelling or grammar errors detected.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SubTab 3: Vocabulary Analysis */}
          {activeSubTab === 'vocabulary' && (
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
              <h5 className="font-button-text text-sm text-primary font-bold uppercase tracking-wider">Repetitive Terms & Synonyms</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Repeating common words lowers writing complexity ratings. Hover or review the suggested academic synonyms to replace redundant vocabulary.
              </p>

              {evaluation.repeatedWords && evaluation.repeatedWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {evaluation.repeatedWords.map((wordObj, idx) => (
                    <div key={idx} className="p-3 border border-outline-variant/40 rounded-lg space-y-2">
                      <div className="flex justify-between items-baseline text-xs font-body-main">
                        <span className="text-error font-bold">"{wordObj.word}"</span>
                        <span className="text-on-surface-variant bg-surface-container px-2 py-0.5 rounded text-[10px]">
                          Repeated: {wordObj.count} times
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-on-surface-variant font-bold">Try Academic Replacements:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {wordObj.alternatives.map((alt, altIdx) => (
                            <span 
                              key={altIdx} 
                              className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] px-2 py-0.5 rounded font-body-main font-bold"
                            >
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic py-4">
                  No vocabulary repetitions flagged. Excellent lexical diversity.
                </p>
              )}
            </div>
          )}

          {/* SubTab 4: Structure Analysis */}
          {activeSubTab === 'structure' && (
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
              <h5 className="font-button-text text-sm text-primary font-bold uppercase tracking-wider">Essay Structure Verification</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'introduction', label: 'Introduction Section' },
                  { key: 'arguments', label: 'Main Logical Claims' },
                  { key: 'examples', label: 'Supporting Examples' },
                  { key: 'counterargument', label: 'Counterargument / Refutation' },
                  { key: 'conclusion', label: 'Concluding Summary' }
                ].map(item => {
                  const present = evaluation.structureAnalysis[item.key];
                  return (
                    <div 
                      key={item.key} 
                      className={`p-3 border rounded-lg flex items-center justify-between text-xs ${
                        present 
                          ? 'border-emerald-200 bg-emerald-50/20 text-emerald-800' 
                          : 'border-error/20 bg-error-container/5 text-error'
                      }`}
                    >
                      <span className="font-button-text font-bold">{item.label}</span>
                      <span className="material-symbols-outlined text-[18px]">
                        {present ? 'check_circle' : 'cancel'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/30 space-y-1">
                <span className="text-xs text-secondary font-bold uppercase tracking-wider font-label-mono block">AI Structural Verdict</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {evaluation.structureAnalysis.suggestions}
                </p>
              </div>
            </div>
          )}

          {/* SubTab 5: AI Feedback Synthesis */}
          {activeSubTab === 'feedback' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths & Weaknesses */}
              <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                <div className="space-y-3">
                  <h5 className="font-button-text text-xs text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    ✔ Key Strengths
                  </h5>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-on-surface-variant flex items-start gap-1.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5"></span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-3 border-t border-outline-variant/30">
                  <h5 className="font-button-text text-xs text-error font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">cancel</span>
                    ✖ Areas to Improve
                  </h5>
                  <ul className="space-y-2">
                    {evaluation.improvements.map((imp, idx) => (
                      <li key={idx} className="text-xs text-on-surface-variant flex items-start gap-1.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-error rounded-full shrink-0 mt-1.5"></span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions for action plans */}
              <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <h5 className="font-button-text text-xs text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                    Actionable Improvement Plan
                  </h5>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {evaluation.suggestions}
                  </p>
                </div>
                
                {/* Visual quote/motivation banner */}
                <div className="bg-surface-container-low/40 p-3.5 rounded-lg border border-outline-variant/30 border-l-4 border-l-secondary text-[11px] text-on-surface-variant leading-relaxed">
                  "Writing structure determines coherence score. Rewriting paragraphs to enforce formal links increases score averages quickly."
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Evaluation history pane */}
      <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <h5 className="font-h1-academic text-base font-bold text-primary">Evaluated Essays</h5>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Select an essay history item to review details.
        </p>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {history.map(item => (
            <div
              key={item.id}
              onClick={() => onViewDetails(item)}
              className={`p-3 border rounded-lg hover:border-secondary cursor-pointer transition-all space-y-1.5 ${
                evaluation.id === item.id 
                  ? 'border-secondary bg-secondary/5 font-bold shadow-sm'
                  : 'border-outline-variant/40'
              }`}
            >
              <div className="flex justify-between items-baseline gap-1.5 text-xs font-body-main">
                <span className="text-primary font-bold truncate block max-w-[130px]">{item.topicTitle}</span>
                <div className="shrink-0">
                  <span className="font-label-mono font-bold text-secondary text-sm">{item.score}</span>
                  <span className="text-[9px] text-on-surface-variant font-normal">/10</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                <span>{item.exam}</span>
                <span>{new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onBackToDashboard}
          className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface hover:text-primary font-button-text text-xs py-2.5 rounded-lg border border-outline-variant/50 transition-all text-center flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

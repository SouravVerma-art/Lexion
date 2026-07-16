import React, { useState } from 'react';

// Seeding grammar exercises
const FILL_BLANKS_EXERCISES = [
  {
    id: 'fb_1',
    sentence: 'The consolidation of various administrative departments __________ to have improved overall corporate profits.',
    options: ['seem', 'seems', 'is seeming', 'seeming'],
    correct: 'seems',
    explanation: 'Subject-Verb Agreement: The subject is singular ("consolidation"), not the plural object of the preposition ("departments"). Therefore, the verb must be the singular form "seems".'
  },
  {
    id: 'fb_2',
    sentence: 'Automating logistics not only speeds up delivery __________ decreases the margin of human error.',
    options: ['and also', 'but also', 'as well as', 'in addition'],
    correct: 'but also',
    explanation: 'Correlative Conjunction: The phrase "not only" must form a parallel structure with "but also".'
  }
];

const CORRECTION_EXERCISES = [
  {
    id: 'sc_1',
    incorrect: 'Having centralizing all operations, Apogees profits increased.',
    options: [
      'Having centralizing all operations, Apogees profits increased.',
      'By centralizing all operations, Apogee increased its profits.',
      'Centralizing all operations, the profits of Apogee increased.',
      'After all operations centralized, the increase of profits happened.'
    ],
    correct: 'By centralizing all operations, Apogee increased its profits.',
    explanation: 'Dangling Modifier: The introductory phrase "Having centralized all operations" must modify the subject of the clause. In the incorrect sentence, the subject is "profits" (which cannot consolidate departments). Changing the subject to "Apogee" resolves the error.'
  },
  {
    id: 'sc_2',
    incorrect: 'Neither the executives nor the regional manager were willing to relocate.',
    options: [
      'Neither the executives nor the regional manager were willing to relocate.',
      'Neither the executives nor the regional manager was willing to relocate.',
      'Neither the executives or the regional manager were willing to relocate.',
      'Neither the executives nor the regional manager are willing to relocate.'
    ],
    correct: 'Neither the executives nor the regional manager was willing to relocate.',
    explanation: 'Subject-Verb Agreement: With correlative subjects joined by "neither... nor", the verb must agree with the closer subject ("manager", which is singular). Hence, "was" is correct.'
  }
];

const SPOTTING_EXERCISES = [
  {
    id: 'es_1',
    segments: ['Although', 'the technology', 'is beneficial,', 'but over-reliance', 'causes passivity.'],
    incorrectIndex: 3,
    correctVersion: 'over-reliance',
    explanation: 'Double Conjunctions: Combining "Although" and "but" in the same complex sentence is redundant. You must eliminate the coordinating conjunction "but".'
  },
  {
    id: 'es_2',
    segments: ['The business team', 'devised', 'an empirical', 'criteria', 'for relocation.'],
    incorrectIndex: 3,
    correctVersion: 'criterion',
    explanation: 'Plurality Error: "Criteria" is plural (singular: "criterion"). The singular article "an" requires the singular noun "criterion".'
  }
];

export default function GrammarPractice() {
  const [activeType, setActiveType] = useState('blanks'); // blanks, correction, spotting
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const handleSelectAnswer = (id, option) => {
    setSelectedAnswers(prev => ({ ...prev, [id]: option }));
  };

  const handleSubmitAnswer = (id) => {
    setSubmittedAnswers(prev => ({ ...prev, [id]: true }));
  };

  const handleResetAnswer = (id) => {
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setSubmittedAnswers(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab Navigation */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex gap-2">
        {[
          { id: 'blanks', label: 'Fill in the Blanks', icon: 'space_bar' },
          { id: 'correction', label: 'Sentence Correction', icon: 'edit_note' },
          { id: 'spotting', label: 'Error Spotting', icon: 'search' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveType(tab.id);
              setSelectedAnswers({});
              setSubmittedAnswers({});
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-button-text transition-all ${
              activeType === tab.id
                ? 'bg-secondary text-white font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Exercises Container */}
      <div className="space-y-4">
        
        {/* TYPE 1: Fill in Blanks */}
        {activeType === 'blanks' && (
          FILL_BLANKS_EXERCISES.map((item) => {
            const isSubmitted = submittedAnswers[item.id];
            const selected = selectedAnswers[item.id];
            const isCorrect = selected === item.correct;

            return (
              <div 
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4"
              >
                {/* Sentence */}
                <h5 className="font-body-main text-sm text-primary leading-relaxed bg-surface-container-low/40 p-4 rounded-lg border border-outline-variant/20">
                  {item.sentence}
                </h5>

                {/* Options grid */}
                <div className="grid grid-cols-2 gap-2">
                  {item.options.map((opt) => {
                    const isSelected = selected === opt;
                    let optStyle = 'border-outline-variant/50 hover:border-secondary hover:bg-surface-container-low/20';
                    if (isSelected) {
                      optStyle = 'border-secondary bg-secondary/5 font-bold';
                    }
                    if (isSubmitted && opt === item.correct) {
                      optStyle = 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold';
                    }
                    if (isSubmitted && isSelected && !isCorrect) {
                      optStyle = 'border-error bg-error-container/20 text-error font-bold animate-shake';
                    }

                    return (
                      <button
                        key={opt}
                        disabled={isSubmitted}
                        onClick={() => handleSelectAnswer(item.id, opt)}
                        className={`p-3 border rounded-lg text-left text-xs font-body-main transition-all ${optStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Actions and Feedback */}
                <div className="flex justify-between items-center pt-2">
                  {!isSubmitted ? (
                    <button
                      onClick={() => handleSubmitAnswer(item.id)}
                      disabled={!selected}
                      className="bg-secondary disabled:opacity-40 text-white hover:bg-secondary-container font-button-text text-xs px-4 py-2 rounded-lg transition-all"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResetAnswer(item.id)}
                      className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container rounded-lg font-button-text text-xs text-on-surface-variant transition-all"
                    >
                      Reset Exercise
                    </button>
                  )}

                  {isSubmitted && (
                    <span className={`font-button-text text-xs font-bold flex items-center gap-1 ${
                      isCorrect ? 'text-emerald-700' : 'text-error'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {isCorrect ? 'check_circle' : 'cancel'}
                      </span>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  )}
                </div>

                {/* Detailed Explanation */}
                {isSubmitted && (
                  <div className="bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed space-y-1 animate-fadeIn">
                    <span className="font-label-mono font-bold uppercase tracking-wider text-secondary">Explanation:</span>
                    <p>{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* TYPE 2: Sentence Correction */}
        {activeType === 'correction' && (
          CORRECTION_EXERCISES.map((item) => {
            const isSubmitted = submittedAnswers[item.id];
            const selected = selectedAnswers[item.id];
            const isCorrect = selected === item.correct;

            return (
              <div 
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] text-error font-bold uppercase tracking-wider block font-label-mono">Flagged Incorrect:</span>
                  <h5 className="font-body-main text-xs text-error bg-error-container/10 p-3 rounded-lg border border-error/20 italic">
                    "{item.incorrect}"
                  </h5>
                </div>

                <div className="space-y-2">
                  {item.options.map((opt) => {
                    const isSelected = selected === opt;
                    let optStyle = 'border-outline-variant/50 hover:border-secondary hover:bg-surface-container-low/20';
                    if (isSelected) {
                      optStyle = 'border-secondary bg-secondary/5 font-bold';
                    }
                    if (isSubmitted && opt === item.correct) {
                      optStyle = 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold';
                    }
                    if (isSubmitted && isSelected && !isCorrect) {
                      optStyle = 'border-error bg-error-container/20 text-error font-bold animate-shake';
                    }

                    return (
                      <button
                        key={opt}
                        disabled={isSubmitted}
                        onClick={() => handleSelectAnswer(item.id, opt)}
                        className={`w-full p-3 border rounded-lg text-left text-xs font-body-main transition-all ${optStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Actions & Feedback */}
                <div className="flex justify-between items-center pt-2">
                  {!isSubmitted ? (
                    <button
                      onClick={() => handleSubmitAnswer(item.id)}
                      disabled={!selected}
                      className="bg-secondary disabled:opacity-40 text-white hover:bg-secondary-container font-button-text text-xs px-4 py-2 rounded-lg transition-all"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResetAnswer(item.id)}
                      className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container rounded-lg font-button-text text-xs text-on-surface-variant transition-all"
                    >
                      Reset Exercise
                    </button>
                  )}

                  {isSubmitted && (
                    <span className={`font-button-text text-xs font-bold flex items-center gap-1 ${
                      isCorrect ? 'text-emerald-700' : 'text-error'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {isCorrect ? 'check_circle' : 'cancel'}
                      </span>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  )}
                </div>

                {/* Explanations */}
                {isSubmitted && (
                  <div className="bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed space-y-1 animate-fadeIn">
                    <span className="font-label-mono font-bold uppercase tracking-wider text-secondary">Explanation:</span>
                    <p>{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* TYPE 3: Error Spotting */}
        {activeType === 'spotting' && (
          SPOTTING_EXERCISES.map((item) => {
            const isSubmitted = submittedAnswers[item.id];
            const selectedIdx = selectedAnswers[item.id]; // integer index
            const isCorrect = selectedIdx === item.incorrectIndex;

            return (
              <div 
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block font-label-mono">
                    Identify the grammatical error:
                  </span>
                  
                  {/* Sentence segmented buttons */}
                  <div className="flex flex-wrap gap-2 py-3 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl p-4">
                    {item.segments.map((segment, index) => {
                      const isSelected = selectedIdx === index;
                      let segStyle = 'border-outline-variant/50 hover:border-secondary hover:bg-surface-container';
                      if (isSelected) {
                        segStyle = 'border-secondary bg-secondary/5 font-bold text-secondary';
                      }
                      if (isSubmitted && index === item.incorrectIndex) {
                        segStyle = 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold';
                      }
                      if (isSubmitted && isSelected && !isCorrect) {
                        segStyle = 'border-error bg-error-container/20 text-error font-bold animate-shake';
                      }

                      return (
                        <button
                          key={index}
                          disabled={isSubmitted}
                          onClick={() => handleSelectAnswer(item.id, index)}
                          className={`px-3 py-2 border rounded-lg font-body-main text-xs transition-all ${segStyle}`}
                        >
                          {segment}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions & Feedback */}
                <div className="flex justify-between items-center pt-2">
                  {!isSubmitted ? (
                    <button
                      onClick={() => handleSubmitAnswer(item.id)}
                      disabled={selectedIdx === undefined}
                      className="bg-secondary disabled:opacity-40 text-white hover:bg-secondary-container font-button-text text-xs px-4 py-2 rounded-lg transition-all"
                    >
                      Check Segment
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResetAnswer(item.id)}
                      className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container rounded-lg font-button-text text-xs text-on-surface-variant transition-all"
                    >
                      Reset Exercise
                    </button>
                  )}

                  {isSubmitted && (
                    <span className={`font-button-text text-xs font-bold flex items-center gap-1 ${
                      isCorrect ? 'text-emerald-700' : 'text-error'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {isCorrect ? 'check_circle' : 'cancel'}
                      </span>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  )}
                </div>

                {/* Explanations */}
                {isSubmitted && (
                  <div className="bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed space-y-2 animate-fadeIn">
                    <div>
                      <span className="font-label-mono font-bold uppercase tracking-wider text-secondary">Correction Recommendation:</span>
                      <p className="font-body-main text-xs text-primary font-bold mt-0.5">
                        Replace "{item.segments[item.incorrectIndex]}" with <span className="text-emerald-700">"{item.correctVersion}"</span>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-outline-variant/20 space-y-1">
                      <span className="font-label-mono font-bold uppercase tracking-wider text-secondary block">Grammar Rule:</span>
                      <p>{item.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

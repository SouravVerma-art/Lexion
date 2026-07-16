import React, { useState } from 'react';

const TEMPLATES = [
  {
    id: 'temp_1',
    name: 'Analytical Critique of an Argument',
    exam: 'GMAT AWA / GRE Argument Task',
    desc: 'Evaluate the logical construction of a business memorandum, spotting logical flaws, false assumptions, and data gaps.',
    outline: [
      { section: 'Paragraph 1: Introduction', details: 'Identify the memorandum\'s conclusion and state clearly that the argument relies on unproven assumptions, making it logically flawed.' },
      { section: 'Paragraph 2: Logical Flaw 1', details: 'Address the primary assumption. Critically analyze why correlation does not equal causation (e.g. historical profit centralization false equivalence).' },
      { section: 'Paragraph 3: Logical Flaw 2', details: 'Analyze secondary failures (e.g., ignoring operational overheads, local customer rigidity, or employee morale degradation).' },
      { section: 'Paragraph 4: Strengthening Proposal', details: 'Explain how empirical data, cost-benefit research, or local surveys could strengthen or clarify the argument\'s validity.' },
      { section: 'Paragraph 5: Conclusion', details: 'Reiterate that the argument is unconvincing in its present state. Summarize the missing evidence required for approval.' }
    ],
    phrases: [
      'The argument relies on the critical assumption that...',
      'This correlation is logically flawed because it fails to account for...',
      'A primary concern is that centralization introduces risks such as...',
      'To bolster the proposal, the business department must provide...',
      'Without an empirical cost-benefit assessment, the recommendation remains unconvincing.'
    ]
  },
  {
    id: 'temp_2',
    name: 'Balanced Discussion & Opinion',
    exam: 'IELTS Task 2 / TOEFL',
    desc: 'Synthesize opposing perspectives on a public policy (e.g., free education) and conclude with a justified, balanced synthesis.',
    outline: [
      { section: 'Paragraph 1: Introduction', details: 'Paraphrase the prompt statement. Present a clear overview summarizing both sides and state your own hybrid thesis.' },
      { section: 'Paragraph 2: Argument A (Free Access)', details: 'Explain the benefits of universal access (social mobility, highly educated workforce, tax revenue increases).' },
      { section: 'Paragraph 3: Argument B (Tuition Contribution)', details: 'Detail the merits of student contribution (lifetime earnings capital, university autonomy, infrastructural quality).' },
      { section: 'Paragraph 4: Balanced Opinion', details: 'Formulate a hybrid solution (subsidized interest loans, grants for low-income brackets combined with partial tuition).' },
      { section: 'Paragraph 5: Conclusion', details: 'Summarize the core arguments and restate that access and quality are both maximized under a balanced framework.' }
    ],
    phrases: [
      'The debate surrounding universal funding remains highly contentious.',
      'On one hand, eliminating financial hurdles promotes social mobility.',
      'On the other hand, tertiary credentials operate as private assets.',
      'In my view, a sustainable approach requires a balanced, hybrid framework.',
      'In summary, access is best guaranteed through targeted grants combined with reasonable contributions.'
    ]
  },
  {
    id: 'temp_3',
    name: 'Problem-Solution Outline',
    exam: 'IELTS / XAT / General',
    desc: 'Identify the causes of a complex societal issue (e.g., carbon offsets or environmental decline) and propose actionable solutions.',
    outline: [
      { section: 'Paragraph 1: Introduction', details: 'State the problem and its contemporary relevance. Outline that the issue stems from specific causes and requires targeted remedies.' },
      { section: 'Paragraph 2: Root Causes', details: 'Critically analyze causes (e.g., corporate greenwashing, lack of regulatory audits, cheap offset prices).' },
      { section: 'Paragraph 3: Actionable Solutions', details: 'Propose solutions (e.g., strict international audits, carbon taxing, mandatory direct emission reductions).' },
      { section: 'Paragraph 4: Conclusion', details: 'Reiterate that while the threat is substantial, implementing structural controls will mitigate long-term impacts.' }
    ],
    phrases: [
      'A major factor contributing to this crisis is...',
      'This problem is exacerbated by the lack of structural auditing...',
      'To mitigate these detrimental impacts, international coalitions must implement...',
      'A particularly effective remedy would be to enforce...',
      'In conclusion, while the challenge is formidable, targeted regulatory reforms can ameliorate...'
    ]
  }
];

export default function WritingTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyOutline = () => {
    const textToCopy = selectedTemplate.outline
      .map(o => `${o.section}\n${o.details}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => alert('Failed to copy template outline.'));
  };

  return (
    <div className="space-y-6">
      {/* Templates Selector Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <h4 className="font-h1-academic text-base font-bold text-primary">Academic Essay Frameworks</h4>
          <p className="text-xs text-on-surface-variant">Review structural templates and advanced transition phrase logs.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map(temp => (
            <button
              key={temp.id}
              onClick={() => setSelectedTemplate(temp)}
              className={`px-4 py-2 border rounded-lg text-xs font-button-text transition-all ${
                selectedTemplate.id === temp.id
                  ? 'border-secondary bg-secondary/5 text-secondary font-bold shadow-sm'
                  : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {temp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Template Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fadeIn">
        {/* Outline steps (Left 2 columns) */}
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
            <div>
              <h5 className="font-button-text text-sm text-primary font-bold">{selectedTemplate.name}</h5>
              <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-label-mono mt-1 inline-block">
                {selectedTemplate.exam}
              </span>
            </div>
            <button
              onClick={handleCopyOutline}
              className="px-3 py-1.5 border border-outline-variant/60 hover:bg-surface-container rounded-lg font-button-text text-[10px] text-on-surface-variant flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copySuccess ? 'check' : 'content_copy'}
              </span>
              {copySuccess ? 'Copied!' : 'Copy Outline'}
            </button>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {selectedTemplate.desc}
          </p>

          <div className="space-y-4">
            {selectedTemplate.outline.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start text-xs leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary font-label-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5 border border-secondary/20">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <h6 className="font-button-text text-primary font-bold">{step.section}</h6>
                  <p className="text-on-surface-variant">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transitional phrases (Right column) */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-l-4 border-l-secondary space-y-4">
          <h5 className="font-button-text text-xs text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">abc</span>
            Key Transitions Phrases
          </h5>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Incorporate these highly academic connectors into your essays to guarantee maximum points in the Flow and sentence Structure criteria.
          </p>

          <div className="space-y-2.5">
            {selectedTemplate.phrases.map((phrase, idx) => (
              <div 
                key={idx}
                onClick={() => navigator.clipboard.writeText(phrase)}
                className="p-2.5 bg-surface-container-low/40 rounded border border-outline-variant/20 hover:border-secondary hover:bg-surface-container transition-all cursor-pointer group"
                title="Click to copy phrase"
              >
                <p className="text-xs text-on-surface leading-relaxed font-body-main group-hover:text-secondary transition-colors">
                  "{phrase}"
                </p>
                <span className="text-[9px] text-outline-variant font-label-mono text-right block mt-1">Click to copy</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

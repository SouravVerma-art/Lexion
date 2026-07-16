import React, { useState } from 'react';

// Static expert model essays for comparison
const MODEL_ESSAYS = {
  topic_1: {
    score: '10.0 / 10 (GMAT AWA 6.0)',
    content: `The memorandum recommendation that Apogee Company consolidate all operations in a single location to restore historic levels of profitability relies on several critical logical assumptions that are fundamentally flawed. 

First, the author assumes a false correlation between geographical centralization and company profitability. The memo notes that when all operations were in one location, Apogee was more profitable. However, this observation fails to account for macro-economic shifts, product lifecycle variations, or competitive intensifications that occurred concurrently with Apogee\'s physical expansion. Centralization itself does not guarantee profitability.

Second, consolidation introduces operational risks such as organizational bottlenecking, logistical rigidity, and regional market detachment. In a single-location model, local distribution branches lose their responsive flexibility, leading to customer dissatisfaction. Additionally, relocating personnel often devastates employee morale, resulting in lowered productivity.

Ultimately, without an empirical cost-benefit analysis of relocation expenses versus local operational savings, Apogee's memorandum fails to justify its recommendation. To strengthen the proposal, the business department must provide detailed projections comparing decentralized overhead against consolidated logistics.`
  },
  topic_2: {
    score: '10.0 / 10 (GRE Issue 6.0)',
    content: `The assertion that humanity's reliance on technology will inevitably degrade our capacity for independent thought is a classic, albeit overly pessimistic, view of technological evolution. Rather than diminishing cognitive agency, digital tools liberate human intellect from mechanical calculations, enabling complex problem-solving and conceptual synthesis.

Historically, every paradigm-shifting utility—from the printing press to the handheld calculator—has sparked alarmist claims of intellectual decay. In practice, however, outsourcing lower-order tasks frees cognitive bandwidth. A researcher today uses software to sort billions of data points in seconds, not to bypass thinking, but to focus on interpreting relationships and formulating hypotheses. Technology is an intellectual amplifier, not a substitute.

Nonetheless, a caveat exists: absolute intellectual passivity is a risk if educational systems fail to cultivate foundational critical thinking. Using a tool without understanding its mechanics can lead to blind reliance. 

In conclusion, technology does not inherently diminish human intelligence; rather, it shifts the cognitive load from retrieval and computation to analysis and strategy. Independent thought is not decaying; it is simply operating on a higher plane of abstraction.`
  },
  topic_3: {
    score: '9.0 / 9.0 (IELTS Band 9)',
    content: `The debate surrounding whether tertiary education should be fully funded by governments or paid for by students remains highly contentious. While some believe that universal free education benefits society as a whole, others argue that students must bear tuition costs since they reap the direct financial rewards.

On one hand, eliminating tuition barriers fosters social mobility and economic equality. A highly educated workforce drives technological innovation and increases tax revenues, benefiting the state. Countries like Germany and Norway offer free higher education to ensure that talent, regardless of socio-economic status, is not wasted.

On the other hand, university education is a private asset that dramatically increases an individual\'s lifetime earnings. It is therefore argued that students should invest in their own futures. Furthermore, introducing tuition fees provides universities with direct capital to improve facilities, attract world-class professors, and maintain global competitiveness.

In my opinion, a balanced, hybrid model is the most sustainable. Governments should provide subsidized loans and merit-based grants to guarantee access for low-income candidates, while students contribute a reasonable portion of fees to ensure university autonomy and quality.`
  }
};

export default function SampleEssays({ topics, history, selectedTopic, onSelectTopic }) {
  const [activeCompareTopic, setActiveCompareTopic] = useState(topics[0].id);

  // Find latest attempt draft for comparison
  const getLatestStudentDraft = (topicId) => {
    const attempts = history.filter(h => h.topicId === topicId);
    if (attempts.length === 0) return null;
    // return latest draft (sorted by date)
    const sorted = [...attempts].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].draft;
  };

  const currentTopicId = selectedTopic ? selectedTopic.id : activeCompareTopic;
  const modelEssay = MODEL_ESSAYS[currentTopicId];
  const studentDraft = getLatestStudentDraft(currentTopicId);

  return (
    <div className="space-y-6">
      {/* Selection row */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="font-h1-academic text-base font-bold text-primary">Model Essay Library</h4>
            <p className="text-xs text-on-surface-variant">Review expert essays written for our practice prompts.</p>
          </div>
          
          {/* Dropdown selectors */}
          <div className="relative w-full sm:w-64">
            <select
              value={currentTopicId}
              onChange={(e) => {
                const topicId = e.target.value;
                if (selectedTopic) {
                  const newT = topics.find(t => t.id === topicId);
                  onSelectTopic(newT);
                } else {
                  setActiveCompareTopic(topicId);
                }
              }}
              className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg py-2 pl-3 pr-8 font-body-sm text-body-sm text-on-surface-variant focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              {topics.slice(0, 4).map(topic => (
                <option key={topic.id} value={topic.id}>
                  [{topic.exam}] {topic.title}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant text-[18px]">expand_more</span>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison slider layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Student Essay */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 min-h-[400px]">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
            <h5 className="font-button-text text-sm text-primary font-bold">Your Latest Draft</h5>
            <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-label-mono">
              Student Draft
            </span>
          </div>

          {studentDraft ? (
            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-sm text-on-surface leading-relaxed font-body-main">
                {studentDraft}
              </p>
              {/* Highlight points markers */}
              <div className="bg-surface-container-low/40 p-3.5 rounded-lg border border-outline-variant/30 space-y-2">
                <span className="text-[10px] font-label-mono font-bold text-secondary uppercase block">Draft Observations</span>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Your essay is functional, but lacks transition words ("Moreover", "Paradoxically") and relies on simple logic. Try to integrate the advanced vocabulary listed in the model essay.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-on-surface-variant font-body-main text-xs space-y-3">
              <span className="material-symbols-outlined text-4xl text-outline-variant">edit</span>
              <p>You haven't attempted this topic yet.</p>
              <p className="text-[10px] text-on-surface-variant">Write a response in the practice editor to unlock side-by-side comparison.</p>
            </div>
          )}
        </div>

        {/* Right Column: Expert Model Essay */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-l-4 border-l-secondary space-y-4 min-h-[400px]">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
            <h5 className="font-button-text text-sm text-secondary font-bold">Expert Model Essay</h5>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-label-mono font-bold">
              {modelEssay ? modelEssay.score : '10.0 / 10'}
            </span>
          </div>

          {modelEssay ? (
            <div className="space-y-4">
              {/* Split paragraph formatting with highlighted structures */}
              <div className="whitespace-pre-wrap text-sm text-on-surface leading-relaxed font-body-main">
                {modelEssay.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">
                    {/* Highlight key academic phrases in green bold */}
                    {paragraph.split(/(fundamentally flawed|false correlation|macro-economic shifts|logistical rigidity|devastates employee morale|empirical cost-benefit analysis|paradigm-shifting utility|outsourcing lower-order tasks|cognitive bandwidth|intellectual amplifier|absolute intellectual passivity|higher plane of abstraction|universal free education|social mobility and economic equality|highly educated workforce|private asset|lifetime earnings|balanced, hybrid model|subsidized loans)/gi).map((part, pIdx) => {
                      const matches = part.match(/(fundamentally flawed|false correlation|macro-economic shifts|logistical rigidity|devastates employee morale|empirical cost-benefit analysis|paradigm-shifting utility|outsourcing lower-order tasks|cognitive bandwidth|intellectual amplifier|absolute intellectual passivity|higher plane of abstraction|universal free education|social mobility and economic equality|highly educated workforce|private asset|lifetime earnings|balanced, hybrid model|subsidized loans)/i);
                      if (matches) {
                        return (
                          <span key={pIdx} className="bg-emerald-50 text-emerald-800 border-b border-emerald-300 font-bold px-0.5 rounded cursor-help" title="Advanced Academic Phrasing">
                            {part}
                          </span>
                        );
                      }
                      return part;
                    })}
                  </p>
                ))}
              </div>

              <div className="bg-emerald-50/30 p-3.5 rounded-lg border border-emerald-100 space-y-2">
                <span className="text-[10px] font-label-mono font-bold text-emerald-800 uppercase block">Expert Styling Highlights</span>
                <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                  Notice the highlighted words. The model essay uses precise nouns ("cognitive bandwidth") and advanced transitions to guarantee high scores in vocabulary and organization.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant italic py-20 text-center">
              No model essay available for this topic.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

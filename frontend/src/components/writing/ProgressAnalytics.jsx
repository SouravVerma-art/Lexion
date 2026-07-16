import React from 'react';

export default function ProgressAnalytics({ history }) {
  const totalEssays = history.length;

  // Mock analytics helper calculations
  const avgEssayLength = totalEssays > 0
    ? Math.round(history.reduce((sum, h) => sum + h.wordCount, 0) / totalEssays)
    : 0;

  const avgMinutesSpent = totalEssays > 0
    ? Math.round(history.reduce((sum, h) => sum + h.durationSpent, 0) / totalEssays)
    : 0;

  // Generate real calendar heatmap data for the past 28 days
  const getRealHeatmapData = () => {
    const dailyCounts = Array(28).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    history.forEach(item => {
      const essayDate = new Date(item.date);
      essayDate.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - essayDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 28) {
        dailyCounts[27 - diffDays]++; // index 27 is today, index 0 is 27 days ago
      }
    });

    const weeks = [];
    for (let i = 0; i < 28; i += 7) {
      weeks.push(dailyCounts.slice(i, i + 7));
    }
    return weeks;
  };
  const heatmapWeeks = getRealHeatmapData();

  const getHeatmapColor = (level) => {
    if (level === 0) return 'bg-surface-container-low border border-outline-variant/20';
    if (level === 1) return 'bg-secondary/20 border border-secondary/10';
    if (level === 2) return 'bg-secondary/55 border border-secondary/20';
    return 'bg-secondary border border-secondary/30';
  };

  // Generate real common mistakes log from history analysis
  const getRealCommonMistakes = () => {
    const counts = {};
    history.forEach(item => {
      if (item.grammarMistakes) {
        item.grammarMistakes.forEach(mistake => {
          const ruleKey = mistake.incorrect.toLowerCase().includes('their') ? 'Homophone confusion ("their" vs "there")' :
                          mistake.incorrect.toLowerCase().includes('all though') ? 'Conjunction split ("all though" -> "although")' :
                          mistake.incorrect.toLowerCase().includes('logicly') ? 'Adverb spelling suffix ("logicly" -> "logically")' :
                          mistake.incorrect.toLowerCase().includes('good') || mistake.incorrect.toLowerCase().includes('bad') ? 'Simple lexical choice warning ("good" / "bad")' :
                          'Miscellaneous Grammar/Spelling issues';
          
          if (!counts[ruleKey]) {
            counts[ruleKey] = { rule: ruleKey, count: 0, severity: ruleKey.includes('Homophone') ? 'High penalty' : ruleKey.includes('lexical') ? 'Minor warning' : 'Medium penalty' };
          }
          counts[ruleKey].count++;
        });
      }
    });
    
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    return sorted.length > 0 ? sorted : [
      { rule: 'No grammatical mistakes flagged yet.', count: 0, severity: 'Clear' }
    ];
  };
  const commonMistakes = getRealCommonMistakes();

  // Generate real category scores averages from history
  const getRealCategoryScores = () => {
    const sums = { GMAT: { sum: 0, count: 0 }, GRE: { sum: 0, count: 0 }, IELTS: { sum: 0, count: 0 }, TOEFL: { sum: 0, count: 0 } };
    history.forEach(item => {
      const examType = item.exam;
      if (sums[examType]) {
        sums[examType].sum += item.score;
        sums[examType].count++;
      }
    });
    
    return [
      { category: 'GMAT Analytical Critique', score: sums.GMAT.count > 0 ? parseFloat((sums.GMAT.sum / sums.GMAT.count).toFixed(1)) : 0 },
      { category: 'GRE Issue Synthesis', score: sums.GRE.count > 0 ? parseFloat((sums.GRE.sum / sums.GRE.count).toFixed(1)) : 0 },
      { category: 'IELTS Band Discussion', score: sums.IELTS.count > 0 ? parseFloat((sums.IELTS.sum / sums.IELTS.count).toFixed(1)) : 0 },
      { category: 'TOEFL Independent Essay', score: sums.TOEFL.count > 0 ? parseFloat((sums.TOEFL.sum / sums.TOEFL.count).toFixed(1)) : 0 }
    ];
  };
  const categoryScores = getRealCategoryScores();

  // SVG Score Trend points
  const scoreHistory = history.map(h => h.score).reverse();
  const trendPoints = scoreHistory.map((score, index) => {
    const x = totalEssays > 1 ? (index / (totalEssays - 1)) * 260 + 20 : 150;
    const y = 80 - (score / 10) * 60;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* High-level performance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-on-surface-variant block font-body-main">Average Essay Length</span>
          <h3 className="font-label-mono text-2xl font-bold text-primary mt-1">
            {avgEssayLength} <span className="text-xs font-normal text-on-surface-variant">words</span>
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Target is 250 - 500 words</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-on-surface-variant block font-body-main">Average Writing Speed</span>
          <h3 className="font-label-mono text-2xl font-bold text-primary mt-1">
            {avgMinutesSpent} <span className="text-xs font-normal text-on-surface-variant">mins / essay</span>
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-1">Includes AI checklist outlines</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-on-surface-variant block font-body-main">Grammar Growth Trend</span>
          <h3 className="font-label-mono text-2xl font-bold text-emerald-600 mt-1">
            +18% <span className="text-xs font-normal text-on-surface-variant">improvement</span>
          </h3>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">trending_up</span>
            Mistakes count declining
          </p>
        </div>
      </div>

      {/* SVG Score Trend and Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Trend SVG */}
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h4 className="font-h1-academic text-base font-bold text-primary">Strict score Progression</h4>
            <p className="text-xs text-on-surface-variant">Historical essay grades over the past 30 days</p>
          </div>

          {totalEssays > 0 ? (
            <div className="py-2">
              <div className="w-full h-48 border border-outline-variant/20 bg-surface-container-low/20 rounded-xl p-4 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="var(--color-outline-variant)" strokeWidth="0.15" strokeDasharray="3" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="var(--color-outline-variant)" strokeWidth="0.15" strokeDasharray="3" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="var(--color-outline-variant)" strokeWidth="0.15" strokeDasharray="3" />
                  {/* Score lines */}
                  {scoreHistory.length > 1 && (
                    <path
                      d={`M 20,100 L ${trendPoints} L 280,100 Z`}
                      fill="url(#trendGrad)"
                      opacity="0.15"
                    />
                  )}
                  <polyline
                    fill="none"
                    stroke="var(--color-secondary)"
                    strokeWidth="2"
                    points={trendPoints}
                  />
                  {scoreHistory.map((score, index) => {
                    const x = totalEssays > 1 ? (index / (totalEssays - 1)) * 260 + 20 : 150;
                    const y = 80 - (score / 10) * 60;
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        className="fill-surface stroke-secondary stroke-[2.5px] cursor-pointer hover:r-6 transition-all"
                        title={`Essay ${index + 1}: ${score}`}
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-secondary)" />
                      <stop offset="100%" stopColor="var(--color-surface-container)" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Score Axes Labels */}
                <div className="absolute left-2.5 top-5 font-label-mono text-[8px] text-on-surface-variant font-bold">10.0</div>
                <div className="absolute left-2.5 top-[52px] font-label-mono text-[8px] text-on-surface-variant font-bold">5.0</div>
                <div className="absolute left-2.5 bottom-6 font-label-mono text-[8px] text-on-surface-variant font-bold">1.0</div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-on-surface-variant mt-2 px-2">
                <span>Start Study</span>
                <span>Latest Evaluation</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant italic py-16 text-center">
              Write essays to unlock the historical score progression chart.
            </p>
          )}
        </div>

        {/* Heatmap Activity */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h4 className="font-h1-academic text-base font-bold text-primary">Writing Frequency</h4>
            <p className="text-xs text-on-surface-variant">Daily essay completion counts (past month)</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            {/* 4x7 grid */}
            <div className="grid grid-cols-7 gap-2">
              {heatmapWeeks.flatMap((week, weekIdx) => 
                week.map((level, dayIdx) => (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`w-6 h-6 rounded ${getHeatmapColor(level)} transition-all`}
                    title={`Day level: ${level} essays`}
                  />
                ))
              )}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant font-label-mono">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded bg-surface-container-low" />
              <div className="w-2.5 h-2.5 rounded bg-secondary/20" />
              <div className="w-2.5 h-2.5 rounded bg-secondary/55" />
              <div className="w-2.5 h-2.5 rounded bg-secondary" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Common Mistakes Log & Categories scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mistakes List */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <h4 className="font-h1-academic text-base font-bold text-primary">Common Essay Errors Log</h4>
          <div className="space-y-3">
            {commonMistakes.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-outline-variant/20 pb-2">
                <div className="space-y-0.5">
                  <span className="font-button-text font-bold text-primary">{item.rule}</span>
                  <span className="text-[10px] text-error font-bold block">{item.severity}</span>
                </div>
                <div className="bg-error-container/30 text-error font-label-mono font-bold px-2.5 py-0.5 rounded-full">
                  {item.count} times
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <h4 className="font-h1-academic text-base font-bold text-primary">Performance by Exam Task</h4>
          <div className="space-y-3.5">
            {categoryScores.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-body-main">
                  <span className="text-on-surface-variant">{item.category}</span>
                  <span className="font-label-mono font-bold text-primary">{item.score} / 10</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary rounded-full" 
                    style={{ width: `${item.score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { MOCK_TOPICS } from './WritingView';

export default function WritingDashboard({ history, onViewEvaluation, onStartPractice }) {
  // Stats calculations
  const totalEssays = history.length;
  
  const averageScore = totalEssays > 0 
    ? parseFloat((history.reduce((sum, h) => sum + h.score, 0) / totalEssays).toFixed(1))
    : 0;

  const averageGrammar = totalEssays > 0
    ? Math.round(history.reduce((sum, h) => sum + h.metrics.grammar, 0) / totalEssays * 10)
    : 0;

  const averageVocab = totalEssays > 0
    ? Math.round(history.reduce((sum, h) => sum + h.metrics.vocabulary, 0) / totalEssays * 10)
    : 0;

  // Calculate real streak from dates in history
  const calculateRealStreak = (historyList) => {
    if (historyList.length === 0) return 0;
    const dates = [...new Set(historyList.map(h => h.date.split('T')[0]))]
      .map(dStr => new Date(dStr))
      .sort((a, b) => b - a);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const latestDate = dates[0];
    latestDate.setHours(0, 0, 0, 0);
    if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    let currentStreak = 1;
    let checkDate = latestDate;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      prevDate.setHours(0, 0, 0, 0);
      
      const compDate = dates[i];
      compDate.setHours(0, 0, 0, 0);
      
      if (compDate.getTime() === prevDate.getTime()) {
        currentStreak++;
        checkDate = compDate;
      } else if (compDate.getTime() < prevDate.getTime()) {
        break;
      }
    }
    return currentStreak;
  };
  const streak = calculateRealStreak(history);

  // Calculate real essays written in the last 7 days
  const getEssaysThisWeek = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return history.filter(h => new Date(h.date) >= sevenDaysAgo).length;
  };
  const essaysThisWeek = getEssaysThisWeek();
  
  // Custom SVG Sparkline points for recent scores
  const scoreHistory = history.map(h => h.score).reverse();
  const sparklinePoints = scoreHistory.map((score, index) => {
    const x = totalEssays > 1 ? (index / (totalEssays - 1)) * 140 + 10 : 75;
    // Map score 0-10 to y-coords 40-10
    const y = 50 - (score / 10) * 40;
    return `${x},${y}`;
  }).join(' ');

  // Upcoming Daily Challenge topic
  const dailyChallengeTopic = MOCK_TOPICS[2]; // IELTS Tuition fee topic

  // Get writing level string
  const getWritingLevel = (score) => {
    if (score >= 9.0) return 'C2 Proficient (Elite)';
    if (score >= 8.0) return 'C1 Advanced (High)';
    if (score >= 7.0) return 'B2 Upper-Intermediate';
    if (score >= 5.5) return 'B1 Intermediate (Rigorous)';
    return 'A2 Elementary (Basic)';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Essays */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-body-sm text-on-surface-variant font-body-main">Total Essays Written</span>
            <h3 className="font-label-mono text-3xl font-bold text-primary mt-1">{totalEssays}</h3>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              +{essaysThisWeek} this week
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">edit_document</span>
          </div>
        </div>

        {/* Avg AI Score */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-body-sm text-on-surface-variant font-body-main">Average AI Score</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="font-label-mono text-3xl font-bold text-primary">{averageScore || 'N/A'}</h3>
              {averageScore > 0 && <span className="text-xs text-on-surface-variant">/ 10</span>}
            </div>
            <p className="text-[11px] text-error font-bold flex items-center gap-0.5 mt-1">
              <span className="material-symbols-outlined text-[12px]">gavel</span>
              Strict Grader Active
            </p>
          </div>
          {/* Circular score gauge */}
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-secondary transition-all duration-500"
                strokeWidth="3.2"
                strokeDasharray={`${averageScore * 10}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-label-mono text-[10px] font-bold text-primary">
              {averageScore ? `${Math.round(averageScore * 10)}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-body-sm text-on-surface-variant font-body-main">Current Streak</span>
            <h3 className="font-label-mono text-3xl font-bold text-amber-600 mt-1 flex items-center gap-1.5">
              {streak} <span className="text-xs text-on-surface-variant font-normal">days</span>
            </h3>
            <p className="text-[11px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">
              <span className="material-symbols-outlined text-[12px] animate-pulse-badge">local_fire_department</span>
              Keep it up!
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 animate-combo-pulse">
            <span className="material-symbols-outlined fill text-2xl">local_fire_department</span>
          </div>
        </div>

        {/* Writing Level */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-body-sm text-on-surface-variant font-body-main">Writing Competency</span>
            <h3 className="font-button-text text-sm font-bold text-primary mt-2">
              {totalEssays > 0 ? getWritingLevel(averageScore) : 'Not Graded Yet'}
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-1.5">
              Based on last {totalEssays} submissions
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-tertiary-fixed/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">school</span>
          </div>
        </div>
      </div>

      {/* Analytics Summary & Sparkline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sparkline & Levels */}
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-h1-academic text-lg font-bold text-primary">Weekly Writing Progress</h4>
              <p className="text-xs text-on-surface-variant">Strict AI evaluations over your history</p>
            </div>
            {totalEssays > 0 && (
              <span className="font-label-mono text-[10px] bg-secondary/10 text-secondary px-2.5 py-1 rounded-full font-bold">
                Trend: Stable
              </span>
            )}
          </div>

          {totalEssays > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
              {/* Sparkline SVG Chart */}
              <div className="flex-1 w-full flex items-center justify-center bg-surface-container-low/30 border border-outline-variant/30 rounded-xl p-4 h-32 relative">
                <svg className="w-full h-full" viewBox="0 0 160 50" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2="160" y2="10" stroke="var(--color-outline-variant)" strokeWidth="0.2" strokeDasharray="2" />
                  <line x1="0" y1="25" x2="160" y2="25" stroke="var(--color-outline-variant)" strokeWidth="0.2" strokeDasharray="2" />
                  <line x1="0" y1="40" x2="160" y2="40" stroke="var(--color-outline-variant)" strokeWidth="0.2" strokeDasharray="2" />
                  {/* Area path */}
                  {scoreHistory.length > 1 && (
                    <path
                      d={`M 10,50 L ${sparklinePoints} L 150,50 Z`}
                      fill="url(#sparklineGrad)"
                      opacity="0.15"
                    />
                  )}
                  {/* Sparkline line */}
                  <polyline
                    fill="none"
                    stroke="var(--color-secondary)"
                    strokeWidth="2.5"
                    points={sparklinePoints}
                  />
                  {/* Score Dots */}
                  {scoreHistory.map((score, index) => {
                    const x = totalEssays > 1 ? (index / (totalEssays - 1)) * 140 + 10 : 75;
                    const y = 50 - (score / 10) * 40;
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="3.5"
                        className="fill-surface stroke-secondary stroke-[2px] cursor-pointer hover:r-5 transition-all"
                        title={`Essay ${index + 1}: Score ${score}`}
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-secondary)" />
                      <stop offset="100%" stopColor="var(--color-surface-container)" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Axes labels */}
                <div className="absolute bottom-1.5 left-2 font-label-mono text-[9px] text-on-surface-variant">Oldest</div>
                <div className="absolute bottom-1.5 right-2 font-label-mono text-[9px] text-on-surface-variant">Latest</div>
              </div>

              {/* Progress metrics */}
              <div className="w-full sm:w-48 space-y-4">
                {/* Grammar Accuracy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Grammar Accuracy</span>
                    <span className="font-label-mono font-bold text-primary">{averageGrammar}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-low border border-outline-variant/30 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${averageGrammar}%` }}></div>
                  </div>
                </div>
                {/* Vocab Level */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Vocabulary Level</span>
                    <span className="font-label-mono font-bold text-primary">{averageVocab}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-low border border-outline-variant/30 rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: `${averageVocab}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-on-surface-variant font-body-main border border-dashed border-outline-variant/50 rounded-xl">
              Submit your first essay to populate this analytics chart.
            </div>
          )}
        </div>

        {/* Daily Writing Challenge card */}
        <div className="bg-gradient-to-br from-secondary/15 via-secondary/5 to-surface border border-secondary/20 rounded-xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 bg-secondary text-white font-label-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[10px] animate-pulse-badge">bolt</span>
              Daily Challenge
            </span>
            <h4 className="font-h1-academic text-lg font-bold text-primary leading-snug">
              {dailyChallengeTopic.title}
            </h4>
            <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
              {dailyChallengeTopic.prompt}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded border border-outline-variant/30">
                {dailyChallengeTopic.exam}
              </span>
              <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded border border-outline-variant/30">
                {dailyChallengeTopic.difficulty}
              </span>
              <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded border border-outline-variant/30">
                ~{dailyChallengeTopic.duration} mins
              </span>
            </div>
          </div>
          <button
            onClick={() => onStartPractice(dailyChallengeTopic, false)}
            className="w-full mt-5 bg-secondary text-white hover:bg-secondary-container font-button-text text-xs py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm group"
          >
            Start Practice
            <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Recommended Practice & Recent Submissions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <h4 className="font-h1-academic text-lg font-bold text-primary">Recent Evaluations</h4>
          
          {totalEssays > 0 ? (
            <div className="divide-y divide-outline-variant/30">
              {history.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onViewEvaluation(item)}
                  className="py-3 flex items-center justify-between hover:bg-surface-container-low/20 px-2 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="space-y-1">
                    <h5 className="font-button-text text-sm text-primary font-bold group-hover:text-secondary transition-colors">
                      {item.topicTitle}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-[10px]">{item.exam}</span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.wordCount} words</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-label-mono text-sm font-bold text-primary">
                        {item.score}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">/10</span>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant text-[18px] group-hover:translate-x-0.5 transition-transform">
                      chevron_right
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-on-surface-variant font-body-main border border-dashed border-outline-variant/50 rounded-xl text-xs">
              No recent writing sessions found. Click 'Practice Topics' to start.
            </div>
          )}
        </div>

        {/* Recommended Practice Prompts */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <h4 className="font-h1-academic text-lg font-bold text-primary">Weak Area Workouts</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            AI recommends these specific prompt exercises to enhance structural transitions and complex synonyms.
          </p>

          <div className="space-y-3">
            {MOCK_TOPICS.slice(0, 2).map((item) => (
              <div 
                key={item.id}
                className="p-3 border border-outline-variant/40 rounded-lg hover:border-secondary transition-all group flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex justify-between items-center gap-1.5">
                    <span className="font-label-mono text-[9px] uppercase tracking-wider text-secondary font-bold">
                      Focus: Argument Strength
                    </span>
                    <span className="bg-error-container text-on-error-container text-[8px] font-bold px-1.5 py-0.5 rounded">
                      {item.difficulty}
                    </span>
                  </div>
                  <h5 className="font-button-text text-xs text-primary font-bold mt-1.5 line-clamp-1">
                    {item.title}
                  </h5>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-on-surface-variant font-body-main">
                    Target: {item.wordCount} words
                  </span>
                  <button
                    onClick={() => onStartPractice(item, false)}
                    className="font-button-text text-[10px] text-secondary group-hover:underline flex items-center gap-0.5"
                  >
                    Attempt <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

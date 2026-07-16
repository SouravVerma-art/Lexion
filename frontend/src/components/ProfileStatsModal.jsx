import React, { useEffect, useState } from 'react';

export default function ProfileStatsModal({ isOpen, onClose, words }) {
  const [writingHistory, setWritingHistory] = useState([]);

  // Load latest writing history safely
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('lexicon_writing_history');
        if (saved) {
          setWritingHistory(JSON.parse(saved));
        } else {
          setWritingHistory([]);
        }
      } catch (error) {
        console.error("Failed to parse writing history inside profile stats:", error);
        setWritingHistory([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Vocabulary stats
  const totalWords = words.length;
  const masteredWords = words.filter(w => w.status === 'mastered').length;
  const reviewWords = words.filter(w => w.status === 'review').length;
  const learningWords = words.filter(w => w.status === 'learning').length;
  const vocabMasteryPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  // Writing stats (real student performance data)
  const totalEssays = writingHistory.length;
  const averageScore = totalEssays > 0
    ? parseFloat((writingHistory.reduce((sum, h) => sum + h.score, 0) / totalEssays).toFixed(1))
    : 0;

  // Calculate real streak
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
  const streak = calculateRealStreak(writingHistory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant/65 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-secondary/10 to-surface-container border-b border-outline-variant/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-secondary shrink-0">
              <img 
                alt="User avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUn1oCnPQMdC7goxGWS3fuk8tMxG9LVmKjzk-oAQenbfl-5psXw7h3pp1bkIIAMlBDH6-1YIGUCr0b3o8lUiJrVa4DtXk6Y-oZltvtnbNhb6A0veZjyU3qEbJeekcKIUoYF6tOUFTsvOtaVzNGsn1r-h7jR_BnhXVhekZcC3bgkV4n4nOTCC8AAvh26-yPnm1zRmq4HyWCP3N3wgpQpZJctL9nEdYDKgTEKcdu16Z06W2FtEBz88QQtpPK2wK0KW8WIcuDcCjheEVj"
              />
            </div>
            <div>
              <h4 className="font-h1-academic text-lg font-bold text-primary">Student Performance Dashboard</h4>
              <span className="font-label-mono text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Scholar Tier
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Section 1: Vocabulary Metrics */}
          <div className="space-y-3">
            <h5 className="font-button-text text-xs text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              Lexicon Vocabulary Statistics
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-xl space-y-1">
                <span className="text-[10px] text-on-surface-variant font-body-main">Total Words Saved</span>
                <h6 className="font-label-mono text-xl font-bold text-primary">{totalWords}</h6>
              </div>
              <div className="bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-xl space-y-1">
                <span className="text-[10px] text-on-surface-variant font-body-main">Needs Review</span>
                <h6 className="font-label-mono text-xl font-bold text-error">{reviewWords}</h6>
              </div>
              <div className="bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-xl space-y-1">
                <span className="text-[10px] text-on-surface-variant font-body-main">Mastered Vocabulary</span>
                <h6 className="font-label-mono text-xl font-bold text-emerald-600">
                  {masteredWords} <span className="text-xs font-normal text-on-surface-variant">({vocabMasteryPercentage}%)</span>
                </h6>
              </div>
            </div>

            {/* Circular representation of mastery */}
            <div className="flex items-center gap-3 bg-surface-container-low/20 p-3 rounded-lg border border-outline-variant/20">
              <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${vocabMasteryPercentage}%` }}
                />
              </div>
              <span className="font-label-mono text-xs font-bold shrink-0">{vocabMasteryPercentage}% Mastered</span>
            </div>
          </div>

          {/* Section 2: Strict Writing Stats */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <h5 className="font-button-text text-xs text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              Strict AI Writing Metrics
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-xl space-y-1">
                <span className="text-[10px] text-on-surface-variant font-body-main">Essays Submitted</span>
                <h6 className="font-label-mono text-xl font-bold text-primary">{totalEssays}</h6>
              </div>
              <div className="bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-xl space-y-1">
                <span className="text-[10px] text-on-surface-variant font-body-main">Average AI Grade</span>
                <h6 className="font-label-mono text-xl font-bold text-secondary">
                  {averageScore || 'N/A'} <span className="text-[10px] text-on-surface-variant font-normal">/10</span>
                </h6>
              </div>
              <div className="bg-surface-container-low/40 p-4 border border-outline-variant/30 rounded-xl space-y-1 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-body-main">Writing Streak</span>
                  <h6 className="font-label-mono text-xl font-bold text-amber-600">{streak} days</h6>
                </div>
                {streak > 0 && (
                  <span className="material-symbols-outlined fill text-amber-600 text-2xl animate-combo-pulse">local_fire_department</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-secondary hover:bg-secondary-container text-white font-button-text text-xs rounded-lg transition-all shadow-sm"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

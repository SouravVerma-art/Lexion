import React, { useState } from 'react';

export default function PracticeTopics({ topics, history, onStartPractice }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Categories list
  const categories = [
    'Education', 'Technology', 'Economy', 'Environment', 
    'Business', 'Society', 'Politics', 'Healthcare', 'Science', 'Ethics'
  ];

  // Exam list
  const exams = ['GMAT', 'GRE', 'CAT WAT', 'XAT', 'IELTS', 'TOEFL', 'General'];

  // Helper to get stats for a topic from history
  const getTopicStats = (topicId) => {
    const attempts = history.filter(h => h.topicId === topicId);
    const count = attempts.length;
    const avgScore = count > 0 
      ? parseFloat((attempts.reduce((sum, h) => sum + h.score, 0) / count).toFixed(1))
      : null;
    return { count, avgScore };
  };

  // Filter topics
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          topic.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = difficultyFilter ? topic.difficulty === difficultyFilter : true;
    const matchesExam = examFilter ? topic.exam === examFilter : true;
    const matchesCategory = categoryFilter ? topic.category === categoryFilter : true;

    return matchesSearch && matchesDifficulty && matchesExam && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors text-[18px]">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search writing prompts..."
              className="w-full bg-surface-bright text-on-surface font-body-main text-body-sm pl-9 pr-8 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder-on-surface-variant/60"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setDifficultyFilter('');
              setExamFilter('');
              setCategoryFilter('');
            }}
            className="text-xs text-outline hover:text-primary font-bold transition-colors flex items-center gap-1 self-end md:self-auto hover:bg-surface-container-low px-3 py-2 rounded-lg"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            Reset Filters
          </button>
        </div>

        {/* Filter selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Exam Filter */}
          <div className="relative">
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg py-2 pl-3 pr-8 font-body-sm text-body-sm text-on-surface-variant focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">All Exams</option>
              {exams.map(exam => <option key={exam} value={exam}>{exam}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant text-[18px]">expand_more</span>
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg py-2 pl-3 pr-8 font-body-sm text-body-sm text-on-surface-variant focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant text-[18px]">expand_more</span>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-surface-bright border border-outline-variant/60 rounded-lg py-2 pl-3 pr-8 font-body-sm text-body-sm text-on-surface-variant focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant text-[18px]">expand_more</span>
          </div>
        </div>
      </div>

      {/* Grid of cards */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((topic) => {
            const stats = getTopicStats(topic.id);
            const difficultyColor = 
              topic.difficulty === 'Hard' ? 'bg-error-container text-on-error-container border border-error/10' :
              topic.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              'bg-emerald-50 text-emerald-800 border border-emerald-100';

            return (
              <div 
                key={topic.id}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:border-secondary transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-label-mono text-[9px] uppercase tracking-wider text-secondary font-bold bg-secondary/5 border border-secondary/15 px-2.5 py-0.5 rounded-full">
                      {topic.exam} • {topic.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${difficultyColor}`}>
                      {topic.difficulty}
                    </span>
                  </div>
                  
                  <h4 className="font-h1-academic text-base font-bold text-primary leading-snug group-hover:text-secondary transition-colors">
                    {topic.title}
                  </h4>
                  
                  <p className="text-xs text-on-surface-variant font-body-main line-clamp-3 leading-relaxed">
                    {topic.prompt}
                  </p>

                  {/* Badges/Info row */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/20">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{topic.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">article</span>
                      <span>Target: {topic.wordCount} words</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">category</span>
                      <span>{topic.category}</span>
                    </div>
                  </div>
                </div>

                {/* Score and Attempt Action Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/30">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-on-surface-variant block font-body-main">Attempts</span>
                      <span className="font-label-mono font-bold text-primary text-sm">{stats.count}</span>
                    </div>
                    {stats.count > 0 && (
                      <div>
                        <span className="text-on-surface-variant block font-body-main">Last AI Rating</span>
                        <span className="font-label-mono font-bold text-primary text-sm">
                          {stats.avgScore} <span className="text-[10px] text-on-surface-variant font-normal">/10</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onStartPractice(topic, false)}
                    className="bg-secondary text-white hover:bg-secondary-container font-button-text text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1 shadow-sm group-hover:shadow"
                  >
                    Start Practice
                    <span className="material-symbols-outlined text-xs">edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant/60 rounded-xl space-y-3">
          <span className="material-symbols-outlined text-4xl text-outline-variant">find_in_page</span>
          <h4 className="font-h1-academic text-lg font-bold text-primary">No Prompts Found</h4>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            Try adjusting your search query or dropdown filters to browse other topics.
          </p>
        </div>
      )}
    </div>
  );
}

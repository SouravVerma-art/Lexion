import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WordCard from './components/WordCard';
import AddWordModal from './components/AddWordModal';
import ImportPdfModal from './components/ImportPdfModal';
import WordDetail from './components/WordDetail';
import QuizView from './components/QuizView';
import ReadingComprehension from './components/ReadingComprehension';
import DictionarySearchDetail from './components/DictionarySearchDetail';
import FlashcardsView from './components/FlashcardsView';
import SettingsView from './components/SettingsView';
import DailyTaskView from './components/DailyTaskView';
import WritingView from './components/writing/WritingView';
import ProfileStatsModal from './components/ProfileStatsModal';

const API_URL = '/api/words';

export default function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWordSearch, setNewWordSearch] = useState('');
  const [filterWord, setFilterWord] = useState('');
  const [posFilter, setPosFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Navigation states
  const [currentView, setCurrentView] = useState('library'); // 'library', 'flashcards', 'quiz', 'dailyTask'
  const [dailyTaskCompleted, setDailyTaskCompleted] = useState(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const saveObj = localStorage.getItem('lexicon_daily_task_completed');
      if (saveObj) {
        const parsed = JSON.parse(saveObj);
        return parsed && parsed.date === todayStr && parsed.completed;
      }
    } catch (e) {
      console.error("Failed to parse daily task completions:", e);
    }
    return false;
  });
  const [quizModeType, setQuizModeType] = useState(null); // null, 'vocab', 'reading'
  const [selectedWord, setSelectedWord] = useState(null);
  
  // Dictionary Integration states
  const [dictionaryResult, setDictionaryResult] = useState(null);
  const [dictSearching, setDictSearching] = useState(false);
  const [dictError, setDictError] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [prefilledWord, setPrefilledWord] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch words from backend
  const fetchWords = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch vocabulary');
      const data = await res.json();
      if (Array.isArray(data)) {
        setWords(data);
      } else {
        console.error('API response is not an array:', data);
        setWords([]);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setWords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();

    // Load saved theme and accent configurations
    const savedMode = localStorage.getItem('lexicon_theme_mode') || 'light';
    if (savedMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    const savedAccent = localStorage.getItem('lexicon_theme_accent') || 'indigo';
    document.documentElement.setAttribute('data-theme', savedAccent);
  }, []);

  // Update selectedWord state if the word changes in the main list
  useEffect(() => {
    if (selectedWord) {
      const updated = words.find(w => w._id === selectedWord._id);
      if (updated) setSelectedWord(updated);
    }
  }, [words]);

  // Toggle Star Status
  const handleToggleStar = async (word) => {
    try {
      const res = await fetch(`${API_URL}/${word._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !word.starred }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWords(words.map(w => w._id === word._id ? updated : w));
      }
    } catch (error) {
      console.error('Error updating star status:', error);
    }
  };

  // Change Word Status
  const handleChangeStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWords(words.map(w => w._id === id ? updated : w));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Update word properties (like spaced repetition fields)
  const handleUpdateWord = async (id, updatedFields) => {
    // If updatedFields is already a fully saved document from the backend, update state directly
    if (updatedFields && updatedFields._id) {
      setWords(words.map(w => w._id === id ? updatedFields : w));
      if (selectedWord && selectedWord._id === id) {
        setSelectedWord(updatedFields);
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const updated = await res.json();
        setWords(words.map(w => w._id === id ? updated : w));
        if (selectedWord && selectedWord._id === id) {
          setSelectedWord(updated);
        }
      }
    } catch (error) {
      console.error('Error updating word:', error);
    }
  };

  // Delete Word
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this word?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWords(words.filter(w => w._id !== id));
        if (selectedWord && selectedWord._id === id) {
          setSelectedWord(null);
        }
      }
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  // Add Word
  const handleAddWord = async (newWordData) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWordData),
      });
      if (res.ok) {
        const saved = await res.json();
        setWords([saved, ...words]);
        setSelectedWord(saved); // Transition to details view directly!
        setDictionaryResult(null); // Clear lookup
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to save word');
      }
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  // Integrated Dictionary lookup (Gemini Backend API)
  const handleDictionaryLookup = async (wordToSearch) => {
    if (!wordToSearch.trim()) return;
    
    try {
      setDictSearching(true);
      setDictError('');
      setDictionaryResult(null);

      const res = await fetch(`${API_URL}/lookup/${encodeURIComponent(wordToSearch.trim())}`);
      if (!res.ok) {
        let errMsg = 'Failed to find word details.';
        try {
          const errData = await res.json();
          if (errData && errData.message) errMsg = errData.message;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      
      if (data.alreadyInLibrary) {
        setSelectedWord(data);
        setCurrentView('library');
        setNewWordSearch('');
      } else {
        setDictionaryResult(data);
        setCurrentView('library');
        setNewWordSearch('');
      }
    } catch (error) {
      setDictError(error.message || 'Failed to look up word.');
    } finally {
      setDictSearching(false);
    }
  };

  const handleQuickAddSearchKeyDown = (e) => {
    if (e.key === 'Enter' && newWordSearch.trim()) {
      handleDictionaryLookup(newWordSearch);
    }
  };

  // Calculate statistics
  const totalWords = words.length;
  const masteredCount = words.filter(w => w.status === 'mastered').length;
  const reviewCount = words.filter(w => w.status === 'review').length;
  const masteryPercentage = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  // Filter words for local list
  const filteredWords = words.filter(word => {
    const matchesSearch = 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilterWord = 
      word.word.toLowerCase().includes(filterWord.toLowerCase());

    const matchesPOS = posFilter ? word.partOfSpeech.toLowerCase() === posFilter.toLowerCase() : true;
    const matchesStatus = statusFilter ? word.status === statusFilter : true;

    return matchesSearch && matchesFilterWord && matchesPOS && matchesStatus;
  });

  const handleViewChange = (view) => {
    setSelectedWord(null);
    setQuizModeType(null);
    setDictionaryResult(null);
    setCurrentView(view);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar 
        onAddWordClick={() => { setPrefilledWord(''); setIsAddModalOpen(true); }} 
        currentView={currentView}
        onViewChange={handleViewChange}
        dailyTaskCompleted={dailyTaskCompleted}
      />

      <div className="flex-1 flex flex-col md:ml-64 w-full animate-fadeIn">
        <Header searchVal={searchTerm} onSearchChange={setSearchTerm} currentView={currentView} onProfileClick={() => setIsProfileModalOpen(true)} />

        <main className="flex-1 p-gutter md:p-8 flex flex-col items-center overflow-y-auto pb-32">
          
          {dictSearching && (
            <div className="text-center py-12 text-on-surface-variant font-body-main italic">
              Searching public dictionary...
            </div>
          )}

          {!dictSearching && dictionaryResult ? (
            <DictionarySearchDetail 
              result={dictionaryResult} 
              onAdd={handleAddWord} 
              onBack={() => setDictionaryResult(null)} 
            />
          ) : currentView === 'dailyTask' ? (
            <DailyTaskView words={words} onComplete={() => setDailyTaskCompleted(true)} />
          ) : currentView === 'settings' ? (
            <SettingsView 
              fetchWords={fetchWords} 
              onClose={() => setCurrentView('library')} 
            />
          ) : currentView === 'flashcards' ? (
            <FlashcardsView 
              words={words} 
              onUpdateWord={handleUpdateWord} 
              onClose={() => setCurrentView('library')} 
            />
          ) : currentView === 'writing' ? (
            <WritingView />
          ) : currentView === 'quiz' ? (
            quizModeType === 'vocab' ? (
              <QuizView words={words} onClose={() => setQuizModeType(null)} />
            ) : quizModeType === 'reading' ? (
              <ReadingComprehension onClose={() => setQuizModeType(null)} />
            ) : (
              // Quiz Selection Landing Page
              <div className="w-full max-w-2xl mx-auto space-y-8 py-6">
                <div className="text-center space-y-2">
                  <h2 className="font-h1-academic text-3xl text-primary font-bold">Lexicon Quiz Sessions</h2>
                  <p className="font-body-main text-body-sm text-on-surface-variant max-w-md mx-auto">
                    Challenge your academic excellence using different custom study exercises.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Vocab Quiz */}
                  <div 
                    onClick={() => setQuizModeType('vocab')}
                    className="bg-surface-container-lowest border border-outline-variant hover:border-secondary hover:shadow-md rounded-xl p-6 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <span className="material-symbols-outlined text-4xl text-secondary">psychology</span>
                      <h3 className="font-h1-academic text-xl text-primary font-bold">Vocabulary Practice</h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Practice synonyms, definitions, and fill-in-the-blank questions generated dynamically from your active library.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-surface-container text-right">
                      <span className="font-button-text text-xs text-secondary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Start Quiz <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Reading Comp */}
                  <div 
                    onClick={() => setQuizModeType('reading')}
                    className="bg-surface-container-lowest border border-outline-variant hover:border-secondary hover:shadow-md rounded-xl p-6 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <span className="material-symbols-outlined text-4xl text-secondary">menu_book</span>
                      <h3 className="font-h1-academic text-xl text-primary font-bold">Reading Comprehension</h3>
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        Read scholarly articles and answer comprehensive multiple-choice questions to test your literacy and memory retention.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-surface-container text-right">
                      <span className="font-button-text text-xs text-secondary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Select Passage <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : selectedWord ? (
            <WordDetail 
              word={selectedWord} 
              onBack={() => setSelectedWord(null)} 
              onUpdateWord={handleUpdateWord}
            />
          ) : (
            <div className="w-full max-w-container-max space-y-section-gap">
              {/* Page Header & Quick Add */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-h1-academic text-h1-academic text-primary tracking-tight">My Library</h2>
                    <button 
                      onClick={() => setIsPdfModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-lg text-xs font-bold transition-all shadow-sm"
                      title="Import words from a PDF list"
                    >
                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                      Import PDF
                    </button>
                  </div>
                  <p className="font-body-main text-body-main text-on-surface-variant mt-1">Manage and review your saved vocabulary.</p>
                </div>
                <div className="relative w-full max-w-md group self-start sm:self-auto">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors text-[20px]">search</span>
                  <input 
                    type="text" 
                    value={newWordSearch}
                    onChange={(e) => setNewWordSearch(e.target.value)}
                    onKeyDown={handleQuickAddSearchKeyDown}
                    placeholder="Search dictionary & press Enter to lookup..." 
                    className="w-full bg-surface-container-lowest text-on-surface font-body-main text-body-sm pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder-on-surface-variant/50"
                  />
                </div>
              </div>

              {/* Dict Error notice */}
              {dictError && (
                <div className="bg-surface-container-low border border-secondary/20 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-h1-academic text-lg text-primary font-bold">Integrated Dictionary Lookup</h3>
                    <button 
                      onClick={() => setDictError('')}
                      className="text-outline-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                  <div className="text-body-sm text-error bg-error-container/30 border border-error-container p-3 rounded-lg flex items-center justify-between">
                    <span>{dictError}</span>
                    <button 
                      onClick={() => {
                        setPrefilledWord(newWordSearch);
                        setIsAddModalOpen(true);
                        setDictError('');
                        setNewWordSearch('');
                      }}
                      className="text-secondary font-bold text-xs hover:underline"
                    >
                      Create Custom Word instead
                    </button>
                  </div>
                </div>
              )}

              {/* Stats & Filters Row */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Daily Progress Widget */}
                <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl border border-[#E2E8F0] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <h3 className="font-label-mono text-label-mono text-outline uppercase tracking-wider mb-4">Daily Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Words Learned</span>
                        <span className="font-button-text text-button-text text-primary">{totalWords}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: `${masteryPercentage}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-[#E2E8F0]">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Revision Due</span>
                      <span className="inline-flex items-center justify-center bg-error-container text-on-error-container font-label-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {reviewCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#E2E8F0]">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Mastery</span>
                      <span className="font-button-text text-button-text text-tertiary-fixed-dim">{masteryPercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="lg:col-span-3 bg-white/50 backdrop-blur-md rounded-xl border border-[#E2E8F0] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-wrap gap-3 items-center">
                  <div className="flex-1 min-w-[200px] relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">filter_list</span>
                    <input 
                      value={filterWord}
                      onChange={(e) => setFilterWord(e.target.value)}
                      className="w-full bg-surface-bright border-none rounded-lg pl-9 pr-4 py-2 font-body-sm text-body-sm focus:ring-1 focus:ring-primary transition-all" 
                      placeholder="Filter by word..." 
                      type="text"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={posFilter}
                      onChange={(e) => setPosFilter(e.target.value)}
                      className="bg-surface-bright border-none rounded-lg py-2 pl-3 pr-8 font-body-sm text-body-sm text-on-surface-variant focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                    >
                      <option value="">Part of Speech</option>
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="adjective">Adjective</option>
                      <option value="adverb">Adverb</option>
                    </select>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-surface-bright border-none rounded-lg py-2 pl-3 pr-8 font-body-sm text-body-sm text-on-surface-variant focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                    >
                      <option value="">Status</option>
                      <option value="learning">Learning</option>
                      <option value="review">Needs Review</option>
                      <option value="mastered">Mastered</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => { setFilterWord(''); setPosFilter(''); setStatusFilter(''); }}
                    className="p-2 text-outline hover:text-primary transition-colors rounded-lg hover:bg-surface-container ml-auto"
                    title="Clear Filters"
                  >
                    <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
                  </button>
                </div>
              </div>

              {/* Vocabulary Grid */}
              {loading ? (
                <div className="text-center py-12 text-on-surface-variant font-body-main">
                  Loading vocabulary...
                </div>
              ) : filteredWords.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant font-body-main border border-dashed border-outline-variant rounded-xl">
                  No words found matching the current filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWords.map((word) => (
                    <div 
                      key={word._id} 
                      onClick={(e) => {
                        const targetTagName = e.target.tagName.toLowerCase();
                        if (targetTagName !== 'button' && !e.target.closest('button')) {
                          setSelectedWord(word);
                        }
                      }}
                    >
                      <WordCard 
                        word={word} 
                        onToggleStar={handleToggleStar}
                        onChangeStatus={handleChangeStatus}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* BottomNavBar (Visible on Mobile, Hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 md:hidden bg-surface border-t border-outline-variant shadow-sm pb-safe">
        <button 
          onClick={() => handleViewChange('library')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'library' && !selectedWord && !dictionaryResult ? 'text-secondary bg-surface-container-low font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">library_books</span>
          <span className="font-label-mono text-[10px] mt-1">Library</span>
        </button>
        
        <button 
          onClick={() => handleViewChange('flashcards')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'flashcards' ? 'text-secondary bg-surface-container-low font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">style</span>
          <span className="font-label-mono text-[10px] mt-1">Flashcards</span>
        </button>

        <button 
          onClick={() => handleViewChange('dailyTask')}
          className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${
            currentView === 'dailyTask' ? 'text-secondary bg-surface-container-low font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">stars</span>
          <span className="font-label-mono text-[10px] mt-1">Daily</span>
          {!dailyTaskCompleted && (
            <span className="absolute top-2 right-[35%] w-2 h-2 rounded-full bg-amber-500 animate-pulse-badge"></span>
          )}
        </button>

        <button 
          onClick={() => handleViewChange('quiz')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'quiz' ? 'text-secondary bg-surface-container-low font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">psychology</span>
          <span className="font-label-mono text-[10px] mt-1">Quiz</span>
        </button>

        <button 
          onClick={() => handleViewChange('settings')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            currentView === 'settings' ? 'text-secondary bg-surface-container-low font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
          <span className="font-label-mono text-[10px] mt-1">Settings</span>
        </button>
      </nav>

      <AddWordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddWord={handleAddWord}
        initialWord={prefilledWord}
      />

      <ImportPdfModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
        apiUrl={API_URL}
        onWordImported={(newWord) => setWords(prev => [newWord, ...prev])}
      />

      <ProfileStatsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        words={words} 
      />
    </div>
  );
}

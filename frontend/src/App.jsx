import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WordCard from './components/WordCard';
import AddWordModal from './components/AddWordModal';
import WordDetail from './components/WordDetail';

const API_URL = 'http://localhost:5000/api/words';

export default function App() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWordSearch, setNewWordSearch] = useState('');
  const [filterWord, setFilterWord] = useState('');
  const [posFilter, setPosFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Navigation states
  const [selectedWord, setSelectedWord] = useState(null);
  
  // Dictionary Integration states
  const [dictionaryResult, setDictionaryResult] = useState(null);
  const [dictSearching, setDictSearching] = useState(false);
  const [dictError, setDictError] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefilledWord, setPrefilledWord] = useState('');

  // Fetch words from backend
  const fetchWords = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch vocabulary');
      const data = await res.json();
      setWords(data);
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
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
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const updated = await res.json();
        setWords(words.map(w => w._id === id ? updated : w));
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
        setDictionaryResult(null); // Clear lookup if saved
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to save word');
      }
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  // Integrated Dictionary lookup (Free Dictionary API)
  const handleDictionaryLookup = async (wordToSearch) => {
    if (!wordToSearch.trim()) return;
    
    // First check if it already exists in the local database
    const localMatch = words.find(w => w.word.toLowerCase() === wordToSearch.trim().toLowerCase());
    if (localMatch) {
      setSelectedWord(localMatch);
      setNewWordSearch('');
      setDictionaryResult(null);
      return;
    }

    try {
      setDictSearching(true);
      setDictError('');
      setDictionaryResult(null);

      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordToSearch.trim()}`);
      if (!res.ok) {
        throw new Error('Word not found in the dictionary.');
      }
      const data = await res.json();
      
      const firstEntry = data[0];
      const meaning = firstEntry.meanings[0];
      const definitionText = meaning.definitions[0].definition;
      const partOfSpeechText = meaning.partOfSpeech;
      const phoneticsText = firstEntry.phonetic || (firstEntry.phonetics && firstEntry.phonetics[0] && firstEntry.phonetics[0].text) || '';

      setDictionaryResult({
        word: firstEntry.word,
        partOfSpeech: partOfSpeechText,
        definition: definitionText,
        pronunciation: phoneticsText,
        synonyms: meaning.synonyms || [],
        antonyms: meaning.antonyms || [],
        examples: meaning.definitions[0].example ? [meaning.definitions[0].example] : [],
        difficulty: 'B2', // Default difficulty
        status: 'learning'
      });
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

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar onAddWordClick={() => { setPrefilledWord(''); setIsAddModalOpen(true); }} />

      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <Header searchVal={searchTerm} onSearchChange={setSearchTerm} />

        <main className="flex-1 p-gutter max-w-container-max mx-auto w-full space-y-section-gap pb-24">
          
          {selectedWord ? (
            <WordDetail 
              word={selectedWord} 
              onBack={() => setSelectedWord(null)} 
              onUpdateWord={handleUpdateWord}
            />
          ) : (
            <>
              {/* Page Header & Quick Add */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="font-h1-academic text-h1-academic text-primary tracking-tight">My Library</h2>
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

              {/* Dict lookup Search Results */}
              {(dictSearching || dictionaryResult || dictError) && (
                <div className="bg-surface-container-low border border-secondary/20 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-h1-academic text-lg text-primary font-bold">Integrated Dictionary Lookup</h3>
                    <button 
                      onClick={() => { setDictionaryResult(null); setDictError(''); setNewWordSearch(''); }}
                      className="text-outline-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>

                  {dictSearching && (
                    <div className="text-body-sm text-on-surface-variant italic">Searching public dictionary...</div>
                  )}

                  {dictError && (
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
                  )}

                  {dictionaryResult && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-lg border border-[#E2E8F0]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display-word-mobile text-2xl font-bold text-primary">{dictionaryResult.word}</span>
                          <span className="text-xs uppercase bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full">{dictionaryResult.partOfSpeech}</span>
                          {dictionaryResult.pronunciation && (
                            <span className="text-xs text-on-surface-variant italic font-label-mono">{dictionaryResult.pronunciation}</span>
                          )}
                        </div>
                        <p className="text-body-sm text-on-surface-variant leading-relaxed">
                          {dictionaryResult.definition}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddWord(dictionaryResult)}
                        className="bg-secondary text-on-secondary hover:bg-[#3a31c5] px-4 py-2 rounded-lg font-button-text text-button-text shrink-0 transition-colors shadow-sm"
                      >
                        Add to Library
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Stats & Filters Row */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Daily Progress Widget (Bento Style) */}
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
                        // Avoid triggering navigation when clicking internal action buttons
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
            </>
          )}
        </main>
      </div>

      <AddWordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddWord={handleAddWord}
        initialWord={prefilledWord}
      />
    </div>
  );
}

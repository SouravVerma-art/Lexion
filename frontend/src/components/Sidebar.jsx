import React from 'react';

export default function Sidebar({ onAddWordClick, currentView, onViewChange, dailyTaskCompleted }) {
  return (
    <aside aria-label="Sidebar Navigation" className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface shadow-sm flex-col py-6 px-4 z-40 border-r border-outline-variant">
      <div className="mb-8 px-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden shrink-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[24px]">school</span>
        </div>
        <div>
          <h1 className="font-h1-academic text-[20px] leading-tight text-primary font-bold">Lexicon</h1>
         
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <button
          onClick={() => onViewChange('library')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-150 font-body-main text-body-main ${
            currentView === 'library'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-surface-container-low'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentView === 'library' ? 'fill' : ''}`}>library_books</span>
          <span className="font-button-text text-button-text">My Library</span>
        </button>

        <button
          onClick={() => onViewChange('dailyTask')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors duration-150 font-body-main text-body-main ${
            currentView === 'dailyTask'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-surface-container-low'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'dailyTask' ? 'fill' : ''}`}>stars</span>
            <span className="font-button-text text-button-text">Daily Task</span>
          </div>
          {!dailyTaskCompleted && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse-badge mr-1"></span>
          )}
        </button>

        <button
          onClick={() => onViewChange('flashcards')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-150 font-body-main text-body-main ${
            currentView === 'flashcards'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-surface-container-low'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentView === 'flashcards' ? 'fill' : ''}`}>style</span>
          <span className="font-button-text text-button-text">Flashcards</span>
        </button>

        <button
          onClick={() => onViewChange('quiz')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-150 font-body-main text-body-main ${
            currentView === 'quiz'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-secondary-fixed/10'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentView === 'quiz' ? 'fill' : ''}`}>psychology</span>
          <span className="font-button-text text-button-text">Quiz Mode</span>
        </button>

        <button
          onClick={() => onViewChange('writing')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-150 font-body-main text-body-main ${
            currentView === 'writing'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-surface-container-low'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentView === 'writing' ? 'fill' : ''}`}>edit_note</span>
          <span className="font-button-text text-button-text">Writing Prep</span>
        </button>

        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-150 font-body-main text-body-main ${
            currentView === 'settings'
              ? 'text-secondary font-bold border-r-4 border-secondary bg-surface-container-low'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentView === 'settings' ? 'fill' : ''}`}>settings</span>
          <span className="font-button-text text-button-text">Settings</span>
        </button>
      </nav>
    </aside>
  );
}

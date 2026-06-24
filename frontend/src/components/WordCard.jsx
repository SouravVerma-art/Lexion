import React, { useState } from 'react';

export default function WordCard({ word, onToggleStar, onChangeStatus, onDelete }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'mastered':
        return 'text-on-tertiary-fixed bg-tertiary-fixed';
      case 'review':
        return 'text-on-error-container bg-error-container';
      case 'learning':
      default:
        return 'text-on-secondary bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'mastered': return 'Mastered';
      case 'review': return 'Needs Review';
      case 'learning':
      default:
        return 'Learning';
    }
  };

  return (
    <div class="bg-surface-container-lowest rounded-lg border border-[#E2E8F0] p-card-padding shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-primary transition-all duration-300 group cursor-pointer flex flex-col h-full relative overflow-hidden">
      <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-surface-container-highest/30 to-transparent pointer-events-none rounded-bl-3xl"></div>
      
      <div class="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 class="font-display-word-mobile text-[28px] leading-tight text-primary font-bold mb-1 group-hover:text-secondary transition-colors">
            {word.word}
          </h3>
          <span class="font-label-mono text-[11px] text-outline tracking-wider uppercase">{word.partOfSpeech}</span>
        </div>
        <div class="flex items-center gap-2">
          <button 
            onClick={() => onToggleStar(word)}
            class={`${word.starred ? 'text-tertiary-fixed-dim' : 'text-outline-variant hover:text-tertiary-fixed-dim'} transition-colors`}
          >
            <span class={`material-symbols-outlined text-[22px] ${word.starred ? 'fill' : ''}`}>star</span>
          </button>
          <button 
            onClick={() => onDelete(word._id)}
            class="text-outline-variant hover:text-error transition-colors"
            title="Delete Word"
          >
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </div>
      
      <div class="h-[1px] w-full bg-[#E2E8F0] mb-4"></div>
      
      <p class="font-body-main text-body-sm text-on-surface-variant line-clamp-3 mb-6 flex-1">
        {word.definition}
      </p>
      
      <div class="flex items-center justify-between mt-auto relative">
        <span class="inline-flex items-center gap-1 bg-primary/5 text-primary font-label-mono text-label-mono px-2.5 py-1 rounded-full">
          <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
          {word.difficulty || 'B2'}
        </span>
        
        <div class="relative">
          <button 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            class={`font-body-sm text-[12px] font-bold px-2.5 py-1 rounded-full shadow-sm ${getStatusBadgeClass(word.status)}`}
          >
            {getStatusText(word.status)}
          </button>
          
          {showStatusMenu && (
            <div class="absolute right-0 bottom-8 mt-2 w-32 bg-white rounded-md shadow-lg border border-outline-variant z-20 py-1">
              {['learning', 'review', 'mastered'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onChangeStatus(word._id, status);
                    setShowStatusMenu(false);
                  }}
                  class="block w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container font-body-sm"
                >
                  {getStatusText(status)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

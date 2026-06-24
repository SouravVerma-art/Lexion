import React from 'react';

export default function Sidebar({ onAddWordClick }) {
  return (
    <aside aria-label="Sidebar Navigation" class="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface shadow-sm flex-col py-6 px-4 z-40">
      <div class="mb-8 px-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden shrink-0 flex items-center justify-center">
          <span class="material-symbols-outlined text-primary text-[24px]">import_contacts</span>
        </div>
        <div>
          <h1 class="font-h1-academic text-h1-academic text-primary tracking-tight">Lexicon</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant opacity-80">Academic Focus</p>
        </div>
      </div>
      
      <nav class="flex-1 space-y-1">
        <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors group" href="#">
          <span class="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">dashboard</span>
          <span class="font-button-text text-button-text">Dashboard</span>
        </a>
        <a aria-current="page" class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary font-bold border-r-4 border-secondary bg-surface-container-low group opacity-80 duration-150" href="#">
          <span class="material-symbols-outlined text-[20px] fill">library_books</span>
          <span class="font-button-text text-button-text">My Library</span>
        </a>
        <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors group" href="#">
          <span class="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">style</span>
          <span class="font-button-text text-button-text">Flashcards</span>
        </a>
        <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors group" href="#">
          <span class="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">collections_bookmark</span>
          <span class="font-button-text text-button-text">Quiz</span>
        </a>
        <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors group mt-auto" href="#">
          <span class="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">settings</span>
          <span class="font-button-text text-button-text">Settings</span>
        </a>
      </nav>

      <div class="mt-8 px-2">
        <button 
          onClick={onAddWordClick}
          class="w-full bg-secondary text-on-secondary font-button-text text-button-text py-3 px-4 rounded-lg hover:bg-[#3a31c5] transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          New Study Session
        </button>
      </div>
    </aside>
  );
}

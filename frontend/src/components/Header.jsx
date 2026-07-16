import React from 'react';

export default function Header({ searchVal, onSearchChange, currentView, onProfileClick }) {
  const showSearch = currentView === 'library';
  return (
    <header className="bg-surface-bright flex justify-between items-center h-16 px-gutter sticky top-0 z-30 w-full focus-within:ring-1 focus-within:ring-primary duration-200">
      <div className="flex-1 flex items-center gap-4 max-w-md">
        {showSearch ? (
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              value={searchVal}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface text-on-surface font-body-main text-body-sm pl-10 pr-4 py-2 border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors bg-transparent border-0 border-b pb-2 placeholder-on-surface-variant/50" 
              placeholder="Search vocabulary..." 
              type="text"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        <button className="p-2 text-on-surface-variant hover:text-secondary transition-all rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <button className="p-2 text-on-surface-variant hover:text-secondary transition-all rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined text-[22px]">help_outline</span>
        </button>
        <div 
          onClick={onProfileClick}
          className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-2 shrink-0 cursor-pointer hover:border-secondary hover:scale-105 active:scale-95 transition-all"
          title="View Performance Statistics"
        >
          <img 
            alt="User avatar" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUn1oCnPQMdC7goxGWS3fuk8tMxG9LVmKjzk-oAQenbfl-5psXw7h3pp1bkIIAMlBDH6-1YIGUCr0b3o8lUiJrVa4DtXk6Y-oZltvtnbNhb6A0veZjyU3qEbJeekcKIUoYF6tOUFTsvOtaVzNGsn1r-h7jR_BnhXVhekZcC3bgkV4n4nOTCC8AAvh26-yPnm1zRmq4HyWCP3N3wgpQpZJctL9nEdYDKgTEKcdu16Z06W2FtEBz88QQtpPK2wK0KW8WIcuDcCjheEVj"
          />
        </div>
      </div>
    </header>
  );
}

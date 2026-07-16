import React, { useState, useRef } from 'react';

// Global in-memory cache to store definitions across all hover instances
const definitionCache = {};

export default function HoverMeaning({ word, children }) {
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const cleanWord = word ? word.trim() : '';

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setShowTooltip(true);

    if (!cleanWord) return;

    // Check cache first
    if (definitionCache[cleanWord.toLowerCase()]) {
      setDefinition(definitionCache[cleanWord.toLowerCase()]);
      return;
    }

    // Fetch from API
    setLoading(true);
    fetch(`/api/words/quick-meaning/${encodeURIComponent(cleanWord)}`)
      .then(res => res.json())
      .then(data => {
        const def = data.definition || 'Quick definition not found.';
        definitionCache[cleanWord.toLowerCase()] = def;
        setDefinition(def);
      })
      .catch(() => {
        setDefinition('Quick definition not available.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 150);
  };

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {showTooltip && cleanWord && (
        <span 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-normal rounded-lg p-2 shadow-lg z-50 pointer-events-none transition-all duration-200 border border-slate-700/50 leading-relaxed text-center normal-case tracking-normal
                     after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-900/95"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-1.5 italic text-slate-400 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:0.4s]"></span>
            </span>
          ) : (
            definition
          )}
        </span>
      )}
    </span>
  );
}

import React, { useState, useEffect } from 'react';

export default function SettingsView({ onClose, fetchWords }) {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('lexicon_theme_mode') === 'dark';
  });
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('lexicon_theme_accent') || 'indigo';
  });

  // TTS states
  const [autoplayAudio, setAutoplayAudio] = useState(() => {
    return localStorage.getItem('lexicon_autoplay_audio') === 'true';
  });
  const [speechRate, setSpeechRate] = useState(() => {
    return parseFloat(localStorage.getItem('lexicon_tts_rate') || '1.0');
  });
  const [speechPitch, setSpeechPitch] = useState(() => {
    return parseFloat(localStorage.getItem('lexicon_tts_pitch') || '1.0');
  });
  const [voiceDialect, setVoiceDialect] = useState(() => {
    return localStorage.getItem('lexicon_tts_dialect') || 'en-US';
  });

  // Cleaners states
  const [resetLibraryModal, setResetLibraryModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetLibraryError, setResetLibraryError] = useState('');
  const [resetLibrarySuccess, setResetLibrarySuccess] = useState(false);

  const [resetPassagesSuccess, setResetPassagesSuccess] = useState(false);

  // Apply theme mode directly
  const handleToggleDarkMode = (isDark) => {
    setDarkMode(isDark);
    localStorage.setItem('lexicon_theme_mode', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply accent attribute directly
  const handleAccentChange = (newAccent) => {
    setAccent(newAccent);
    localStorage.setItem('lexicon_theme_accent', newAccent);
    document.documentElement.setAttribute('data-theme', newAccent);
  };

  // TTS Handlers
  const handleAutoplayChange = (enabled) => {
    setAutoplayAudio(enabled);
    localStorage.setItem('lexicon_autoplay_audio', enabled ? 'true' : 'false');
  };

  const handleRateChange = (val) => {
    setSpeechRate(val);
    localStorage.setItem('lexicon_tts_rate', val.toString());
  };

  const handlePitchChange = (val) => {
    setSpeechPitch(val);
    localStorage.setItem('lexicon_tts_pitch', val.toString());
  };

  const handleDialectChange = (val) => {
    setVoiceDialect(val);
    localStorage.setItem('lexicon_tts_dialect', val);
  };

  // Preview TTS Pronunciation
  const handlePlayPreview = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const testWords = {
      'en-US': 'Welcome to Lexicon. Enhance your academic vocabulary.',
      'en-GB': 'Welcome to Lexicon. Enhance your academic vocabulary.'
    };
    const text = testWords[voiceDialect] || 'Welcome to Lexicon.';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceDialect;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    // Search for a suitable voice matching preferred dialect
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.toLowerCase() === voiceDialect.toLowerCase()) ||
                        voices.find(v => v.lang.toLowerCase().startsWith(voiceDialect.toLowerCase().substring(0, 2)));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  // Reset Custom Reading Comprehension Passages
  const handleResetPassages = () => {
    if (window.confirm('Are you sure you want to delete all custom-made or AI-generated reading passages? This cannot be undone.')) {
      localStorage.removeItem('lexicon_custom_passages');
      setResetPassagesSuccess(true);
      setTimeout(() => setResetPassagesSuccess(false), 3000);
    }
  };

  // Reset entire vocabulary database
  const handleResetLibrary = async () => {
    setResetLibraryError('');
    if (resetConfirmInput.trim().toLowerCase() !== 'reset') {
      setResetLibraryError('Please type "RESET" exactly to confirm.');
      return;
    }

    try {
      const res = await fetch('/api/words', {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Server returned error resetting library.');
      }

      setResetLibrarySuccess(true);
      setResetConfirmInput('');
      if (fetchWords) fetchWords();
      setTimeout(() => {
        setResetLibrarySuccess(false);
        setResetLibraryModal(false);
      }, 2500);
    } catch (err) {
      setResetLibraryError(err.message || 'Failed to connect to the database.');
    }
  };

  return (
    <div className="w-full max-w-container-max space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-h1-academic text-h1-academic text-primary tracking-tight">Settings</h2>
          <p className="font-body-main text-body-main text-on-surface-variant mt-1">Configure your personal preferences, theme configurations, and audio settings.</p>
        </div>
        <button 
          onClick={onClose}
          className="px-4 py-2 border border-outline-variant hover:bg-surface-container rounded-lg text-on-surface-variant text-button-text font-button-text transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: THEME & COLOR ACCENT SETTINGS */}
        <div className="space-y-6">
          {/* Card 1: Theme Mode */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-h1-academic text-lg text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">palette</span> Visual Theme Mode
            </h3>
            
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-primary font-body-main block">Dark Mode</span>
                <span className="text-[11px] text-outline leading-snug">Toggle between dark and light themes</span>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={(e) => handleToggleDarkMode(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </div>

          {/* Card 2: Color Accents */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-h1-academic text-lg text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">style</span> Brand Accent Color
            </h3>
            <p className="text-xs text-on-surface-variant">Customize the primary branding color across headers, buttons, and badges:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Option: Indigo */}
              <button 
                onClick={() => handleAccentChange('indigo')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  accent === 'indigo' ? 'border-indigo-600 bg-indigo-50/20' : 'border-outline-variant hover:border-outline'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 mb-1.5 flex items-center justify-center text-white">
                  {accent === 'indigo' && <span className="material-symbols-outlined text-xs">done</span>}
                </div>
                <span className="text-xs font-semibold text-primary">Indigo</span>
              </button>

              {/* Option: Emerald */}
              <button 
                onClick={() => handleAccentChange('emerald')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  accent === 'emerald' ? 'border-emerald-600 bg-emerald-50/20' : 'border-outline-variant hover:border-outline'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 mb-1.5 flex items-center justify-center text-white">
                  {accent === 'emerald' && <span className="material-symbols-outlined text-xs">done</span>}
                </div>
                <span className="text-xs font-semibold text-primary">Emerald</span>
              </button>

              {/* Option: Crimson */}
              <button 
                onClick={() => handleAccentChange('crimson')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  accent === 'crimson' ? 'border-rose-600 bg-rose-50/20' : 'border-outline-variant hover:border-outline'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-rose-600 mb-1.5 flex items-center justify-center text-white">
                  {accent === 'crimson' && <span className="material-symbols-outlined text-xs">done</span>}
                </div>
                <span className="text-xs font-semibold text-primary">Crimson</span>
              </button>

              {/* Option: Amber */}
              <button 
                onClick={() => handleAccentChange('amber')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  accent === 'amber' ? 'border-amber-600 bg-amber-50/20' : 'border-outline-variant hover:border-outline'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-amber-600 mb-1.5 flex items-center justify-center text-white">
                  {accent === 'amber' && <span className="material-symbols-outlined text-xs">done</span>}
                </div>
                <span className="text-xs font-semibold text-primary">Amber</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUDIO & TTS SETTINGS */}
        <div className="space-y-6">
          {/* Card 3: Pronunciation & TTS */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-h1-academic text-lg text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">volume_up</span> Speech & Pronunciation
            </h3>

            {/* Toggle Autoplay */}
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-primary font-body-main block">Autoplay Audio</span>
                <span className="text-[11px] text-outline leading-snug">Auto-speak vocabulary when viewing details</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  checked={autoplayAudio} 
                  onChange={(e) => handleAutoplayChange(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>

            {/* Accent selection */}
            <div className="space-y-1.5 pt-2">
              <label className="block font-label-mono text-[10px] uppercase text-on-surface-variant font-bold">Preferred Voice Accent</label>
              <select
                value={voiceDialect}
                onChange={(e) => handleDialectChange(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
              >
                <option value="en-US">US English (General American)</option>
                <option value="en-GB">UK English (Received Pronunciation)</option>
              </select>
            </div>

            {/* Rate Speech slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-baseline">
                <label className="block font-label-mono text-[10px] uppercase text-on-surface-variant font-bold">Speaking Rate</label>
                <span className="text-xs font-mono font-bold text-secondary">{speechRate}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="1.8" 
                step="0.1" 
                value={speechRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-secondary"
              />
            </div>

            {/* Pitch Speech slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-baseline">
                <label className="block font-label-mono text-[10px] uppercase text-on-surface-variant font-bold">Voice Pitch</label>
                <span className="text-xs font-mono font-bold text-secondary">{speechPitch}</span>
              </div>
              <input 
                type="range" 
                min="0.7" 
                max="1.3" 
                step="0.05" 
                value={speechPitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-secondary"
              />
            </div>

            {/* Test Pronunciation Preview Button */}
            <div className="pt-2 flex justify-end">
              <button 
                onClick={handlePlayPreview}
                className="px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">volume_up</span> Hear Voice Sample
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM CONTROLS CARD */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-h1-academic text-lg text-primary font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-error">delete_forever</span> System Reset controls
        </h3>
        <p className="text-xs text-on-surface-variant">Perform administrative modifications and reset local cached documents or library data.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/30 pt-4">
          {/* Action 1: Reset custom RC passages */}
          <div className="border border-outline-variant/60 rounded-lg p-4 flex flex-col justify-between items-start gap-4">
            <div>
              <h4 className="text-sm font-semibold text-primary font-body-main">Reset Custom Reading Passages</h4>
              <p className="text-[11px] text-outline mt-1">Clears all AI-generated or manually constructed academic passages from your local database cache.</p>
            </div>
            {resetPassagesSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> Passages Reset Successful
              </span>
            ) : (
              <button 
                onClick={handleResetPassages}
                className="px-3.5 py-1.5 border border-outline-variant hover:border-error hover:bg-red-50 hover:text-error text-xs font-bold rounded-lg transition-all"
              >
                Clear Passages
              </button>
            )}
          </div>

          {/* Action 2: Reset Vocabulary library */}
          <div className="border border-outline-variant/60 rounded-lg p-4 flex flex-col justify-between items-start gap-4">
            <div>
              <h4 className="text-sm font-semibold text-primary font-body-main">Reset Vocabulary Library</h4>
              <p className="text-[11px] text-outline mt-1">Deletes all saved vocabulary words from your active database. Requires confirmation to execute.</p>
            </div>
            <button 
              onClick={() => setResetLibraryModal(true)}
              className="px-3.5 py-1.5 border border-outline-variant hover:border-error hover:bg-red-50 hover:text-error text-xs font-bold rounded-lg transition-all"
            >
              Clear Library Data
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL FOR DATABASE RESET */}
      {resetLibraryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-h1-academic text-xl font-bold text-primary">Destructive Action</h3>
            </div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This will permanently delete **ALL** vocabulary words, card reviews, star metrics, and historical metadata from your Lexicon local database.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-label-mono text-outline uppercase font-bold">
                Type "RESET" to confirm:
              </label>
              <input 
                type="text" 
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="Type RESET"
                disabled={resetLibrarySuccess}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-center font-mono focus:outline-none focus:ring-1 focus:ring-error focus:border-error"
              />
            </div>

            {resetLibraryError && (
              <p className="text-xs text-error font-semibold text-center">{resetLibraryError}</p>
            )}

            {resetLibrarySuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-bold text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> Vocabulary Library Cleared Successfully
              </div>
            ) : (
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  onClick={() => { setResetLibraryModal(false); setResetConfirmInput(''); setResetLibraryError(''); }}
                  className="px-4 py-2 border border-outline-variant hover:bg-surface-container rounded-lg text-xs font-bold text-on-surface-variant transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResetLibrary}
                  className="px-4 py-2 bg-error text-white hover:bg-red-700 rounded-lg text-xs font-bold shadow-sm transition-all"
                >
                  Clear Database
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

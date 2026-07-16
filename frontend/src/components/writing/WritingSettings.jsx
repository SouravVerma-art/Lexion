import React, { useState } from 'react';

export default function WritingSettings({ settings, onUpdateSettings }) {
  const [successMsg, setSuccessMsg] = useState(false);

  const handleUpdate = (key, val) => {
    onUpdateSettings({ ...settings, [key]: val });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-6">
      <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
        <div>
          <h4 className="font-h1-academic text-base font-bold text-primary">Writing Module Settings</h4>
          <p className="text-xs text-on-surface-variant">Adjust AI rigor criteria and typographical preferences.</p>
        </div>
        {successMsg && (
          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded font-bold animate-fadeIn font-label-mono">
            Preferences Saved
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* Rigor settings */}
        <div className="space-y-2">
          <label className="font-button-text text-xs text-primary font-bold uppercase tracking-wider block">
            AI Grading Rigor Persona
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'lenient', label: 'Lenient Grader', desc: 'Higher scores, basic errors highlighted.' },
              { id: 'moderate', label: 'Balanced Grader', desc: 'Standard GMAT/GRE averages criteria.' },
              { id: 'strict', label: 'Strict Human Grader', desc: 'Elite academic review, heavy penalties.' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => handleUpdate('rigor', r.id)}
                className={`p-3 border rounded-lg text-left transition-all ${
                  settings.rigor === r.id
                    ? 'border-secondary bg-secondary/5 font-bold shadow-sm'
                    : 'border-outline-variant/60 hover:bg-surface-container-low'
                }`}
              >
                <span className="text-xs text-primary block">{r.label}</span>
                <span className="text-[9px] text-on-surface-variant font-normal block leading-snug mt-1">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-outline-variant/20">
          <div className="space-y-2">
            <label className="font-button-text text-xs text-primary font-bold uppercase tracking-wider block">
              Editor Font Face
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdate('fontFamily', 'serif')}
                className={`flex-1 py-2 border rounded-lg text-xs font-button-text transition-all ${
                  settings.fontFamily === 'serif' ? 'border-secondary bg-secondary/5 font-bold' : 'border-outline-variant/60 hover:bg-surface-container-low'
                }`}
              >
                Serif (Academic Style)
              </button>
              <button
                onClick={() => handleUpdate('fontFamily', 'sans')}
                className={`flex-1 py-2 border rounded-lg text-xs font-button-text transition-all ${
                  settings.fontFamily === 'sans' ? 'border-secondary bg-secondary/5 font-bold' : 'border-outline-variant/60 hover:bg-surface-container-low'
                }`}
              >
                Sans-Serif (Modern Style)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-button-text text-xs text-primary font-bold uppercase tracking-wider block">
              Editor Font Size
            </label>
            <div className="flex gap-2">
              {['sm', 'md', 'lg'].map(size => (
                <button
                  key={size}
                  onClick={() => handleUpdate('fontSize', size)}
                  className={`flex-1 py-2 border rounded-lg text-xs font-button-text capitalize transition-all ${
                    settings.fontSize === size ? 'border-secondary bg-secondary/5 font-bold' : 'border-outline-variant/60 hover:bg-surface-container-low'
                  }`}
                >
                  {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulator controls */}
        <div className="pt-3 border-t border-outline-variant/20 space-y-3">
          <label className="font-button-text text-xs text-primary font-bold uppercase tracking-wider block">
            Simulator Preferences
          </label>
          
          <div className="space-y-3">
            {/* Audio warning cue */}
            <div className="flex justify-between items-center text-xs">
              <div className="space-y-0.5">
                <span className="font-button-text text-primary font-bold">Timer Warning Cues</span>
                <p className="text-[10px] text-on-surface-variant">Flashes red and emits ticks when under 5 minutes.</p>
              </div>
              <button
                onClick={() => handleUpdate('audioCue', !settings.audioCue)}
                className={`w-10 h-6 rounded-full flex items-center transition-all px-0.5 border ${
                  settings.audioCue ? 'bg-secondary border-secondary justify-end' : 'bg-surface-container-high border-outline-variant/60 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {/* Keyboard click sounds */}
            <div className="flex justify-between items-center text-xs pt-2 border-t border-outline-variant/10">
              <div className="space-y-0.5">
                <span className="font-button-text text-primary font-bold">Mechanical Keyboard Clicks</span>
                <p className="text-[10px] text-on-surface-variant">Simulates click sounds on keyboard input for focus.</p>
              </div>
              <button
                onClick={() => handleUpdate('keyboardClicks', !settings.keyboardClicks)}
                className={`w-10 h-6 rounded-full flex items-center transition-all px-0.5 border ${
                  settings.keyboardClicks ? 'bg-secondary border-secondary justify-end' : 'bg-surface-container-high border-outline-variant/60 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

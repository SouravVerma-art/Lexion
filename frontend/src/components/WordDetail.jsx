import React, { useState } from 'react';
import PronunciationPlayer from './PronunciationPlayer';
import HoverMeaning from './HoverMeaning';

const highlightWord = (text, wordToHighlight) => {
  if (!text) return '';
  if (!wordToHighlight) return text;
  const parts = text.split(new RegExp(`(\\b${wordToHighlight}\\b)`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === wordToHighlight.toLowerCase()
      ? <strong key={index} className="font-semibold text-primary">{part}</strong>
      : part
  );
};

export default function WordDetail({ word, onBack, onUpdateWord }) {
  React.useEffect(() => {
    if (!word) return;
    const isAutoplay = localStorage.getItem('lexicon_autoplay_audio') === 'true';
    if (isAutoplay && word && word.word && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const savedRate = parseFloat(localStorage.getItem('lexicon_tts_rate') || '1.0');
      const savedPitch = parseFloat(localStorage.getItem('lexicon_tts_pitch') || '1.0');
      const savedDialect = localStorage.getItem('lexicon_tts_dialect') || 'en-US';

      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = savedDialect;
      utterance.rate = savedRate;
      utterance.pitch = savedPitch;

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.toLowerCase() === savedDialect.toLowerCase()) ||
                          voices.find(v => v.lang.toLowerCase().startsWith(savedDialect.toLowerCase().substring(0, 2)));
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  }, [word]);

  if (!word) return null;


  // Handle spaced repetition checkbox toggles
  const handleScheduleToggle = (index) => {
    const updatedSchedule = [...(word.revisionSchedule || [])];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      checked: !updatedSchedule[index].checked
    };

    // Calculate new retention strength based on checked schedules
    const checkedCount = updatedSchedule.filter(s => s.checked).length;
    const totalCount = updatedSchedule.length;
    const retentionStrength = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    onUpdateWord(word._id, {
      revisionSchedule: updatedSchedule,
      retentionStrength
    });
  };

  // Handle status level change
  const handleStatusChange = (e) => {
    const value = e.target.value;
    // Map visual "remembered" to backend "review" status
    const statusMap = {
      learning: 'learning',
      remembered: 'review',
      mastered: 'mastered'
    };
    onUpdateWord(word._id, { status: statusMap[value] || value });
  };

  // Convert status to select value
  const getSelectValue = (status) => {
    if (status === 'review') return 'remembered';
    return status || 'learning';
  };



  return (
    <div className="w-full max-w-container-max grid grid-cols-1 lg:grid-cols-12 gap-8 relative p-4 md:p-8">
      {/* Back Action */}
      <div className="lg:col-span-12 mb-2 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center text-outline hover:text-secondary transition-colors font-body-sm text-body-sm group"
        >
          <span className="material-symbols-outlined mr-1 text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Library
        </button>
      </div>

      {/* Main Card Column */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Header Section */}
        <section className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-[0_4px_12px_rgba(11,28,48,0.04)] p-6 transition-all hover:border-secondary-container hover:shadow-[0_8px_16px_rgba(11,28,48,0.06)] group">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display-word-mobile md:font-display-word text-display-word-mobile md:text-display-word text-primary mb-2 drop-shadow-[0_0_15px_rgba(75,65,225,0.2)] font-bold">
                {word.word}
              </h1>
              <div className="flex items-center gap-3 flex-wrap mt-2">
                <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">{word.partOfSpeech}</span>
                <span className="text-outline-variant">•</span>
                <PronunciationPlayer word={word.word} pronunciation={word.pronunciation} />
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="bg-secondary/10 text-secondary font-label-mono text-label-mono px-3 py-1 rounded-full border border-secondary/20">
                {word.difficulty === 'C1' ? 'C1 Advanced' : word.difficulty === 'B2' ? 'B2 Upper-Int' : `${word.difficulty || 'B2'} Level`}
              </span>
              <div aria-label={`Frequency: ${word.frequency || 3} out of 5`} className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined text-sm ${i < (word.frequency || 3) ? 'text-tertiary-fixed-dim fill' : 'text-outline-variant'}`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-surface-container mb-6"></div>

          <div className="mb-6">
            <h2 className="font-h1-academic text-xl text-primary mb-2 font-bold">Meaning</h2>
            <p className="font-body-main text-body-main text-on-surface-variant leading-relaxed">
              {word.definition}
            </p>
          </div>

          {word.context && (
            <div className="bg-surface-container-low rounded-lg p-4 border-l-4 border-secondary">
              <p className="font-body-main text-body-main text-primary italic font-medium">"{word.context}"</p>
            </div>
          )}
        </section>

        {/* Etymology & Details Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Root/Origin */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-[0_4px_12px_rgba(11,28,48,0.04)]">
            <h3 className="font-label-mono text-label-mono text-outline mb-4 uppercase flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-sm">history_edu</span>
              Root & Origin
            </h3>
            <div className="font-body-main text-body-main text-on-surface-variant">
              <p className="mb-2">{word.rootOrigin || 'Origins not specified.'}</p>
            </div>
          </div>

          {/* Word Family */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-[0_4px_12px_rgba(11,28,48,0.04)]">
            <h3 className="font-label-mono text-label-mono text-outline mb-4 uppercase flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-sm">account_tree</span>
              Word Family
            </h3>
            {word.wordFamily && word.wordFamily.length > 0 ? (
              <ul className="space-y-3 font-body-main text-body-main">
                {word.wordFamily.map((fam, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b border-surface-container pb-2">
                    <HoverMeaning word={fam.word}>
                      <span className="text-primary hover:text-primary/80 transition-colors cursor-help">{fam.word}</span>
                    </HoverMeaning>
                    <span className="font-label-mono text-[10px] text-outline">{fam.partOfSpeech}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-on-surface-variant text-body-sm italic">No family members registered.</p>
            )}
          </div>
        </section>

        {/* Usage & Context */}
        <section className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-[0_4px_12px_rgba(11,28,48,0.04)] p-6">
          <h3 className="font-label-mono text-label-mono text-outline mb-6 uppercase font-bold">Context & Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Collocations */}
            <div>
              <h4 className="font-button-text text-body-sm text-primary mb-3 font-bold">Common Collocations</h4>
              {word.collocations && word.collocations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {word.collocations.map((coll, idx) => (
                    <span key={idx} className="px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 text-body-sm text-secondary font-medium hover:bg-secondary/20 transition-colors">
                      {coll}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-body-sm italic">No collocations available.</p>
              )}
            </div>

            {/* Synonyms/Antonyms */}
            <div className="space-y-4">
              <div>
                <h4 className="font-button-text text-body-sm text-primary mb-2 font-bold">Synonyms</h4>
                {word.synonyms && word.synonyms.length > 0 ? (
                  <div className="font-body-main text-body-main text-on-surface-variant flex flex-wrap gap-1.5">
                    {word.synonyms.map((syn, idx) => (
                      <HoverMeaning key={idx} word={syn}>
                        <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant px-2 py-0.5 rounded cursor-help hover:bg-tertiary-fixed-dim/30 transition-colors">
                          {syn}
                        </span>
                      </HoverMeaning>
                    ))}
                  </div>
                ) : (
                  <p className="text-on-surface-variant text-body-sm italic">None added.</p>
                )}
              </div>
              <div>
                <h4 className="font-button-text text-body-sm text-primary mb-2 font-bold">Antonyms</h4>
                {word.antonyms && word.antonyms.length > 0 ? (
                  <div className="font-body-main text-body-main text-on-surface-variant flex flex-wrap gap-1.5">
                    {word.antonyms.map((ant, idx) => (
                      <HoverMeaning key={idx} word={ant}>
                        <span className="bg-primary-fixed/40 text-on-primary-fixed-variant px-2 py-0.5 rounded cursor-help hover:bg-primary-fixed/50 transition-colors">
                          {ant}
                        </span>
                      </HoverMeaning>
                    ))}
                  </div>
                ) : (
                  <p className="text-on-surface-variant text-body-sm italic">None added.</p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-surface-container my-8"></div>

          {/* Examples */}
          <div>
            <h4 className="font-button-text text-body-sm text-primary mb-4 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-sm">format_quote</span>
              Example Sentences
            </h4>
            {word.examples && word.examples.length > 0 ? (
              <ul className="space-y-4">
                {word.examples.map((ex, idx) => (
                  <li key={idx} className="flex gap-4 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2.5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <p className="font-body-main text-body-main text-on-surface-variant leading-relaxed">
                      {highlightWord(ex, word.word)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-on-surface-variant text-body-sm italic">No examples added.</p>
            )}
          </div>
        </section>
      </div>

      {/* Sidebar / Metadata Column */}
      <div className="lg:col-span-4 flex flex-col gap-6">

        {/* Memory Trick Card */}
        {word.memoryTrick && (
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-[0_4px_12px_rgba(11,28,48,0.04)] p-5 group transition-all hover:border-secondary hover:shadow-[0_8px_16px_rgba(11,28,48,0.06)]">
            <h3 className="font-button-text text-body-sm text-primary mb-2 font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">psychology</span>
              Memory Trick
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant italic leading-relaxed">
              {word.memoryTrick}
            </p>
          </div>
        )}

        {/* Study Metadata */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-[0_4px_12px_rgba(11,28,48,0.04)] p-6">
          <h3 className="font-label-mono text-label-mono text-outline mb-6 uppercase flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-sm">analytics</span>
            Study Status
          </h3>

          {/* Status Selector */}
          <div className="mb-6">
            <label className="block font-button-text text-body-sm text-primary mb-2 font-bold">Mastery Level</label>
            <div className="relative">
              <select
                value={getSelectValue(word.status)}
                onChange={handleStatusChange}
                className="w-full appearance-none bg-surface border border-secondary text-on-surface font-body-sm py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors cursor-pointer"
              >
                <option value="learning">Learning</option>
                <option value="remembered">Remembered</option>
                <option value="mastered">Mastered</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-outline">
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Schedule */}
          {word.revisionSchedule && word.revisionSchedule.length > 0 && (
            <div className="mb-6">
              <h4 className="font-button-text text-body-sm text-primary mb-3 font-bold">Revision Schedule</h4>
              <div className="space-y-3">
                {word.revisionSchedule.map((sched, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={sched.checked}
                        onChange={() => handleScheduleToggle(idx)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-outline-variant bg-surface checked:border-secondary checked:bg-secondary transition-all hover:border-secondary focus:ring-2 focus:ring-secondary focus:ring-offset-1 focus:ring-offset-surface"
                      />
                      <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[14px] text-on-secondary opacity-0 peer-checked:opacity-100 pointer-events-none font-bold">
                        check
                      </span>
                    </div>
                    <span className={`font-body-sm text-body-sm transition-colors ${sched.checked ? 'text-outline line-through' : 'text-on-surface-variant group-hover:text-primary'}`}>
                      {sched.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="font-label-mono text-[10px] text-outline uppercase font-bold">Retention Strength</span>
              <span className="font-body-sm text-body-sm font-medium text-tertiary-fixed-dim">{word.retentionStrength ?? 0}%</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-tertiary-fixed-dim h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${word.retentionStrength ?? 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Common Mistakes Alert */}
        {word.commonMistake && (
          <div className="bg-error-container/30 border border-error-container rounded-xl p-5 shadow-sm">
            <h4 className="font-button-text text-body-sm text-on-error-container mb-2 flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-error">warning</span>
              Common Mistake
            </h4>
            <p className="font-body-sm text-body-sm text-on-error-container/80">
              {word.commonMistake}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

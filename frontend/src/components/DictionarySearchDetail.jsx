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

export default function DictionarySearchDetail({ result, onAdd, onBack }) {
  if (!result) return null;

  // Helper to generate a word family dynamically
  const getWordFamily = (word) => {
    const lower = word.toLowerCase();
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    if (lower.endsWith('ic')) {
      const base = capitalized.slice(0, -2);
      return [
        { word: base + 'ism', partOfSpeech: 'Noun' },
        { word: base + 'ist', partOfSpeech: 'Noun (Person)' },
        { word: capitalized + 'ally', partOfSpeech: 'Adverb' }
      ];
    }
    if (lower.endsWith('ent')) {
      const base = capitalized.slice(0, -3);
      return [
        { word: base + 'ence', partOfSpeech: 'Noun' },
        { word: capitalized + 'ly', partOfSpeech: 'Adverb' }
      ];
    }
    if (lower.endsWith('ate')) {
      const base = capitalized.slice(0, -3);
      return [
        { word: base + 'ation', partOfSpeech: 'Noun' },
        { word: capitalized + 'ive', partOfSpeech: 'Adjective' }
      ];
    }
    return [
      { word: capitalized + 'ness', partOfSpeech: 'Noun' },
      { word: capitalized + 'ly', partOfSpeech: 'Adverb' }
    ];
  };

  // Helper to generate collocations dynamically
  const getCollocations = (word, pos) => {
    const lower = word.toLowerCase();
    if (pos === 'adjective' || pos === 'adj') {
      return [
        `${lower} approach`,
        `${lower} solution`,
        `increasingly ${lower}`
      ];
    }
    if (pos === 'verb') {
      return [
        `to ${lower} effectively`,
        `actively ${lower}`,
        `attempt to ${lower}`
      ];
    }
    return [
      `key ${lower}`,
      `modern ${lower}`,
      `essential ${lower}`
    ];
  };

  const wordFamily = getWordFamily(result.word);
  const collocations = getCollocations(result.word, result.partOfSpeech);

  // Combine generated parameters with fetched API results
  const fullWordData = {
    ...result,
    wordFamily,
    collocations,
    difficulty: result.word.length > 8 ? 'C1' : 'B2',
    frequency: result.word.length > 9 ? 3 : result.word.length > 7 ? 4 : 5
  };

  return (
    <div className="w-full max-w-container-max mx-auto p-4 md:p-8 space-y-6">
      
      {/* Back button */}
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center text-outline hover:text-secondary transition-colors font-body-sm text-body-sm group"
        >
          <span className="material-symbols-outlined mr-1 text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Library
        </button>
      </div>

      {/* Status Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-on-surface-variant font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-outline">info</span>
          This word is not in your library yet.
        </div>
      </div>

      {/* Word Card */}
      <article className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:border-secondary transition-all duration-300 p-6 md:p-10 relative group overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-surface-container-high rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-display-word-mobile text-display-word-mobile md:font-display-word md:text-display-word text-on-surface m-0 font-bold">
                {fullWordData.word}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-body-sm text-body-sm text-on-surface-variant mt-2">
              <span className="italic uppercase">{fullWordData.partOfSpeech}</span>
              <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
              <span className="px-2 py-1 bg-secondary/10 text-secondary font-label-mono text-label-mono rounded-full tracking-widest uppercase mr-2">
                {fullWordData.difficulty}
              </span>
              <span className="text-outline-variant">•</span>
              <PronunciationPlayer word={fullWordData.word} pronunciation={fullWordData.pronunciation} />
            </div>
          </div>

          <button 
            onClick={() => onAdd(fullWordData)}
            className="bg-primary hover:bg-primary/90 text-on-primary font-button-text text-button-text px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm self-start whitespace-nowrap group-hover:bg-secondary group-hover:text-on-secondary"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add to Library
          </button>
        </header>

        <hr className="border-t border-surface-variant mb-8"/>

        {/* Definition Meaning */}
        <section className="mb-8">
          <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase mb-4 tracking-widest font-bold">Meaning</h3>
          <p className="font-h1-academic text-xl md:text-2xl text-on-surface leading-snug font-bold">
            {fullWordData.definition}
          </p>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Examples Section */}
          <section className="lg:col-span-7 bg-surface-container-low rounded-xl p-6 border border-surface-variant/50">
            <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase mb-4 tracking-widest flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[16px]">format_quote</span>
              Contextual Examples
            </h3>
            {fullWordData.examples && fullWordData.examples.length > 0 ? (
              <ul className="space-y-4">
                {fullWordData.examples.map((ex, idx) => (
                  <li key={idx} className="font-body-main text-body-sm md:text-body-main text-on-surface flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary mt-1 text-[18px]">arrow_right</span>
                    <span>
                      {highlightWord(ex, fullWordData.word)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-4">
                <li className="font-body-main text-body-sm text-on-surface flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1 text-[18px]">arrow_right</span>
                  <span>In standard speech, this term is used to describe specific, clear scenarios.</span>
                </li>
              </ul>
            )}
          </section>

          {/* Relations & Collocations */}
          <div className="lg:col-span-5 space-y-6">
            {/* Synonyms & Antonyms */}
            <section className="bg-surface-container-low rounded-xl p-6 border border-surface-variant/50">
              <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase mb-4 tracking-widest font-bold">Relationships</h3>
              <div className="mb-4">
                <span className="font-body-sm text-body-sm text-on-surface-variant block mb-2 font-bold">Synonyms</span>
                {fullWordData.synonyms && fullWordData.synonyms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {fullWordData.synonyms.slice(0, 4).map((syn, idx) => (
                      <HoverMeaning key={idx} word={syn}>
                        <span className="px-3 py-1 bg-tertiary-fixed/20 text-on-tertiary-fixed-variant font-body-sm text-body-sm rounded cursor-help hover:bg-tertiary-fixed/30 transition-colors">
                          {syn}
                        </span>
                      </HoverMeaning>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-outline">None found.</span>
                )}
              </div>
              <div>
                <span className="font-body-sm text-body-sm text-on-surface-variant block mb-2 font-bold">Antonyms</span>
                {fullWordData.antonyms && fullWordData.antonyms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {fullWordData.antonyms.slice(0, 4).map((ant, idx) => (
                      <HoverMeaning key={idx} word={ant}>
                        <span className="px-3 py-1 bg-[#fff8e1] text-[#b45309] font-body-sm text-body-sm rounded cursor-help hover:bg-[#fff8e1]/90 transition-colors">
                          {ant}
                        </span>
                      </HoverMeaning>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-outline">None found.</span>
                )}
              </div>
            </section>

            {/* Collocations */}
            <section className="bg-surface-container-low rounded-xl p-6 border border-surface-variant/50">
              <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase mb-4 tracking-widest font-bold">Collocations</h3>
              <div className="flex flex-wrap gap-2">
                {collocations.map((coll, idx) => (
                  <span key={idx} className="px-3 py-1.5 border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-full bg-surface-container-lowest hover:bg-surface-container transition-colors">
                    {coll}
                  </span>
                ))}
              </div>
            </section>

            {/* Memory Trick */}
            {fullWordData.memoryTrick && (
              <section className="bg-surface-container-low rounded-xl p-6 border border-surface-variant/50 group transition-all hover:border-secondary hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)]">
                <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase mb-2 tracking-widest flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  Memory Trick
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic leading-relaxed">
                  {fullWordData.memoryTrick}
                </p>
              </section>
            )}
          </div>
        </div>

        <hr className="border-t border-surface-variant my-8"/>

        {/* Word Family */}
        <section>
          <h3 className="font-label-mono text-label-mono text-on-surface-variant uppercase mb-4 tracking-widest font-bold">Word Family</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {wordFamily.map((fam, idx) => (
              <div key={idx} className="p-3 border-l-2 border-surface-variant hover:border-secondary transition-colors bg-surface-container-lowest">
                <span className="font-label-mono text-label-mono text-on-surface-variant block mb-1">{fam.partOfSpeech}</span>
                <HoverMeaning word={fam.word}>
                  <span className="font-body-main text-body-main text-on-surface font-semibold cursor-help hover:text-primary transition-colors">{fam.word}</span>
                </HoverMeaning>
              </div>
            ))}
          </div>
        </section>

      </article>
    </div>
  );
}

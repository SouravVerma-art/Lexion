import React, { useState, useEffect, useRef } from 'react';

const TurtleIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-4 h-4"
  >
    {/* Shell */}
    <path d="M4 14a8 8 0 0 1 16 0" />
    {/* Bottom line */}
    <path d="M2 14h20" />
    {/* Head */}
    <circle cx="21" cy="13" r="1.5" />
    {/* Legs */}
    <path d="M7 14v3a1.5 1.5 0 0 0 3 0v-3" />
    <path d="M14 14v3a1.5 1.5 0 0 0 3 0v-3" />
    {/* Tail */}
    <path d="M3 14c-0.5-0.5-0.5-1 0-1.5" />
  </svg>
);
const ipaMap = {
  'x': 'j', // d͡ʒ mapped to x
  'q': 'ch', // t͡ʃ mapped to q
  'ʃ': 'sh',
  'ʒ': 'zh',
  'θ': 'th',
  'ð': 'th',
  'ŋ': 'ng',
  'j': 'y',
  'w': 'w',
  'h': 'h',
  'p': 'p',
  'b': 'b',
  't': 't',
  'd': 'd',
  'k': 'k',
  'ɡ': 'g',
  'g': 'g',
  'f': 'f',
  'v': 'v',
  's': 's',
  'z': 'z',
  'm': 'm',
  'n': 'n',
  'l': 'l',
  'ɹ': 'r',
  'r': 'r',
  
  // Vowels & Diphthongs
  'eɪ': 'ay',
  'aɪ': 'y',
  'ɔɪ': 'oy',
  'aʊ': 'ow',
  'oʊ': 'oh',
  'əʊ': 'oh',
  'uː': 'oo',
  'iː': 'ee',
  'ɔː': 'aw',
  'ɑː': 'ah',
  'ɜː': 'ur',
  'æ': 'a',
  'ʌ': 'uh',
  'ɒ': 'o',
  'ɔ': 'aw',
  'ə': 'uh',
  'ɪ': 'ih',
  'ɛ': 'e',
  'e': 'e',
  'ʊ': 'uu',
  'i': 'ee',
  'u': 'oo',
  'a': 'ah',
  'o': 'oh'
};

function convertSyllable(syl) {
  let res = "";
  let i = 0;
  const keys = Object.keys(ipaMap).sort((a, b) => b.length - a.length);
  
  while (i < syl.length) {
    let matched = false;
    for (const key of keys) {
      if (syl.startsWith(key, i)) {
        res += ipaMap[key];
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      res += syl[i];
      i++;
    }
  }
  
  if (res.endsWith('l') && res.length > 1) {
    const prev = res[res.length - 2];
    if (!['a', 'e', 'i', 'o', 'u', 'y', 'h', 'l'].includes(prev)) {
      res = res.slice(0, -1) + 'uhl';
    }
  }

  res = res.replace(/c/g, 'k');
  return res;
}

function ipaToPhonics(word, ipaStr) {
  if (!ipaStr) return "";
  if (ipaStr.includes(' - ')) return ipaStr;
  
  let ipa = ipaStr.replace(/[\/\[\]]/g, '').trim();
  
  ipa = ipa
    .replace(/d͡ʒ/g, 'x')
    .replace(/t͡ʃ/g, 'q')
    .replace(/dʒ/g, 'x')
    .replace(/tʃ/g, 'q');

  ipa = ipa.replace(/ˈ/g, '.ˈ').replace(/ˌ/g, '.ˌ');
  
  let parts = ipa.split('.').filter(p => p.trim().length > 0);
  let syllables = [];

  const vowelRegex = /[eɪ|aɪ|ɔɪ|aʊ|oʊ|əʊ|uː|iː|ɔː|ɑː|ɜː|æ|ʌ|ɒ|ɔ|ə|ɪ|ɛ|e|ʊ|i|u|a|o|n̩]/g;

  for (let part of parts) {
    const matches = part.match(vowelRegex) || [];
    if (matches.length > 1) {
      let tempSyl = "";
      for (let i = 0; i < part.length; i++) {
        const char = part[i];
        tempSyl += char;
        
        const hasVowel = vowelRegex.test(tempSyl);
        if (hasVowel && i < part.length - 1) {
          const nextChar = part[i + 1];
          const isNextVowel = vowelRegex.test(nextChar);
          
          if (!isNextVowel && i < part.length - 2) {
            const afterNext = part[i + 2];
            const isAfterNextVowel = vowelRegex.test(afterNext);
            if (isAfterNextVowel) {
              syllables.push(tempSyl);
              tempSyl = "";
            }
          }
        }
      }
      if (tempSyl) {
        syllables.push(tempSyl);
      }
    } else {
      syllables.push(part);
    }
  }

  let resultSyllables = [];
  
  for (let idx = 0; idx < syllables.length; idx++) {
    let syl = syllables[idx];
    const isStressed = syl.includes('ˈ') || syllables.length === 1;
    syl = syl.replace(/[ˈˌ]/g, '');
    
    let phonicsSyl = convertSyllable(syl);
    
    if (isStressed) {
      phonicsSyl = phonicsSyl.toUpperCase();
    } else {
      phonicsSyl = phonicsSyl.toLowerCase();
    }
    
    resultSyllables.push(phonicsSyl);
  }
  
  return resultSyllables.join('-');
}
export default function PronunciationPlayer({ word, pronunciation, className = "" }) {
  const [playingLang, setPlayingLang] = useState(null); // 'en-US' | 'en-GB' | null
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [voices, setVoices] = useState([]);
  
  // Track last play time and voice for the alternate speed toggle (like Google Translate)
  const lastPlayRef = useRef({ time: 0, lang: null, wasSlow: false });

  // Get formatted pronunciation guide dynamically if it's just IPA
  const getFormattedPronunciation = () => {
    if (!pronunciation) return "";
    if (pronunciation.includes(' - ')) return pronunciation;
    
    const phonics = ipaToPhonics(word, pronunciation);
    if (phonics && phonics.toLowerCase() !== pronunciation.toLowerCase()) {
      return `${phonics} - ${pronunciation}`;
    }
    return pronunciation;
  };
  
  const displayPron = getFormattedPronunciation();

  // Fetch voices on load and when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const handlePlay = (e, lang) => {
    if (e) e.stopPropagation(); // Stop click events from bubbling (critical for Flashcard view)
    
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel any current speaking
    window.speechSynthesis.cancel();

    const now = Date.now();
    let useSlow = isSlowMode;

    // Alternating speed logic (Google Translate behavior):
    // If clicked again on the same language within 2.5 seconds of the previous play, alternate speed
    const lastPlay = lastPlayRef.current;
    if (lastPlay.lang === lang && (now - lastPlay.time) < 2500) {
      useSlow = !lastPlay.wasSlow;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    
    // Load custom speed rate and pitch settings from settings panel
    const savedRate = parseFloat(localStorage.getItem('lexicon_tts_rate') || '1.0');
    const savedPitch = parseFloat(localStorage.getItem('lexicon_tts_pitch') || '1.0');
    utterance.rate = useSlow ? savedRate * 0.55 : savedRate;
    utterance.pitch = savedPitch;

    // Find the best voice for the chosen dialect
    const voiceList = window.speechSynthesis.getVoices();
    const voice = voiceList.find(v => v.lang.toLowerCase() === lang.toLowerCase()) ||
                  voiceList.find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase().substring(0, 2)));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setPlayingLang(lang);
    };

    utterance.onend = () => {
      setPlayingLang(null);
      // Save last play info to trigger slow mode on immediate next click
      lastPlayRef.current = { time: Date.now(), lang, wasSlow: useSlow };
    };

    utterance.onerror = () => {
      setPlayingLang(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="font-mono text-sm font-semibold tracking-wide text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
        {word.toLowerCase()}{displayPron ? ` → ${displayPron}` : ''}
      </span>
      
      <div className="flex items-center gap-2">
        {/* US Accent Button */}
        <div className="flex items-center bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded-full pl-3 pr-1 py-1 shadow-sm transition-all group/us">
          <span className="text-[10px] font-bold text-outline font-label-mono tracking-wider mr-1.5 group-hover/us:text-primary transition-colors">US</span>
          <button
            type="button"
            onClick={(e) => handlePlay(e, 'en-US')}
            aria-label="Pronounce in American accent"
            className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
              playingLang === 'en-US' 
                ? 'bg-primary text-on-primary scale-105 shadow-md' 
                : 'text-secondary hover:bg-secondary/10'
            }`}
          >
            {playingLang === 'en-US' && (
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></span>
            )}
            <span className="material-symbols-outlined text-lg">
              {playingLang === 'en-US' ? 'volume_up' : 'volume_down'}
            </span>
          </button>
        </div>

        {/* UK Accent Button */}
        <div className="flex items-center bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded-full pl-3 pr-1 py-1 shadow-sm transition-all group/uk">
          <span className="text-[10px] font-bold text-outline font-label-mono tracking-wider mr-1.5 group-hover/uk:text-primary transition-colors">UK</span>
          <button
            type="button"
            onClick={(e) => handlePlay(e, 'en-GB')}
            aria-label="Pronounce in British accent"
            className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
              playingLang === 'en-GB' 
                ? 'bg-primary text-on-primary scale-105 shadow-md' 
                : 'text-secondary hover:bg-secondary/10'
            }`}
          >
            {playingLang === 'en-GB' && (
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></span>
            )}
            <span className="material-symbols-outlined text-lg">
              {playingLang === 'en-GB' ? 'volume_up' : 'volume_down'}
            </span>
          </button>
        </div>

        {/* Slow Play Toggle */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsSlowMode(!isSlowMode); }}
          aria-label="Toggle slow speed"
          title="Toggle slow pronunciation"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all active:scale-95 ${
            isSlowMode
              ? 'bg-tertiary text-on-tertiary border-tertiary hover:bg-tertiary/90'
              : 'bg-surface-container-high text-outline border-outline-variant hover:text-on-surface hover:bg-surface-container-highest'
          }`}
        >
          <TurtleIcon />
          <span>Slow</span>
        </button>
      </div>
    </div>
  );
}

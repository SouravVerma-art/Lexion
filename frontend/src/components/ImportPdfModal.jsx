import React, { useState, useRef } from 'react';

export default function ImportPdfModal({ isOpen, onClose, apiUrl, onWordImported }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Processing, 4: Summary
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Word Lists
  const [extractedWords, setExtractedWords] = useState([]);
  const [newWordInput, setNewWordInput] = useState('');

  // Progress States
  const [currentWord, setCurrentWord] = useState('');
  const [progressIndex, setProgressIndex] = useState(0);
  const [importedList, setImportedList] = useState([]); // Array of { word, status, error/message }
  const [processing, setProcessing] = useState(false);
  
  const cancelRef = useRef(false);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const extractWords = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${apiUrl}/parse-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to parse PDF.');
      }

      const data = await res.json();
      if (!data.words || data.words.length === 0) {
        throw new Error('No words could be extracted from this PDF. Please ensure it contains readable text.');
      }

      setExtractedWords(data.words);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeWord = (indexToRemove) => {
    setExtractedWords(extractedWords.filter((_, idx) => idx !== indexToRemove));
  };

  const addManualWord = (e) => {
    e.preventDefault();
    const trimmed = newWordInput.trim();
    if (!trimmed) return;

    // Title-case normalization
    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (extractedWords.includes(normalized)) {
      setError('Word is already in the list.');
      return;
    }

    setExtractedWords([...extractedWords, normalized]);
    setNewWordInput('');
    setError('');
  };

  const startImport = async () => {
    setStep(3);
    setProcessing(true);
    setImportedList([]);
    cancelRef.current = false;

    const listToProcess = [...extractedWords];
    const results = [];

    for (let i = 0; i < listToProcess.length; i++) {
      if (cancelRef.current) {
        results.push({ word: listToProcess[i], status: 'cancelled', message: 'Cancelled by user' });
        continue;
      }

      const targetWord = listToProcess[i];
      setCurrentWord(targetWord);
      setProgressIndex(i + 1);

      try {
        // 1. Dictionary lookup / Gemini generation
        const lookupRes = await fetch(`${apiUrl}/lookup/${encodeURIComponent(targetWord)}`);
        if (!lookupRes.ok) {
          const errData = await lookupRes.json();
          throw new Error(errData.message || 'Gemini lookup failed');
        }
        const richDetails = await lookupRes.json();

        // 2. Skip if already in library
        if (richDetails.alreadyInLibrary) {
          results.push({ word: targetWord, status: 'skipped', message: 'Already in library' });
          setImportedList([...results]);
          continue;
        }

        // 3. Save word
        const saveRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(richDetails),
        });

        if (!saveRes.ok) {
          const errData = await saveRes.json();
          throw new Error(errData.message || 'Failed to save');
        }

        const saved = await saveRes.json();
        onWordImported(saved); // Real-time UI synchronization
        results.push({ word: targetWord, status: 'success' });
      } catch (err) {
        console.error(err);
        results.push({ word: targetWord, status: 'failed', error: err.message });
      }

      setImportedList([...results]);
      // Small throttle/delay to prevent API thrashing and rate limiting
      await new Promise(r => setTimeout(r, 600));
    }

    setProcessing(false);
    setStep(4);
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setProcessing(false);
  };

  const resetModal = () => {
    setStep(1);
    setFile(null);
    setExtractedWords([]);
    setImportedList([]);
    setError('');
    onClose();
  };

  const totalWordsToImport = extractedWords.length;
  const progressPercent = totalWordsToImport > 0 ? Math.round((progressIndex / totalWordsToImport) * 100) : 0;
  
  const successCount = importedList.filter(item => item.status === 'success' || item.status === 'skipped').length;
  const failCount = importedList.filter(item => item.status === 'failed').length;

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl border border-[#E2E8F0] shadow-xl w-full max-w-xl overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="bg-surface p-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h3 className="font-h1-academic text-[20px] font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-secondary">picture_as_pdf</span>
            Import Words from PDF List
          </h3>
          <button 
            disabled={processing}
            onClick={resetModal} 
            className="text-outline-variant hover:text-primary transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Wizard Steps */}
        <div className="p-6">
          
          {/* Step 1: Upload View */}
          {step === 1 && (
            <div className="space-y-6">
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-outline-variant hover:border-secondary transition-all rounded-xl p-8 text-center bg-surface-bright flex flex-col items-center justify-center cursor-pointer group relative"
              >
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-5xl text-outline-variant group-hover:text-secondary group-hover:scale-110 transition-all duration-200">cloud_upload</span>
                <p className="mt-4 font-body-main text-body-main font-semibold text-on-surface">
                  Drag and drop your PDF file here
                </p>
                <p className="mt-1 font-body-sm text-body-xs text-on-surface-variant">
                  or click to browse your files
                </p>
                
                {file && (
                  <div className="mt-6 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">picture_as_pdf</span>
                    <span className="font-label-mono text-body-xs font-semibold max-w-[200px] truncate">{file.name}</span>
                    <span className="text-[10px] text-outline">({Math.round(file.size / 1024)} KB)</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-body-sm text-error bg-error-container/30 border border-error-container px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
                <button 
                  onClick={onClose} 
                  className="px-4 py-2 border border-outline-variant text-on-surface-variant font-button-text text-button-text rounded-lg hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={!file || loading}
                  onClick={extractWords}
                  className="px-5 py-2 bg-secondary text-on-secondary font-button-text text-button-text rounded-lg hover:bg-[#3a31c5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin"></div>
                      Extracting...
                    </>
                  ) : (
                    <>
                      Extract Words
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review View */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="font-body-main text-body-sm text-on-surface-variant">
                  We found these words in the PDF. Review the list, remove unwanted words, or add new ones manually.
                </p>
              </div>

              {/* Add custom word line */}
              <form onSubmit={addManualWord} className="flex gap-2">
                <input 
                  type="text" 
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  placeholder="Type a word and press Enter..."
                  className="flex-1 bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-body-main text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-surface border border-outline-variant text-primary font-button-text rounded-lg hover:bg-surface-container transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add
                </button>
              </form>

              {error && (
                <p className="text-body-xs text-error font-body-main">{error}</p>
              )}

              {/* Chips Area */}
              <div className="max-h-60 overflow-y-auto border border-outline-variant rounded-xl p-4 bg-surface-bright flex flex-wrap gap-2">
                {extractedWords.map((word, idx) => (
                  <div 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full font-label-mono text-body-xs font-bold"
                  >
                    <span>{word}</span>
                    <button 
                      type="button" 
                      onClick={() => removeWord(idx)}
                      className="hover:bg-secondary/20 rounded-full p-0.5 inline-flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-[#E2E8F0] pt-4">
                <span className="font-body-sm text-body-sm text-on-surface-variant font-semibold">
                  {extractedWords.length} words selected
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStep(1)} 
                    className="px-4 py-2 border border-outline-variant text-on-surface-variant font-button-text text-button-text rounded-lg hover:bg-surface transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    disabled={extractedWords.length === 0}
                    onClick={startImport}
                    className="px-5 py-2 bg-secondary text-on-secondary font-button-text text-button-text rounded-lg hover:bg-[#3a31c5] transition-colors disabled:opacity-50"
                  >
                    Start AI Import
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Processing View */}
          {step === 3 && (
            <div className="space-y-6">
              
              {/* Progress info */}
              <div className="space-y-2">
                <div className="flex justify-between text-body-sm font-semibold">
                  <span className="text-primary font-body-main">
                    Generating rich definitions with Gemini API...
                  </span>
                  <span className="text-secondary font-label-mono">
                    {progressIndex} / {totalWordsToImport}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary transition-all duration-300 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Current word spinner */}
              {processing && currentWord && (
                <div className="bg-surface-bright border border-outline-variant rounded-xl p-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-body-main text-body-sm text-on-surface">
                    Processing definition for: <strong className="text-secondary font-bold">{currentWord}</strong>
                  </span>
                </div>
              )}

              {/* Progress Log */}
              <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-xl p-4 bg-surface-bright space-y-2">
                {importedList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-body-xs font-body-main">
                    <span className="font-semibold text-on-surface">{item.word}</span>
                    {item.status === 'success' && (
                      <span className="text-emerald-600 flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Imported
                      </span>
                    )}
                    {item.status === 'skipped' && (
                      <span className="text-amber-600 flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        Already in Library
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-error flex items-center gap-1 font-bold" title={item.error}>
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        Failed
                      </span>
                    )}
                    {item.status === 'cancelled' && (
                      <span className="text-outline flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[16px]">block</span>
                        Cancelled
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-[#E2E8F0]">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-error text-error font-button-text text-button-text rounded-lg hover:bg-error/10 transition-colors"
                >
                  Cancel Import
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Summary View */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="material-symbols-outlined text-6xl text-emerald-500 animate-bounce">check_circle</span>
                <h4 className="font-h1-academic text-[22px] font-bold text-primary">Import Process Complete</h4>
                <p className="font-body-main text-body-sm text-on-surface-variant max-w-sm">
                  We have processed your word list. Check the summary below.
                </p>
              </div>

              {/* Status report card */}
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <span className="block font-label-mono text-2xl font-bold text-emerald-700">{successCount}</span>
                  <span className="font-body-xs text-body-xs text-emerald-800 font-semibold">Added / Skipped</span>
                </div>
                <div className="bg-error-container/20 border border-error-container/30 rounded-xl p-4 text-center">
                  <span className="block font-label-mono text-2xl font-bold text-error">{failCount}</span>
                  <span className="font-body-xs text-body-xs text-error font-semibold">Failed</span>
                </div>
              </div>

              {/* Display list of failures if any */}
              {failCount > 0 && (
                <div className="text-left border border-error-container/40 rounded-xl p-4 bg-error-container/5 space-y-2 max-w-md mx-auto">
                  <p className="font-body-main text-body-xs text-error font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Failed word definitions:
                  </p>
                  <ul className="list-disc list-inside text-body-xs text-on-surface-variant space-y-1">
                    {importedList.filter(item => item.status === 'failed').map((item, idx) => (
                      <li key={idx}>
                        <strong className="text-on-surface">{item.word}</strong>: {item.error || 'Unknown error'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-center pt-4 border-t border-[#E2E8F0]">
                <button 
                  onClick={resetModal} 
                  className="px-6 py-2.5 bg-secondary text-on-secondary font-button-text rounded-lg hover:bg-[#3a31c5] transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useRef, useState } from 'react';
import { useLang } from '@/lib/LanguageContext';

interface Props {
  onExtracted: (strengths: string[], fullName?: string, gallupFileUrl?: string) => void;
}

type UploadState = 'idle' | 'dragging' | 'loading' | 'success' | 'error';

export default function UploadZone({ onExtracted }: Props) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [foundCount, setFoundCount] = useState(0);
  const [fileName, setFileName] = useState('');

  const processFile = useCallback(async (file: File) => {
    setState('loading');
    setErrorMsg('');
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/extract', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setState('error');
        setErrorMsg(data.error ?? t.uploadError);
        return;
      }

      const strengths: string[] = data.strengths ?? [];
      const fullName: string = data.full_name ?? '';
      const gallupFileUrl: string | undefined = data.gallup_file_url ?? undefined;
      setFoundCount(strengths.length);
      setState('success');
      // Pass top 10 in ranked order + name + original file URL to parent
      onExtracted(strengths.slice(0, 10), fullName, gallupFileUrl);
    } catch {
      setState('error');
      setErrorMsg(t.uploadError);
    }
  }, [t.uploadError, onExtracted]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    processFile(files[0]);
  }, [processFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setState('dragging'); };
  const onDragLeave = () => setState('idle');

  const reset = () => {
    setState('idle');
    setErrorMsg('');
    setFoundCount(0);
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // Loading state
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 rounded-2xl border border-white/10 bg-white/3">
        <div className="spinner" />
        <p className="text-slate-300 text-sm font-medium">{t.uploadReading}</p>
        <p className="text-slate-600 text-xs truncate max-w-xs">{fileName}</p>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 rounded-2xl border border-red-500/20 bg-red-500/5">
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl">!</div>
        <p className="text-red-300 text-sm text-center leading-relaxed max-w-xs">{errorMsg}</p>
        <button
          onClick={reset}
          className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-sm transition-colors"
        >
          {t.uploadRetry}
        </button>
      </div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="flex items-center justify-between gap-4 py-4 px-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-emerald-300 text-sm font-medium">{t.uploadFoundAll(foundCount)}</p>
            <p className="text-slate-500 text-xs truncate max-w-[220px]">{fileName}</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="text-slate-500 hover:text-slate-300 text-xs transition-colors flex-shrink-0"
        >
          {t.uploadChangeFile}
        </button>
      </div>
    );
  }

  // Idle / dragging state
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 group ${
        state === 'dragging'
          ? 'border-gold/60 bg-gold/5 scale-[1.01]'
          : 'border-white/15 bg-white/2 hover:border-gold/30 hover:bg-white/4'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Upload icon */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
        state === 'dragging'
          ? 'bg-gold/20 border border-gold/30'
          : 'bg-white/5 border border-white/10 group-hover:bg-gold/10 group-hover:border-gold/20'
      }`}>
        <svg
          className={`w-5 h-5 transition-colors ${state === 'dragging' ? 'text-gold' : 'text-slate-500 group-hover:text-gold'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div className="text-center">
        <p className={`text-sm font-medium transition-colors ${state === 'dragging' ? 'text-gold' : 'text-slate-300 group-hover:text-white'}`}>
          {t.uploadDrop}
        </p>
        <p className="text-slate-600 text-xs mt-1">{t.uploadBrowse}</p>
      </div>

      <p className="text-slate-700 text-xs">{t.uploadFormats}</p>
    </div>
  );
}

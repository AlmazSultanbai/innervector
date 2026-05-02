'use client';

import { useLang } from '@/lib/LanguageContext';

export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
          lang === 'en'
            ? 'bg-gold/20 text-gold border border-gold/30'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ru')}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
          lang === 'ru'
            ? 'bg-gold/20 text-gold border border-gold/30'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        RU
      </button>
    </div>
  );
}

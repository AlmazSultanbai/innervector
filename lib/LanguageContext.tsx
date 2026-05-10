'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Lang, translations, Translations } from './i18n';
import { getSetting, setSetting } from './supabase';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: translations['en'],
});

function isValidLang(l: string | null): l is Lang {
  return l === 'en' || l === 'ru' || l === 'ky';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // On mount: localStorage first (instant), then sync from Supabase
  useEffect(() => {
    // 1. Apply localStorage immediately (no flicker)
    const local = localStorage.getItem('lang');
    if (isValidLang(local)) setLangState(local);

    // 2. Sync from Supabase in background (source of truth)
    getSetting('lang').then((remote) => {
      if (isValidLang(remote)) {
        setLangState(remote);
        localStorage.setItem('lang', remote);
      }
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    // Write to both localStorage (instant) and Supabase (persistent)
    localStorage.setItem('lang', l);
    setSetting('lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

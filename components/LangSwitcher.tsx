'use client'

import { useLocaleStore, type Locale } from '@/store/localeStore'

const LANGS: { code: Locale; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'ky', label: 'KY' },
]

export default function LangSwitcher() {
  const { locale, setLocale } = useLocaleStore()

  return (
    <div className="flex items-center rounded-lg overflow-hidden border border-white/10 bg-white/5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className="px-2.5 py-1 text-[10px] font-semibold tracking-widest transition-all duration-150"
          style={
            locale === code
              ? {
                  background: 'rgba(212,168,67,0.18)',
                  color: '#d4a843',
                  borderRight: code !== 'ky' ? '1px solid rgba(255,255,255,0.08)' : undefined,
                }
              : {
                  color: 'rgba(148,163,184,0.6)',
                  borderRight: code !== 'ky' ? '1px solid rgba(255,255,255,0.08)' : undefined,
                }
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}

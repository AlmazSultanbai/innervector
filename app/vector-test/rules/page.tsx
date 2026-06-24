'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useVectorTestStore } from '@/store/vectorTestStore'
import { useLocaleStore } from '@/store/localeStore'
import { ui } from '@/locales/ui'
import { domainColors } from '@/data/vectorTraits'
import LangSwitcher from '@/components/LangSwitcher'

const GOLD = '#d4a843'
const SCALE_VALUES = [2, 1, 0, 1, 2]
const DEMO_SELECTED = 1 // "Скорее А / Lean A" highlighted

export default function VectorTestRules() {
  const router = useRouter()
  const { userInfo, testMode } = useVectorTestStore()
  const locale = useLocaleStore(s => s.locale)
  const t = ui[locale]

  useEffect(() => {
    if (!userInfo) router.replace('/vector-test')
  }, [userInfo, router])

  if (!userInfo) return null

  const modeColor = testMode === 'express' ? domainColors.vliyanie : domainColors.myshlenie
  const modeLabel = testMode === 'express' ? t.expressResultBadge : t.fullResultBadge

  return (
    <div className="min-h-screen bg-radial flex flex-col">

      {/* Nav */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-3 max-w-4xl mx-auto w-full">
        <button
          onClick={() => router.push('/vector-test')}
          className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t.back}
        </button>
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Inner Vector" width={28} height={28} className="opacity-90" />
          <span className="text-xs font-semibold tracking-widest uppercase text-white">Inner Vector</span>
        </div>
        <LangSwitcher />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-2xl mx-auto w-full">

        {/* Mode badge */}
        <div
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ background: modeColor + '18', border: `1px solid ${modeColor}44`, color: modeColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: modeColor }} />
          {modeLabel}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white text-center mb-2">
          {t.rulesTitle}
        </h1>
        <p className="text-slate-500 text-sm text-center mb-8">
          {t.rulesSubtitle}
        </p>

        {/* ── HOW IT WORKS VISUAL ─────────────────────────── */}
        <div className="w-full mb-8">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 text-center mb-1">
            {t.howItWorksTitle}
          </p>
          <p className="text-slate-500 text-xs text-center mb-4">
            {t.howItWorksDesc}
          </p>

          <div className="bg-white/3 border border-white/8 rounded-2xl px-4 py-5 sm:px-7 sm:py-6">

            {/* A | scale | B */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-7 items-center mb-5">

              {/* Statement A — bright (demo leans A) */}
              <p className="font-serif text-sm sm:text-base text-white text-right leading-relaxed">
                {t.exampleA}
              </p>

              {/* Scale circles */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {SCALE_VALUES.map((label, i) => {
                    const selected = i === DEMO_SELECTED
                    return (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-semibold"
                        style={selected ? {
                          borderColor: GOLD,
                          background: GOLD + '28',
                          boxShadow: `0 0 18px ${GOLD}55`,
                          color: GOLD,
                        } : {
                          borderColor: GOLD + '30',
                          background: GOLD + '08',
                          color: GOLD + '45',
                        }}
                      >
                        {label}
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between w-full px-0.5">
                  <span className="text-[9px] tracking-wide text-slate-600">{t.optionA}</span>
                  <span className="text-[9px] tracking-wide text-slate-600">{t.optionB}</span>
                </div>
              </div>

              {/* Statement B — dimmed */}
              <p className="font-serif text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.exampleB}
              </p>
            </div>

            {/* Scale legend */}
            <div className="flex items-start justify-between border-t border-white/6 pt-4">
              {t.scaleLabels.map((lbl, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: i === DEMO_SELECTED ? GOLD : 'rgba(100,116,139,0.3)' }}
                  />
                  <span
                    className="text-center leading-tight"
                    style={{
                      fontSize: '9px',
                      color: i === DEMO_SELECTED ? GOLD : 'rgba(100,116,139,0.55)',
                      fontWeight: i === DEMO_SELECTED ? 600 : 400,
                    }}
                  >
                    {lbl}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
        {/* ── END HOW IT WORKS ────────────────────────────── */}

        {/* Rule cards */}
        <div className="w-full space-y-3 mb-10">
          {t.rules.map((rule, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white/3 border border-white/8 rounded-2xl px-5 py-4"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{rule.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold mb-1">{rule.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={() => router.push('/vector-test/test')}
          className="w-full inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #d4a843 0%, #b8922e 100%)',
            color: '#0e1120',
            boxShadow: '0 0 40px rgba(212,168,67,0.25), 0 0 80px rgba(212,168,67,0.1)',
          }}
        >
          {t.rulesStartBtn}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>

      </div>
    </div>
  )
}

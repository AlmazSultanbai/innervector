'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useVectorTestStore } from '@/store/vectorTestStore'
import { traitData, domainColors, domainNames, domainDescs } from '@/data/vectorTraits'
import type { Domain } from '@/data/vectorTraits'

const DOMAINS: Domain[] = ['impulse', 'sozidanie', 'svyaz', 'navigacia', 'energia', 'rost']

interface TraitScore { name: string; pct: number; d: Domain }

export default function VectorTestReport() {
  const { scores } = useVectorTestStore()

  const hasResults = Object.keys(scores).length > 0 &&
    Object.values(scores).some(s => s.a > 0 || s.b > 0)

  const traitScores: TraitScore[] = useMemo(() =>
    Object.keys(scores)
      .map(name => ({
        name,
        pct: Math.round((scores[name].a / 10) * 100),
        d: (traitData[name]?.d ?? 'rost') as Domain,
      }))
      .sort((a, b) => b.pct - a.pct),
    [scores]
  )

  const top5 = traitScores.slice(0, 5)

  const domainAverages = useMemo(() => {
    const totals = Object.fromEntries(DOMAINS.map(d => [d, { sum: 0, count: 0 }])) as Record<Domain, { sum: number; count: number }>
    traitScores.forEach(t => { totals[t.d].sum += t.pct; totals[t.d].count += 1 })
    return Object.fromEntries(DOMAINS.map(d => [d, totals[d].count > 0 ? Math.round(totals[d].sum / totals[d].count) : 0])) as Record<Domain, number>
  }, [traitScores])

  if (!hasResults) {
    return (
      <div className="min-h-screen bg-radial flex flex-col items-center justify-center gap-6 text-center px-6">
        <p className="font-serif text-3xl text-slate-400">Пройди тест сначала</p>
        <Link
          href="/vector-test"
          className="px-8 py-3 rounded-xl border border-gold/30 text-gold text-xs tracking-widest uppercase hover:bg-gold/10 transition-all duration-200"
        >
          К началу
        </Link>
      </div>
    )
  }

  const topTrait = top5[0]
  const topColor = domainColors[topTrait.d]

  return (
    <div className="min-h-screen bg-radial">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-24">

        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/vector-test" className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Пройти заново
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">IV</div>
            <span className="text-xs font-semibold tracking-widest uppercase">
              <span className="text-white">Inner Vector</span>
              <span className="text-gold/40 mx-1.5">·</span>
              <span className="text-gold/60">Результат</span>
            </span>
          </div>
          <Link href="/" className="text-slate-500 hover:text-gold text-xs tracking-wide transition-colors">
            Главная
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16 animate-slide-in">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            Твой вектор
          </div>
          <p className="font-serif text-3xl md:text-4xl text-slate-400 font-normal mb-2">Доминирующая характеристика</p>
          <h1
            className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-6"
            style={{ color: topColor, textShadow: `0 0 60px ${topColor}33` }}
          >
            {topTrait.name}
          </h1>
          <div className="w-12 h-px bg-gold/20 mx-auto mb-6" />
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            {traitData[topTrait.name]?.short}
          </p>
        </div>

        {/* Top 5 */}
        <Section label="ТОП-5 ХАРАКТЕРИСТИК">
          <div className="space-y-4">
            {top5.map((trait, i) => {
              const color = domainColors[trait.d]
              const data = traitData[trait.name]
              return (
                <div
                  key={trait.name}
                  className="bg-white/3 border backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/5"
                  style={{ borderColor: i === 0 ? color + '44' : 'rgba(255,255,255,0.08)' }}
                >
                  {/* Bar */}
                  <div className="h-0.5 bg-white/5">
                    <div className="h-full transition-all duration-1000" style={{ width: `${trait.pct}%`, background: color, boxShadow: `0 0 8px ${color}55` }} />
                  </div>

                  {/* Header */}
                  <div className="grid grid-cols-[48px_1fr_auto] items-center gap-4 px-6 py-5">
                    <span className="font-serif text-3xl text-white/15 font-light leading-none">{i + 1}</span>
                    <div>
                      <div className="font-serif text-xl text-white font-semibold">{trait.name}</div>
                      <div className="text-xs tracking-widest mt-0.5 font-medium" style={{ color }}>{domainNames[trait.d]}</div>
                    </div>
                    <div className="font-serif text-3xl font-light" style={{ color }}>{trait.pct}%</div>
                  </div>

                  {/* Body */}
                  {data && (
                    <div className="px-6 pb-6 border-t border-white/6">
                      <p className="text-slate-400 text-sm leading-relaxed mt-4 mb-4">{data.short}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-slate-600 text-[10px] tracking-widest uppercase mb-2">Сильная сторона</div>
                          <div className="bg-gold/5 border-l-2 border-gold/40 pl-3 py-3 pr-3 rounded-r-lg text-slate-300 text-xs leading-relaxed">{data.positive}</div>
                        </div>
                        <div>
                          <div className="text-slate-600 text-[10px] tracking-widest uppercase mb-2">Тёмная сторона</div>
                          <div className="bg-red-500/5 border-l-2 border-red-500/25 pl-3 py-3 pr-3 rounded-r-lg text-slate-400 text-xs leading-relaxed">{data.dark}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* Domain profile */}
        <Section label="ПРОФИЛЬ ПО ДОМЕНАМ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOMAINS.map(d => {
              const color = domainColors[d]
              const avg = domainAverages[d]
              return (
                <div key={d} className="bg-white/3 border border-white/8 backdrop-blur-sm rounded-2xl p-5">
                  <div className="text-xs font-semibold tracking-widest mb-1" style={{ color }}>{domainNames[d]}</div>
                  <div className="text-slate-500 text-xs mb-4 leading-relaxed">{domainDescs[d]}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-1 bg-white/6 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${avg}%`, background: color, boxShadow: `0 0 8px ${color}44` }} />
                    </div>
                    <span className="text-slate-400 text-xs w-8 text-right">{avg}%</span>
                  </div>
                  <div className="space-y-2">
                    {traitScores.filter(t => t.d === d).slice(0, 4).map(t => (
                      <div key={t.name} className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 text-xs truncate">{t.name}</span>
                        <div className="w-16 h-0.5 bg-white/6 rounded-full overflow-hidden flex-shrink-0">
                          <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Full ranking */}
        <Section label="ВСЕ 36 ХАРАКТЕРИСТИК">
          <div className="space-y-1.5">
            {traitScores.map((trait, i) => {
              const color = domainColors[trait.d]
              const isTop = i < 5
              return (
                <div
                  key={trait.name}
                  className="grid grid-cols-[28px_1fr_90px_40px] items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200"
                  style={{
                    background: isTop ? color + '08' : 'rgba(255,255,255,0.02)',
                    borderColor: isTop ? color + '30' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="text-slate-600 text-[11px] text-center">{i + 1}</span>
                  <span className={`font-serif text-base ${isTop ? 'text-white' : 'text-slate-400'}`}>{trait.name}</span>
                  <div className="h-0.5 bg-white/6 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${trait.pct}%`, background: color }} />
                  </div>
                  <span className="text-slate-500 text-xs text-right">{trait.pct}%</span>
                </div>
              )
            })}
          </div>
        </Section>

        {/* CTA */}
        <div className="flex justify-center gap-4 flex-wrap mt-4">
          <Link
            href="/vector-test"
            className="px-8 py-3 rounded-xl border border-white/10 text-slate-400 text-xs tracking-widest uppercase hover:border-white/20 hover:text-slate-300 transition-all duration-200"
          >
            Пройти заново
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #d4a843 0%, #b8922e 100%)',
              color: '#0e1120',
              boxShadow: '0 0 30px rgba(212,168,67,0.2)',
            }}
          >
            Главная
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] text-gold/60 tracking-widest uppercase font-medium">{label}</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      {children}
    </div>
  )
}

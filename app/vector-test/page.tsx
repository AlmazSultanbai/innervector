import Link from 'next/link'
import { domainColors, domainNames } from '@/data/vectorTraits'
import type { Domain } from '@/data/vectorTraits'

const domains: Domain[] = ['impulse', 'sozidanie', 'svyaz', 'navigacia', 'energia', 'rost']

export default function VectorTestIntro() {
  return (
    <div className="min-h-screen bg-radial flex flex-col">

      {/* Nav — same pattern as main site */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-3">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
            IV
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase">
            <span className="text-white">Inner Vector</span>
            <span className="text-gold/40 mx-1.5">·</span>
            <span className="text-gold/60">Тест</span>
          </span>
        </div>
        <div className="w-16" />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium tracking-widest uppercase animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
          Авторская методология
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4 leading-tight animate-slide-in delay-100">
          Узнай свой{' '}
          <span className="text-gold-light italic">вектор</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base mb-10 animate-fade-in delay-200">
          180 вопросов · 36 характеристик · ~15 минут
        </p>

        {/* Domain pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 max-w-lg animate-fade-in delay-300">
          {domains.map(d => (
            <span
              key={d}
              className="px-3 py-1 rounded-full text-xs font-medium tracking-wide border"
              style={{
                color: domainColors[d],
                borderColor: domainColors[d] + '55',
                background: domainColors[d] + '12',
              }}
            >
              {domainNames[d]}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-gold/20 mb-10" />

        {/* CTA */}
        <Link
          href="/vector-test/test"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-200 animate-fade-in delay-400"
          style={{
            background: 'linear-gradient(135deg, #d4a843 0%, #b8922e 100%)',
            color: '#0e1120',
            boxShadow: '0 0 40px rgba(212,168,67,0.25), 0 0 80px rgba(212,168,67,0.1)',
          }}
        >
          Начать тест
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        {/* Note */}
        <p className="text-slate-600 text-xs mt-5 italic border-l-2 border-gold/20 pl-3 max-w-xs text-left animate-fade-in delay-500">
          Отвечай быстро — первый импульс точнее размышления
        </p>
      </div>
    </div>
  )
}

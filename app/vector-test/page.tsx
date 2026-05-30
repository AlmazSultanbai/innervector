'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { domainColors } from '@/data/vectorTraits'
import { useVectorTestStore } from '@/store/vectorTestStore'
import { useLocaleStore } from '@/store/localeStore'
import { ui } from '@/locales/ui'
import { domainNamesI18n } from '@/locales/domainNames'
import LangSwitcher from '@/components/LangSwitcher'
import type { Domain } from '@/data/vectorTraits'
import type { TestMode } from '@/store/vectorTestStore'

const domains: Domain[] = ['vliyanie', 'realizacia', 'otnosenia', 'myshlenie', 'energia', 'rost']

export default function VectorTestIntro() {
  const router = useRouter()
  const { setUserInfo, testMode, setTestMode, reset } = useVectorTestStore()
  const locale = useLocaleStore(s => s.locale)
  const t = ui[locale]

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getDomainLabel = (d: Domain) => {
    if (locale === 'en') return domainNamesI18n[d]?.en ?? d
    if (locale === 'ky') return domainNamesI18n[d]?.ky ?? d
    // Russian — use the domain key to get original Russian labels
    const ruLabels: Record<Domain, string> = {
      vliyanie:   'ВЛИЯНИЕ',
      realizacia: 'РЕАЛИЗАЦИЯ',
      otnosenia:  'ОТНОШЕНИЯ',
      myshlenie:  'МЫШЛЕНИЕ',
      energia:    'ЭНЕРГИЯ',
      rost:       'РОСТ',
    }
    return ruLabels[d]
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = t.nameError
    if (!phone.trim()) e.phone = t.phoneError
    if (!email.trim()) e.email = t.emailError
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t.emailInvalidError
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    // Reset all previous answers, scores and share token before starting a new test
    reset()
    setUserInfo({ fullName: fullName.trim(), phone: phone.trim(), email: email.trim() })
    router.push('/vector-test/test')
  }

  return (
    <div className="min-h-screen bg-radial flex flex-col">

      {/* Nav */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-3">
        <a href="/" className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t.back}
        </a>
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Inner Vector" width={32} height={32} className="opacity-90 flex-shrink-0" />
          <span className="text-xs font-semibold tracking-widest uppercase">
            <span className="text-white">Inner Vector</span>
          </span>
        </div>
        <LangSwitcher />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium tracking-widest uppercase animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
          {t.testBadge}
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4 leading-tight animate-slide-in delay-100 text-center">
          {t.headline1}{' '}
          <span className="text-gold-light italic">{t.headline2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base mb-8 animate-fade-in delay-200 text-center">
          {testMode === 'express' ? t.subtitleExpress : t.subtitleFull}
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
              {getDomainLabel(d)}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-gold/20 mb-10" />

        {/* Mode tabs */}
        <div className="flex w-full max-w-sm mb-4 rounded-xl overflow-hidden border border-white/10 animate-fade-in delay-350">
          {(['express', 'full'] as TestMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTestMode(mode)}
              className="flex-1 py-3 text-xs font-semibold tracking-widest uppercase transition-all duration-200"
              style={testMode === mode ? {
                background: 'rgba(212,168,67,0.15)',
                color: '#d4a843',
                borderBottom: '2px solid #d4a843',
              } : {
                color: 'rgba(148,163,184,0.5)',
                borderBottom: '2px solid transparent',
              }}
            >
              {mode === 'express' ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10h5l-6 9V14H7l6-9v5z"/></svg>
                  {t.modeExpress}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V18H9v2h6v-2h-2v-2.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
                  {t.modeFull}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white/3 border border-white/8 backdrop-blur rounded-2xl p-6 space-y-4 animate-fade-in delay-400"
        >
          <p className="text-slate-400 text-sm text-center mb-2">
            {t.formTitle}
          </p>

          {/* Full Name */}
          <div>
            <input
              type="text"
              value={fullName}
              onChange={e => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: '' })) }}
              placeholder={t.namePlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold/40 transition-all"
              style={errors.fullName ? { borderColor: 'rgba(239,68,68,0.4)' } : {}}
            />
            {errors.fullName && <p className="text-red-400 text-xs mt-1 pl-1">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })) }}
              placeholder={t.phonePlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold/40 transition-all"
              style={errors.phone ? { borderColor: 'rgba(239,68,68,0.4)' } : {}}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1 pl-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
              placeholder={t.emailPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold/40 transition-all"
              style={errors.email ? { borderColor: 'rgba(239,68,68,0.4)' } : {}}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1 pl-1">{errors.email}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all duration-200 mt-2"
            style={{
              background: 'linear-gradient(135deg, #d4a843 0%, #b8922e 100%)',
              color: '#0e1120',
              boxShadow: '0 0 40px rgba(212,168,67,0.25), 0 0 80px rgba(212,168,67,0.1)',
            }}
          >
            {t.startBtn}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </form>

        {/* Note */}
        <p className="text-slate-600 text-xs mt-6 italic border-l-2 border-gold/20 pl-3 max-w-xs text-left animate-fade-in delay-500">
          {t.noteText}
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { domainColors, domainNames } from '@/data/vectorTraits'
import { useVectorTestStore } from '@/store/vectorTestStore'
import type { Domain } from '@/data/vectorTraits'

const domains: Domain[] = ['impulse', 'sozidanie', 'svyaz', 'navigacia', 'energia', 'rost']

export default function VectorTestIntro() {
  const router = useRouter()
  const setUserInfo = useVectorTestStore(s => s.setUserInfo)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Введите имя и фамилию'
    if (!phone.trim()) e.phone = 'Введите телефон'
    if (!email.trim()) e.email = 'Введите email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Некорректный email'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
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
          Назад
        </a>
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium tracking-widest uppercase animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
          Авторская методология
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4 leading-tight animate-slide-in delay-100 text-center">
          Узнай свой{' '}
          <span className="text-gold-light italic">вектор</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base mb-8 animate-fade-in delay-200 text-center">
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

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white/3 border border-white/8 backdrop-blur rounded-2xl p-6 space-y-4 animate-fade-in delay-400"
        >
          <p className="text-slate-400 text-sm text-center mb-2">
            Заполни форму, чтобы начать тест
          </p>

          {/* Full Name */}
          <div>
            <input
              type="text"
              value={fullName}
              onChange={e => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: '' })) }}
              placeholder="Имя и Фамилия"
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
              placeholder="Телефон"
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
              placeholder="Email"
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
            Начать тест
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </form>

        {/* Note */}
        <p className="text-slate-600 text-xs mt-6 italic border-l-2 border-gold/20 pl-3 max-w-xs text-left animate-fade-in delay-500">
          Отвечай быстро — первый импульс точнее размышления
        </p>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useVectorTestStore } from '@/store/vectorTestStore'
import { questions } from '@/data/vectorQuestions'
import { domainColors, domainNames } from '@/data/vectorTraits'

const TIMER_DURATION = 20
const CIRCUMFERENCE = 2 * Math.PI * 13

export default function VectorTestPage() {
  const router = useRouter()
  const { current, isComplete, answer, skip } = useVectorTestStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeLeftRef = useRef(TIMER_DURATION)
  const circleRef = useRef<SVGCircleElement>(null)

  const currentQuestion = questions[Math.min(current, questions.length - 1)]
  const progress = (current / questions.length) * 100
  const domainColor = domainColors[currentQuestion.d]

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timeLeftRef.current = TIMER_DURATION
    if (circleRef.current) circleRef.current.style.strokeDashoffset = '0'

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1
      const offset = CIRCUMFERENCE - (timeLeftRef.current / TIMER_DURATION) * CIRCUMFERENCE
      if (circleRef.current) circleRef.current.style.strokeDashoffset = String(offset)
      if (timeLeftRef.current <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        skip()
      }
    }, 1000)
  }, [skip])

  useEffect(() => {
    if (isComplete) {
      if (timerRef.current) clearInterval(timerRef.current)
      router.push('/vector-test/report')
      return
    }
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [current, isComplete, router, startTimer])

  const handleAnswer = (value: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    answer(value)
  }

  return (
    <div className="min-h-screen bg-radial flex flex-col">

      {/* Top progress bar — domain color */}
      <div className="w-full h-0.5 bg-white/5">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: domainColor,
            boxShadow: `0 0 12px ${domainColor}66`,
          }}
        />
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-4xl mx-auto w-full">
        {/* Domain pill */}
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide border"
          style={{
            color: domainColor,
            borderColor: domainColor + '55',
            background: domainColor + '12',
          }}
        >
          {domainNames[currentQuestion.d]}
        </span>

        {/* Counter + timer */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs tracking-widest">
            {String(current + 1).padStart(2, '0')} / 180
          </span>
          <svg width="28" height="28" viewBox="0 0 30 30" style={{ transform: 'rotate(-90deg)', opacity: 0.8 }}>
            <circle cx="15" cy="15" r="13" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
            <circle
              ref={circleRef}
              cx="15" cy="15" r="13"
              fill="none"
              stroke={domainColor}
              strokeWidth="2.5"
              strokeDasharray={String(CIRCUMFERENCE)}
              strokeDashoffset="0"
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-3xl">
          <div className="bg-white/3 border border-white/8 backdrop-blur-sm rounded-2xl p-8 md:p-12">

            {/* Statements grid */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 md:gap-10 items-center">

              {/* Statement A */}
              <p className="font-serif text-lg md:text-xl text-white text-right leading-relaxed">
                {currentQuestion.a}
              </p>

              {/* Scale */}
              <ScaleRadio onAnswer={handleAnswer} color={domainColor} />

              {/* Statement B */}
              <p className="font-serif text-lg md:text-xl text-white leading-relaxed">
                {currentQuestion.b}
              </p>
            </div>
          </div>

          {/* Skip */}
          <div className="flex justify-center mt-5">
            <button
              onClick={() => handleAnswer(3)}
              className="px-8 py-2.5 rounded-lg border border-white/8 text-slate-600 text-xs tracking-widest uppercase hover:border-white/15 hover:text-slate-400 transition-all duration-200"
            >
              Пропустить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScaleRadio({ onAnswer, color }: { onAnswer: (v: number) => void; color: string }) {
  const sizes = [40, 30, 22, 30, 40]

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <span className="text-slate-600 text-[9px] tracking-widest uppercase">нейтрально</span>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value, i) => (
          <button
            key={value}
            onClick={() => onAnswer(value)}
            className="rounded-full border border-white/10 bg-white/3 text-slate-600 text-[10px] flex items-center justify-center transition-all duration-150 hover:scale-105"
            style={{ width: sizes[i], height: sizes[i] }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = color
              el.style.background = color + '22'
              el.style.boxShadow = `0 0 16px ${color}44`
              el.style.color = color
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = ''
              el.style.background = ''
              el.style.boxShadow = ''
              el.style.color = ''
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full">
        <span className="text-slate-600 text-[9px] tracking-wide">A</span>
        <span className="text-slate-600 text-[9px] tracking-wide">B</span>
      </div>
    </div>
  )
}

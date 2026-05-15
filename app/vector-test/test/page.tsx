'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useVectorTestStore } from '@/store/vectorTestStore'
import { questions } from '@/data/vectorQuestions'
import { domainColors, domainNames } from '@/data/vectorTraits'

const TIMER_DURATION = 20
const CIRCUMFERENCE = 2 * Math.PI * 13 // r=13

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
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = '0'
    }
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1
      const offset = CIRCUMFERENCE - (timeLeftRef.current / TIMER_DURATION) * CIRCUMFERENCE
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(offset)
      }
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [current, isComplete, router, startTimer])

  const handleAnswer = (value: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    answer(value)
  }

  const qNum = String(current + 1).padStart(2, '0')

  return (
    <div
      style={{
        minHeight: '100vh',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
      }}
    >
      {/* Progress bar — top */}
      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: domainColor,
            transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
            boxShadow: `0 0 12px ${domainColor}66`,
          }}
        />
      </div>

      {/* Header bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 14px',
            borderRadius: '999px',
            fontSize: '11px',
            letterSpacing: '1px',
            fontWeight: 500,
            border: `1px solid ${domainColor}55`,
            color: domainColor,
            background: `${domainColor}12`,
          }}
        >
          {domainNames[currentQuestion.d]}
        </span>
        <span style={{ fontSize: '12px', color: '#64748b', letterSpacing: '1px' }}>
          {qNum} / 180
        </span>
      </div>

      {/* Question card */}
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          margin: '16px auto 0',
          padding: '0 24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Statements + scale */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '40px 40px 32px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '32px',
              alignItems: 'center',
            }}
          >
            {/* Statement A */}
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(16px, 2vw, 20px)',
                fontWeight: 400,
                lineHeight: 1.55,
                textAlign: 'right',
                color: '#e2e8f0',
              }}
            >
              {currentQuestion.a}
            </div>

            {/* Scale */}
            <ScaleRadio onAnswer={handleAnswer} color={domainColor} />

            {/* Statement B */}
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(16px, 2vw, 20px)',
                fontWeight: 400,
                lineHeight: 1.55,
                color: '#e2e8f0',
              }}
            >
              {currentQuestion.b}
            </div>
          </div>

          {/* Timer */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 30 30"
              style={{ transform: 'rotate(-90deg)', opacity: 0.7 }}
            >
              <circle cx="15" cy="15" r="13" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
              <circle
                ref={circleRef}
                cx="15"
                cy="15"
                r="13"
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

        {/* Skip */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '40px' }}>
          <button
            onClick={() => handleAnswer(3)}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748b',
              padding: '10px 36px',
              fontSize: '11px',
              letterSpacing: '2px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            Пропустить
          </button>
        </div>
      </div>
    </div>
  )
}

function ScaleRadio({
  onAnswer,
  color,
}: {
  onAnswer: (value: number) => void
  color: string
}) {
  const sizes = [40, 30, 22, 30, 40]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '9px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase' }}>
        нейтрально
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((value, i) => {
          const size = sizes[i]
          return (
            <button
              key={value}
              onClick={() => onAnswer(value)}
              title={String(value)}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#64748b',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = color
                el.style.background = `${color}22`
                el.style.boxShadow = `0 0 16px ${color}44`
                el.style.color = color
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = 'rgba(255,255,255,0.1)'
                el.style.background = 'rgba(255,255,255,0.03)'
                el.style.boxShadow = 'none'
                el.style.color = '#64748b'
              }}
            >
              {value}
            </button>
          )
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          fontSize: '9px',
          color: '#64748b',
          letterSpacing: '1px',
        }}
      >
        <span>A</span>
        <span>B</span>
      </div>
    </div>
  )
}

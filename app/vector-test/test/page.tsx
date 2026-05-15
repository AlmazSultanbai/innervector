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
        background: '#0a0a0f',
        color: '#f0ede8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '860px', padding: '20px 40px 0', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#7a7870',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}
        >
          <span>ВОПРОС {current + 1}</span>
          <span>{Math.round(progress)}%</span>
          <span>180</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '2px',
            background: '#232328',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: domainColor,
              borderRadius: '2px',
              transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          margin: '28px auto 0',
          padding: '0 40px',
        }}
      >
        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '10px',
              letterSpacing: '2px',
              fontWeight: 500,
              border: `1px solid ${domainColor}`,
              color: domainColor,
              background: `${domainColor}15`,
            }}
          >
            {domainNames[currentQuestion.d]}
          </span>
          <span style={{ fontSize: '11px', color: '#7a7870', letterSpacing: '1px' }}>
            {qNum} / 180
          </span>
        </div>

        {/* Scale wrapper */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '28px',
            alignItems: 'center',
          }}
        >
          {/* Statement A */}
          <div
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '20px',
              fontWeight: 400,
              lineHeight: 1.5,
              textAlign: 'right',
              color: '#f0ede8',
            }}
          >
            {currentQuestion.a}
          </div>

          {/* Scale radio buttons */}
          <ScaleRadio onAnswer={handleAnswer} color={domainColor} />

          {/* Statement B */}
          <div
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '20px',
              fontWeight: 400,
              lineHeight: 1.5,
              color: '#f0ede8',
            }}
          >
            {currentQuestion.b}
          </div>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 30 30"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle cx="15" cy="15" r="13" fill="none" stroke="#232328" strokeWidth="2.5" />
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

      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0 48px' }}>
        <button
          onClick={() => handleAnswer(3)}
          style={{
            background: 'none',
            border: '1px solid #232328',
            color: '#7a7870',
            padding: '12px 40px',
            fontSize: '11px',
            letterSpacing: '2px',
            borderRadius: '2px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Пропустить
        </button>
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
  const sizes = [38, 28, 20, 28, 38]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '9px', color: '#7a7870', letterSpacing: '1px' }}>НЕЙТРАЛЬНО</span>
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
                border: `1.5px solid #232328`,
                background: '#13131a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#7a7870',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = color
                el.style.background = `${color}22`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = '#232328'
                el.style.background = '#13131a'
              }}
            >
              {value}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '9px', color: '#7a7870', letterSpacing: '1px' }}>
        <span>A</span>
        <span>B</span>
      </div>
    </div>
  )
}

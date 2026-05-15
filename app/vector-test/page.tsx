import Link from 'next/link'
import { domainColors, domainNames } from '@/data/vectorTraits'
import type { Domain } from '@/data/vectorTraits'

const domains: Domain[] = ['impulse', 'sozidanie', 'svyaz', 'navigacia', 'energia', 'rost']

export default function VectorTestIntro() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: '#0a0a0f',
        color: '#f0ede8',
        fontFamily: 'inherit',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: '11px',
          letterSpacing: '4px',
          color: '#7a7870',
          marginBottom: '24px',
          fontWeight: 500,
        }}
      >
        VECTOR TEST
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 300,
          letterSpacing: '8px',
          color: '#f0ede8',
          marginBottom: '16px',
          fontFamily: 'Georgia, serif',
        }}
      >
        Узнай свой вектор
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '13px',
          color: '#7a7870',
          letterSpacing: '2px',
          marginBottom: '48px',
        }}
      >
        180 вопросов · 36 характеристик · ~15 минут
      </p>

      {/* Domain pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '56px',
          maxWidth: '500px',
        }}
      >
        {domains.map(d => (
          <span
            key={d}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: `1px solid ${domainColors[d]}`,
              color: domainColors[d],
              background: `${domainColors[d]}15`,
              fontSize: '11px',
              letterSpacing: '1.5px',
              fontWeight: 500,
            }}
          >
            {domainNames[d]}
          </span>
        ))}
      </div>

      {/* CTA Button */}
      <Link
        href="/vector-test/test"
        style={{
          display: 'inline-block',
          background: '#c9a96e',
          color: '#0a0a0f',
          padding: '18px 64px',
          borderRadius: '2px',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '3px',
          textDecoration: 'none',
          marginBottom: '24px',
          transition: 'all 0.2s',
        }}
      >
        Начать тест →
      </Link>

      {/* Note */}
      <p
        style={{
          fontSize: '11px',
          color: '#7a7870',
          letterSpacing: '1px',
          maxWidth: '360px',
          lineHeight: 1.7,
        }}
      >
        Отвечай быстро — первый импульс точнее
      </p>
    </div>
  )
}

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
        padding: '60px 24px',
        textAlign: 'center',
        color: '#e2e8f0',
        fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: '11px',
          letterSpacing: '4px',
          color: '#d4a843',
          marginBottom: '20px',
          fontWeight: 500,
          textTransform: 'uppercase',
          opacity: 0.8,
        }}
      >
        Inner Vector
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 'clamp(36px, 6vw, 60px)',
          fontWeight: 400,
          letterSpacing: '2px',
          color: '#e2e8f0',
          marginBottom: '16px',
          fontFamily: "'Playfair Display', Georgia, serif",
          lineHeight: 1.2,
        }}
      >
        Узнай свой вектор
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '14px',
          color: '#94a3b8',
          letterSpacing: '1px',
          marginBottom: '48px',
          lineHeight: 1.6,
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
          maxWidth: '520px',
        }}
      >
        {domains.map(d => (
          <span
            key={d}
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              border: `1px solid ${domainColors[d]}55`,
              color: domainColors[d],
              background: `${domainColors[d]}12`,
              fontSize: '12px',
              letterSpacing: '0.5px',
              fontWeight: 500,
            }}
          >
            {domainNames[d]}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          width: '60px',
          height: '1px',
          background: 'rgba(212,168,67,0.3)',
          marginBottom: '48px',
        }}
      />

      {/* CTA Button */}
      <Link
        href="/vector-test/test"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #d4a843 0%, #b8922e 100%)',
          color: '#111628',
          padding: '16px 64px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '2px',
          textDecoration: 'none',
          marginBottom: '24px',
          transition: 'all 0.2s',
          boxShadow: '0 0 40px rgba(212,168,67,0.2), 0 0 80px rgba(212,168,67,0.08)',
        }}
      >
        Начать тест →
      </Link>

      {/* Note */}
      <p
        style={{
          fontSize: '12px',
          color: '#64748b',
          letterSpacing: '0.5px',
          maxWidth: '360px',
          lineHeight: 1.7,
          marginTop: '8px',
        }}
      >
        Отвечай быстро — первый импульс точнее
      </p>

      {/* Back link */}
      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          fontSize: '12px',
          color: '#64748b',
          textDecoration: 'none',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        ← Главная
      </Link>
    </div>
  )
}

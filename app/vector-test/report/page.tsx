'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useVectorTestStore } from '@/store/vectorTestStore'
import { traitData, domainColors, domainNames, domainDescs } from '@/data/vectorTraits'
import type { Domain } from '@/data/vectorTraits'

const DOMAINS: Domain[] = ['impulse', 'sozidanie', 'svyaz', 'navigacia', 'energia', 'rost']

interface TraitScore {
  name: string
  pct: number
  d: Domain
}

export default function VectorTestReport() {
  const { scores } = useVectorTestStore()

  const hasResults = Object.keys(scores).length > 0 && Object.values(scores).some(s => s.a > 0 || s.b > 0)

  const traitScores: TraitScore[] = useMemo(() => {
    return Object.keys(scores)
      .map(name => ({
        name,
        pct: Math.round((scores[name].a / 10) * 100),
        d: (traitData[name]?.d ?? 'rost') as Domain,
      }))
      .sort((a, b) => b.pct - a.pct)
  }, [scores])

  const top5 = traitScores.slice(0, 5)

  const domainAverages: Record<Domain, number> = useMemo(() => {
    const totals: Record<Domain, { sum: number; count: number }> = {} as Record<Domain, { sum: number; count: number }>
    DOMAINS.forEach(d => { totals[d] = { sum: 0, count: 0 } })
    traitScores.forEach(t => {
      totals[t.d].sum += t.pct
      totals[t.d].count += 1
    })
    const avgs = {} as Record<Domain, number>
    DOMAINS.forEach(d => {
      avgs[d] = totals[d].count > 0 ? Math.round(totals[d].sum / totals[d].count) : 0
    })
    return avgs
  }, [traitScores])

  if (!hasResults) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          color: '#f0ede8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          textAlign: 'center',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: '32px', fontFamily: 'Georgia, serif', color: '#7a7870' }}>
          Пройди тест сначала
        </div>
        <Link
          href="/vector-test"
          style={{
            color: '#c9a96e',
            textDecoration: 'none',
            fontSize: '13px',
            letterSpacing: '2px',
            border: '1px solid #c9a96e',
            padding: '12px 32px',
            borderRadius: '2px',
          }}
        >
          К началу
        </Link>
      </div>
    )
  }

  const topTrait = top5[0]
  const topColor = domainColors[topTrait.d]

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '48px 40px 80px',
        background: '#0a0a0f',
        color: '#f0ede8',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div
          style={{
            fontSize: '11px',
            color: '#7a7870',
            letterSpacing: '3px',
            marginBottom: '16px',
          }}
        >
          VECTOR REPORT
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 300,
            letterSpacing: '4px',
            marginBottom: '8px',
          }}
        >
          Твой вектор —
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 500,
            color: topColor,
            letterSpacing: '2px',
          }}
        >
          {topTrait.name}
        </div>
        <div style={{ width: '80px', height: '1px', background: '#232328', margin: '24px auto' }} />
        <div style={{ fontSize: '13px', color: '#7a7870', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
          {traitData[topTrait.name]?.short}
        </div>
      </div>

      {/* Top 5 */}
      <SectionTitle>ТОП-5 ХАРАКТЕРИСТИК</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '56px' }}>
        {top5.map((trait, i) => {
          const color = domainColors[trait.d]
          const data = traitData[trait.name]
          return (
            <div
              key={trait.name}
              style={{
                background: '#13131a',
                borderRadius: '12px',
                border: `1px solid ${i === 0 ? color : '#232328'}`,
                overflow: 'hidden',
              }}
            >
              {/* Bar */}
              <div style={{ height: '3px', background: '#232328' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${trait.pct}%`,
                    background: color,
                    transition: 'width 1.2s cubic-bezier(.4,0,.2,1)',
                  }}
                />
              </div>
              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr auto',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px 24px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '32px',
                    fontWeight: 300,
                    color: '#7a7870',
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '22px',
                      fontWeight: 500,
                      color: '#f0ede8',
                    }}
                  >
                    {trait.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#7a7870', letterSpacing: '2px', marginTop: '2px' }}>
                    {domainNames[trait.d]}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '28px',
                      color,
                    }}
                  >
                    {trait.pct}%
                  </div>
                </div>
              </div>
              {/* Body */}
              {data && (
                <div style={{ padding: '0 24px 24px', borderTop: '1px solid #232328' }}>
                  <p style={{ fontSize: '14px', color: '#b0ada8', lineHeight: 1.75, margin: '20px 0 16px' }}>
                    {data.short}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 500, color: '#7a7870', marginBottom: '8px' }}>
                        СИЛЬНАЯ СТОРОНА
                      </div>
                      <div
                        style={{
                          background: 'rgba(201,169,110,0.06)',
                          borderLeft: '2px solid #c9a96e',
                          padding: '14px 16px',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '12px',
                          color: '#c8c4be',
                          lineHeight: 1.65,
                        }}
                      >
                        {data.positive}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 500, color: '#7a7870', marginBottom: '8px' }}>
                        ТЁМНАЯ СТОРОНА
                      </div>
                      <div
                        style={{
                          background: 'rgba(180,80,80,0.06)',
                          borderLeft: '2px solid rgba(224,92,92,0.4)',
                          padding: '14px 16px',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '12px',
                          color: '#a09898',
                          lineHeight: 1.65,
                        }}
                      >
                        {data.dark}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Domain profile */}
      <SectionTitle>ПРОФИЛЬ ПО ДОМЕНАМ</SectionTitle>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '56px',
        }}
      >
        {DOMAINS.map(d => {
          const color = domainColors[d]
          const avg = domainAverages[d]
          return (
            <div
              key={d}
              style={{
                background: '#13131a',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #232328',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '2px', color, marginBottom: '4px' }}>
                {domainNames[d]}
              </div>
              <div style={{ fontSize: '11px', color: '#7a7870', marginBottom: '14px' }}>
                {domainDescs[d]}
              </div>
              {/* Average bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '4px', background: '#232328', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${avg}%`,
                      background: color,
                      borderRadius: '2px',
                      transition: 'width 1.4s cubic-bezier(.4,0,.2,1)',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#7a7870', minWidth: '36px', textAlign: 'right' }}>
                  {avg}%
                </span>
              </div>
              {/* Traits in domain */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {traitScores
                  .filter(t => t.d === d)
                  .slice(0, 4)
                  .map(t => (
                    <div
                      key={t.name}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span style={{ fontSize: '11px', color: '#7a7870' }}>{t.name}</span>
                      <div style={{ width: '80px', height: '3px', background: '#232328', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${t.pct}%`, background: color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Full ranking */}
      <SectionTitle>ВСЕ 36 ХАРАКТЕРИСТИК — РЕЙТИНГ</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '56px' }}>
        {traitScores.map((trait, i) => {
          const color = domainColors[trait.d]
          const isTop = i < 5
          return (
            <div
              key={trait.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 120px 48px',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#13131a',
                border: `1px solid ${isTop ? color : '#232328'}`,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '11px', color: '#7a7870', textAlign: 'center' }}>
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '17px',
                  color: '#f0ede8',
                }}
              >
                {trait.name}
              </span>
              <div style={{ height: '4px', background: '#232328', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${trait.pct}%`,
                    background: color,
                    borderRadius: '2px',
                    transition: 'width 1.4s cubic-bezier(.4,0,.2,1)',
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: '#7a7870', textAlign: 'right' }}>
                {trait.pct}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Retake */}
      <div style={{ textAlign: 'center' }}>
        <Link
          href="/vector-test"
          style={{
            display: 'inline-block',
            border: '1px solid #232328',
            color: '#7a7870',
            padding: '14px 48px',
            borderRadius: '2px',
            fontSize: '11px',
            letterSpacing: '3px',
            textDecoration: 'none',
          }}
        >
          Пройти заново
        </Link>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '10px',
        color: '#7a7870',
        letterSpacing: '3px',
        fontWeight: 500,
        marginBottom: '24px',
      }}
    >
      {children}
    </div>
  )
}

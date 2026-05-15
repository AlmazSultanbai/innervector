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

  const hasResults =
    Object.keys(scores).length > 0 &&
    Object.values(scores).some(s => s.a > 0 || s.b > 0)

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
    const totals: Record<Domain, { sum: number; count: number }> = {} as Record<
      Domain,
      { sum: number; count: number }
    >
    DOMAINS.forEach(d => {
      totals[d] = { sum: 0, count: 0 }
    })
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
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          textAlign: 'center',
          padding: '40px',
          fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '28px',
            color: '#94a3b8',
          }}
        >
          Пройди тест сначала
        </div>
        <Link
          href="/vector-test"
          style={{
            color: '#d4a843',
            textDecoration: 'none',
            fontSize: '12px',
            letterSpacing: '2px',
            border: '1px solid rgba(212,168,67,0.3)',
            padding: '12px 32px',
            borderRadius: '8px',
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
        padding: '56px 32px 96px',
        color: '#e2e8f0',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div
          style={{
            fontSize: '11px',
            color: '#d4a843',
            letterSpacing: '4px',
            marginBottom: '20px',
            fontWeight: 500,
            opacity: 0.8,
          }}
        >
          INNER VECTOR · РЕЗУЛЬТАТ
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(26px, 4vw, 40px)',
            fontWeight: 400,
            color: '#94a3b8',
            marginBottom: '8px',
            letterSpacing: '1px',
          }}
        >
          Твой вектор —
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 600,
            color: topColor,
            letterSpacing: '1px',
            lineHeight: 1.1,
            textShadow: `0 0 40px ${topColor}44`,
          }}
        >
          {topTrait.name}
        </div>
        <div
          style={{
            width: '60px',
            height: '1px',
            background: 'rgba(212,168,67,0.3)',
            margin: '28px auto',
          }}
        />
        <div
          style={{
            fontSize: '15px',
            color: '#94a3b8',
            lineHeight: 1.7,
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          {traitData[topTrait.name]?.short}
        </div>
      </div>

      {/* Top 5 */}
      <SectionTitle>ТОП-5 ХАРАКТЕРИСТИК</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '64px' }}>
        {top5.map((trait, i) => {
          const color = domainColors[trait.d]
          const data = traitData[trait.name]
          return (
            <div
              key={trait.name}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                border: `1px solid ${i === 0 ? color + '55' : 'rgba(255,255,255,0.08)'}`,
                backdropFilter: 'blur(10px)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Progress bar top */}
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${trait.pct}%`,
                    background: color,
                    transition: 'width 1.2s cubic-bezier(.4,0,.2,1)',
                    boxShadow: `0 0 8px ${color}66`,
                  }}
                />
              </div>

              {/* Header row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr auto',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '22px 28px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '36px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.15)',
                    lineHeight: 1,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '22px',
                      fontWeight: 500,
                      color: '#e2e8f0',
                    }}
                  >
                    {trait.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: color,
                      letterSpacing: '1.5px',
                      marginTop: '3px',
                      opacity: 0.8,
                    }}
                  >
                    {domainNames[trait.d]}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '32px',
                    color: color,
                    lineHeight: 1,
                  }}
                >
                  {trait.pct}%
                </div>
              </div>

              {/* Body */}
              {data && (
                <div
                  style={{
                    padding: '0 28px 28px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      lineHeight: 1.75,
                      margin: '20px 0 16px',
                    }}
                  >
                    {data.short}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          letterSpacing: '2px',
                          fontWeight: 500,
                          color: '#64748b',
                          marginBottom: '8px',
                        }}
                      >
                        СИЛЬНАЯ СТОРОНА
                      </div>
                      <div
                        style={{
                          background: 'rgba(212,168,67,0.06)',
                          borderLeft: '2px solid rgba(212,168,67,0.5)',
                          padding: '14px 16px',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '13px',
                          color: '#cbd5e1',
                          lineHeight: 1.65,
                        }}
                      >
                        {data.positive}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          letterSpacing: '2px',
                          fontWeight: 500,
                          color: '#64748b',
                          marginBottom: '8px',
                        }}
                      >
                        ТЁМНАЯ СТОРОНА
                      </div>
                      <div
                        style={{
                          background: 'rgba(180,80,80,0.06)',
                          borderLeft: '2px solid rgba(224,92,92,0.35)',
                          padding: '14px 16px',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '13px',
                          color: '#94a3b8',
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
          marginBottom: '64px',
        }}
      >
        {DOMAINS.map(d => {
          const color = domainColors[d]
          const avg = domainAverages[d]
          return (
            <div
              key={d}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                  color,
                  marginBottom: '4px',
                }}
              >
                {domainNames[d]}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                {domainDescs[d]}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${avg}%`,
                      background: color,
                      borderRadius: '2px',
                      transition: 'width 1.4s cubic-bezier(.4,0,.2,1)',
                      boxShadow: `0 0 8px ${color}55`,
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '36px', textAlign: 'right' }}>
                  {avg}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {traitScores
                  .filter(t => t.d === d)
                  .slice(0, 4)
                  .map(t => (
                    <div
                      key={t.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{t.name}</span>
                      <div
                        style={{
                          width: '80px',
                          height: '3px',
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${t.pct}%`,
                            background: color,
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Full ranking */}
      <SectionTitle>ВСЕ 36 ХАРАКТЕРИСТИК</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '64px' }}>
        {traitScores.map((trait, i) => {
          const color = domainColors[trait.d]
          const isTop = i < 5
          return (
            <div
              key={trait.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 100px 44px',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 18px',
                borderRadius: '10px',
                background: isTop ? `${color}08` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isTop ? color + '30' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '16px',
                  color: isTop ? '#e2e8f0' : '#94a3b8',
                }}
              >
                {trait.name}
              </span>
              <div
                style={{
                  height: '3px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
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
              <span style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                {trait.pct}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Link
          href="/vector-test"
          style={{
            display: 'inline-block',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            padding: '14px 40px',
            borderRadius: '8px',
            fontSize: '12px',
            letterSpacing: '2px',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          Пройти заново
        </Link>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #d4a843 0%, #b8922e 100%)',
            color: '#111628',
            padding: '14px 40px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '2px',
            textDecoration: 'none',
            boxShadow: '0 0 30px rgba(212,168,67,0.2)',
          }}
        >
          Главная →
        </Link>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '11px',
        color: '#d4a843',
        letterSpacing: '3px',
        fontWeight: 500,
        marginBottom: '20px',
        opacity: 0.7,
      }}
    >
      {children}
    </div>
  )
}

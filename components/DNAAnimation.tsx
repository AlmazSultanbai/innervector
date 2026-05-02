'use client';

import { useMemo } from 'react';

const PERIOD = 9;          // rungs per full rotation
const RUNG_COUNT = 32;     // rungs per segment (doubled for seamless loop)
const RUNG_SPACING = 30;
const CENTER_X = 76;
const AMPLITUDE = 50;
const SVG_WIDTH = 152;
const WRAPPER_W = 290;     // wider than SVG to fit names on both sides
const SEGMENT_H = RUNG_COUNT * RUNG_SPACING;
const NAMES_SPEED = 0.18;  // fast scroll for names

// Domain colors: Executing, Influencing, Relationship, Strategic, gold accent
const PALETTE = [
  { fill: '#60a5fa', shadow: '0 0 8px #3b82f6, 0 0 16px #3b82f640' },
  { fill: '#fb923c', shadow: '0 0 8px #f97316, 0 0 16px #f9731640' },
  { fill: '#34d399', shadow: '0 0 8px #10b981, 0 0 16px #10b98140' },
  { fill: '#a78bfa', shadow: '0 0 8px #8b5cf6, 0 0 16px #8b5cf640' },
  { fill: '#d4a843', shadow: '0 0 8px #d4a843, 0 0 16px #d4a84340' },
];

// Floating strength names alongside the helix
const FLOATING_NAMES = [
  'Strategic', 'Achiever', 'Learner', 'Empathy',
  'Command', 'Futuristic', 'Relator', 'Maximizer',
  'Analytical', 'Positivity', 'Focus', 'Activator',
  'Developer', 'Ideation', 'Woo', 'Belief',
];

interface Rung {
  y: number;
  leftX: number;
  rightX: number;
  rungOpacity: number;
  color: typeof PALETTE[number];
  leftFront: boolean;
  frontR: number;
  backR: number;
  frontOp: number;
  backOp: number;
}

function buildRungs(offset: number): Rung[] {
  return Array.from({ length: RUNG_COUNT }, (_, i) => {
    const idx = offset + i;
    const y = i * RUNG_SPACING + RUNG_SPACING / 2;
    const θ = (idx / PERIOD) * Math.PI * 2;
    const sinθ = Math.sin(θ);
    const leftX = CENTER_X + AMPLITUDE * sinθ;
    const rightX = CENTER_X - AMPLITUDE * sinθ;
    const depth = Math.abs(sinθ);          // 0 = crossing, 1 = max separation
    const leftFront = sinθ >= 0;
    return {
      y,
      leftX,
      rightX,
      rungOpacity: depth * 0.55 + 0.05,
      color: PALETTE[idx % PALETTE.length],
      leftFront,
      frontR: 5 + depth * 2,
      backR: 2.5 + depth * 0.5,
      frontOp: 0.7 + depth * 0.3,
      backOp: 0.2 + depth * 0.15,
    };
  });
}

function RungSet({ rungs, yOffset }: { rungs: Rung[]; yOffset: number }) {
  return (
    <g transform={`translate(0, ${yOffset})`}>
      {rungs.map((r, i) => {
        const BackNode = (
          <circle
            key={`b-${i}`}
            cx={r.leftFront ? r.rightX : r.leftX}
            cy={r.y}
            r={r.backR}
            fill={r.color.fill}
            opacity={r.backOp}
          />
        );
        const Rung = (
          <line
            key={`l-${i}`}
            x1={r.leftX} y1={r.y}
            x2={r.rightX} y2={r.y}
            stroke={r.color.fill}
            strokeWidth={1.2}
            opacity={r.rungOpacity}
          />
        );
        const FrontNode = (
          <circle
            key={`f-${i}`}
            cx={r.leftFront ? r.leftX : r.rightX}
            cy={r.y}
            r={r.frontR}
            fill={r.color.fill}
            opacity={r.frontOp}
            style={{ filter: `drop-shadow(0 0 5px ${r.color.fill}99)` }}
          />
        );
        return [BackNode, Rung, FrontNode];
      })}
    </g>
  );
}

export default function DNAAnimation() {
  const rungs = useMemo(() => buildRungs(0), []);
  const rungs2 = useMemo(() => buildRungs(RUNG_COUNT), []);

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Gallup label */}
      <div className="mb-3 flex items-center gap-2">
        <span className="w-6 h-px bg-gold/30" />
        <span className="text-gold/70 text-xs font-medium tracking-[0.2em] uppercase">Gallup CliftonStrengths®</span>
        <span className="w-6 h-px bg-gold/30" />
      </div>

      {/* Outer wrapper — wide enough for names + helix */}
      <div className="relative" style={{ width: WRAPPER_W, height: 238 }}>

        {/* Helix — centered, clipped, gradient-masked */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: (WRAPPER_W - SVG_WIDTH) / 2,
            width: SVG_WIDTH,
            height: 238,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          }}
        >
          <svg
            width={SVG_WIDTH}
            height={SEGMENT_H * 2}
            style={{ animation: `scrollDNA ${RUNG_COUNT * 0.844}s linear infinite` }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <RungSet rungs={rungs} yOffset={0} />
            <RungSet rungs={rungs2} yOffset={SEGMENT_H} />
          </svg>
        </div>

        {/* Floating names — outside overflow-hidden, full text visible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          }}
        >
          {FLOATING_NAMES.map((name, i) => {
            const isLeft = i % 2 === 0;
            const top = (i / FLOATING_NAMES.length) * 218 + 10;
            const delay = i * 0.4;
            return (
              <span
                key={name}
                className="absolute font-medium text-slate-400"
                style={{
                  fontSize: 9.5,
                  top,
                  ...(isLeft
                    ? { left: 2, textAlign: 'left' }
                    : { right: 2, textAlign: 'right' }),
                  letterSpacing: '0.08em',
                  opacity: 0.48,
                  whiteSpace: 'nowrap',
                  animation: `floatName ${RUNG_COUNT * NAMES_SPEED}s ${delay}s linear infinite`,
                }}
              >
                {name}
              </span>
            );
          })}
        </div>

      </div>

      {/* Domain legend */}
      <div className="mt-4 flex flex-col gap-1.5">
        {[
          { label: 'Executing', color: '#60a5fa' },
          { label: 'Influencing', color: '#fb923c' },
          { label: 'Relationship', color: '#34d399' },
          { label: 'Strategic', color: '#a78bfa' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }} />
            <span className="text-slate-500 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

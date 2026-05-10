'use client';

import { TalentCombination } from '@/lib/types';

const TYPE_CONFIG = {
  signature: {
    label: 'Signature',
    labelRu: 'Подпись',
    labelKy: 'Негизги',
    icon: '✦',
    color: 'border-gold/30 bg-gold/5',
    badge: 'bg-gold/15 text-gold border-gold/30',
    dot: 'bg-gold',
  },
  hidden: {
    label: 'Hidden Power',
    labelRu: 'Скрытая сила',
    labelKy: 'Жашыруун күч',
    icon: '◈',
    color: 'border-violet-500/30 bg-violet-500/5',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    dot: 'bg-violet-400',
  },
  tension: {
    label: 'Tension',
    labelRu: 'Напряжение',
    labelKy: 'Чыңалуу',
    icon: '⚡',
    color: 'border-amber-500/30 bg-amber-500/5',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  sleeper: {
    label: 'Sleeper',
    labelRu: 'Спящий гигант',
    labelKy: 'Уктаган күч',
    icon: '◎',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
};

interface Props {
  combo: TalentCombination;
  lang: string;
}

export default function CombinationCard({ combo, lang }: Props) {
  const cfg = TYPE_CONFIG[combo.type];
  const typeLabel = lang === 'ru' ? cfg.labelRu : lang === 'ky' ? cfg.labelKy : cfg.label;

  const bestLabel = lang === 'ru' ? 'В лучшем виде' : lang === 'ky' ? 'Эң мыктысы' : 'At its best';
  const backfiresLabel = lang === 'ru' ? 'Риск' : lang === 'ky' ? 'Коркунуч' : 'Backfires when';

  return (
    <div className={`card p-5 border ${cfg.color} flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{cfg.icon}</span>
          <div>
            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${cfg.badge}`}>
              {typeLabel}
            </span>
            <h3 className="font-serif text-white text-base font-semibold mt-1">{combo.name}</h3>
          </div>
        </div>
        <span className="text-slate-600 text-[10px] whitespace-nowrap flex-shrink-0 mt-1">{combo.rarity}</span>
      </div>

      {/* Talents */}
      <div className="flex flex-wrap gap-1.5">
        {combo.talents.map((t) => (
          <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-slate-300">
            {t}
          </span>
        ))}
      </div>

      {/* Mechanism */}
      <p className="text-slate-400 text-sm leading-relaxed">{combo.mechanism}</p>

      {/* Best / Backfires */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="rounded-lg bg-white/3 border border-white/6 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">{bestLabel}</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">{combo.atItsBest}</p>
        </div>
        <div className="rounded-lg bg-white/3 border border-white/6 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">{backfiresLabel}</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">{combo.whenItBackfires}</p>
        </div>
      </div>
    </div>
  );
}

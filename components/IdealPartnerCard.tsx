'use client';

import { IdealPartner } from '@/lib/types';
import { getDomainForStrength, DOMAIN_COLORS } from '@/lib/strengths';

const ICONS = ['🤝', '🔍', '⚡', '🌱', '💡'];

export default function IdealPartnerCard({ partner, index }: { partner: IdealPartner; index: number }) {
  return (
    <div className="relative p-5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all duration-200 group">

      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
          {ICONS[index % ICONS.length]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold text-sm">{partner.type}</span>
          </div>
          {/* Strength pills */}
          <div className="flex flex-wrap gap-1">
            {partner.topStrengths.map((s) => {
              const domain = getDomainForStrength(s);
              const colors = domain ? DOMAIN_COLORS[domain] : null;
              return (
                <span
                  key={s}
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs border font-medium ${
                    colors
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {s}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why complement */}
      <p className="text-slate-300 text-sm leading-relaxed mb-3">{partner.whyComplement}</p>

      {/* Dynamic in action */}
      <div className="flex gap-2 p-3 rounded-xl bg-white/3 border border-white/6">
        <span className="text-gold/60 text-xs flex-shrink-0 mt-0.5">▶</span>
        <p className="text-slate-400 text-xs leading-relaxed italic">{partner.dynamicInAction}</p>
      </div>
    </div>
  );
}

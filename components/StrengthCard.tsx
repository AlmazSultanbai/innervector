import { Domain } from '@/lib/types';
import { DOMAIN_COLORS } from '@/lib/strengths';

interface Props {
  name: string;
  domain: Domain;
  rank: number;
  animDelay?: number;
}

export default function StrengthCard({ name, domain, rank, animDelay = 0 }: Props) {
  const colors = DOMAIN_COLORS[domain];
  const delayClass = `delay-${animDelay}`;

  return (
    <div
      className={`card p-4 flex items-center gap-4 animate-slide-in ${delayClass} ${colors.glow} shadow-lg`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold font-serif ${colors.bg} ${colors.text} border ${colors.border} flex-shrink-0`}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold text-base">{name}</div>
        <div className={`text-xs mt-0.5 font-medium ${colors.text} opacity-80`}>{domain}</div>
      </div>
      <div className={`w-2 h-8 rounded-full ${colors.bg} border ${colors.border} opacity-60`} />
    </div>
  );
}

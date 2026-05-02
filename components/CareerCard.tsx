import { Career } from '@/lib/types';

interface Props {
  career: Career;
  rank: number;
  animDelay?: number;
}

export default function CareerCard({ career, rank, animDelay = 0 }: Props) {
  const delayClass = `delay-${animDelay}`;

  return (
    <div className={`card p-5 animate-slide-in ${delayClass} flex gap-4 h-full`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-sm font-serif">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm mb-2">{career.title}</h4>
        <p className="text-slate-400 text-xs leading-relaxed mb-3">{career.whyFits}</p>
        <div className="flex items-start gap-2 bg-gold/5 border border-gold/15 rounded-lg p-2.5">
          <svg className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <p className="text-gold-light text-xs leading-relaxed">{career.firstStep}</p>
        </div>
      </div>
    </div>
  );
}

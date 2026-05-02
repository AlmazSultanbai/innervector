import { FamousPerson } from '@/lib/types';

interface Props {
  person: FamousPerson;
  animDelay?: number;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'from-blue-600 to-blue-800',
  'from-purple-600 to-purple-800',
  'from-emerald-600 to-emerald-800',
  'from-orange-600 to-orange-800',
  'from-rose-600 to-rose-800',
];

export default function FamousPersonCard({ person, animDelay = 0 }: Props) {
  const colorIndex = person.name.charCodeAt(0) % AVATAR_COLORS.length;
  const delayClass = `delay-${animDelay}`;

  return (
    <div className={`card p-5 animate-slide-in ${delayClass} flex flex-col gap-3 h-full`}>
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[colorIndex]} flex items-center justify-center text-white font-bold text-sm font-serif flex-shrink-0`}
        >
          {getInitials(person.name)}
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">{person.name}</div>
          <div className="text-gold text-xs mt-0.5 font-medium">{person.field}</div>
        </div>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed flex-1">{person.whyMatch}</p>
      <div className="pt-3 border-t border-white/8">
        <div className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-gold mt-1.5 flex-shrink-0" />
          <p className="text-slate-300 text-xs leading-relaxed italic">{person.achievement}</p>
        </div>
      </div>
    </div>
  );
}

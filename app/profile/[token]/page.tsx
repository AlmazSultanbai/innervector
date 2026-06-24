'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisResult, Domain } from '@/lib/types';
import { getAnalysisByToken } from '@/lib/supabase';
import { getDomainForStrength, DOMAIN_BADGE_COLORS } from '@/lib/strengths';
import StrengthCard from '@/components/StrengthCard';
import FamousPersonCard from '@/components/FamousPersonCard';
import CareerCard from '@/components/CareerCard';
import CombinationCard from '@/components/CombinationCard';
import IdealPartnerCard from '@/components/IdealPartnerCard';
import Image from 'next/image';

const DOMAIN_ICONS: Record<Domain, string> = {
  Executing: '⚡',
  Influencing: '🔥',
  'Relationship Building': '🌿',
  'Strategic Thinking': '💡',
};

export default function ClientProfilePage() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [lang, setLang] = useState<'en' | 'ru' | 'ky'>('en');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const row = await getAnalysisByToken(token);
      if (!row) { setNotFound(true); setLoading(false); return; }
      const l = row.lang === 'ru' ? 'ru' : row.lang === 'ky' ? 'ky' : 'en';
      setLang(l);
      setStrengths(row.strengths ?? []);
      setFullName(row.full_name ?? '');
      try {
        const cleaned = row.analysis.trim()
          .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        setResult(JSON.parse(cleaned));
        // Gold confetti — only once per token
        const confettiKey = `iv_profile_confetti_${token}`;
        if (!localStorage.getItem(confettiKey)) {
          localStorage.setItem(confettiKey, '1');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3500);
        }
      } catch { setNotFound(true); }

      setLoading(false);
    })();
  }, [token]);

  const labels = {
    en: {
      poweredBy: 'Powered by Inner Vector',
      top5: 'Your Top Strengths',
      superpower: 'Your Superpower',
      interaction: 'How They Interact',
      combinations: 'Talent Combinations',
      blindSpots: 'Blind Spots to Watch',
      famous: 'Famous Strengths Matches',
      careers: 'Career Directions to Explore',
      dominantSuffix: 'Dominant',
      notFound: 'Profile not found',
      notFoundSub: 'This link may be invalid or expired.',
      ctaTitle: 'Ready to activate your talents?',
      ctaButton: 'Start with Vector Coach Daniyar',
      ctaSubtext: 'Daily personalized tasks · Voice reports · Real coaching feedback',
    },
    ru: {
      poweredBy: 'Создано Inner Vector',
      top5: 'Ваши главные сильные стороны',
      superpower: 'Ваша суперсила',
      interaction: 'Как они взаимодействуют',
      combinations: 'Сочетания талантов',
      blindSpots: 'Слепые зоны',
      famous: 'Известные люди с похожим профилем',
      careers: 'Карьерные направления для исследования',
      dominantSuffix: 'Доминирует',
      notFound: 'Профиль не найден',
      notFoundSub: 'Ссылка недействительна или устарела.',
      ctaTitle: 'Готов активировать свои таланты?',
      ctaButton: 'Начать с Вектор Коучем Данияром',
      ctaSubtext: 'Ежедневные задания · Голосовые отчёты · Живой фидбек коуча',
    },
    ky: {
      poweredBy: 'Inner Vector тарабынан түзүлдү',
      top5: 'Сиздин негизги күчтүү жактарыңыз',
      superpower: 'Сиздин суперкүчүңүз',
      interaction: 'Алар кандай өз ара аракеттенет',
      combinations: 'Талант айкалыштары',
      blindSpots: 'Байкалбаган жактар',
      famous: 'Окшош профилдеги белгилүү адамдар',
      careers: 'Изилдөө үчүн карьералык багыттар',
      dominantSuffix: 'Үстөмдүк кылат',
      notFound: 'Профил табылган жок',
      notFoundSub: 'Шилтеме жараксыз же эскирген.',
      ctaTitle: 'Таланттарыңды активдештирүүгө даярсыңбы?',
      ctaButton: 'Вектор Коуч Данияр менен баштоо',
      ctaSubtext: 'Күнүмдүк тапшырмалар · Үн отчёттор · Жандуу коуч пикири',
    },
  };
  const L = labels[lang];
  const domainBadge = result ? DOMAIN_BADGE_COLORS[result.dominantDomain] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-radial flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !result) {
    return (
      <div className="min-h-screen bg-radial flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-serif text-2xl text-white mb-2">{L.notFound}</h1>
          <p className="text-slate-500 text-sm">{L.notFoundSub}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radial">
      {/* Header */}
      <header className="border-b border-white/5 bg-navy-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Inner Vector" width={32} height={32} className="opacity-90 flex-shrink-0" />
            <svg className="w-3 h-3 text-gold/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-xs font-semibold tracking-widest uppercase">
              <span className="text-white">Inner Vector</span>
              <span className="text-gold/40 mx-1.5">·</span>
              <span className="text-gold/60">{lang === 'ru' ? 'Твой внутренний вектор' : lang === 'ky' ? 'Сенин ички векторуң' : 'Your Inner Vector'}</span>
            </span>
          </div>
          {fullName && (
            <span className="text-white font-medium text-sm">{fullName}</span>
          )}
        </div>
      </header>

      {/* Gold confetti — first visit only */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 80 }).map((_, i) => {
            const colors = ['#d4a843','#e8c96a','#f5d878','#b8922a','#ffd700','#c9a227','#ffe066','#a07820'];
            const color = colors[i % colors.length];
            const x = Math.random() * 100;
            const delay = Math.random() * 0.8;
            const duration = 2.2 + Math.random() * 1.2;
            const size = 6 + Math.random() * 8;
            const rotate = Math.random() * 720;
            const shape = i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0%';
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: '-20px',
                  width: `${size}px`,
                  height: `${size * (i % 2 === 0 ? 1 : 0.4)}px`,
                  background: color,
                  borderRadius: shape,
                  animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
                  transform: `rotate(${rotate}deg)`,
                  opacity: 0.9,
                }}
              />
            );
          })}
          <style>{`
            @keyframes confetti-fall {
              0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
              80%  { opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-10 pb-20 space-y-12">

        {/* Hero */}
        <div className="text-center py-4">
          {domainBadge && (
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 ${domainBadge}`}>
              <span>{DOMAIN_ICONS[result.dominantDomain]}</span>
              {result.dominantDomain} {L.dominantSuffix}
            </div>
          )}
          <blockquote className="font-serif text-2xl md:text-3xl text-white leading-relaxed max-w-3xl mx-auto mb-4">
            &ldquo;{result.talentDNA}&rdquo;
          </blockquote>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">{result.domainReason}</p>
        </div>

        {/* Top Strengths */}
        <section>
          <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-gold/40" />
            {L.top5}
            <span className="text-slate-600 text-sm font-sans font-normal">({strengths.length})</span>
            <span className="flex-1 h-px bg-white/5" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {strengths.map((s, i) => {
              const domain = getDomainForStrength(s);
              if (!domain) return null;
              return <StrengthCard key={s} name={s} domain={domain} rank={i + 1} animDelay={i * 80} />;
            })}
          </div>
        </section>

        {/* Superpower + Interaction */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="card p-6 glow-gold border border-gold/20 bg-gold/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs">✦</div>
              <span className="text-gold text-xs font-semibold tracking-widest uppercase">{L.superpower}</span>
            </div>
            <p className="font-serif text-lg text-white leading-relaxed">{result.superpower}</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-xs">◎</div>
              <span className="text-slate-400 text-xs font-semibold tracking-widest uppercase">{L.interaction}</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{result.strengthsInteraction}</p>
          </div>
        </section>

        {/* Talent Combinations */}
        {result.combinations?.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
              <span className="w-6 h-px bg-gold/40" />
              {L.combinations}
              <span className="flex-1 h-px bg-white/5" />
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {result.combinations.map((combo) => (
                <CombinationCard key={combo.type} combo={combo} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Blind Spots */}
        <section>
          <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-gold/40" />
            {L.blindSpots}
            <span className="flex-1 h-px bg-white/5" />
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {result.blindSpots.map((spot, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{spot}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lesser Talents — managing zones (only when full-34 report provided bottom themes) */}
        {result.lesserTalents && result.lesserTalents.themes?.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
              <span className="w-6 h-px bg-gold/40" />
              {lang === 'ru' ? 'Зоны управления (нижние таланты)' : lang === 'ky' ? 'Башкаруу зоналары' : 'Managing Zones (lesser talents)'}
              <span className="flex-1 h-px bg-white/5" />
            </h2>
            <div className="card p-5 mb-3">
              <p className="text-slate-300 text-sm leading-relaxed">{result.lesserTalents.summary}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              {result.lesserTalents.themes.map((lt, i) => (
                <div key={i} className="card p-4">
                  <div className="font-serif text-white font-semibold text-sm mb-2">{lt.name}</div>
                  <div className="mb-2">
                    <div className="text-[10px] tracking-widest text-red-400/60 uppercase font-medium mb-1">{lang === 'ru' ? 'Риск' : lang === 'ky' ? 'Тобокел' : 'Risk'}</div>
                    <p className="text-slate-400 text-xs leading-relaxed">{lt.risk}</p>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-widest text-emerald-400/60 uppercase font-medium mb-1">{lang === 'ru' ? 'Как управлять' : lang === 'ky' ? 'Кантип башкаруу' : 'How to manage'}</div>
                    <p className="text-slate-400 text-xs leading-relaxed">{lt.manage}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-5 border-gold/15">
              <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-2">{lang === 'ru' ? 'Что это даёт твоим топ-талантам' : lang === 'ky' ? 'Топ-таланттарга эмне берет' : 'What this gives your top talents'}</div>
              <p className="text-slate-300 text-sm leading-relaxed">{result.lesserTalents.forTopTalents}</p>
            </div>
          </section>
        )}

        {/* Famous People */}
        <section>
          <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-gold/40" />
            {L.famous}
            <span className="flex-1 h-px bg-white/5" />
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.famousPeople.map((person, i) => (
              <FamousPersonCard key={person.name} person={person} animDelay={i * 100} />
            ))}
          </div>
        </section>

        {/* Careers */}
        <section>
          <h2 className="font-serif text-xl text-white mb-1 flex items-center gap-3">
            <span className="w-6 h-px bg-gold/40" />
            {L.careers}
            <span className="flex-1 h-px bg-white/5" />
          </h2>
          <p className="text-slate-500 text-sm mb-4 ml-9">
            {lang === 'ru'
              ? 'Таланты не определяют профессию — они показывают, в каких ролях и средах ты будешь в своей стихии. Это направления для исследования, не предписание.'
              : lang === 'ky'
              ? 'Таланттар кесипти аныктабайт — алар кайсы ролдордо жана чөйрөлөрдө өзүңдү толук ача аларыңды көрсөтөт. Бул изилдөө үчүн багыттар, буйрук эмес.'
              : "Talents don't determine your profession — they show which roles and environments let you thrive. These are directions to explore, not a prescription."}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {result.careers.map((career, i) => (
              <CareerCard key={career.title} career={career} rank={i + 1} animDelay={i * 100} />
            ))}
          </div>
        </section>

        {/* Ideal Partners */}
        {result.idealPartners?.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-white mb-1 flex items-center gap-3">
              <span className="w-6 h-px bg-gold/40" />
              {lang === 'ru' ? 'Кто дополнит тебя' : lang === 'ky' ? 'Сени ким толуктайт' : 'Who Complements You'}
              <span className="flex-1 h-px bg-white/5" />
            </h2>
            <p className="text-slate-500 text-sm mb-4 ml-9">
              {lang === 'ru'
                ? 'Типы людей, которые закрывают твои слабые зоны — по принципу Gallup: сильное в тебе + сильное в них. Это описание архетипа, а не конкретного человека.'
                : lang === 'ky'
                ? 'Алсыз жактарыңды жабуучу адам типтери — Gallup принциби боюнча: сендеги күч + алардагы күч. Бул архетиптин сүрөттөмөсү, конкреттүү адам эмес.'
                : "Types of people who cover your weak zones — Gallup’s principle: your strength + theirs. A description of an archetype, not a specific person."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.idealPartners.map((partner, i) => (
                <IdealPartnerCard key={partner.type} partner={partner} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Telegram CTA — main action */}
        <section className="py-4">
          <div className="relative rounded-3xl overflow-hidden border border-[#229ED9]/20 bg-gradient-to-br from-[#229ED9]/8 via-[#229ED9]/5 to-transparent p-8 text-center">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#229ED9]/5 to-transparent pointer-events-none" />

            <div className="relative">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 14.55l-2.945-.924c-.64-.203-.654-.64.136-.954l11.49-4.43c.538-.194 1.006.131.843.979z"/>
                </svg>
              </div>

              <h3 className="font-serif text-2xl text-white mb-2">{L.ctaTitle}</h3>
              <p className="text-slate-400 text-sm mb-7">{L.ctaSubtext}</p>

              <a
                href={`https://t.me/innervector_1bot?start=${token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#229ED9] hover:bg-[#1a8bbf] transition-all duration-200 group shadow-lg shadow-[#229ED9]/20"
              >
                <span className="text-white font-semibold text-sm">{L.ctaButton}</span>
                <svg className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-slate-600 text-xs">{L.poweredBy} · innervector.co</p>
        </div>

      </main>
    </div>
  );
}

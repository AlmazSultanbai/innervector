'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { STRENGTHS, DOMAIN_COLORS, getDomainForStrength } from '@/lib/strengths';
import { Domain } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';
import LangToggle from '@/components/LangToggle';
import UploadZone from '@/components/UploadZone';
import DNAAnimation from '@/components/DNAAnimation';
import LoginModal, { useAuth } from '@/components/LoginModal';

const MAX = 10;

const DOMAIN_ORDER: Domain[] = ['Executing', 'Influencing', 'Relationship Building', 'Strategic Thinking'];

const DOMAIN_LABELS_EN: Record<Domain, string> = {
  Executing: 'Executing',
  Influencing: 'Influencing',
  'Relationship Building': 'Relationship Building',
  'Strategic Thinking': 'Strategic Thinking',
};

const DOMAIN_LABELS_RU: Record<Domain, string> = {
  Executing: 'Исполнение',
  Influencing: 'Влияние',
  'Relationship Building': 'Выстраивание отношений',
  'Strategic Thinking': 'Стратегическое мышление',
};

const DOMAIN_LABELS_KY: Record<Domain, string> = {
  Executing: 'Аткаруу',
  Influencing: 'Таасир этүү',
  'Relationship Building': 'Мамиле куруу',
  'Strategic Thinking': 'Стратегиялык ойлоо',
};

type InputMode = 'upload' | 'manual';

export default function HomePage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const { isAuthed: authed, authed: authRole, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [mode, setMode] = useState<InputMode>('upload');
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // Index of currently glowing chip (-1 = none)
  const [glowIndex, setGlowIndex] = useState(-1);
  const [openMethod, setOpenMethod] = useState<string | null>(null);
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const glowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/profile-count')
      .then((r) => r.json())
      .then((d) => setProfileCount(d.count ?? null))
      .catch(() => {});
  }, []);

  const switchMode = (m: InputMode) => {
    setMode(m);
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const domainLabels = lang === 'ru' ? DOMAIN_LABELS_RU : lang === 'ky' ? DOMAIN_LABELS_KY : DOMAIN_LABELS_EN;

  const toggle = useCallback((name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((s) => s !== name);
      if (prev.length >= MAX) return prev;
      return [...prev, name];
    });
  }, []);

  const handleExtracted = useCallback((strengths: string[], fullName?: string, gallupFileUrl?: string) => {
    setSelected(strengths.slice(0, MAX));
    if (fullName?.trim()) {
      const parts = fullName.trim().split(/\s+/);
      setFirstName(parts[0] ?? '');
      setLastName(parts.slice(1).join(' ') ?? '');
    }
    // Store original Gallup file URL in sessionStorage for the analyze step
    if (gallupFileUrl) {
      sessionStorage.setItem('iv_gallup_file_url', gallupFileUrl);
    } else {
      sessionStorage.removeItem('iv_gallup_file_url');
    }
    setMode('manual');
  }, []);

  const goToResults = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const params = new URLSearchParams({ s: selected.join(','), lang, name: fullName });
    sessionStorage.setItem('iv_show_confetti', '1');
    router.push(`/results?${params.toString()}`);
  };

  const handleAnalyze = () => {
    stopGlow();
    if (selected.length < 5) return;
    goToResults();
  };

  // Sequential glow animation when hovering the CTA button
  const startGlow = useCallback(() => {
    if (selected.length < 5) return;
    let idx = 0;
    setGlowIndex(0);
    glowIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % selected.length;
      setGlowIndex(idx);
    }, 180);
  }, [selected]);

  const stopGlow = useCallback(() => {
    if (glowIntervalRef.current) {
      clearInterval(glowIntervalRef.current);
      glowIntervalRef.current = null;
    }
    setGlowIndex(-1);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopGlow(), [stopGlow]);

  const filtered = STRENGTHS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByDomain = DOMAIN_ORDER.reduce<Record<Domain, typeof STRENGTHS>>((acc, domain) => {
    acc[domain] = filtered.filter((s) => s.domain === domain);
    return acc;
  }, {} as Record<Domain, typeof STRENGTHS>);

  const getDomainPillClass = (name: string) => {
    const domain = getDomainForStrength(name);
    if (!domain || !selected.includes(name)) return '';
    const map: Record<Domain, string> = {
      Executing: 'selected-executing',
      Influencing: 'selected-influencing',
      'Relationship Building': 'selected-relationship',
      'Strategic Thinking': 'selected-strategic',
    };
    return map[domain];
  };

  const ready = selected.length >= 5;

  return (
    <div className="min-h-screen bg-radial flex flex-col">
      {showLogin && (
        <LoginModal
          onSuccess={(role, meta) => {
            login(role);
            setShowLogin(false);
            // If client logs in from home page — go to their profile
            if (role === 'client' && meta?.analysis_id) {
              router.push(`/results?id=${meta.analysis_id}`);
            }
          }}
          onClose={() => setShowLogin(false)}
        />
      )}
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-3">

        {/* Left: Admin + History (when authed) */}
        <div className="flex items-center gap-3 flex-1">
          {authed && authRole !== 'client' && (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/25 text-gold text-xs font-semibold hover:bg-gold/20 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => router.push('/history')}
                className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {lang === 'ru' ? 'История' : lang === 'ky' ? 'Тарых' : 'History'}
              </button>
            </>
          )}
        </div>

        {/* Center: Logo */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold tracking-widest uppercase">
            <span className="text-white">Inner Vector</span>
            <span className="text-gold/40 mx-1.5">·</span>
            <span className="text-gold/60">{lang === 'ru' ? 'Твой внутренний вектор' : lang === 'ky' ? 'Сенин ички векторуң' : 'Your Inner Vector'}</span>
          </span>
        </div>

        {/* Right: LangToggle + auth button */}
        {authed ? (
          <div className="flex items-center gap-2 flex-1 justify-end">
            <LangToggle small />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <span className="text-slate-300 text-xs font-medium">vector</span>
            </div>
            <button
              onClick={logout}
              className="text-slate-600 hover:text-red-400 transition-colors"
              title={lang === 'ru' ? 'Выйти' : 'Sign out'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 justify-end">
            <LangToggle small />
            <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium hover:bg-gold/20 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 15l3-3m0 0l-3-3m3 3H2.25" />
            </svg>
            {lang === 'ru' ? 'Войти' : 'Sign In'}
          </button>
          </div>
        )}
      </div>

      {/* Hero: DNA left + text right */}
      <header className="pt-0 pb-8 px-4 -mt-1">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* DNA Animation */}
          <div className="flex-shrink-0 animate-fade-in relative">
            {/* Ambient glow behind helix */}
            <div className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #3b82f6 0%, #8b5cf6 40%, transparent 70%)' }} />
            <DNAAnimation />
          </div>

          {/* Text */}
          <div className="flex-1 text-center lg:text-left animate-slide-in delay-100">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {t.heroTitle1}<br />
              <span className="text-gold-light italic">{t.heroTitle2}</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg lg:max-w-none leading-relaxed mb-6">
              {t.heroSubtitle}
            </p>
            {/* Navigator quote */}
            <p className="text-slate-400 text-sm italic border-l-2 border-gold/30 pl-3 max-w-md">
              {lang === 'ru'
                ? <>&ldquo;Navigator — это не очередной личностный тест. Это система, превращающая самопознание в измеримые действия.&rdquo;</>
                : lang === 'ky'
                ? <>&ldquo;Navigator — бул дагы бир инсандык тест эмес. Бул өз-өзүңдү тааныуну өлчөнүүчү аракетке айландырган система.&rdquo;</>
                : <>&ldquo;Navigator is not another personality assessment — it&apos;s a system designed to turn self-awareness into measurable action.&rdquo;</>
              }
              <span className="block mt-1 not-italic text-gold/50 text-xs">— Inner Vector Methodology</span>
            </p>
          </div>

        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pb-20">

        {/* Scientific foundation */}
        <div className="mb-8 animate-fade-in">
          <p className="text-center text-slate-500 text-xs uppercase tracking-widest mb-3 font-medium">
            {lang === 'ru' ? 'Методология основана на' : lang === 'ky' ? 'Методология негизделген' : 'Methodology based on'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              {
                name: 'Big Five',
                desc: lang === 'ru' ? 'Большая пятёрка' : lang === 'ky' ? 'Беш фактор' : 'Five Factor Model',
                title: lang === 'ru' ? 'Big Five — личностный профиль' : 'Big Five — Personality Profile',
                info: lang === 'ru'
                  ? 'Показывает базовые черты характера: открытость, дисциплину, общительность, мягкость и эмоциональную устойчивость.'
                  : 'Shows core personality traits: openness, conscientiousness, extraversion, agreeableness, and emotional stability.',
              },
              {
                name: 'HEXACO',
                desc: lang === 'ru' ? 'Честность · Смирение' : lang === 'ky' ? 'Чынчылдык · Кичипейилдик' : 'Honesty · Humility',
                title: lang === 'ru' ? 'HEXACO — этичность и социальное поведение' : 'HEXACO — Ethics & Social Behaviour',
                info: lang === 'ru'
                  ? 'Дополняет личностный анализ: показывает честность, скромность, эмоциональность, терпимость и стиль взаимодействия с людьми.'
                  : 'Adds honesty, humility, emotionality, and social interaction style to the personality picture.',
              },
              {
                name: 'SDT',
                desc: lang === 'ru' ? 'Теория самодетерминации' : lang === 'ky' ? 'Өз аныктоо теориясы' : 'Self-Determination Theory',
                title: lang === 'ru' ? 'SDT — мотивация' : 'SDT — Motivation',
                info: lang === 'ru'
                  ? 'Показывает, что даёт человеку внутреннюю энергию: свобода выбора, ощущение роста и связь с людьми.'
                  : 'Reveals what drives inner energy: autonomy, competence, and meaningful connection with others.',
              },
              {
                name: 'RIASEC',
                desc: lang === 'ru' ? 'Типы Холланда' : lang === 'ky' ? 'Холланд коддору' : 'Holland Codes',
                title: lang === 'ru' ? 'RIASEC — карьерные интересы' : 'RIASEC — Career Interests',
                info: lang === 'ru'
                  ? 'Показывает, к каким видам деятельности человек тянется: практическим, аналитическим, творческим, социальным, предпринимательским или системным.'
                  : 'Maps natural interests to activity types: realistic, investigative, artistic, social, enterprising, or conventional.',
              },
            ].map((m) => (
              <div
                key={m.name}
                className="relative"
                onMouseEnter={() => setOpenMethod(m.name)}
                onMouseLeave={() => setOpenMethod(null)}
              >
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-default transition-all duration-200 ${
                  openMethod === m.name
                    ? 'bg-gold/10 border-gold/30 shadow-md'
                    : 'bg-white/4 border-white/8 hover:border-white/15'
                }`}>
                  <span className="text-gold text-xs font-bold">{m.name}</span>
                  <span className="text-slate-500 text-xs">{m.desc}</span>
                </div>
                {openMethod === m.name && (
                  <div className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-navy-800 border border-gold/20 rounded-xl p-4 shadow-xl animate-fade-in">
                    <p className="text-gold text-xs font-semibold mb-1.5">{m.title}</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{m.info}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profile counter */}
        {profileCount !== null && profileCount > 0 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex -space-x-1.5">
              {[
                'bg-gold/80', 'bg-blue-400/70', 'bg-emerald-400/70',
                'bg-purple-400/70', 'bg-rose-400/70',
              ].map((c, i) => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-white/10 ${c}`} />
              ))}
            </div>
            <p className="text-slate-400 text-lg">
              <span className="text-white font-semibold">
                {(profileCount + 36).toLocaleString()}+
              </span>
              {' '}
              {lang === 'ru'
                ? 'человек уже узнали свой вектор'
                : lang === 'ky'
                ? 'адам өз векторун билди'
                : 'people have discovered their vector'}
            </p>
          </div>
        )}

        {/* Mode tabs */}
        <div ref={tabsRef} className="flex gap-2 mb-6 p-1 rounded-xl bg-white/4 border border-white/8 w-fit mx-auto">
          <button
            onClick={() => switchMode('upload')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 active:opacity-80 ${
              mode === 'upload'
                ? 'bg-white/8 text-white border border-white/15'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {t.uploadGallupBtn}
          </button>
          <a
            href="/vector-test"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 active:opacity-80 bg-gold/15 text-gold border border-gold/25 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            {t.tryVectorBtn}
          </a>
        </div>

        {/* Upload mode */}
        {mode === 'upload' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-center text-slate-500 text-sm mb-4">{t.uploadSubtitle}</p>
            <UploadZone onExtracted={handleExtracted} />
          </div>
        )}

        {/* Manual mode */}
        {mode === 'manual' && (
          <div className="animate-fade-in">

            {/* Counter + progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{t.selectCount(selected.length)}</span>
                {selected.length > 0 && (
                  <button onClick={() => setSelected([])} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                    {t.clearAll}
                  </button>
                )}
              </div>
              {/* Rank dots */}
              <div className="flex gap-1.5">
                {Array.from({ length: MAX }).map((_, i) => {
                  const s = selected[i];
                  const domain = s ? getDomainForStrength(s) : null;
                  const colors = domain ? DOMAIN_COLORS[domain] : null;
                  const isGlowing = glowIndex === i;
                  return (
                    <div
                      key={i}
                      title={s ?? ''}
                      className={`flex-1 h-2 rounded-full transition-all duration-150 ${
                        s
                          ? `${colors?.bg} border ${colors?.border} ${isGlowing ? `${colors?.glow} shadow-lg scale-y-150` : ''}`
                          : 'bg-white/5 border border-white/8'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Selected chips */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-xl bg-white/3 border border-white/8">
                {selected.map((s, i) => {
                  const domain = getDomainForStrength(s)!;
                  const colors = DOMAIN_COLORS[domain];
                  const isGlowing = glowIndex === i;
                  return (
                    <button
                      key={s}
                      onClick={() => toggle(s)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${colors.bg} ${colors.text} ${colors.border} hover:opacity-80 ${
                        isGlowing ? `${colors.glow} shadow-lg scale-105` : ''
                      }`}
                    >
                      <span className={`text-xs font-bold ${isGlowing ? 'opacity-100' : 'opacity-50'}`}>{i + 1}</span>
                      {s}
                      <span className="opacity-40 text-base leading-none">×</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold/40 transition-all text-sm"
              />
            </div>

            {/* Strengths grid */}
            <div className="space-y-6">
              {DOMAIN_ORDER.map((domain) => {
                const items = groupedByDomain[domain];
                if (!items.length) return null;
                const colors = DOMAIN_COLORS[domain];
                return (
                  <div key={domain}>
                    <div className={`inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${colors.bg} ${colors.text} border ${colors.border}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {domainLabels[domain]}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {items.map((s) => {
                        const rank = selected.indexOf(s.name);
                        const isSelected = rank !== -1;
                        const isGlowing = glowIndex === rank && isSelected;
                        return (
                          <button
                            key={s.name}
                            onClick={() => toggle(s.name)}
                            disabled={!isSelected && selected.length >= MAX}
                            className={`strength-pill ${getDomainPillClass(s.name)} ${
                              !isSelected && selected.length >= MAX ? 'opacity-30 cursor-not-allowed' : ''
                            } ${isGlowing ? 'scale-105' : ''} transition-transform duration-150`}
                          >
                            {isSelected && (
                              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold transition-all ${
                                isGlowing ? 'bg-current opacity-40' : 'bg-current opacity-20'
                              }`}>
                                {rank + 1}
                              </span>
                            )}
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Name fields — only in manual mode; upload mode extracts name from the file */}
        {mode === 'manual' && <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-slate-400 text-xs font-medium tracking-wide uppercase">
              {lang === 'ru' ? 'Имя клиента — обязательно для PDF и истории' : lang === 'ky' ? 'Кардың аты — PDF жана тарых үчүн талап кылынат' : 'Client name — required for PDF & history'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={lang === 'ru' ? 'Имя' : lang === 'ky' ? 'Аты' : 'First name'}
                className={`w-full rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none transition-all text-sm ${
                  firstName.trim()
                    ? 'bg-white/5 border border-white/10 focus:border-gold/40'
                    : 'bg-gold/5 border border-gold/20 focus:border-gold/50'
                }`}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={lang === 'ru' ? 'Фамилия' : lang === 'ky' ? 'Фамилиясы' : 'Last name'}
                className={`w-full rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none transition-all text-sm ${
                  lastName.trim()
                    ? 'bg-white/5 border border-white/10 focus:border-gold/40'
                    : 'bg-gold/5 border border-gold/20 focus:border-gold/50'
                }`}
              />
            </div>
          </div>
          {!firstName.trim() && !lastName.trim() && (
            <p className="mt-1.5 text-gold/40 text-xs">
              {lang === 'ru' ? '⚠ Введите имя — иначе в PDF и истории будет «Anonymous»' : lang === 'ky' ? '⚠ Атын жазыңыз — антпесе PDF жана тарыхта «Anonymous» болот' : '⚠ Enter a name — otherwise PDF & history will show «Anonymous»'}
            </p>
          )}
        </div>}

        {/* CTA */}
        <div className="mt-6 text-center">
          <button
            onClick={handleAnalyze}
            onMouseEnter={startGlow}
            onMouseLeave={stopGlow}
            disabled={!ready}
            className={`relative inline-flex items-center gap-3 px-6 sm:px-10 py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto justify-center ${
              ready
                ? 'bg-gold text-navy-900 hover:bg-gold-light shadow-lg glow-gold cursor-pointer'
                : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/10'
            }`}
          >
            <span>
              {ready
                ? t.revealBtn
                : mode === 'upload' && selected.length === 0
                  ? t.uploadDrop
                  : t.selectMore(5 - selected.length)}
            </span>
            {ready && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
          {ready && (
            <p className="mt-3 text-slate-500 text-sm">{t.poweredBy}</p>
          )}

        </div>
      </main>

      <footer className="text-center py-6 text-slate-600 text-xs border-t border-white/5">
        {t.footer}
      </footer>
    </div>
  );
}

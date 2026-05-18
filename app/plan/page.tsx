'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PlanResult, PlanTask, TaskCategory } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';
import { Lang } from '@/lib/i18n';

import { getPlan, insertPlan, updatePlanProgress, PlanRecord } from '@/lib/supabase';
import { getDomainForStrength } from '@/lib/strengths';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlanProgress {
  planId: string;          // Supabase row id
  plan: PlanResult;
  completed: number[];
  unlocked: number[];
}

/** Get or create a stable browser session id (localStorage) */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let sid = localStorage.getItem('iv_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('iv_session_id', sid);
  }
  return sid;
}

// ─── Phase config ────────────────────────────────────────────────────────────

const PHASE_CONFIG: Record<TaskCategory, {
  label: Record<Lang, string>;
  phase: number;
  borderClass: string;
  textClass: string;
  badgeBg: string;
  headerBg: string;
}> = {
  awareness: {
    label: { en: 'Awareness', ru: 'Осознание', ky: 'Аң-сезим' },
    phase: 1,
    borderClass: 'border-l-blue-500',
    textClass: 'text-blue-400',
    badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    headerBg: 'from-blue-500/10 to-transparent border-blue-500/30 text-blue-400',
  },
  practice: {
    label: { en: 'Practice', ru: 'Практика', ky: 'Машыгуу' },
    phase: 2,
    borderClass: 'border-l-orange-500',
    textClass: 'text-orange-400',
    badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    headerBg: 'from-orange-500/10 to-transparent border-orange-500/30 text-orange-400',
  },
  challenge: {
    label: { en: 'Challenge', ru: 'Вызов', ky: 'Кыйынчылык' },
    phase: 3,
    borderClass: 'border-l-violet-500',
    textClass: 'text-violet-400',
    badgeBg: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    headerBg: 'from-violet-500/10 to-transparent border-violet-500/30 text-violet-400',
  },
  mastery: {
    label: { en: 'Mastery', ru: 'Мастерство', ky: 'Чеберчилик' },
    phase: 4,
    borderClass: 'border-l-[#d4a843]',
    textClass: 'text-gold',
    badgeBg: 'bg-gold/15 text-gold border-gold/30',
    headerBg: 'from-gold/10 to-transparent border-gold/30 text-gold',
  },
};

// ─── Task card ───────────────────────────────────────────────────────────────

function TaskCard({
  task,
  isCompleted,
  isCurrent,
  isLocked,
  onUnlock,
  lang,
  t,
}: {
  task: PlanTask;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onUnlock: (id: number, key: string) => boolean;
  lang: Lang;
  t: {
    planMarkComplete: string;
    planKeyLabel: string;
    planEnterKey: string;
    planUnlockBtn: string;
    planWrongKey: string;
    planCompleted: string;
    planMission: string;
    planReflect: string;
    planStrengthsActivated: string;
  };
}) {
  const cfg = PHASE_CONFIG[task.category];
  const [keyInput, setKeyInput] = useState('');
  const [wrongKey, setWrongKey] = useState(false);

  const handleUnlock = () => {
    const ok = onUnlock(task.id, keyInput);
    if (!ok) {
      setWrongKey(true);
      setTimeout(() => setWrongKey(false), 2000);
    } else {
      setKeyInput('');
    }
  };

  return (
    <div className={`relative card border-l-4 ${cfg.borderClass} p-0 overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-40' : 'opacity-100'}`}>
      {/* Blurred overlay for locked */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-navy-900/70 backdrop-blur-sm gap-3 p-6">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xl">
            🔒
          </div>
          <p className="text-slate-500 text-xs text-center max-w-xs">
            {lang === 'ru'
              ? 'Введите ключ предыдущего задания'
              : lang === 'ky'
              ? 'Мурунку тапшырманын ачкычын жазыңыз'
              : 'Enter previous task\'s key to unlock'}
          </p>
          <div className="flex gap-2 w-full max-w-xs">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder={t.planEnterKey}
              className={`flex-1 px-3 py-2 rounded-lg bg-white/5 border text-sm text-white placeholder-slate-600 outline-none transition-colors ${
                wrongKey ? 'border-red-500/50 text-red-400' : 'border-white/10 focus:border-gold/40'
              }`}
            />
            <button
              onClick={handleUnlock}
              className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
            >
              {t.planUnlockBtn}
            </button>
          </div>
          {wrongKey && (
            <p className="text-red-400 text-xs animate-fade-in">{t.planWrongKey}</p>
          )}
        </div>
      )}

      {/* Card content (blurred when locked) */}
      <div className={`p-5 ${isLocked ? 'filter blur-sm select-none pointer-events-none' : ''}`}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${cfg.badgeBg}`}>
              {task.dayRange}
            </span>
            <span className="text-[10px] text-slate-500 bg-white/3 border border-white/8 px-2 py-0.5 rounded-full">
              {task.duration}
            </span>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">✓</div>
              <span className="text-emerald-400 text-xs font-medium">{t.planCompleted}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-white text-lg leading-snug mb-2">{task.title}</h3>

        {/* Hook — narrative opening */}
        {task.hook && (
          <p className={`text-sm leading-relaxed italic mb-3 ${cfg.textClass} opacity-90`}>
            &ldquo;{task.hook}&rdquo;
          </p>
        )}

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{task.description}</p>

        {/* Mission block */}
        <div className="rounded-xl bg-white/3 border border-white/6 p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`text-[10px] font-bold tracking-widest uppercase ${cfg.textClass}`}>
              {t.planMission}
            </span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{task.action}</p>
        </div>

        {/* Strengths used */}
        <div className="mb-3">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mr-2">
            {t.planStrengthsActivated}:
          </span>
          <span className="inline-flex flex-wrap gap-1.5 mt-1">
            {task.strengthsUsed.map((s) => (
              <span
                key={s}
                className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400"
              >
                {s}
              </span>
            ))}
          </span>
        </div>

        {/* Reflection */}
        <p className="text-slate-500 text-xs italic leading-relaxed mb-4">
          <span className="text-slate-600 not-italic font-semibold mr-1">{t.planReflect}:</span>
          {task.reflection}
        </p>

        {/* Completed: show key */}
        {isCompleted && (
          <div className="rounded-xl bg-gold/5 border border-gold/20 p-3 flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-400 flex-shrink-0">{t.planKeyLabel}</span>
            <span className="font-mono font-bold text-gold tracking-widest text-sm">{task.unlockKey}</span>
          </div>
        )}

        {/* Current: open in Telegram */}
        {isCurrent && !isCompleted && (
          <a
            href="https://t.me/innervector_1bot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full px-4 py-2.5 rounded-xl bg-[#229ED9] text-white font-semibold text-sm hover:bg-[#1a8bbf] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 14.55l-2.945-.924c-.64-.203-.654-.64.136-.954l11.49-4.43c.538-.194 1.006.131.843.979z"/>
            </svg>
            {lang === 'ru' ? 'Выполнить с Вектор Коучем Данияром' : lang === 'ky' ? 'Данияр менен аткаруу' : 'Complete with Vector Coach Daniyar'}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Phase header ─────────────────────────────────────────────────────────────

function PhaseHeader({ category, lang, planPhase }: { category: TaskCategory; lang: Lang; planPhase: string }) {
  const cfg = PHASE_CONFIG[category];
  return (
    <div className={`flex items-center gap-3 py-3 px-5 rounded-xl bg-gradient-to-r ${cfg.headerBg} border`}>
      <span className={`text-xs font-bold tracking-widest uppercase ${cfg.textClass}`}>
        {planPhase} {cfg.phase} · {cfg.label[lang]}
      </span>
      <div className="flex-1 h-px bg-current opacity-20" />
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = Math.round((completed / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 tabular-nums flex-shrink-0">{completed}/{total}</span>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function PlanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLang();

  const [strengths, setStrengths] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [planLang, setPlanLang] = useState<Lang>('en');
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentCount, setAgentCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const initialized = useRef(false);
  const sessionIdRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const agentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const strengthsRef = useRef<string[]>([]);

  const lsKey = useCallback((s: string[]) => `iv_plan_${s.join(',')}`, []);

  /** Write progress to both localStorage and Supabase */
  const persistProgress = useCallback((updated: PlanProgress, s: string[]) => {
    setProgress({ ...updated });
    // 1. localStorage (instant, no network)
    localStorage.setItem(lsKey(s), JSON.stringify({
      planId: updated.planId,
      plan: updated.plan,
      completed: updated.completed,
      unlocked: updated.unlocked,
    }));
    // 2. Supabase (fire-and-forget)
    if (updated.planId) {
      updatePlanProgress(updated.planId, updated.completed, updated.unlocked);
    }
  }, [lsKey]);

  const fetchAndSavePlan = useCallback(async (s: string[], language: Lang, name: string) => {
    setLoading(true);
    setError(null);
    setElapsed(0);
    setAgentCount(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (agentTimerRef.current) clearInterval(agentTimerRef.current);
    timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    let count = 0;
    agentTimerRef.current = setInterval(() => {
      count += 1;
      setAgentCount(count);
      if (count >= 10 && agentTimerRef.current) clearInterval(agentTimerRef.current);
    }, 2000);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strengths: s, lang: language, full_name: name }),
      });
      if (!res.ok) throw new Error('Failed');
      const plan: PlanResult = await res.json();

      // Save to Supabase
      const planId = await insertPlan({
        session_id: sessionIdRef.current,
        strengths: s,
        lang: language,
        full_name: name,
        plan,
        completed: [],
        unlocked: [1],
      });

      const prog: PlanProgress = { planId: planId ?? '', plan, completed: [], unlocked: [1] };
      // Also cache in localStorage
      localStorage.setItem(lsKey(s), JSON.stringify(prog));
      setProgress(prog);
    } catch {
      setError(language === 'ru'
        ? 'Не удалось создать план. Попробуйте ещё раз.'
        : language === 'ky'
        ? 'Пландоо мүмкүн болгон жок. Кайра аракет кылыңыз.'
        : 'Failed to generate plan. Please try again.');
    } finally {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (agentTimerRef.current) { clearInterval(agentTimerRef.current); agentTimerRef.current = null; }
      setLoading(false);
    }
  }, [lsKey]);

  // Auth check + init
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (typeof window === 'undefined') return;

    const auth = sessionStorage.getItem('mv_auth');
    if (auth !== '1') { router.replace('/'); return; }

    const s = searchParams.get('s');
    if (!s) { router.replace('/'); return; }
    const list = s.split(',').map((x) => x.trim()).filter(Boolean);
    if (list.length < 5) { router.replace('/'); return; }

    const urlLang = searchParams.get('lang') as Lang | null;
    const activeLang: Lang = urlLang === 'ru' ? 'ru' : urlLang === 'ky' ? 'ky' : 'en';
    const name = searchParams.get('name') ?? '';

    setStrengths(list);
    strengthsRef.current = list;
    setFullName(name);
    setPlanLang(activeLang);
    sessionIdRef.current = getSessionId();

    // 1. Supabase — primary source of truth (works from any device)
    getPlan(sessionIdRef.current, list).then((row: PlanRecord | null) => {
      if (row) {
        const prog: PlanProgress = {
          planId: row.id,
          plan: row.plan as PlanResult,
          completed: (row.completed as number[]) ?? [],
          unlocked: (row.unlocked as number[]) ?? [1],
        };
        // Mirror to localStorage as cache
        localStorage.setItem(`iv_plan_${list.join(',')}`, JSON.stringify(prog));
        setProgress(prog);
      } else {
        // 2. If Supabase has nothing, check localStorage (offline fallback)
        const cached = localStorage.getItem(`iv_plan_${list.join(',')}`);
        if (cached) {
          try {
            const prog: PlanProgress = JSON.parse(cached);
            if (prog.plan && prog.completed !== undefined) {
              setProgress(prog);
              return;
            }
          } catch { /* invalid */ }
        }
        // 3. Generate brand new plan
        fetchAndSavePlan(list, activeLang, name);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkComplete = useCallback((id: number) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    if (!progress) return;
    const updated: PlanProgress = {
      ...progress,
      completed: progress.completed.includes(id) ? progress.completed : [...progress.completed, id],
    };
    persistProgress(updated, strengths);
  }, [progress, persistProgress, strengths]);

  const handleUnlock = useCallback((taskId: number, inputKey: string): boolean => {
    if (!progress) return false;
    const prevTask = progress.plan.tasks.find((t) => t.id === taskId - 1);
    if (!prevTask) return false;
    if (inputKey.trim().toUpperCase() !== prevTask.unlockKey.toUpperCase()) return false;
    const updated: PlanProgress = {
      ...progress,
      unlocked: progress.unlocked.includes(taskId) ? progress.unlocked : [...progress.unlocked, taskId],
    };
    persistProgress(updated, strengths);
    return true;
  }, [progress, persistProgress, strengths]);

  const handleRetry = () => {
    fetchAndSavePlan(strengths, planLang, fullName);
  };

  const backUrl = `/results?s=${strengths.join(',')}&lang=${planLang}${fullName ? `&name=${encodeURIComponent(fullName)}` : ''}`;

  // Determine which tasks are first of each phase
  const phaseFirstIds = new Set<number>();
  if (progress) {
    const seen = new Set<string>();
    for (const task of progress.plan.tasks) {
      if (!seen.has(task.category)) {
        seen.add(task.category);
        phaseFirstIds.add(task.id);
      }
    }
  }

  const completedCount = progress?.completed.length ?? 0;
  const totalCount = progress?.plan.tasks.length ?? 15;

  return (
    <div className="min-h-screen bg-radial">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-navy-900/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push(backUrl)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {planLang === 'ru' ? 'Результаты' : planLang === 'ky' ? 'Натыйжалар' : 'Results'}
          </button>

          <div className="text-gold text-xs font-medium tracking-widest uppercase hidden sm:block">
            {t.badge}
          </div>
        </div>

        {/* Progress bar strip */}
        {progress && (
          <div className="border-t border-white/5 px-4 py-2 max-w-3xl mx-auto">
            <ProgressBar completed={completedCount} total={totalCount} />
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 pb-24">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in">
            <div className="spinner-brand" />
            <div className="text-center">
              <p className="text-white font-serif text-2xl mb-2">{t.planLoading}</p>
              <p className="text-slate-500 text-sm">
                <span className="text-emerald-400 font-bold tabular-nums">{agentCount}</span>{' '}
                {planLang === 'ru'
                  ? 'агентов персонализируют ваш план'
                  : planLang === 'ky'
                  ? 'агент планыңызды даярдап жатат'
                  : 'agents personalizing your plan'}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-slate-600 text-xs tabular-nums">
                  {elapsed < 35
                    ? <>{planLang === 'ru' ? 'осталось ~' : planLang === 'ky' ? '~' : '~'}<span className="text-emerald-400/70 font-semibold mx-1">{35 - elapsed}</span>{planLang === 'ru' ? 'сек' : planLang === 'ky' ? 'сек' : 'sec'}</>
                    : <span className="text-emerald-400/50">{planLang === 'ru' ? 'Завершаем...' : planLang === 'ky' ? 'Аяктап жатабыз...' : 'Finishing up...'}</span>
                  }
                </span>
              </div>
            </div>

            {/* Animated strength chips */}
            <div className="flex gap-2 mt-2 flex-wrap justify-center max-w-xl">
              {(strengthsRef.current.length ? strengthsRef.current : strengths).map((s, i) => {
                const domain = getDomainForStrength(s);
                const domainColors: Record<string, { rgb: string }> = {
                  'Executing':            { rgb: '59,130,246'  },
                  'Influencing':          { rgb: '249,115,22'  },
                  'Relationship Building':{ rgb: '16,185,129'  },
                  'Strategic Thinking':   { rgb: '168,85,247'  },
                };
                const color = domain ? (domainColors[domain]?.rgb ?? '212,168,67') : '212,168,67';
                return (
                  <span
                    key={s}
                    className="plan-chip text-xs px-2.5 py-1 rounded-full"
                    style={{ '--chip-color': color, animationDelay: `${i * 288}ms` } as React.CSSProperties}
                  >
                    <span className="chip-dot" style={{ animationDelay: `${i * 288}ms` }} />
                    {s}
                  </span>
                );
              })}
            </div>

            <style>{`
              .plan-chip {
                display: inline-flex; align-items: center; gap: 5px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                color: #64748b;
                animation: chip-scan 2.88s ease-in-out infinite;
              }
              @keyframes chip-scan {
                0%,100% { border-color: rgba(255,255,255,0.08); color: #64748b; background: rgba(255,255,255,0.03); box-shadow: none; }
                20%     { border-color: rgba(var(--chip-color),0.7); color: rgb(var(--chip-color)); background: rgba(var(--chip-color),0.12); box-shadow: 0 0 12px rgba(var(--chip-color),0.3); }
                45%     { border-color: rgba(255,255,255,0.08); color: #94a3b8; background: rgba(255,255,255,0.04); box-shadow: none; }
              }
              .chip-dot {
                width: 5px; height: 5px; border-radius: 50%;
                background: currentColor; opacity: 0.5; flex-shrink: 0;
                animation: dot-pulse 2.88s ease-in-out infinite;
              }
              @keyframes dot-pulse {
                0%,100% { transform: scale(1); opacity: 0.3; }
                20%     { transform: scale(2); opacity: 1; }
                45%     { transform: scale(1); opacity: 0.3; }
              }
            `}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl">!</div>
            <p className="text-white font-serif text-xl text-center px-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 rounded-xl bg-gold text-navy-900 font-semibold hover:bg-gold-light transition-colors text-sm"
            >
              {t.tryAgain}
            </button>
          </div>
        )}

        {/* Plan */}
        {progress && !loading && (
          <div className="space-y-4 animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-4">
                ✦ {t.planTitle}
              </div>
              <h1 className="font-serif text-2xl md:text-3xl text-white mb-3 leading-tight">
                {progress.plan.programTitle}
              </h1>
              <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                {progress.plan.programDescription}
              </p>
            </div>

            {/* Tasks */}
            {progress.plan.tasks.map((task) => {
              const isCompleted = progress.completed.includes(task.id);
              const isUnlocked = progress.unlocked.includes(task.id);
              const isCurrent = isUnlocked && !isCompleted;
              const isLocked = !isUnlocked && !isCompleted;

              return (
                <div key={task.id}>
                  {phaseFirstIds.has(task.id) && (
                    <PhaseHeader category={task.category} lang={planLang} planPhase={t.planPhase} />
                  )}
                  <TaskCard
                    task={task}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isLocked={isLocked}
                    onUnlock={handleUnlock}
                    lang={planLang}
                    t={{
                      planMarkComplete: t.planMarkComplete,
                      planKeyLabel: t.planKeyLabel,
                      planEnterKey: t.planEnterKey,
                      planUnlockBtn: t.planUnlockBtn,
                      planWrongKey: t.planWrongKey,
                      planCompleted: t.planCompleted,
                      planMission: t.planMission,
                      planReflect: t.planReflect,
                      planStrengthsActivated: t.planStrengthsActivated,
                    }}
                  />
                </div>
              );
            })}

            {/* All done */}
            {completedCount === totalCount && totalCount > 0 && (
              <div className="card border border-gold/30 bg-gold/5 p-8 text-center mt-6 animate-fade-in">
                <div className="text-4xl mb-3">🏆</div>
                <h2 className="font-serif text-2xl text-white mb-2">
                  {planLang === 'ru' ? 'Программа завершена!' : planLang === 'ky' ? 'Программа аяктады!' : 'Program Complete!'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {planLang === 'ru'
                    ? 'Вы прошли все 30 дней активации талантов. Вы трансформировали свои сильные стороны в реальные действия.'
                    : planLang === 'ky'
                    ? 'Сиз таланттарды активдештирүүнүн бардык 30 күнүн аяктадыңыз.'
                    : 'You\'ve completed all 30 days of talent activation. Your strengths are now real-world superpowers.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function PlanPage() {
  const { t } = useLang();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-radial flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-slate-400 text-sm">{t.loading}</p>
        </div>
      </div>
    }>
      <PlanContent />
    </Suspense>
  );
}

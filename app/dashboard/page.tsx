'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal, { useAuth } from '@/components/LoginModal';
import { DOMAIN_COLORS, getDomainForStrength } from '@/lib/strengths';
import { Domain } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityDay { date: string; count: number }
interface TopStrength { name: string; count: number }
interface RecentProfile {
  id: string; full_name: string; lang: string;
  created_at: string; share_token: string; strengths_preview: string[];
}
interface BotUserRow {
  tg_id: number; full_name: string | null; streak: number; lang: string;
  last_report_date: string | null; joined_at: string;
  reports_count: number; tasks_completed: number;
}
interface Stats {
  profiles: {
    total: number; todayCount: number; weekCount: number; withPdf: number;
    langCount: Record<string, number>; topStrengths: TopStrength[];
    activity: ActivityDay[]; recent: RecentProfile[];
  };
  bot: {
    totalUsers: number; activeToday: number; activeThisWeek: number;
    totalReports: number; maxStreak: number; avgStreak: number;
    activity: ActivityDay[]; users: BotUserRow[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function fmtDay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date().toISOString().slice(0, 10) === dateStr;
}

const LANG_LABEL: Record<string, string> = { ru: 'RU', ky: 'KY', en: 'EN' };
const LANG_COLOR: Record<string, string> = {
  ru: 'bg-blue-500/20 text-blue-300 border-blue-500/25',
  ky: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25',
  en: 'bg-purple-500/20 text-purple-300 border-purple-500/25',
};

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function BarChart({ data, color = 'bg-gold' }: { data: ActivityDay[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-0.5 h-14">
      {data.map((d) => {
        const pct = Math.round((d.count / max) * 100);
        const today = new Date().toISOString().slice(0, 10) === d.date;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div
              className={`w-full rounded-t transition-all duration-300 ${
                d.count > 0
                  ? today ? 'bg-gold' : color
                  : 'bg-white/5'
              }`}
              style={{ height: `${Math.max(pct, d.count > 0 ? 8 : 3)}%` }}
            />
            {/* tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-navy-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap shadow-xl">
                {fmtDay(d.date)}: <span className="text-gold font-semibold">{d.count}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, accent = 'gold',
}: { label: string; value: string | number; sub?: string; icon: React.ReactNode; accent?: string }) {
  const accentMap: Record<string, string> = {
    gold: 'bg-gold/10 border-gold/20 text-gold',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${accentMap[accent] ?? accentMap.gold}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-slate-400 text-xs mt-0.5 font-medium">{label}</div>
        {sub && <div className="text-slate-600 text-xs mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-white font-semibold text-sm">{title}</h2>
        {sub && <p className="text-slate-500 text-xs">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthed, authed: authRole, authLoading, login, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'profiles' | 'bot'>('profiles');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await fetch('/api/superadmin/stats');
      if (res.status === 401) {
        // Server cookie expired (8h) while sessionStorage still says
        // logged in — drop client auth so the login modal reappears.
        logout();
        return;
      }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStats(data);
    } catch {
      setError('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authLoading) return;
    // Paying clients have no access to the dashboard — send them home
    if (authRole === 'client') { router.replace('/'); return; }
    if (isAuthed) load();
  }, [authLoading, isAuthed, authRole, router, load]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-radial flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // Not logged in (fresh tab — sessionStorage is empty): show login right
  // here instead of silently bouncing to the home page.
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-radial">
        <LoginModal
          onSuccess={(role) => {
            if (role === 'client') { router.replace('/'); return; }
            login(role);
          }}
          onClose={() => router.push('/')}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-radial flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-radial flex items-center justify-center">
        <div className="text-slate-400 text-sm">{error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const { profiles, bot } = stats;
  const totalLang = Object.values(profiles.langCount).reduce((s, n) => s + n, 0) || 1;

  return (
    <div className="min-h-screen bg-radial">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-navy-900/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-slate-500 hover:text-gold transition-colors"
              title="Назад"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white text-sm font-semibold">Dashboard</span>
              <span className="px-1.5 py-0.5 rounded-md bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold tracking-wide">SUPER</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/4 border border-white/8">
              {(['profiles', 'bot'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === t
                      ? 'bg-gold/15 text-gold border border-gold/25'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t === 'profiles' ? 'Профили' : 'Агент'}
                </button>
              ))}
            </div>

            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-gold transition-colors disabled:opacity-50"
              title="Обновить"
            >
              <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={() => router.push('/admin')}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs transition-colors"
            >
              История
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8 space-y-8">

        {/* ══ PROFILES TAB ══════════════════════════════════════════════════ */}
        {tab === 'profiles' && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Всего профилей"
                value={profiles.total}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                accent="gold"
              />
              <StatCard
                label="Сегодня"
                value={profiles.todayCount}
                sub="новых анализов"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" /></svg>}
                accent="emerald"
              />
              <StatCard
                label="За 7 дней"
                value={profiles.weekCount}
                sub="новых анализов"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                accent="blue"
              />
              <StatCard
                label="С Gallup PDF"
                value={profiles.withPdf}
                sub={`${Math.round((profiles.withPdf / Math.max(profiles.total, 1)) * 100)}% от всех`}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                accent="purple"
              />
            </div>

            {/* Activity chart + lang breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chart */}
              <div className="md:col-span-2 rounded-2xl border border-white/8 bg-white/3 p-5">
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  title="Активность за 14 дней"
                  sub="Новые профили по дням"
                />
                <BarChart data={profiles.activity} color="bg-blue-500/60" />
                <div className="flex justify-between mt-2">
                  <span className="text-slate-700 text-xs">{fmtDay(profiles.activity[0]?.date ?? '')}</span>
                  <span className="text-slate-700 text-xs">{fmtDay(profiles.activity[profiles.activity.length - 1]?.date ?? '')}</span>
                </div>
              </div>

              {/* Lang breakdown */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>}
                  title="По языкам"
                />
                <div className="space-y-3 mt-2">
                  {(['ru', 'ky', 'en'] as const).map((l) => {
                    const cnt = profiles.langCount[l] ?? 0;
                    const pct = Math.round((cnt / totalLang) * 100);
                    return (
                      <div key={l}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${LANG_COLOR[l]}`}>{LANG_LABEL[l]}</span>
                          <span className="text-slate-300 text-xs font-medium">{cnt} <span className="text-slate-600">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              l === 'ru' ? 'bg-blue-500' : l === 'ky' ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top strengths + recent profiles */}
            <div className="grid md:grid-cols-2 gap-4">

              {/* Top strengths */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 h0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                  title="Топ таланты (позиции 1–3)"
                  sub="Наиболее частые у клиентов"
                />
                <div className="space-y-2">
                  {profiles.topStrengths.map((s, i) => {
                    const domain = getDomainForStrength(s.name) as Domain | null;
                    const colors = domain ? DOMAIN_COLORS[domain] : null;
                    const maxCnt = profiles.topStrengths[0]?.count ?? 1;
                    return (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="text-slate-600 text-xs w-4 text-right flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs font-medium ${colors?.text ?? 'text-slate-300'}`}>{s.name}</span>
                            <span className="text-slate-500 text-xs">{s.count}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors?.bg ?? 'bg-white/20'}`}
                              style={{ width: `${Math.round((s.count / maxCnt) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {profiles.topStrengths.length === 0 && (
                    <p className="text-slate-600 text-xs text-center py-4">Нет данных</p>
                  )}
                </div>
              </div>

              {/* Recent profiles */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <SectionHeader
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  title="Последние профили"
                />
                <div className="space-y-2">
                  {profiles.recent.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/results?id=${p.id}`)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                        {(p.full_name ?? '?')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-200 text-xs font-medium truncate">{p.full_name}</span>
                          <span className={`px-1 py-0.5 rounded text-[9px] font-bold border flex-shrink-0 ${LANG_COLOR[p.lang] ?? LANG_COLOR.en}`}>{LANG_LABEL[p.lang] ?? p.lang}</span>
                        </div>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {p.strengths_preview.map((s) => {
                            const dom = getDomainForStrength(s) as Domain | null;
                            const c = dom ? DOMAIN_COLORS[dom] : null;
                            return (
                              <span key={s} className={`text-[9px] px-1 py-0.5 rounded border ${c?.bg ?? 'bg-white/5'} ${c?.text ?? 'text-slate-400'} ${c?.border ?? 'border-white/10'}`}>{s}</span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-slate-600 text-[10px] flex-shrink-0 group-hover:text-slate-400 transition-colors">
                        {fmtDate(p.created_at)}
                      </div>
                    </div>
                  ))}
                  {profiles.recent.length === 0 && (
                    <p className="text-slate-600 text-xs text-center py-4">Профилей нет</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ BOT TAB ═══════════════════════════════════════════════════════ */}
        {tab === 'bot' && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Пользователей бота"
                value={bot.totalUsers}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                accent="gold"
              />
              <StatCard
                label="Активны сегодня"
                value={bot.activeToday}
                sub="сдали отчёт"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                accent="emerald"
              />
              <StatCard
                label="Всего отчётов"
                value={bot.totalReports}
                sub="выполнено заданий"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                accent="blue"
              />
              <StatCard
                label="Макс. стрик"
                value={`${bot.maxStreak} 🔥`}
                sub={`ср. стрик: ${bot.avgStreak}`}
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>}
                accent="rose"
              />
            </div>

            {/* Bot activity chart */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <SectionHeader
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                title="Активность агента за 14 дней"
                sub="Количество отчётов от пользователей по дням"
              />
              <BarChart data={bot.activity} color="bg-emerald-500/60" />
              <div className="flex justify-between mt-2">
                <span className="text-slate-700 text-xs">{fmtDay(bot.activity[0]?.date ?? '')}</span>
                <span className="text-slate-700 text-xs">{fmtDay(bot.activity[bot.activity.length - 1]?.date ?? '')}</span>
              </div>
            </div>

            {/* Users table */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 overflow-x-auto">
              <SectionHeader
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                title="Участники программы"
                sub="30-дневный курс Inner Vector Agent"
              />
              <div className="space-y-2">
                {bot.users.map((u) => {
                  const progress = Math.min(Math.round((u.tasks_completed / 30) * 100), 100);
                  const filled = Math.round((u.tasks_completed / 30) * 10);
                  const progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);
                  const activeNow = isToday(u.last_report_date);
                  return (
                    <div key={u.tg_id} className="p-3.5 rounded-xl bg-white/2 border border-white/6 hover:border-white/12 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          activeNow ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border border-white/10 text-slate-400'
                        }`}>
                          {u.full_name ? u.full_name[0].toUpperCase() : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200 text-sm font-medium">{u.full_name ?? <span className="text-slate-600 italic">Без профиля</span>}</span>
                              {activeNow && (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[9px] font-semibold">Активен сегодня</span>
                              )}
                              {u.streak > 0 && (
                                <span className="text-orange-400 text-xs font-bold">{u.streak}🔥</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{u.tasks_completed}<span className="text-slate-700">/30</span></span>
                              <span>{u.reports_count} отчётов</span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progress >= 100 ? 'bg-gold' : progress > 50 ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-slate-600 text-[10px] font-mono whitespace-nowrap">{progressBar}</span>
                            <span className="text-slate-600 text-[10px]">{progress}%</span>
                          </div>
                          {/* Meta row */}
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className={`px-1 py-0.5 rounded text-[9px] font-bold border ${LANG_COLOR[u.lang] ?? LANG_COLOR.en}`}>{LANG_LABEL[u.lang] ?? u.lang}</span>
                            {u.last_report_date && (
                              <span className="text-slate-600 text-[10px]">
                                последний отчёт: {new Date(u.last_report_date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                            {!u.last_report_date && (
                              <span className="text-slate-700 text-[10px] italic">отчётов нет</span>
                            )}
                            <span className="text-slate-700 text-[10px]">
                              подключился {new Date(u.joined_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {bot.users.length === 0 && (
                  <p className="text-slate-600 text-xs text-center py-8">Нет пользователей бота</p>
                )}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

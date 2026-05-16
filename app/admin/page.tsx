'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Analysis } from '@/lib/supabase';
import { getDomainForStrength, DOMAIN_COLORS } from '@/lib/strengths';
import { useAuth } from '@/components/LoginModal';
import { domainColors } from '@/data/vectorTraits';

interface VectorTestRow {
  id: string;
  session_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  test_mode?: string;
  lang?: string;
  top5: Array<{ name: string; pct: number; d: string }>;
  completed_at: string;
  share_token: string;
  retake_count?: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

type AdminTab = 'gallup' | 'vector';

export default function AdminPage() {
  const router = useRouter();
  const { authed } = useAuth();
  const [tab, setTab] = useState<AdminTab>('vector');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [vectorResults, setVectorResults] = useState<VectorTestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authed === null) return;
    if (!authed || authed === 'client') { router.replace('/'); return; }
    Promise.all([
      supabase.from('analyses').select('*').order('created_at', { ascending: false }),
      supabase.from('vector_test_results').select('id,session_id,full_name,email,phone,test_mode,lang,top5,completed_at,share_token,retake_count').order('completed_at', { ascending: false }),
    ]).then(([gallupRes, vectorRes]) => {
      setAnalyses(gallupRes.data ?? []);
      setVectorResults(vectorRes.data ?? []);
      setLoading(false);
    });
  }, [authed, router]);

  if (authed === null || loading) return <div className="min-h-screen bg-radial" />;

  const filtered = analyses.filter((a) =>
    (a.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredVector = vectorResults.filter((a) =>
    (a.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Gallup stats
  const total = analyses.length;
  const byLang = { en: 0, ru: 0, ky: 0 };
  analyses.forEach((a) => { if (a.lang in byLang) byLang[a.lang as keyof typeof byLang]++; });
  const today = analyses.filter((a) =>
    a.created_at && new Date(a.created_at).toDateString() === new Date().toDateString()
  ).length;
  const withName = analyses.filter((a) => a.full_name?.trim()).length;

  // Vector stats
  const vtTotal = vectorResults.length;
  const vtToday = vectorResults.filter((a) =>
    a.completed_at && new Date(a.completed_at).toDateString() === new Date().toDateString()
  ).length;
  const vtFull = vectorResults.filter((a) => a.test_mode === 'full').length;
  const vtExpress = vectorResults.filter((a) => a.test_mode === 'express').length;

  const copyClientLink = (token: string, id: string) => {
    const url = `${window.location.origin}/profile/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const copyVectorLink = (token: string, id: string) => {
    const url = `${window.location.origin}/vector-profile/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-radial">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-navy-900/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
            <span className="text-white/10">|</span>
            <span className="text-gold text-xs font-bold tracking-widest uppercase">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-xs font-medium hover:bg-gold/20 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
            <span className="text-slate-500 text-xs">Inner Vector · {total + vtTotal} записей</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8 w-fit">
          {([['vector', '⚡ Vector Test', vtTotal], ['gallup', '🎯 Gallup', total]] as const).map(([id, label, count]) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={tab === id
                ? { background: 'rgba(212,168,67,0.15)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.25)' }
                : { color: 'rgba(148,163,184,0.6)', border: '1px solid transparent' }
              }>
              {label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: tab === id ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.05)', color: tab === id ? '#d4a843' : 'rgba(100,116,139,0.8)' }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── VECTOR TEST section ──────────────────────────────────────────── */}
        {tab === 'vector' && (
          <div>
            {/* Vector stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Всего тестов', value: vtTotal, color: 'text-white' },
                { label: 'Сегодня', value: vtToday, color: 'text-emerald-400' },
                { label: 'Full', value: vtFull, color: 'text-gold' },
                { label: 'Express', value: vtExpress, color: 'text-blue-400' },
              ].map((s) => (
                <div key={s.label} className="card p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{s.label}</p>
                  <p className={`font-serif text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search + list */}
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <h2 className="font-serif text-xl text-white">Vector Test результаты</h2>
              <div className="relative">
                <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по имени..."
                  className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold/40 text-sm w-full sm:w-52"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredVector.map((a, idx) => {
                const top5 = a.top5 ?? [];
                const isCopied = copiedId === a.id;
                return (
                  <div key={a.id ?? idx}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-white font-semibold text-sm">
                          {a.full_name?.trim() || <span className="text-slate-600 italic">Anonymous</span>}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                          a.lang === 'ru' ? 'bg-blue-500/15 text-blue-400' :
                          a.lang === 'ky' ? 'bg-violet-500/15 text-violet-400' :
                          'bg-white/8 text-slate-400'
                        }`}>{(a.lang ?? 'ru').toUpperCase()}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                          a.test_mode === 'full' ? 'bg-gold/15 text-gold' : 'bg-blue-400/15 text-blue-400'
                        }`}>{a.test_mode ?? 'full'}</span>
                        {a.email && <span className="text-slate-600 text-xs">{a.email}</span>}
                        <span className="text-slate-600 text-xs">{a.completed_at ? formatDate(a.completed_at) : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {top5.map((tr, i) => {
                          const color = domainColors[tr.d as keyof typeof domainColors] ?? '#888'
                          return (
                            <span key={tr.name} title={`${i + 1}. ${tr.name}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border"
                              style={{ color, borderColor: color + '40', background: color + '12' }}>
                              <span className="opacity-50 text-[10px] font-bold">{i + 1}</span>
                              {tr.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-wrap items-center gap-2">
                      <button onClick={() => a.share_token && copyVectorLink(a.share_token, a.id)}
                        disabled={!a.share_token}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isCopied
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                            : 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/15'
                        } disabled:opacity-30`}>
                        {isCopied ? (
                          <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Скопировано</>
                        ) : (
                          <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>Ссылка</>
                        )}
                      </button>
                      <button onClick={() => router.push(`/vector-profile/${a.share_token}`)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10 hover:text-white transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Открыть
                      </button>
                    </div>
                  </div>
                )
              })}
              {filteredVector.length === 0 && (
                <div className="text-center py-12 text-slate-600 text-sm">Нет результатов</div>
              )}
            </div>
          </div>
        )}

        {/* ── GALLUP section ───────────────────────────────────────────────── */}
        {tab === 'gallup' && (
        <div>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Всего анализов', value: total, color: 'text-white' },
            { label: 'Сегодня', value: today, color: 'text-emerald-400' },
            { label: 'С именем', value: withName, color: 'text-gold' },
            { label: 'EN / RU / KY', value: `${byLang.en} / ${byLang.ru} / ${byLang.ky}`, color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`font-serif text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + list */}
        <div>
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <h2 className="font-serif text-xl text-white">Все профили</h2>
            <div className="relative">
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по имени..."
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold/40 text-sm w-full sm:w-52"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map((a, idx) => {
              const strengths: string[] = a.strengths ?? [];
              const isCopied = copiedId === a.id;

              return (
                <div
                  key={a.id ?? idx}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all"
                >
                  {/* Index */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xs font-bold">
                    {idx + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-white font-semibold text-sm">
                        {a.full_name?.trim() || <span className="text-slate-600 italic">Anonymous</span>}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                        a.lang === 'ru' ? 'bg-blue-500/15 text-blue-400' :
                        a.lang === 'ky' ? 'bg-violet-500/15 text-violet-400' :
                        'bg-white/8 text-slate-400'
                      }`}>{(a.lang ?? 'en').toUpperCase()}</span>
                      <span className="text-slate-600 text-xs">{a.created_at ? formatDate(a.created_at) : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {strengths.slice(0, 10).map((s, i) => {
                        const domain = getDomainForStrength(s);
                        const colors = domain ? DOMAIN_COLORS[domain] : null;
                        return (
                          <span key={s} title={`${i + 1}. ${s}`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${colors ? `${colors.bg} ${colors.text} ${colors.border}` : 'bg-white/5 text-slate-400 border-white/10'}`}>
                            <span className="opacity-50 text-[10px] font-bold">{i + 1}</span>
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-wrap items-center gap-2">
                    {/* Copy client link */}
                    <button
                      onClick={() => a.share_token && copyClientLink(a.share_token, a.id!)}
                      disabled={!a.share_token}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isCopied
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                          : 'bg-emerald-500/8 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/15'
                      } disabled:opacity-30`}
                      title="Скопировать ссылку клиента"
                    >
                      {isCopied ? (
                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Скопировано</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>Клиент</>
                      )}
                    </button>

                    {/* View profile */}
                    <button
                      onClick={() => router.push(`/results?id=${a.id}&lang=${a.lang ?? 'en'}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Открыть
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
        )}

      </main>
    </div>
  );
}

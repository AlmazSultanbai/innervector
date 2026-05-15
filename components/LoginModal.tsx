'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mv_auth';

// authed: null = loading, false = not logged in, true = admin, 'super' = superadmin, 'client' = paying client
export function useAuth() {
  const [authed, setAuthed] = useState<boolean | null | 'super' | 'client'>(null);

  useEffect(() => {
    const v = sessionStorage.getItem(STORAGE_KEY);
    setAuthed(v === 'super' ? 'super' : v === 'client' ? 'client' : v === '1' ? true : false);
  }, []);

  const login = (role: 'admin' | 'superadmin' | 'client') => {
    const val = role === 'superadmin' ? 'super' : role === 'client' ? 'client' : '1';
    sessionStorage.setItem(STORAGE_KEY, val);
    setAuthed(role === 'superadmin' ? 'super' : role === 'client' ? 'client' : true);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  };

  const isSuperAdmin = authed === 'super';
  const isAuthed = authed === true || authed === 'super' || authed === 'client';
  const authLoading = authed === null;

  return { authed, isAuthed, isSuperAdmin, authLoading, login, logout };
}

interface AuthMeta { analysis_id?: string; share_token?: string; telegram_id?: number }

export default function LoginModal({ onSuccess, onClose }: { onSuccess: (role: 'admin' | 'superadmin' | 'client', meta?: AuthMeta) => void; onClose?: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError('Неверный логин или пароль');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      } else {
        onSuccess(data.role as 'admin' | 'superadmin' | 'client', {
          analysis_id: data.analysis_id,
          share_token: data.share_token,
          telegram_id: data.telegram_id,
        });
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop — click to reopen card if dismissed */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => setDismissed(false)}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(26,31,53,0.85) 0%, rgba(10,13,20,0.92) 100%)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      />

      {/* Modal card — hidden when dismissed, click backdrop to restore */}
      <div
        className={`relative w-full max-w-sm mx-4 transition-all duration-300 ${shake ? 'animate-shake' : ''} ${dismissed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 24,
          boxShadow: '0 0 60px rgba(212,168,67,0.08), 0 24px 80px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)' }}
        />

        {/* Close — returns to main page */}
        <button
          onClick={() => onClose ? onClose() : setDismissed(true)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 text-slate-500 hover:text-white"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          aria-label="Close"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 pt-10 pb-8">
          {/* Logo mark */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'rgba(212,168,67,0.10)',
                border: '1px solid rgba(212,168,67,0.25)',
                boxShadow: '0 0 24px rgba(212,168,67,0.12)',
              }}
            >
              <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-white font-semibold mb-1">С возвращением</h2>
            <p className="text-slate-500 text-sm">Войдите с логином из Telegram</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5 tracking-wide uppercase">
                Логин
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Введите логин"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                onBlur={e => (e.target.style.borderColor = error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5 tracking-wide uppercase">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Введите пароль"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,168,67,0.4)')}
                  onBlur={e => (e.target.style.borderColor = error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/20">
                <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="text-red-400 text-xs">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 text-navy-900 flex items-center justify-center gap-2 disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #d4a843 0%, #e8c96a 100%)',
                boxShadow: '0 0 24px rgba(212,168,67,0.25)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 36px rgba(212,168,67,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 24px rgba(212,168,67,0.25)')}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
              ) : null}
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          30%       { transform: translateX(8px); }
          45%       { transform: translateX(-6px); }
          60%       { transform: translateX(6px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
        .animate-shake { animation: shake 0.55s ease; }
      `}</style>
    </div>
  );
}

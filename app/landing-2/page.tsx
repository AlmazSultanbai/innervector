'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ── Trial light B2B landing — separate route, live site untouched ──────────────
// Positioning: Inner Vector for teams & HR. Original clean-SaaS layout, Inner
// Vector's own brand (emerald growth accent + navy), not a copy of any vendor.

const DOMAINS = [
  { key: 'exec', label: 'Реализация', color: '#e0a040', desc: 'Кто доводит до результата' },
  { key: 'infl', label: 'Влияние', color: '#f0a500', desc: 'Кто ведёт и убеждает' },
  { key: 'rel', label: 'Отношения', color: '#5bc8af', desc: 'Кто держит команду вместе' },
  { key: 'think', label: 'Мышление', color: '#7b9fff', desc: 'Кто видит стратегию' },
]

const TABS = [
  {
    key: 'hire',
    label: 'Подбор',
    title: 'Нанимай по сильным сторонам, а не по резюме',
    body: 'Видишь, какие таланты кандидата реально усилят команду, а где будут слепые зоны. Меньше ошибок найма, быстрее адаптация.',
    points: ['Профиль из 34 талантов за 10 минут', 'Совместимость с текущей командой', 'Роли, где человек в своей стихии'],
  },
  {
    key: 'team',
    label: 'Команда',
    title: 'Собери карту талантов всей команды',
    body: 'Кто двигатель, кто стратег, кто держит людей вместе. Находишь дыры в составе и дубли — до того, как они станут проблемой.',
    points: ['Баланс 4 доменов в команде', 'Кто кого дополняет', 'Где команде не хватает силы'],
  },
  {
    key: 'grow',
    label: 'Развитие',
    title: 'Личный AI-коуч для каждого сотрудника',
    body: 'Данияр ведёт 30-дневную программу в Telegram — персональные задания на основе талантов человека. Развитие без HR-нагрузки.',
    points: ['Ежедневные задания под профиль', 'Голосовые отчёты и обратная связь', 'Прогресс виден руководителю'],
  },
]

const STEPS = [
  { n: '01', t: 'Сотрудник проходит тест', d: '68 вопросов, 10–15 минут. Никакой подготовки.' },
  { n: '02', t: 'AI строит профиль', d: 'Портрет, сильные стороны, слепые зоны, карьерные направления.' },
  { n: '03', t: 'Команда получает карту', d: 'Видишь состав, совместимость и точки роста каждого.' },
]

export default function LandingTrial() {
  const [tab, setTab] = useState(0)
  const active = TABS[tab]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Inner Vector" width={30} height={30} />
            <span className="font-semibold text-lg tracking-tight text-slate-900">Inner Vector</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#product" className="hover:text-slate-900 transition-colors">Продукт</a>
            <a href="#how" className="hover:text-slate-900 transition-colors">Как это работает</a>
            <a href="#coach" className="hover:text-slate-900 transition-colors">Коуч</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/vector-test" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Войти
            </Link>
            <Link href="/vector-test"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: '#10b981' }}>
              Пройти тест
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 45%, #eff6ff 100%)' }} />
        <div className="relative max-w-4xl mx-auto px-5 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Платформа анализа талантов для команд
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-slate-900 mb-6">
            Собери команду<br />по сильным сторонам
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-9 leading-relaxed">
            Inner Vector раскрывает таланты каждого сотрудника и показывает, как из них собрать сильную команду. На основе методологии 34 талантов и AI-анализа.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/vector-test"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md"
              style={{ background: '#10b981' }}>
              Пройти тест бесплатно
            </Link>
            <a href="#product"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 transition-all">
              Как это работает
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-5">Без карты · результат сразу · 3 языка</p>
        </div>

        {/* Domain preview strip */}
        <div className="relative max-w-4xl mx-auto px-5 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DOMAINS.map(d => (
              <div key={d.key} className="rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm">
                <div className="w-9 h-9 rounded-lg mb-3 flex items-center justify-center"
                  style={{ background: d.color + '18' }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                </div>
                <div className="font-semibold text-slate-900 text-sm">{d.label}</div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product tabs */}
      <section id="product" className="max-w-5xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Одна платформа — весь путь таланта
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">От найма до развития каждого человека в команде.</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-center gap-1 p-1 mb-10 rounded-xl bg-slate-100 max-w-md mx-auto">
          {TABS.map((t, i) => (
            <button key={t.key} onClick={() => setTab(i)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={tab === i
                ? { background: '#fff', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                : { color: '#64748b' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">{active.title}</h3>
            <p className="text-slate-600 leading-relaxed mb-6">{active.body}</p>
            <ul className="space-y-3">
              {active.points.map(p => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Mock preview card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-600 text-sm">МА</div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Махабат А.</div>
                <div className="text-xs text-slate-500">Профиль талантов</div>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { n: 'Фокус', d: '#e0a040', w: 92 },
                { n: 'Уверенность', d: '#f0a500', w: 84 },
                { n: 'Взаимосвязь', d: '#5bc8af', w: 71 },
                { n: 'Стратег', d: '#7b9fff', w: 63 },
              ].map(s => (
                <div key={s.n}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{s.n}</span>
                    <span className="text-slate-400 tabular-nums">{s.w}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.w}%`, background: s.d }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">Три шага до карты команды</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="rounded-2xl bg-white border border-slate-100 p-7 shadow-sm">
                <div className="text-sm font-bold text-emerald-600 mb-4">{s.n}</div>
                <div className="font-semibold text-slate-900 text-lg mb-2">{s.t}</div>
                <p className="text-sm text-slate-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coach section */}
      <section id="coach" className="max-w-5xl mx-auto px-5 py-20">
        <div className="rounded-3xl overflow-hidden border border-slate-200 grid md:grid-cols-2">
          <div className="p-10 md:p-12">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
              AI-коуч в Telegram
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-snug">Данияр развивает каждого — индивидуально</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              После теста сотрудник продолжает с персональным коучем: 30 дней заданий на основе именно его талантов, голосовые отчёты, живая обратная связь. HR не тратит на это ни часа.
            </p>
            <Link href="/vector-test"
              className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#229ED9' }}>
              Попробовать с Данияром
            </Link>
          </div>
          <div className="bg-slate-50 p-10 flex items-center justify-center">
            <div className="w-full max-w-xs space-y-3">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-emerald-500 text-white text-sm px-4 py-2.5">
                Сегодня познакомился с новым клиентом, было легко
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-sm px-4 py-2.5 text-slate-700">
                Твоё Обаяние сработало точно — ты открываешь двери, которые другим приходится ломать. Где ещё сегодня это пригодится?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-5 pb-24">
        <div className="rounded-3xl px-8 py-14 text-center"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Начни с одного профиля</h2>
          <p className="text-emerald-50 mb-8 max-w-md mx-auto">Пройди тест сам за 10 минут — а дальше подключай команду.</p>
          <Link href="/vector-test"
            className="inline-flex px-8 py-3.5 rounded-xl text-sm font-semibold bg-white text-emerald-700 hover:bg-emerald-50 transition-all">
            Пройти тест бесплатно
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Inner Vector" width={24} height={24} />
            <span className="font-semibold text-slate-900">Inner Vector</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Приватность</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Условия</Link>
            <Link href="/vector-test" className="hover:text-slate-900 transition-colors">Пройти тест</Link>
          </div>
          <div className="text-xs text-slate-400">© 2026 Inner Vector</div>
        </div>
      </footer>
    </div>
  )
}

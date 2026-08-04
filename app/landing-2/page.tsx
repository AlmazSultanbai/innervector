'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Manrope } from 'next/font/google'

// Display font — Cyrillic-complete, premium B2B feel (ui-ux-pro-max: dual-font, warm/bold)
const display = Manrope({ subsets: ['latin', 'cyrillic'], weight: ['600', '700', '800'], display: 'swap' })

// ── Trial light B2B landing — separate route, live dark site untouched ─────────
// Design system (ui-ux-pro-max): Trust & Authority + Conversion pattern, Flat
// Design, WCAG-minded. Palette: navy #0F172A + trust-blue accent + Inner Vector
// emerald brand + domain colors. Original layout — not a vendor copy.

const NAVY = '#0F172A'
const BLUE = '#0369A1'
const EMERALD = '#10b981'

const DOMAINS = [
  { label: 'Реализация', color: '#e0a040', desc: 'Кто доводит до результата' },
  { label: 'Влияние', color: '#f0a500', desc: 'Кто ведёт и убеждает' },
  { label: 'Отношения', color: '#5bc8af', desc: 'Кто держит команду вместе' },
  { label: 'Мышление', color: '#7b9fff', desc: 'Кто видит стратегию' },
]

const TABS = [
  {
    key: 'hire', label: 'Подбор',
    title: 'Нанимай по сильным сторонам, а не по резюме',
    body: 'Видишь, какие таланты кандидата реально усилят команду и где будут слепые зоны. Меньше ошибок найма, быстрее адаптация.',
    points: ['Профиль из 34 талантов за 10 минут', 'Совместимость с текущей командой', 'Роли, где человек в своей стихии'],
  },
  {
    key: 'team', label: 'Команда',
    title: 'Собери карту талантов всей команды',
    body: 'Кто двигатель, кто стратег, кто держит людей вместе. Находишь дыры в составе и дубли — до того, как они станут проблемой.',
    points: ['Баланс 4 доменов в команде', 'Кто кого дополняет', 'Где команде не хватает силы'],
  },
  {
    key: 'grow', label: 'Развитие',
    title: 'Личный AI-коуч для каждого сотрудника',
    body: 'Данияр ведёт 30-дневную программу в Telegram — персональные задания на основе талантов человека. Развитие без нагрузки на HR.',
    points: ['Ежедневные задания под профиль', 'Голосовые отчёты и обратная связь', 'Прогресс виден руководителю'],
  },
]

const STEPS = [
  { n: '01', t: 'Сотрудник проходит тест', d: '68 вопросов, 10–15 минут. Никакой подготовки.' },
  { n: '02', t: 'AI строит профиль', d: 'Портрет, сильные стороны, слепые зоны, карьерные направления.' },
  { n: '03', t: 'Команда получает карту', d: 'Видишь состав, совместимость и точки роста каждого.' },
]

const FEATURES = [
  { icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', t: 'Портрет личности', d: 'Литературный разбор того, как человек думает и действует' },
  { icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', t: '34 таланта в ранге', d: 'Полное ранжирование сильных и слабых зон' },
  { icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25', t: 'Карьерные направления', d: 'Реальные роли и направления обучения под профиль' },
  { icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', t: 'Совместимость', d: 'Кто кого дополняет и где команде не хватает силы' },
  { icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z', t: 'Слепые зоны', d: 'Честные риски и где профиль споткнётся' },
  { icon: 'M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z', t: 'AI-коуч Данияр', d: '30 дней персональных заданий в Telegram' },
]

// Talent → domain color for chips
const TALENT_COLOR: Record<string, string> = {
  'Достиженец': '#e0a040', 'Организатор': '#e0a040', 'Убеждения': '#e0a040', 'Дисциплина': '#e0a040', 'Фокус': '#e0a040', 'Осторожность': '#e0a040', 'Ответственность': '#e0a040',
  'Катализатор': '#f0a500', 'Командность': '#f0a500', 'Коммуникация': '#f0a500', 'Соперничество': '#f0a500', 'Максимизатор': '#f0a500', 'Уверенность': '#f0a500', 'Обаяние': '#f0a500', 'Значимость': '#f0a500',
  'Развитие': '#5bc8af', 'Взаимосвязь': '#5bc8af', 'Эмпатия': '#5bc8af', 'Позитивность': '#5bc8af', 'Близость': '#5bc8af',
  'Стратег': '#7b9fff', 'Аналитик': '#7b9fff', 'Генератор': '#7b9fff', 'Будущее': '#7b9fff', 'Ученик': '#7b9fff', 'Размышление': '#7b9fff',
}

// Prototype data — goal → needed talents, your gaps, matched teammates (curated, no backend yet)
const GOALS = [
  {
    label: 'Запустить стартап',
    needs: ['Катализатор', 'Стратег', 'Уверенность', 'Достиженец'],
    gaps: ['Аналитик', 'Осторожность', 'Коммуникация'],
    matches: [
      { name: 'Аналитик-финансист', talents: ['Аналитик', 'Осторожность'], fills: 'Закрывает риски и цифры, которые основатель часто пропускает', pct: 94 },
      { name: 'Продажи и рост', talents: ['Обаяние', 'Коммуникация'], fills: 'Приводит первых клиентов и переговоры', pct: 88 },
    ],
  },
  {
    label: 'Вырасти в лидера',
    needs: ['Командность', 'Развитие', 'Коммуникация', 'Взаимосвязь'],
    gaps: ['Стратег', 'Аналитик'],
    matches: [
      { name: 'Стратег-советник', talents: ['Стратег', 'Будущее'], fills: 'Помогает видеть на несколько ходов вперёд', pct: 91 },
      { name: 'Аналитик решений', talents: ['Аналитик', 'Осторожность'], fills: 'Проверяет решения на данных, а не на чувствах', pct: 85 },
    ],
  },
  {
    label: 'Сделать продукт',
    needs: ['Генератор', 'Стратег', 'Максимизатор', 'Фокус'],
    gaps: ['Коммуникация', 'Обаяние', 'Достиженец'],
    matches: [
      { name: 'Маркетолог-рассказчик', talents: ['Коммуникация', 'Обаяние'], fills: 'Доносит ценность продукта до рынка', pct: 90 },
      { name: 'Исполнитель-двигатель', talents: ['Достиженец', 'Дисциплина'], fills: 'Доводит релизы до конца в срок', pct: 87 },
    ],
  },
  {
    label: 'Отдел продаж',
    needs: ['Соперничество', 'Обаяние', 'Командность', 'Достиженец'],
    gaps: ['Аналитик', 'Дисциплина', 'Осторожность'],
    matches: [
      { name: 'Аналитик продаж', talents: ['Аналитик', 'Стратег'], fills: 'Строит воронку и считает конверсию', pct: 92 },
      { name: 'Операционист', talents: ['Дисциплина', 'Осторожность'], fills: 'Держит процессы и не даёт хаосу расти', pct: 84 },
    ],
  },
]

// Domain meta for team-map balance
const DOMAIN_META = [
  { key: 'realizacia', label: 'Реализация', color: '#e0a040' },
  { key: 'vliyanie', label: 'Влияние', color: '#f0a500' },
  { key: 'otnosenia', label: 'Отношения', color: '#5bc8af' },
  { key: 'myshlenie', label: 'Мышление', color: '#7b9fff' },
]

// Whole-team assessment prototype — who's on what place, how they realize, team gap
const TEAMS = [
  {
    label: 'Команда продукта',
    members: [
      { n: 'Айгерим', role: 'Стратег', d: 'myshlenie', talents: ['Стратег', 'Генератор'], realize: 'когда есть простор придумать направление, а не чинить чужое' },
      { n: 'Нурлан', role: 'Двигатель', d: 'realizacia', talents: ['Достиженец', 'Фокус'], realize: 'когда есть ясная цель и дедлайн — доводит до конца' },
      { n: 'Асель', role: 'Хранитель качества', d: 'myshlenie', talents: ['Аналитик', 'Осторожность'], realize: 'когда может всё проверить и предвидеть риски до запуска' },
      { n: 'Тимур', role: 'Координатор', d: 'realizacia', talents: ['Организатор', 'Дисциплина'], realize: 'когда управляет процессом и держит ритм команды' },
    ],
    gap: 'Перекос в Мышление и Реализацию. Некому продавать продукт наружу (Влияние) и удерживать команду вместе (Отношения).',
    add: ['Коммуникация', 'Обаяние', 'Эмпатия'],
  },
  {
    label: 'Отдел продаж',
    members: [
      { n: 'Данияр', role: 'Лицо команды', d: 'vliyanie', talents: ['Обаяние', 'Коммуникация'], realize: 'когда открывает двери и ведёт первые переговоры' },
      { n: 'Айсулуу', role: 'Чемпион', d: 'vliyanie', talents: ['Соперничество', 'Достиженец'], realize: 'когда есть план и с кем соревноваться' },
      { n: 'Марат', role: 'Капитан', d: 'vliyanie', talents: ['Командность', 'Уверенность'], realize: 'когда берёт ответственность в неопределённости' },
    ],
    gap: 'Сильный перекос во Влияние — много энергии, но некому считать воронку и видеть стратегию.',
    add: ['Аналитик', 'Стратег', 'Дисциплина'],
  },
]

export default function LandingTrial() {
  const [tab, setTab] = useState(0)
  const [count, setCount] = useState<number | null>(null)
  const [goalIdx, setGoalIdx] = useState(0)
  const [teamIdx, setTeamIdx] = useState(0)
  const active = TABS[tab]
  const goal = GOALS[goalIdx]
  const team = TEAMS[teamIdx]
  const balance = DOMAIN_META.map(dm => ({ ...dm, n: team.members.filter(m => m.d === dm.key).length }))

  useEffect(() => {
    fetch('/api/profile-count').then(r => r.json()).then(d => setCount(d.count ?? null)).catch(() => {})
  }, [])

  const stats = [
    { v: count != null ? `${count + 36}+` : '—', l: 'профилей построено' },
    { v: '34', l: 'таланта в анализе' },
    { v: '4', l: 'домена силы' },
    { v: '3', l: 'языка' },
  ]

  return (
    <div className={`min-h-screen bg-white text-slate-900 ${display.className}`}>
      <style>{`
        html { scroll-behavior: smooth; }
        .lift { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .lift:hover { transform: translateY(-3px); box-shadow: 0 12px 28px -12px rgba(15,23,42,.18); }
        .btn { transition: transform .15s ease, background .15s ease, box-shadow .15s ease; }
        .btn:hover { transform: translateY(-1px); }
        .btn:active { transform: translateY(0); }
        a:focus-visible, button:focus-visible { outline: 2px solid ${BLUE}; outline-offset: 2px; border-radius: 8px; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .lift, .btn { transition: none; }
          .lift:hover, .btn:hover { transform: none; }
        }
      `}</style>

      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Inner Vector" width={30} height={30} />
            <span className="font-extrabold text-lg tracking-tight" style={{ color: NAVY }}>Inner Vector</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#product" className="hover:text-slate-900 transition-colors">Продукт</a>
            <a href="#teams" className="hover:text-slate-900 transition-colors">Команда под цель</a>
            <a href="#team-map" className="hover:text-slate-900 transition-colors">Карта команды</a>
            <a href="#coach" className="hover:text-slate-900 transition-colors">Коуч</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/vector-test" className="hidden sm:inline text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Войти</Link>
            <Link href="/vector-test" className="btn px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm" style={{ background: NAVY }}>
              Пройти тест
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(1200px 500px at 50% -10%, #ecfeff 0%, transparent 60%), radial-gradient(900px 500px at 90% 0%, #eff6ff 0%, transparent 55%)' }} />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-14 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: EMERALD }} />
              Платформа анализа талантов для команд
            </div>
            <h1 className="text-[2.7rem] sm:text-6xl font-extrabold tracking-tight leading-[1.02]" style={{ color: NAVY }}>
              Собирай команды<br />по сильным сторонам
            </h1>
            <p className="text-lg text-slate-600 max-w-lg mt-6 mb-8 leading-relaxed font-medium">
              Inner Vector раскрывает таланты каждого сотрудника и показывает, как из них собрать сильную команду. Методология 34 талантов плюс AI-анализ.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/vector-test" className="btn px-7 py-3.5 rounded-xl text-sm font-bold text-white shadow-md" style={{ background: EMERALD }}>
                Пройти тест бесплатно
              </Link>
              <a href="#how" className="btn px-7 py-3.5 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-200 shadow-sm">
                Как это работает
              </a>
            </div>
            <div className="flex items-center gap-5 mt-6 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5"><Dot c={EMERALD} /> Без карты</span>
              <span className="inline-flex items-center gap-1.5"><Dot c={BLUE} /> Результат сразу</span>
              <span className="inline-flex items-center gap-1.5"><Dot c="#f0a500" /> 3 языка</span>
            </div>
          </div>
          {/* Right — floating profile card */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl p-6 lift">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: NAVY }}>МА</div>
                <div>
                  <div className="text-sm font-bold" style={{ color: NAVY }}>Махабат А.</div>
                  <div className="text-xs text-slate-500 font-medium">Профиль талантов · Реализация</div>
                </div>
                <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: '#ecfdf5', color: '#047857' }}>ГОТОВ</span>
              </div>
              <div className="space-y-3">
                {[{ n: 'Фокус', d: '#e0a040', w: 92 }, { n: 'Уверенность', d: '#f0a500', w: 84 }, { n: 'Взаимосвязь', d: '#5bc8af', w: 71 }, { n: 'Стратег', d: '#7b9fff', w: 63 }].map(s => (
                  <div key={s.n}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{s.n}</span>
                      <span className="text-slate-400 tabular-nums font-medium">{s.w}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.w}%`, background: s.d }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 rounded-xl border border-slate-200 bg-white shadow-lg px-4 py-3 lift hidden sm:block">
              <div className="text-xs text-slate-500 font-medium">Совместимость с командой</div>
              <div className="text-xl font-extrabold" style={{ color: EMERALD }}>Высокая</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats proof bar */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-extrabold tabular-nums" style={{ color: NAVY }}>{s.v}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Domain overview */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DOMAINS.map(d => (
            <div key={d.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-left lift">
              <div className="w-9 h-9 rounded-lg mb-3 flex items-center justify-center" style={{ background: d.color + '18' }}>
                <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
              </div>
              <div className="font-bold text-slate-900 text-sm">{d.label}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{d.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Product tabs */}
      <section id="product" className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-[2.6rem] font-extrabold tracking-tight" style={{ color: NAVY }}>Одна платформа — весь путь таланта</h2>
          <p className="text-slate-600 max-w-lg mx-auto mt-3 font-medium">От найма до развития каждого человека в команде.</p>
        </div>
        <div className="flex items-center justify-center gap-1 p-1 mb-10 rounded-xl bg-slate-100 max-w-md mx-auto">
          {TABS.map((t, i) => (
            <button key={t.key} onClick={() => setTab(i)} className="btn flex-1 py-2.5 rounded-lg text-sm font-bold"
              style={tab === i ? { background: '#fff', color: NAVY, boxShadow: '0 1px 3px rgba(0,0,0,.1)' } : { color: '#64748b' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-extrabold mb-3 leading-snug" style={{ color: NAVY }}>{active.title}</h3>
            <p className="text-slate-600 leading-relaxed mb-6 font-medium">{active.body}</p>
            <ul className="space-y-3">
              {active.points.map(p => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#ecfdf5' }}>
                    <svg className="w-3 h-3" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed font-medium">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Команда · срез</div>
            <div className="space-y-3">
              {[{ n: 'Айгерим', r: 'Стратег + Аналитик', c: '#7b9fff' }, { n: 'Данияр', r: 'Командность + Обаяние', c: '#f0a500' }, { n: 'Нурлан', r: 'Достиженец + Фокус', c: '#e0a040' }, { n: 'Асель', r: 'Эмпатия + Развитие', c: '#5bc8af' }].map(m => (
                <div key={m.n} className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 px-3 py-2.5">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: m.c }}>{m.n[0]}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{m.n}</div>
                    <div className="text-xs text-slate-500 font-medium">{m.r}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Teams by talents — Phase 2 prototype (buttons, curated data, no backend yet) */}
      <section id="teams" className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#eff6ff', color: BLUE }}>Скоро · прототип</div>
            <h2 className="text-3xl md:text-[2.6rem] font-extrabold tracking-tight" style={{ color: NAVY }}>Собери команду под свою цель</h2>
            <p className="text-slate-600 max-w-xl mx-auto mt-3 font-medium">Выбери цель — система подберёт людей, чьи таланты закрывают твои слепые зоны именно под неё.</p>
          </div>

          {/* Goal buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 my-8">
            {GOALS.map((g, i) => (
              <button key={g.label} onClick={() => setGoalIdx(i)} className="btn px-4 py-2.5 rounded-xl text-sm font-bold border"
                style={goalIdx === i
                  ? { background: NAVY, color: '#fff', borderColor: NAVY }
                  : { background: '#fff', color: '#334155', borderColor: '#e2e8f0' }}>
                {g.label}
              </button>
            ))}
          </div>

          {/* Result */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Left — needed talents + gaps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Эта цель требует таланты</div>
              <div className="flex flex-wrap gap-2 mb-6">
                {goal.needs.map(t => (
                  <span key={t} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: (TALENT_COLOR[t] || '#94a3b8') + '1a', color: TALENT_COLOR[t] || '#475569' }}>{t}</span>
                ))}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Команде не хватает — твои слепые зоны</div>
              <div className="flex flex-wrap gap-2">
                {goal.gaps.map(t => (
                  <span key={t} className="text-xs font-bold px-3 py-1.5 rounded-full border border-dashed" style={{ borderColor: (TALENT_COLOR[t] || '#94a3b8'), color: TALENT_COLOR[t] || '#475569' }}>{t}</span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-6 leading-relaxed">Пунктиром — таланты, которых обычно не хватает под эту цель. Их закрывают партнёры справа.</p>
            </div>

            {/* Right — matched teammates */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Рекомендуем в команду</div>
              {goal.matches.map(m => (
                <div key={m.name} className="rounded-2xl border border-slate-200 bg-white p-5 lift">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-slate-900">{m.name}</div>
                    <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: '#ecfdf5', color: '#047857' }}>{m.pct}% матч</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {m.talents.map(t => (
                      <span key={t} className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: (TALENT_COLOR[t] || '#94a3b8') + '1a', color: TALENT_COLOR[t] || '#475569' }}>{t}</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{m.fills}</p>
                </div>
              ))}
              <button className="btn w-full mt-1 px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: EMERALD }}>
                Найти таких людей →
              </button>
              <p className="text-[11px] text-slate-400 text-center">Прототип интерфейса. Реальный подбор подключим на следующем этапе.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Whole-team assessment — Phase 2 prototype (buttons, curated data) */}
      <section id="team-map" className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#eff6ff', color: BLUE }}>Скоро · прототип</div>
          <h2 className="text-3xl md:text-[2.6rem] font-extrabold tracking-tight" style={{ color: NAVY }}>Протестируй всю команду</h2>
          <p className="text-slate-600 max-w-xl mx-auto mt-3 font-medium">Каждый проходит тест — ты получаешь карту: кто на своём месте, как раскрывается и чего команде не хватает.</p>
        </div>

        {/* Team toggle */}
        <div className="flex flex-wrap items-center justify-center gap-2 my-8">
          {TEAMS.map((tm, i) => (
            <button key={tm.label} onClick={() => setTeamIdx(i)} className="btn px-4 py-2.5 rounded-xl text-sm font-bold border"
              style={teamIdx === i ? { background: NAVY, color: '#fff', borderColor: NAVY } : { background: '#fff', color: '#334155', borderColor: '#e2e8f0' }}>
              {tm.label}
            </button>
          ))}
        </div>

        {/* Member cards — who's on what place + how they realize */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {team.members.map(m => {
            const c = DOMAIN_META.find(d => d.key === m.d)?.color || '#94a3b8'
            return (
              <div key={m.n} className="rounded-2xl border border-slate-200 bg-white p-5 lift">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: c }}>{m.n[0]}</span>
                  <div>
                    <div className="font-bold text-slate-900 leading-tight">{m.n}</div>
                    <div className="text-xs font-bold" style={{ color: c }}>{m.role}</div>
                  </div>
                  <div className="ml-auto flex flex-wrap gap-1 justify-end max-w-[45%]">
                    {m.talents.map(t => (
                      <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: (TALENT_COLOR[t] || '#94a3b8') + '1a', color: TALENT_COLOR[t] || '#475569' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium"><span className="text-slate-400">Раскрывается</span> {m.realize}.</p>
              </div>
            )
          })}
        </div>

        {/* Domain balance + gap */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Баланс команды по доменам</div>
            <div className="space-y-3">
              {balance.map(b => (
                <div key={b.key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{b.label}</span>
                    <span className="tabular-nums font-medium" style={{ color: b.n ? b.color : '#cbd5e1' }}>{b.n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
                    {Array.from({ length: Math.max(1, team.members.length) }).map((_, i) => (
                      <div key={i} className="h-full flex-1 rounded-full" style={{ background: i < b.n ? b.color : '#eef2f6' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-6" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
            <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#b45309' }}>Чего не хватает команде</div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{team.gap}</p>
            <div className="text-xs font-bold text-slate-500 mb-2">Добавить человека с талантами:</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {team.add.map(t => (
                <span key={t} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: (TALENT_COLOR[t] || '#94a3b8') + '1a', color: TALENT_COLOR[t] || '#475569' }}>{t}</span>
              ))}
            </div>
            <button className="btn w-full px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: EMERALD }}>Найти, кого не хватает →</button>
            <p className="text-[11px] text-slate-400 text-center mt-2">Прототип. Реальный расчёт по профилям подключим позже.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-[2.6rem] font-extrabold tracking-tight" style={{ color: NAVY }}>Три шага до карты команды</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="rounded-2xl bg-white border border-slate-200 p-7 lift">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm mb-4 text-white" style={{ background: NAVY }}>{s.n}</div>
                <div className="font-bold text-lg mb-2" style={{ color: NAVY }}>{s.t}</div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-[2.6rem] font-extrabold tracking-tight" style={{ color: NAVY }}>Что получает каждый профиль</h2>
          <p className="text-slate-600 max-w-lg mx-auto mt-3 font-medium">Полный AI-разбор, а не просто список качеств.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.t} className="rounded-2xl border border-slate-200 bg-white p-6 lift">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: '#f0f9ff' }}>
                <svg className="w-5 h-5" style={{ color: BLUE }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
              </div>
              <div className="font-bold text-slate-900 mb-1.5">{f.t}</div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coach */}
      <section id="coach" className="max-w-5xl mx-auto px-5 py-16">
        <div className="rounded-3xl overflow-hidden border border-slate-200 grid md:grid-cols-2">
          <div className="p-10 md:p-12">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#eff6ff', color: BLUE }}>AI-коуч в Telegram</div>
            <h2 className="text-3xl font-extrabold mb-4 leading-snug" style={{ color: NAVY }}>Данияр развивает каждого — индивидуально</h2>
            <p className="text-slate-600 leading-relaxed mb-6 font-medium">
              После теста сотрудник продолжает с персональным коучем: 30 дней заданий на основе именно его талантов, голосовые отчёты, живая обратная связь. HR не тратит на это ни часа.
            </p>
            <Link href="/vector-test" className="btn inline-flex px-6 py-3 rounded-xl text-sm font-bold text-white shadow-sm" style={{ background: '#229ED9' }}>
              Попробовать с Данияром
            </Link>
          </div>
          <div className="bg-slate-50 p-10 flex items-center justify-center">
            <div className="w-full max-w-xs space-y-3">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm text-white text-sm px-4 py-2.5 font-medium" style={{ background: EMERALD }}>
                Сегодня познакомился с новым клиентом, было легко
              </div>
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-sm px-4 py-2.5 text-slate-700 font-medium">
                Твоё Обаяние сработало точно — ты открываешь двери, которые другим приходится ломать. Где ещё сегодня это пригодится?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-5 pb-24">
        <div className="rounded-3xl px-8 py-16 text-center relative overflow-hidden" style={{ background: NAVY }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(600px 300px at 50% 0%, rgba(16,185,129,.18) 0%, transparent 70%)' }} />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Начни с одного профиля</h2>
            <p className="text-slate-300 mb-8 max-w-md mx-auto font-medium">Пройди тест сам за 10 минут — а дальше подключай команду.</p>
            <Link href="/vector-test" className="btn inline-flex px-8 py-4 rounded-xl text-sm font-bold shadow-lg" style={{ background: EMERALD, color: '#fff' }}>
              Пройти тест бесплатно
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Inner Vector" width={24} height={24} />
            <span className="font-extrabold" style={{ color: NAVY }}>Inner Vector</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
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

function Dot({ c }: { c: string }) {
  return <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
}

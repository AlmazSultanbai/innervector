'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getVectorResultByToken } from '@/lib/supabase'
import type { VectorAnalysis } from '@/lib/supabase'
import { useAuth } from '@/components/LoginModal'
import { traitData, domainColors } from '@/data/vectorTraits'
import { ui } from '@/locales/ui'
import { traitNamesI18n } from '@/locales/traitNames'
import { domainNamesI18n } from '@/locales/domainNames'
import { traitDataEn } from '@/locales/traitData.en'
import { traitDataKy } from '@/locales/traitData.ky'
import type { Domain } from '@/data/vectorTraits'
import type { Locale } from '@/store/localeStore'

type VectorResult = {
  id: string
  share_token: string
  completed_at: string
  test_mode: string
  session_id: string
  scores: Record<string, { a: number; b: number }>
  top5: Array<{ name: string; pct: number; d: string }>
  domain_averages: Record<string, number>
  lang?: string
  full_name?: string
  email?: string
  phone?: string
  analysis?: VectorAnalysis | null
}

const RU_DOMAIN_NAMES: Record<Domain, string> = {
  vliyanie:   'ВЛИЯНИЕ',
  realizacia: 'РЕАЛИЗАЦИЯ',
  otnosenia:  'ОТНОШЕНИЯ',
  myshlenie:  'МЫШЛЕНИЕ',
  energia:    'ЭНЕРГИЯ',
  rost:       'РОСТ',
}

const traitBizRu: Record<string, string> = {
  'Убеждение':'Закрывает сделки и сдвигает людей с мёртвой точки.','Вдохновение':'Задаёт вектор и создаёт культуру.','Катализатор':'Держит команду честной.',
  'Репутация':'Открывает двери без слов.','Инициатива':'Запускает проекты когда других парализует неопределённость.','Магнетизм':'Притягивает нужных людей органично.',
  'Дисциплина':'Удерживает темп без внешнего давления.','Завершение':'Доводит до конца то что другие бросают.','Системность':'Строит процессы которые работают без тебя.',
  'Качество':'Гарантирует что продукт будет сделан на уровне.','Скорость':'Выигрывает за счёт быстрых итераций.','Ответственность':'На него можно положиться без контроля.',
  'Эмпатия':'Чувствует что происходит в команде до того как скажут.','Забота':'Создаёт команду где люди остаются надолго.','Глубина':'Строит альянсы на годы.',
  'Партнёрство':'Открывает двери через правильных людей.','Честность':'Создаёт культуру реальной обратной связи.','Границы':'Защищает ресурс команды от перегрузки.',
  'Анализ':'Принимает решения на данных.','Стратегия':'Видит куда идёт рынок до того как это стало очевидным.','Интуиция':'Действует точно где данных недостаточно.',
  'Синтез':'Создаёт прорывные идеи на стыке областей.','Осмотрительность':'Защищает бизнес от катастрофических ошибок.','Любознательность':'Переводит между специалистами.',
  'Смысл':'Вкладывается полностью когда верит в дело.','Автономия':'Работает на результат без микроменеджмента.','Вызов':'Незаменим в кризисе.',
  'Ритм':'Создаёт предсказуемость и надёжность.','Новизна':'Первым осваивает новые инструменты.','Тишина':'Приносит глубокие инсайты.',
  'Мастерство':'Даёт команде глубокую экспертизу.','Рефлексия':'Накапливает организационную мудрость.','Передача':'Умножает силу команды через обучение.',
  'Эксперимент':'Ускоряет обучение через действие.','Адаптация':'Выживает и побеждает в хаосе.','Долгосрочный след':'Мыслит горизонтом десятилетий.',
}

const traitLoveRu: Record<string, string> = {
  'Убеждение':'В отношениях умеет объяснить и примирить. Партнёру нужно уметь держать свою позицию.','Вдохновение':'Создаёт ощущение смысла и движения. Партнёру нужно возвращать в настоящий момент.',
  'Катализатор':'Говорит правду даже когда это больно. Нужен партнёр с толстой кожей.','Репутация':'Строит отношения через последовательность. Надёжен и предсказуем.',
  'Инициатива':'Зажигает и запускает. Нужен партнёр который поддерживает движение.','Магнетизм':'Партнёр рядом с тобой чувствует особость. Нужна глубина под харизмой.',
  'Дисциплина':'Стабилен и держит слово. Партнёру нужно вносить лёгкость.','Завершение':'Не бросает. Риск — может держаться за отношения которые стоит отпустить.',
  'Системность':'Создаёт надёжный быт. Партнёру нужно добавлять спонтанность.','Качество':'Глубоко вкладывается в отношения. Важно не превращать любовь в перфекционизм.',
  'Скорость':'Ценит момент. Партнёру важно не чувствовать что его торопят.','Ответственность':'Надёжен. Риск — берёт слишком много на себя.',
  'Эмпатия':'Чувствует партнёра глубже чем тот понимает сам. Важно не растворяться.','Забота':'Любит через действие. Нужен партнёр который умеет заботиться в ответ.',
  'Глубина':'Любит редко но по-настоящему. Партнёру нужно терпение.','Партнёрство':'Ищет взаимовыгодную близость. Оба должны расти.',
  'Честность':'Говорит то что думает. Нужен человек который принимает прямоту как уважение.','Границы':'Умеет беречь себя. Риск — дистанцируется когда нужно быть ближе.',
  'Анализ':'Думает прежде чем говорит. Партнёру важна живость.','Стратегия':'Думает об отношениях вперёд. Партнёру нужно помогать присутствовать в настоящем.',
  'Интуиция':'Чувствует когда что-то не так раньше слов.','Синтез':'Приносит новые идеи в отношения.','Осмотрительность':'Надёжен и осторожен. Медлительность — не холодность.',
  'Любознательность':'Лёгкий собеседник. Партнёру нужно помогать углубляться.','Смысл':'Ищет глубину в партнёре. Вкладывается без остатка.','Автономия':'Любит свободно. Свобода — не дистанция.',
  'Вызов':'Страстен и интенсивен. Партнёру нужна устойчивость.','Ритм':'Создаёт стабильность. Партнёру нужно вносить живость.','Новизна':'Делает жизнь яркой. Партнёру нужна уверенность.',
  'Тишина':'Любит глубоко но нуждается в личном пространстве.','Мастерство':'Строит отношения с той же тщательностью что и своё дело.','Рефлексия':'Анализирует и извлекает уроки.',
  'Передача':'Видит потенциал в партнёре. Риск — отношения как воспитательный процесс.','Эксперимент':'Привносит новые форматы. Партнёру нужно ощущать что это жизнь а не тест.',
  'Адаптация':'Гибок и незлопамятен. Риск — адаптируется к тому что нужно изменить.','Долгосрочный след':'Смотрит на отношения с горизонтом всей жизни.',
}

const complementaryTraits: Record<string, string[]> = {
  'Убеждение':['Честность','Завершение','Системность'],'Вдохновение':['Завершение','Анализ','Системность'],'Катализатор':['Забота','Эмпатия','Честность'],
  'Репутация':['Инициатива','Новизна','Вызов'],'Инициатива':['Партнёрство','Вдохновение','Автономия'],'Магнетизм':['Глубина','Системность','Качество'],
  'Дисциплина':['Вдохновение','Новизна','Вызов'],'Завершение':['Инициатива','Вдохновение','Новизна'],'Системность':['Инициатива','Вдохновение','Интуиция'],
  'Качество':['Скорость','Инициатива','Адаптация'],'Скорость':['Качество','Завершение','Системность'],'Ответственность':['Автономия','Новизна','Вдохновение'],
  'Эмпатия':['Честность','Автономия','Вызов'],'Забота':['Честность','Катализатор','Вызов'],'Глубина':['Партнёрство','Автономия','Вдохновение'],
  'Партнёрство':['Глубина','Завершение','Системность'],'Честность':['Забота','Эмпатия','Вдохновение'],'Границы':['Забота','Эмпатия','Автономия'],
  'Анализ':['Интуиция','Инициатива','Вдохновение'],'Стратегия':['Анализ','Системность','Завершение'],'Интуиция':['Анализ','Завершение','Системность'],
  'Синтез':['Анализ','Завершение','Системность'],'Осмотрительность':['Инициатива','Скорость','Вдохновение'],'Любознательность':['Мастерство','Завершение','Системность'],
  'Смысл':['Анализ','Системность','Автономия'],'Автономия':['Тишина','Системность','Завершение'],'Вызов':['Осмотрительность','Забота','Системность'],
  'Ритм':['Новизна','Вдохновение','Инициатива'],'Новизна':['Ритм','Завершение','Системность'],'Тишина':['Автономия','Партнёрство','Вдохновение'],
  'Мастерство':['Любознательность','Инициатива','Вдохновение'],'Рефлексия':['Автономия','Инициатива','Вдохновение'],'Передача':['Мастерство','Системность','Завершение'],
  'Эксперимент':['Системность','Завершение','Анализ'],'Адаптация':['Ритм','Системность','Стратегия'],'Долгосрочный след':['Инициатива','Автономия','Системность'],
}

interface TraitScore { name: string; pct: number; d: Domain }

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(
    locale === 'ru' ? 'ru-RU' : locale === 'ky' ? 'ky-KG' : 'en-US',
    { day: '2-digit', month: 'long', year: 'numeric' }
  )
}

function VectorProfilePage() {
  const { token } = useParams<{ token: string }>()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<VectorResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token) return
    getVectorResultByToken(token).then(data => {
      if (!data) { setNotFound(true); setLoading(false); return }
      setResult(data as VectorResult)
      setLoading(false)
    })
  }, [token])

  // Auto-print when ?pdf=1
  useEffect(() => {
    if (!loading && result && searchParams.get('pdf') === '1') {
      setTimeout(() => window.print(), 800)
    }
  }, [loading, result, searchParams])

  const locale: Locale = (result?.lang as Locale) ?? 'ru'
  const t = ui[locale]

  const traitScores: TraitScore[] = useMemo(() => {
    if (!result?.scores) return []
    return Object.keys(result.scores)
      .map(name => ({
        name,
        pct: Math.round((result.scores[name].a / 10) * 100),
        d: (traitData[name]?.d ?? 'rost') as Domain,
      }))
      .sort((a, b) => b.pct - a.pct)
  }, [result])

  const maxPct = traitScores[0]?.pct || 1
  const normPct = (p: number) => Math.round((p / maxPct) * 100)

  // Use stored top5 from DB (preserves order from test time, avoids re-sort ties)
  const top5: TraitScore[] = useMemo(() => {
    if (!result?.top5?.length) return traitScores.slice(0, 5)
    return result.top5.map(t => ({
      name: t.name,
      pct: t.pct,
      d: (t.d as Domain) ?? (traitData[t.name]?.d ?? 'rost') as Domain,
    }))
  }, [result, traitScores])

  const testMode = result?.test_mode ?? 'full'

  const getTraitName = (ruKey: string) => {
    if (locale === 'en') return traitNamesI18n[ruKey]?.en ?? ruKey
    if (locale === 'ky') return traitNamesI18n[ruKey]?.ky ?? ruKey
    return ruKey
  }
  const getDomainName = (d: Domain) => {
    if (locale === 'en') return domainNamesI18n[d]?.en ?? d
    if (locale === 'ky') return domainNamesI18n[d]?.ky ?? d
    return RU_DOMAIN_NAMES[d]
  }
  const getTraitFields = (ruKey: string) => {
    if (locale === 'en') return traitDataEn[ruKey] ?? traitData[ruKey]
    if (locale === 'ky') return traitDataKy[ruKey] ?? traitData[ruKey]
    return traitData[ruKey]
  }
  const getBizInsight = (ruKey: string) => traitBizRu[ruKey] ?? ''
  const getLoveInsight = (ruKey: string) => traitLoveRu[ruKey] ?? ''

  const analysis: VectorAnalysis | null = result?.analysis ?? null

  const applications = useMemo(() => {
    const raw = top5
      .flatMap(trait => {
        const fields = getTraitFields(trait.name)
        return (fields?.team ?? '').split(/[,·.]/).map((s: string) => s.trim())
      })
      .filter((s: string) => s.length > 3)
    const seen = new Set<string>()
    return raw.filter((s: string) => {
      const key = s.toLowerCase().slice(0, 12)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 14)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top5, locale])

  const neededTraits = useMemo(() => {
    const pool = top5.flatMap(t => complementaryTraits[t.name] ?? [])
    const topNames = new Set(top5.map(t => t.name))
    const seen = new Set<string>()
    return pool.filter(name => {
      if (topNames.has(name) || seen.has(name)) return false
      seen.add(name)
      return true
    }).slice(0, 5)
  }, [top5])

  const { isSuperAdmin } = useAuth()
  const [generating, setGenerating] = useState(false)

  const generateForAdmin = async () => {
    if (!result || generating) return
    setGenerating(true)
    try {
      const scores = (result as unknown as Record<string, unknown>).scores as Record<string, { a: number; b: number }> | undefined ?? {}
      const allScores = Object.keys(scores)
        .map(name => ({ name, pct: Math.round((scores[name].a / 10) * 100), d: '' }))
        .sort((a, b) => b.pct - a.pct)
      const top5 = result.top5 ?? allScores.slice(0, 5)
      const top10 = allScores.slice(0, 10).length >= 10 ? allScores.slice(0, 10) : top5
      const bottom5 = allScores.slice(-5)
      const res = await fetch('/api/vector-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ top5, top10, bottom5, lang: locale, full_name: result.full_name ?? '', result_id: result.id }),
      })
      const data = await res.json()
      if (!data.error) {
        setResult(prev => prev ? { ...prev, analysis: data } : prev)
      }
    } finally {
      setGenerating(false)
    }
  }

  const profileUrl = typeof window !== 'undefined' ? window.location.href : ''
  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const savePDF = () => window.print()

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-radial flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    )
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !result) {
    return (
      <div className="min-h-screen bg-radial flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">🔍</div>
        <p className="font-serif text-3xl text-slate-400">
          {locale === 'en' ? 'Profile not found' : locale === 'ky' ? 'Профиль табылган жок' : 'Профиль не найден'}
        </p>
        <p className="text-slate-600 text-sm max-w-xs">
          {locale === 'en' ? 'This link may be invalid or expired.' : locale === 'ky' ? 'Бул шилтеме жараксыз болушу мүмкүн.' : 'Эта ссылка недействительна или устарела.'}
        </p>
        <Link href="/vector-test"
          className="px-8 py-3 rounded-xl border border-gold/30 text-gold text-xs tracking-widest uppercase hover:bg-gold/10 transition-all duration-200">
          {locale === 'en' ? 'Take the test' : locale === 'ky' ? 'Тестти тапшыр' : 'Пройти тест'}
        </Link>
      </div>
    )
  }

  const topTrait = top5[0]
  const topColor = topTrait ? domainColors[topTrait.d] : '#d4a843'

  return (
    <div className="min-h-screen bg-radial">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-24">

        {/* Nav */}
        <div className="flex items-center justify-between mb-12 print:hidden">
          <Link href="/vector-test"
            className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {locale === 'en' ? 'Take the test' : locale === 'ky' ? 'Тест' : 'Пройти тест'}
          </Link>
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Inner Vector" width={32} height={32} className="opacity-90" />
            <span className="text-xs font-semibold tracking-widest uppercase">
              <span className="text-white">Inner Vector</span>
              <span className="text-gold/40 mx-1.5">·</span>
              <span className="text-gold/60">{t.result}</span>
            </span>
          </div>
          <Link href="/" className="text-slate-500 hover:text-gold text-xs tracking-wide transition-colors">{t.home}</Link>
        </div>

        {/* Person header */}
        {result.full_name && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/3 border border-white/8">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: topColor + '33', border: `1px solid ${topColor}44` }}>
                {result.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-serif text-base text-white font-semibold">{result.full_name}</div>
                <div className="text-slate-600 text-xs">
                  {formatDate(result.completed_at, locale)}
                  {' · '}
                  {testMode === 'express' ? t.expressResultBadge : t.fullResultBadge}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12 animate-slide-in">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            {testMode === 'express' ? t.expressResultBadge : t.fullResultBadge}
          </div>
          <p className="font-serif text-2xl md:text-3xl text-slate-400 font-normal mb-2">{t.dominantForce}</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-6"
            style={{ color: topColor, textShadow: `0 0 60px ${topColor}33` }}>
            {topTrait ? getTraitName(topTrait.name) : ''}
          </h1>
          <div className="w-12 h-px bg-gold/20 mx-auto mb-6" />
          {!analysis && (
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
              {topTrait ? getTraitFields(topTrait.name)?.short : ''}
            </p>
          )}
          {!analysis && isSuperAdmin && (
            <div className="mt-6">
              <button
                onClick={generateForAdmin}
                disabled={generating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-violet-500/30 text-violet-400 text-xs font-semibold tracking-widest uppercase hover:bg-violet-500/10 transition-all duration-200 disabled:opacity-50"
              >
                {generating ? (
                  <><span className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />Генерирую анализ...</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>Сгенерировать полный анализ (admin)</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── AI Essence Hero Quote ─────────────────────────────────────── */}
        {analysis?.essence && (
          <div className="mb-16 text-center">
            <p className="font-serif text-xl md:text-2xl text-white leading-relaxed max-w-2xl mx-auto mb-4"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.05)' }}>
              <span className="text-gold/50 font-serif text-3xl leading-none mr-1">&ldquo;</span>
              {analysis.essence}
              <span className="text-gold/50 font-serif text-3xl leading-none ml-1">&rdquo;</span>
            </p>
            {analysis.dominantTheme && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5">
                <span className="w-1 h-1 rounded-full bg-gold/60" />
                <span className="text-gold/70 text-xs font-medium tracking-widest uppercase">{analysis.dominantTheme}</span>
                <span className="w-1 h-1 rounded-full bg-gold/60" />
              </div>
            )}
          </div>
        )}

        {/* ── Top 5 ──────────────────────────────────────────────────────── */}
        <Section label={t.top5Label}>
          <div className="space-y-3">
            {top5.map((trait, i) => {
              const color = domainColors[trait.d]
              const fields = getTraitFields(trait.name)
              return (
                <div key={trait.name}
                  className="rounded-2xl overflow-hidden border backdrop-blur-sm"
                  style={{ borderColor: i === 0 ? color + '50' : 'rgba(255,255,255,0.07)', background: i === 0 ? color + '08' : 'rgba(255,255,255,0.02)' }}>
                  <div className="h-0.5 bg-white/5">
                    <div className="h-full transition-all duration-1000" style={{ width: `${normPct(trait.pct)}%`, background: color, boxShadow: `0 0 8px ${color}55` }} />
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-2xl text-white/12 font-light leading-none w-7">{i + 1}</span>
                        <div>
                          <div className="font-serif text-lg text-white font-semibold leading-tight">{getTraitName(trait.name)}</div>
                          <div className="text-[10px] tracking-widest font-medium mt-0.5" style={{ color }}>{getDomainName(trait.d)}</div>
                        </div>
                      </div>
                      <span className="font-serif text-2xl font-light" style={{ color }}>{trait.pct}%</span>
                    </div>
                    {fields && (
                      <div className="space-y-3">
                        <p className="text-slate-400 text-sm leading-relaxed">{fields.positive}</p>
                        <div className="flex gap-3">
                          <div className="flex-1 bg-white/3 border border-white/6 rounded-xl px-3 py-2.5">
                            <div className="text-[9px] tracking-widest text-slate-600 uppercase mb-1.5">{t.strengthLabel}</div>
                            <p className="text-slate-300 text-xs leading-relaxed">{fields.short}</p>
                          </div>
                          <div className="flex-1 bg-red-500/4 border border-red-500/12 rounded-xl px-3 py-2.5">
                            <div className="text-[9px] tracking-widest text-slate-600 uppercase mb-1.5">{t.darkLabel}</div>
                            <p className="text-slate-400 text-xs leading-relaxed">{fields.dark}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* ── Where you shine ────────────────────────────────────────────── */}
        <Section label={t.whereYouShine}>
          <div className="space-y-4">
            {/* Detailed AI block */}
            {analysis ? (
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <p className="text-slate-300 text-sm leading-relaxed mb-5">{analysis.whereYouShine.summary}</p>
                <div className="flex flex-col gap-2">
                  {analysis.whereYouShine.contexts.map((ctx, i) => {
                    const color = domainColors[top5[i % top5.length]?.d ?? 'rost']
                    return (
                      <div key={i} className="px-4 py-3 rounded-xl border text-xs leading-relaxed font-medium"
                        style={{ color, borderColor: color + '30', background: color + '08' }}>
                        {ctx}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {/* Compact applications pills */}
            <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
              <p className="text-slate-400 text-sm leading-relaxed mb-5">{t.whereYouShineDesc}</p>
              <div className="flex flex-wrap gap-2">
                {applications.map((app, i) => {
                  const trait = top5[Math.floor(i * top5.length / applications.length)]
                  const color = domainColors[trait?.d ?? 'rost']
                  return (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                      style={{ color, borderColor: color + '35', background: color + '0d' }}>
                      {app}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Career ───────────────────────────────────────────────────── */}
        {analysis?.career && (
          <Section label={locale === 'en' ? 'CAREER PATH' : locale === 'ky' ? 'КАРЬЕРА ЖОЛУ' : 'КАРЬЕРНЫЙ ПУТЬ'}>
            <div className="space-y-4">
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <p className="text-slate-300 text-sm leading-relaxed">{analysis.career.summary}</p>
              </div>
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-4">
                  {locale === 'en' ? 'Roles where you thrive' : locale === 'ky' ? 'Ийгиликтүү болгон ролдор' : 'Роли, где ты в своей стихии'}
                </div>
                <div className="space-y-3">
                  {analysis.career.roles.map((role, i) => {
                    const color = domainColors[top5[i % top5.length]?.d ?? 'rost']
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: color, minHeight: 40 }} />
                        <div>
                          <span className="font-serif text-sm text-white font-semibold">{role.title}</span>
                          <p className="text-slate-400 text-sm leading-relaxed mt-0.5">{role.why}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-500/4 border border-emerald-500/15 rounded-2xl p-5">
                  <div className="text-[10px] tracking-widest text-emerald-400/60 uppercase font-medium mb-3">
                    {locale === 'en' ? 'Ideal environments' : locale === 'ky' ? 'Идеалдуу чөйрөлөр' : 'Идеальная среда'}
                  </div>
                  <div className="space-y-2">
                    {analysis.career.environments.map((env, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-emerald-400/60 text-xs mt-0.5 flex-shrink-0">✓</span>
                        <p className="text-slate-300 text-xs leading-relaxed">{env}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-red-500/4 border border-red-500/12 rounded-2xl p-5">
                  <div className="text-[10px] tracking-widest text-red-400/60 uppercase font-medium mb-3">
                    {locale === 'en' ? 'Avoid' : locale === 'ky' ? 'Качуу керек' : 'Чего избегать'}
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{analysis.career.avoid}</p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* ── Business Partnership ─────────────────────────────────────── */}
        <Section label={t.bizLabel}>
          {analysis ? (
            <div className="space-y-4">
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-4">{t.bizWhatYouBring}</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">{analysis.business.whatYouBring}</p>
                <div className="space-y-3">
                  {analysis.business.contributions.map((c, i) => {
                    const color = domainColors[top5[i]?.d ?? 'rost']
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: color, minHeight: 40 }} />
                        <div>
                          <span className="font-serif text-sm text-white font-medium">{c.vector} </span>
                          <span className="text-slate-400 text-sm leading-relaxed">— {c.insight}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-3">{t.bizWhoYouNeed}</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">{analysis.business.whoYouNeed}</p>
                <div className="space-y-3">
                  {analysis.business.partners.map((p, i) => {
                    const color = domainColors[top5[i % top5.length]?.d ?? 'rost']
                    return (
                      <div key={i} className="rounded-xl border p-4"
                        style={{ borderColor: color + '30', background: color + '06' }}>
                        <div className="font-serif text-sm text-white font-semibold mb-1">{p.type}</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {p.vectors.map(v => (
                            <span key={v} className="text-[10px] px-2 py-0.5 rounded-full border"
                              style={{ color, borderColor: color + '40', background: color + '10' }}>{v}</span>
                          ))}
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed mb-1">{p.why}</p>
                        <p className="text-slate-500 text-xs leading-relaxed italic">{p.dynamic}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-4">{t.bizWhatYouBring}</div>
                <div className="space-y-3">
                  {top5.slice(0, 3).map(trait => {
                    const color = domainColors[trait.d]
                    const insight = getBizInsight(trait.name)
                    return (
                      <div key={trait.name} className="flex gap-3">
                        <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: color, minHeight: '100%' }} />
                        <div>
                          <span className="font-serif text-sm text-white font-medium">{getTraitName(trait.name)} </span>
                          <span className="text-slate-400 text-sm leading-relaxed">— {insight}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-2">{t.bizWhoYouNeed}</div>
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">{t.bizWhoDesc}</p>
                <div className="flex flex-wrap gap-2">
                  {neededTraits.map(ruKey => {
                    const d = traitData[ruKey]?.d ?? 'rost'
                    const color = domainColors[d]
                    return (
                      <div key={ruKey} className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                        style={{ borderColor: color + '35', background: color + '0d' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-xs font-medium" style={{ color }}>{getTraitName(ruKey)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── Love & Relationships ─────────────────────────────────────── */}
        <Section label={t.loveLabel}>
          {analysis ? (
            <div className="space-y-4">
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <p className="text-slate-300 text-sm leading-relaxed">{analysis.love.summary}</p>
              </div>
              <div className="space-y-3">
                {analysis.love.dynamics.map((dyn, i) => {
                  const color = domainColors[top5[i]?.d ?? 'rost']
                  const icons = t.loveIcons
                  return (
                    <div key={i} className="rounded-2xl border p-5"
                      style={{ borderColor: color + '30', background: color + '06' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg">{icons[i]}</span>
                        <div className="font-serif text-base text-white font-semibold">{dyn.vector}</div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-2">{dyn.strength}</p>
                      <p className="text-slate-500 text-xs leading-relaxed italic border-l-2 pl-3"
                        style={{ borderColor: color + '40' }}>{dyn.shadow}</p>
                    </div>
                  )
                })}
              </div>
              <div className="bg-white/2 border border-white/7 rounded-2xl p-5">
                <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-2">
                  {locale === 'en' ? 'Ideal partner' : locale === 'ky' ? 'Идеалдуу өнөк' : 'Идеальный партнёр'}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{analysis.love.partnerNeeds}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {top5.slice(0, 3).map((trait, i) => {
                const color = domainColors[trait.d]
                const insight = getLoveInsight(trait.name)
                const icons = t.loveIcons
                return (
                  <div key={trait.name} className="rounded-2xl border p-5"
                    style={{ borderColor: color + '30', background: color + '06' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg">{icons[i]}</span>
                      <div>
                        <div className="font-serif text-base text-white font-semibold">{getTraitName(trait.name)}</div>
                        <div className="text-[10px] tracking-widest font-medium" style={{ color }}>{getDomainName(trait.d)}</div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{insight}</p>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* ── Blind spots & Combinations & Famous (AI only) ─────────── */}
        {analysis && (
          <>
            <Section label={locale === 'en' ? 'BLIND SPOTS' : locale === 'ky' ? 'КӨР ЖАКТАР' : 'СЛЕПЫЕ ЗОНЫ'}>
              <div className="space-y-3">
                {analysis.blindSpots.map((spot, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-red-500/4 border border-red-500/12">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-slate-400 text-sm leading-relaxed">{spot}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section label={locale === 'en' ? 'VECTOR COMBINATIONS' : locale === 'ky' ? 'ВЕКТОР АЙКАЛЫШТАРЫ' : 'СОЧЕТАНИЯ ВЕКТОРОВ'}>
              <div className="grid sm:grid-cols-2 gap-4">
                {analysis.combinations.map((combo, i) => {
                  const TYPE_CFG = {
                    signature: { labelRu: 'Подпись', labelKy: 'Негизги', label: 'Signature', icon: '✦', border: 'border-gold/30', bg: 'bg-gold/5', badge: 'bg-gold/15 text-gold border-gold/30' },
                    hidden:    { labelRu: 'Скрытая сила', labelKy: 'Жашыруун күч', label: 'Hidden Power', icon: '◈', border: 'border-violet-500/30', bg: 'bg-violet-500/5', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
                    tension:   { labelRu: 'Напряжение', labelKy: 'Чыңалуу', label: 'Tension', icon: '⚡', border: 'border-amber-500/30', bg: 'bg-amber-500/5', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
                    sleeper:   { labelRu: 'Спящий гигант', labelKy: 'Уктаган күч', label: 'Sleeper', icon: '◎', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
                  }
                  const cfg = TYPE_CFG[combo.type] ?? TYPE_CFG.signature
                  const typeLabel = locale === 'ru' ? cfg.labelRu : locale === 'ky' ? cfg.labelKy : cfg.label
                  return (
                    <div key={i} className={`rounded-2xl border p-5 flex flex-col gap-3 ${cfg.border} ${cfg.bg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{cfg.icon}</span>
                          <div>
                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${cfg.badge}`}>{typeLabel}</span>
                            <div className="font-serif text-white text-base font-semibold mt-1">{combo.name}</div>
                          </div>
                        </div>
                        <span className="text-slate-600 text-[10px] whitespace-nowrap flex-shrink-0 mt-1">{combo.rarity}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {combo.vectors.map(v => (
                          <span key={v} className="text-xs px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-slate-300">{v}</span>
                        ))}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{combo.how}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="rounded-lg bg-white/3 border border-white/6 p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                              {locale === 'en' ? 'At best' : locale === 'ky' ? 'Эң мыктысы' : 'В лучшем виде'}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed">{combo.atBest}</p>
                        </div>
                        <div className="rounded-lg bg-white/3 border border-white/6 p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">
                              {locale === 'en' ? 'Risk' : locale === 'ky' ? 'Коркунуч' : 'Риск'}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed">{combo.risk}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>

            {analysis.famousPeople?.length > 0 && (
              <Section label={locale === 'en' ? 'FAMOUS SIMILAR PROFILES' : locale === 'ky' ? 'ОКШОШ ПРОФИЛДЕГИ БЕЛГИЛҮҮ АДАМДАР' : 'ИЗВЕСТНЫЕ ЛЮДИ С ПОХОЖИМ ПРОФИЛЕМ'}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.famousPeople.map((person, i) => {
                    const AVATAR_COLORS = ['from-blue-600 to-blue-800','from-purple-600 to-purple-800','from-emerald-600 to-emerald-800','from-orange-600 to-orange-800','from-rose-600 to-rose-800']
                    const colorClass = AVATAR_COLORS[person.name.charCodeAt(0) % AVATAR_COLORS.length]
                    const initials = person.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <div key={i} className="bg-white/2 border border-white/7 rounded-2xl p-5 flex flex-col gap-3 h-full">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm font-serif flex-shrink-0`}>
                            {initials}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm leading-tight">{person.name}</div>
                            <div className="text-gold text-xs mt-0.5 font-medium">{person.field}</div>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed flex-1">{person.whyMatch}</p>
                        <div className="pt-3 border-t border-white/8 flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                          <p className="text-slate-300 text-xs leading-relaxed italic">{person.achievement}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}
          </>
        )}

        {/* ── 36 Vectors by domain columns (Full only) ────────────────── */}
        {testMode === 'full' && traitScores.length > 0 && (
          <Section label={t.all36Label}>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">{t.all36Desc}</p>

            {(() => {
              const DOMAINS_LIST = ['vliyanie','realizacia','otnosenia','myshlenie','energia','rost'] as Domain[]
              const rankMap = new Map<string, number>()
              traitScores.forEach((tr, i) => rankMap.set(tr.name, i + 1))

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {DOMAINS_LIST.map(domain => {
                      const color = domainColors[domain]
                      const domainTraits = traitScores
                        .filter(tr => tr.d === domain)
                        .sort((a, b) => (rankMap.get(a.name) ?? 99) - (rankMap.get(b.name) ?? 99))

                      return (
                        <div key={domain} className="flex flex-col gap-1.5 min-w-0">
                          {/* Domain header */}
                          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl mb-0.5 min-w-0"
                            style={{ background: color + '15', border: `1px solid ${color}35` }}>
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-[10px] font-bold tracking-wider uppercase leading-tight min-w-0"
                              style={{ color, wordBreak: 'break-word' }}>
                              {getDomainName(domain)}
                            </span>
                          </div>

                          {domainTraits.map(trait => {
                            const rank = rankMap.get(trait.name) ?? 99
                            const isTop5 = rank <= 5
                            const isTop12 = rank <= 12
                            return (
                              <div key={trait.name}
                                className="flex flex-col items-start gap-1 px-2.5 py-2 rounded-xl w-full"
                                style={isTop5 ? {
                                  background: color + '1a',
                                  border: `1px solid ${color}55`,
                                  boxShadow: `0 0 10px ${color}20`,
                                } : isTop12 ? {
                                  background: color + '10',
                                  border: `1px solid ${color}35`,
                                  boxShadow: `0 0 6px ${color}12`,
                                } : {
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255,255,255,0.05)',
                                }}
                              >
                                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                  style={{
                                    background: isTop5 ? color : isTop12 ? color + '40' : 'rgba(255,255,255,0.05)',
                                    color: isTop5 ? '#0e1120' : isTop12 ? color : 'rgba(100,116,139,0.4)',
                                    border: `1px solid ${isTop5 ? color : isTop12 ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                                  }}>
                                  {rank}
                                </div>
                                <span className="font-serif text-[11px] leading-tight w-full"
                                  style={{
                                    color: isTop5 ? 'white' : isTop12 ? 'rgba(226,232,240,0.9)' : 'rgba(100,116,139,0.4)',
                                    fontWeight: isTop5 ? 700 : isTop12 ? 500 : 400,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}>
                                  {getTraitName(trait.name)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-5 mt-5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-gold/25 border border-gold/50" />
                      <span className="text-[10px] text-slate-500">{locale === 'en' ? 'Top 5' : 'Топ 5'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-white/8 border border-white/20" />
                      <span className="text-[10px] text-slate-500">6–12</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-white/2 border border-white/5" />
                      <span className="text-[10px] text-slate-500">{locale === 'en' ? 'Background' : locale === 'ky' ? 'Фондук' : 'Фоновые'}</span>
                    </div>
                  </div>
                </>
              )
            })()}

          </Section>
        )}

        {/* Share this profile */}
        <div className="mb-8 bg-white/2 border border-gold/15 rounded-2xl p-5 print:hidden">
          <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-3">
            {locale === 'en' ? 'Share this profile' : locale === 'ky' ? 'Профилди бөлүшүү' : 'Поделиться профилем'}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex-1 text-slate-500 text-xs truncate font-mono bg-white/3 px-3 py-2 rounded-lg border border-white/8">
              {profileUrl}
            </span>
            <button
              onClick={copyLink}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200"
              style={copied
                ? { background: 'rgba(109,222,138,0.15)', color: '#6dde8a', border: '1px solid rgba(109,222,138,0.3)' }
                : { background: 'rgba(212,168,67,0.15)', color: '#d4a843', border: '1px solid rgba(212,168,67,0.3)' }
              }
            >
              {copied
                ? (locale === 'en' ? 'Copied!' : locale === 'ky' ? 'Көчүрүлдү!' : 'Скопировано!')
                : (locale === 'en' ? 'Copy' : locale === 'ky' ? 'Көчүрүү' : 'Скопировать')}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4 flex-wrap print:hidden">
          <Link href="/vector-test"
            className="px-8 py-3 rounded-xl border border-white/10 text-slate-400 text-xs tracking-widest uppercase hover:border-white/20 hover:text-slate-300 transition-all duration-200">
            {t.retake}
          </Link>
          <button
            onClick={savePDF}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-gold/30 text-gold text-xs font-semibold tracking-widest uppercase hover:bg-gold/10 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {locale === 'ru' ? 'Сохранить PDF' : locale === 'ky' ? 'PDF сактоо' : 'Save PDF'}
          </button>
          <Link href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #d4a843 0%, #b8922e 100%)', color: '#0e1120', boxShadow: '0 0 30px rgba(212,168,67,0.2)' }}>
            {t.home}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function VectorProfilePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-radial" />}>
      <VectorProfilePage />
    </Suspense>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] text-gold/60 tracking-widest uppercase font-medium">{label}</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      {children}
    </div>
  )
}

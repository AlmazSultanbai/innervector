'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getVectorResultByToken } from '@/lib/supabase'
import { traitData, domainColors } from '@/data/vectorTraits'
import { ui } from '@/locales/ui'
import { traitNamesI18n } from '@/locales/traitNames'
import { domainNamesI18n } from '@/locales/domainNames'
import { traitDataEn } from '@/locales/traitData.en'
import { traitDataKy } from '@/locales/traitData.ky'
import { traitBizEn, traitLoveEn, traitBizKy, traitLoveKy } from '@/locales/traitInsights'
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
  'Убеждение':         'Закрывает сделки и сдвигает людей с мёртвой точки. В деле незаменим там где нужно договориться.',
  'Вдохновение':       'Задаёт вектор и создаёт культуру. Команда идёт за тобой потому что верит в то куда ты ведёшь.',
  'Катализатор':       'Держит команду честной. Задаёт неудобные вопросы до того как ошибка стала дорогой.',
  'Репутация':         'Открывает двери без слов. Партнёры приходят сами потому что доверяют твоему имени.',
  'Инициатива':        'Запускает проекты когда других парализует неопределённость. Создаёт импульс на нулевой фазе.',
  'Магнетизм':         'Притягивает нужных людей и ресурсы органично. Нетворкинг происходит без усилий.',
  'Дисциплина':        'Удерживает темп без внешнего давления. Стабильный результат там где другие ждут вдохновения.',
  'Завершение':        'Доводит до конца то что другие бросают. Последняя миля — твоя стихия.',
  'Системность':       'Строит процессы которые работают без тебя. Рост становится устойчивым а не рывками.',
  'Качество':          'Гарантирует что продукт будет сделан на уровне. Репутация компании держится на тебе.',
  'Скорость':          'Выигрывает за счёт быстрых итераций. Пока другие планируют — ты уже получил обратную связь.',
  'Ответственность':   'На него можно положиться без контроля. Высокие ставки не ломают — только усиливают.',
  'Эмпатия':           'Чувствует что происходит в команде и у клиента до того как они скажут. Интуиция в переговорах.',
  'Забота':            'Создаёт команду где люди остаются надолго. Низкая текучка — прямой экономический эффект.',
  'Глубина':           'Строит альянсы на годы. Твои деловые отношения — редкие но нерушимые.',
  'Партнёрство':       'Открывает двери через правильных людей и строит взаимовыгодные связи. Сеть как актив.',
  'Честность':         'Создаёт культуру реальной обратной связи. Проблемы всплывают рано пока их ещё можно исправить.',
  'Границы':           'Защищает ресурс команды от перегрузки. Умеет говорить нет там где это спасает проект.',
  'Анализ':            'Принимает решения на данных а не на ощущениях. Защищает от дорогостоящих ошибок.',
  'Стратегия':         'Видит куда идёт рынок до того как это стало очевидным. Думает на несколько ходов вперёд.',
  'Интуиция':          'Действует точно в ситуациях где данных недостаточно. Скорость решений — конкурентный актив.',
  'Синтез':            'Создаёт прорывные идеи на стыке областей. Там где другие видят проблему — ты видишь решение.',
  'Осмотрительность':  'Защищает бизнес от катастрофических ошибок. Страховка от дорогостоящей самонадеянности.',
  'Любознательность':  'Переводит между специалистами и видит целое. Ценен там где нужна интеграция разных областей.',
  'Смысл':             'Вкладывается полностью когда верит в дело. Уровень отдачи недостижим для тех кто просто работает.',
  'Автономия':         'Создаёт темп и энергию самостоятельно. Работает на результат без микроменеджмента.',
  'Вызов':             'Незаменим в кризисе и на сложных задачах. Включается на полную когда другие опускают руки.',
  'Ритм':              'Создаёт предсказуемость и надёжность. На него можно рассчитывать в долгосрочных обязательствах.',
  'Новизна':           'Первым осваивает новые инструменты и рынки. Тащит команду в будущее.',
  'Тишина':            'Приносит глубокие инсайты из тихой работы. Лучшие идеи созревают без шума.',
  'Мастерство':        'Даёт команде глубокую экспертизу которую невозможно заменить быстро. Незаменимый специалист.',
  'Рефлексия':         'Накапливает организационную мудрость. Не повторяет дорогие ошибки дважды.',
  'Передача':          'Умножает силу команды через обучение. Его уход не оставляет команду беспомощной.',
  'Эксперимент':       'Ускоряет обучение через действие. Быстрые итерации вместо долгих планирований.',
  'Адаптация':         'Выживает и побеждает в хаосе. Кризис — твоё преимущество перед теми кто привык к порядку.',
  'Долгосрочный след': 'Мыслит горизонтом десятилетий. Строит то что работает без него и переживает его.',
}

const traitLoveRu: Record<string, string> = {
  'Убеждение':         'В отношениях умеет объяснить и примирить. Тёмная сторона — может продавить своё мнение силой слова. Партнёру нужно уметь держать свою позицию.',
  'Вдохновение':       'Создаёт в отношениях ощущение смысла и движения. Партнёру нужно возвращать его в настоящий момент и удерживать от слишком красивых обещаний.',
  'Катализатор':       'Говорит правду даже когда это больно. Близкие знают — ты честен. Нужен партнёр с толстой кожей и умением принимать прямоту как заботу, а не атаку.',
  'Репутация':         'Строит отношения через последовательность. Надёжен и предсказуем. Нужен партнёр который даёт пространство для роста а не только закрепляет образ.',
  'Инициатива':        'Зажигает и запускает. Романтика и первые шаги — твоя стихия. Нужен партнёр который поддерживает движение когда новизна стихает.',
  'Магнетизм':         'Партнёр рядом с тобой чувствует особость. Нужна глубина под харизмой — иначе притяжение исчезает и остаётся пустота.',
  'Дисциплина':        'Стабилен и держит слово. Отношения строятся на доверии к твоей последовательности. Партнёру нужно вносить лёгкость и спонтанность.',
  'Завершение':        'Не бросает. Партнёр знает — если взял обязательство то выполнит. Риск — может держаться за отношения которые стоит отпустить.',
  'Системность':       'Создаёт надёжный быт и понятные договорённости. Партнёру нужно добавлять спонтанность и жизнь в структуру.',
  'Качество':          'Глубоко вкладывается в отношения. Высокие ожидания от себя и партнёра — важно не превращать любовь в перфекционизм.',
  'Скорость':          'Действует быстро и ценит момент. Партнёру важно не чувствовать что его торопят — ты привык к темпу выше среднего.',
  'Ответственность':   'Надёжен и на него можно опереться. Риск — может брать слишком много на себя и ждать того же от партнёра. Важно делиться грузом.',
  'Эмпатия':           'Чувствует партнёра глубже чем тот сам себя понимает. Это создаёт близость. Важно не растворяться в чужих состояниях.',
  'Забота':            'Любит через действие — всегда рядом когда нужно. Нужен партнёр который умеет заботиться в ответ иначе баланс нарушается.',
  'Глубина':           'Любит редко но по-настоящему. Отношения строятся медленно но держатся годами. Партнёру нужно терпение в период открытия.',
  'Партнёрство':       'Ищет взаимовыгодную близость — где оба растут. Партнёру нужно уметь держать баланс и не превращать союз в одностороннее соглашение.',
  'Честность':         'Говорит то что думает. Партнёр знает где стоит. Нужен человек который воспринимает прямоту как уважение а не как атаку.',
  'Границы':           'Умеет беречь себя и уважает границы партнёра. Риск — дистанцируется когда нужно быть ближе. Партнёру важно научиться вызывать на открытость.',
  'Анализ':            'Думает прежде чем говорит. Взвешивает. Партнёру важна живость и спонтанность которую аналитик может недодавать.',
  'Стратегия':         'Думает об отношениях с горизонтом вперёд. Видит куда двигаться вместе. Партнёру нужно помогать присутствовать в настоящем.',
  'Интуиция':          'Чувствует партнёра. Знает когда что-то не так раньше слов. Риск — защищает свою интуицию даже когда она ошибается.',
  'Синтез':            'Приносит новые идеи и смотрит на отношения неожиданно. Партнёру важно следить за нитью его мысли.',
  'Осмотрительность':  'Надёжен и осторожен. Не делает импульсивных шагов. Партнёру нужно понимать что медлительность — не холодность.',
  'Любознательность':  'Лёгкий собеседник на любую тему. Отношения наполнены разговорами. Партнёру нужно помогать углубляться а не только расширяться.',
  'Смысл':             'Ищет глубину и смысл в партнёре. Когда есть — вкладывается без остатка. Партнёру важно разделять хотя бы часть его ценностей.',
  'Автономия':         'Любит свободно. Партнёру нужна уверенность что свобода — не дистанция. Обсуждать личное пространство заранее — ключ к близости.',
  'Вызов':             'Страстен и интенсивен. Отношения никогда не скучные. Партнёру нужна устойчивость чтобы не сгорать в постоянном накале.',
  'Ритм':              'Создаёт стабильность и предсказуемость. Партнёру нужно вносить живость и не нарушать ритм резко.',
  'Новизна':           'Делает жизнь яркой и непредсказуемой. Партнёру нужна уверенность что новизна не заменит его самого.',
  'Тишина':            'Любит глубоко но нуждается в личном пространстве. Партнёру важно не принимать уединение как отчуждение.',
  'Мастерство':        'Уважает глубину в партнёре. Отношения строит с той же тщательностью что и своё дело. Нужен партнёр с собственной страстью.',
  'Рефлексия':         'Анализирует отношения и извлекает уроки. Партнёру нужно давать пространство для осмысления но и вытаскивать в действие.',
  'Передача':          'Видит потенциал в партнёре и помогает раскрыться. Риск — может превращать отношения в воспитательный процесс.',
  'Эксперимент':       'Привносит эксперименты и новые форматы в совместную жизнь. Партнёру нужно ощущать что это не тест а жизнь.',
  'Адаптация':         'Гибок и незлопамятен. Умеет перестроиться после конфликта. Риск — может адаптироваться к тому что нужно изменить.',
  'Долгосрочный след': 'Смотрит на отношения с горизонтом всей жизни. Строит не на эмоции момента — на фундаменте. Партнёру важно разделять длинный горизонт.',
}

const complementaryTraits: Record<string, string[]> = {
  'Убеждение':         ['Честность', 'Завершение', 'Системность'],
  'Вдохновение':       ['Завершение', 'Анализ', 'Системность'],
  'Катализатор':       ['Забота', 'Эмпатия', 'Честность'],
  'Репутация':         ['Инициатива', 'Новизна', 'Вызов'],
  'Инициатива':        ['Партнёрство', 'Вдохновение', 'Автономия'],
  'Магнетизм':         ['Глубина', 'Системность', 'Качество'],
  'Дисциплина':        ['Вдохновение', 'Новизна', 'Вызов'],
  'Завершение':        ['Инициатива', 'Вдохновение', 'Новизна'],
  'Системность':       ['Инициатива', 'Вдохновение', 'Интуиция'],
  'Качество':          ['Скорость', 'Инициатива', 'Адаптация'],
  'Скорость':          ['Качество', 'Завершение', 'Системность'],
  'Ответственность':   ['Автономия', 'Новизна', 'Вдохновение'],
  'Эмпатия':           ['Честность', 'Автономия', 'Вызов'],
  'Забота':            ['Честность', 'Катализатор', 'Вызов'],
  'Глубина':           ['Партнёрство', 'Автономия', 'Вдохновение'],
  'Партнёрство':       ['Глубина', 'Завершение', 'Системность'],
  'Честность':         ['Забота', 'Эмпатия', 'Вдохновение'],
  'Границы':           ['Забота', 'Эмпатия', 'Автономия'],
  'Анализ':            ['Интуиция', 'Инициатива', 'Вдохновение'],
  'Стратегия':         ['Анализ', 'Системность', 'Завершение'],
  'Интуиция':          ['Анализ', 'Завершение', 'Системность'],
  'Синтез':            ['Анализ', 'Завершение', 'Системность'],
  'Осмотрительность':  ['Инициатива', 'Скорость', 'Вдохновение'],
  'Любознательность':  ['Мастерство', 'Завершение', 'Системность'],
  'Смысл':             ['Анализ', 'Системность', 'Автономия'],
  'Автономия':         ['Тишина', 'Системность', 'Завершение'],
  'Вызов':             ['Осмотрительность', 'Забота', 'Системность'],
  'Ритм':              ['Новизна', 'Вдохновение', 'Инициатива'],
  'Новизна':           ['Ритм', 'Завершение', 'Системность'],
  'Тишина':            ['Автономия', 'Партнёрство', 'Вдохновение'],
  'Мастерство':        ['Любознательность', 'Инициатива', 'Вдохновение'],
  'Рефлексия':         ['Автономия', 'Инициатива', 'Вдохновение'],
  'Передача':          ['Мастерство', 'Системность', 'Завершение'],
  'Эксперимент':       ['Системность', 'Завершение', 'Анализ'],
  'Адаптация':         ['Ритм', 'Системность', 'Стратегия'],
  'Долгосрочный след': ['Инициатива', 'Автономия', 'Системность'],
}

interface TraitScore { name: string; pct: number; d: Domain }

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(
    locale === 'ru' ? 'ru-RU' : locale === 'ky' ? 'ky-KG' : 'en-US',
    { day: '2-digit', month: 'long', year: 'numeric' }
  )
}

export default function VectorProfilePage() {
  const { token } = useParams<{ token: string }>()
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

  const next5 = traitScores.slice(5, 10)
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
  const getBizInsight = (ruKey: string) => {
    if (locale === 'en') return traitBizEn[ruKey] ?? traitBizRu[ruKey] ?? ''
    if (locale === 'ky') return traitBizKy[ruKey] ?? traitBizRu[ruKey] ?? ''
    return traitBizRu[ruKey] ?? ''
  }
  const getLoveInsight = (ruKey: string) => {
    if (locale === 'en') return traitLoveEn[ruKey] ?? traitLoveRu[ruKey] ?? ''
    if (locale === 'ky') return traitLoveKy[ruKey] ?? traitLoveRu[ruKey] ?? ''
    return traitLoveRu[ruKey] ?? ''
  }

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

  const profileUrl = typeof window !== 'undefined' ? window.location.href : ''
  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        <div className="flex items-center justify-between mb-12">
          <Link href="/vector-test"
            className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {locale === 'en' ? 'Take the test' : locale === 'ky' ? 'Тест' : 'Пройти тест'}
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">IV</div>
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
        <div className="text-center mb-16 animate-slide-in">
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
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            {topTrait ? getTraitFields(topTrait.name)?.short : ''}
          </p>
        </div>

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
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{fields.dark}</p>
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
          <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{t.whereYouShineDesc}</p>
            <div className="flex flex-wrap gap-2">
              {applications.map((app, i) => {
                const trait = top5[Math.floor(i * top5.length / applications.length)]
                const color = domainColors[trait?.d ?? 'rost']
                return (
                  <span key={i}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{ color, borderColor: color + '35', background: color + '0d' }}>
                    {app}
                  </span>
                )
              })}
            </div>
          </div>
        </Section>

        {/* ── Business Partnership ─────────────────────────────────────── */}
        <Section label={t.bizLabel}>
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
                    <div key={ruKey}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                      style={{ borderColor: color + '35', background: color + '0d' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs font-medium" style={{ color }}>{getTraitName(ruKey)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Love & Relationships ─────────────────────────────────────── */}
        <Section label={t.loveLabel}>
          <div className="space-y-3">
            {top5.slice(0, 3).map((trait, i) => {
              const color = domainColors[trait.d]
              const insight = getLoveInsight(trait.name)
              const icons = t.loveIcons
              return (
                <div key={trait.name}
                  className="rounded-2xl border p-5"
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
        </Section>

        {/* ── 36 Vectors Grid (Full only) ─────────────────────────────── */}
        {testMode === 'full' && traitScores.length > 0 && (
          <Section label={t.all36Label}>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">{t.all36Desc}</p>

            {/* Domain legend */}
            <div className="flex flex-wrap gap-3 mb-6">
              {(['vliyanie','realizacia','otnosenia','myshlenie','energia','rost'] as Domain[]).map(d => (
                <div key={d} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: domainColors[d] }} />
                  <span className="text-[10px] tracking-wide" style={{ color: domainColors[d] + 'cc' }}>
                    {getDomainName(d)}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {traitScores.map((trait, i) => {
                const color = domainColors[trait.d]
                const rank = i + 1
                const isTop10 = rank <= 10
                const isTop5 = rank <= 5

                return (
                  <div
                    key={trait.name}
                    className="relative flex flex-col items-center justify-center text-center rounded-xl p-2.5 transition-all duration-300"
                    style={isTop10 ? {
                      background: color + (isTop5 ? '18' : '0d'),
                      border: `1px solid ${color}${isTop5 ? '55' : '30'}`,
                      boxShadow: isTop5 ? `0 0 16px ${color}20` : 'none',
                    } : {
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Rank badge — top 10 only */}
                    {isTop10 && (
                      <div
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-lg"
                        style={{
                          background: isTop5 ? color : color + '99',
                          color: '#0e1120',
                        }}
                      >
                        {rank}
                      </div>
                    )}

                    {/* Domain dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full mb-1.5 flex-shrink-0"
                      style={{ background: isTop10 ? color : color + '44' }}
                    />

                    {/* Name */}
                    <span
                      className="font-serif text-[11px] leading-tight font-medium"
                      style={{ color: isTop10 ? (isTop5 ? 'white' : 'rgba(226,232,240,0.85)') : 'rgba(100,116,139,0.5)' }}
                    >
                      {getTraitName(trait.name)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend: top5 / top10 / rest */}
            <div className="flex items-center gap-5 mt-5 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gold/20 border border-gold/50" />
                <span className="text-[10px] text-slate-500">
                  {locale === 'en' ? 'Top 5 strengths' : locale === 'ky' ? 'Топ 5 күч' : 'Топ 5 сил'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/5 border border-white/15" />
                <span className="text-[10px] text-slate-500">
                  {locale === 'en' ? 'Ranks 6–10' : locale === 'ky' ? '6–10 орун' : 'Позиции 6–10'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/2 border border-white/6" />
                <span className="text-[10px] text-slate-500">
                  {locale === 'en' ? 'Background traits' : locale === 'ky' ? 'Фондук' : 'Фоновые'}
                </span>
              </div>
            </div>
          </Section>
        )}

        {/* Share this profile */}
        <div className="mb-8 bg-white/2 border border-gold/15 rounded-2xl p-5">
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
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/vector-test"
            className="px-8 py-3 rounded-xl border border-white/10 text-slate-400 text-xs tracking-widest uppercase hover:border-white/20 hover:text-slate-300 transition-all duration-200">
            {t.retake}
          </Link>
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

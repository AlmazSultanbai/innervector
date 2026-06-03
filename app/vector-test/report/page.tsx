'use client'

import { useMemo, useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useVectorTestStore } from '@/store/vectorTestStore'
import { traitData, domainColors } from '@/data/vectorTraits'
import { checkResultPaid } from '@/lib/supabase'
import type { VectorAnalysis } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { useLocaleStore } from '@/store/localeStore'
import { ui } from '@/locales/ui'
import { traitNamesI18n } from '@/locales/traitNames'
import { domainNamesI18n } from '@/locales/domainNames'
import { traitDataEn } from '@/locales/traitData.en'
import { traitDataKy } from '@/locales/traitData.ky'
import LangSwitcher from '@/components/LangSwitcher'
import { useAuth } from '@/components/LoginModal'
import type { Domain } from '@/data/vectorTraits'

const DOMAINS: Domain[] = ['vliyanie', 'realizacia', 'otnosenia', 'myshlenie', 'energia', 'rost']

const RU_DOMAIN_NAMES: Record<Domain, string> = {
  vliyanie:   'ВЛИЯНИЕ',
  realizacia: 'РЕАЛИЗАЦИЯ',
  otnosenia:  'ОТНОШЕНИЯ',
  myshlenie:  'МЫШЛЕНИЕ',
  energia:    'ЭНЕРГИЯ',
  rost:       'РОСТ',
}

// Russian business insights (from original report page)
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

// ── Complementary traits map ──────────────────────────────────────────────────
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

interface TraitScore { name: string; pct: number; d: Domain; _net?: number }

export default function VectorTestReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-radial" />}>
      <VectorTestReport />
    </Suspense>
  )
}

function VectorTestReport() {
  const { scores, userInfo, testMode, shareToken, setShareToken } = useVectorTestStore()
  const locale = useLocaleStore(s => s.locale)
  const t = ui[locale]

  const hasResults = Object.keys(scores).length > 0 &&
    Object.values(scores).some(s => s.a > 0 || s.b > 0)

  const traitScores: TraitScore[] = useMemo(() =>
    Object.keys(scores)
      .map(name => {
        const a = scores[name].a
        const b = scores[name].b
        const total = a + b
        // Lean toward the trait pole (0–100), accounting for "away" answers.
        const pct = total > 0 ? Math.round((a / total) * 100) : 0
        return {
          name,
          pct,
          // keep raw net for stable tie-breaking
          _net: a - b,
          d: (traitData[name]?.d ?? 'rost') as Domain,
        }
      })
      // primary: lean %, secondary: net intensity → removes arbitrary ties
      .sort((a, b) => (b.pct - a.pct) || (b._net - a._net)),
    [scores]
  )

  const maxPct = traitScores[0]?.pct || 1
  const normPct = (p: number) => Math.round((p / maxPct) * 100)

  // 3-layer model: dominant TALENTS come from the 4 talent domains only.
  // Energy (energia) and Growth (rost) are separate lenses, not "top talents".
  const TALENT_DOMAINS: Domain[] = ['vliyanie', 'realizacia', 'otnosenia', 'myshlenie']
  const talentScores = traitScores.filter(t => TALENT_DOMAINS.includes(t.d))
  const energyScores = traitScores.filter(t => t.d === 'energia')
  const growthScores = traitScores.filter(t => t.d === 'rost')
  const top5 = talentScores.slice(0, 5)


  // Helper: get localized trait name
  const getTraitName = (ruKey: string) => {
    if (locale === 'en') return traitNamesI18n[ruKey]?.en ?? ruKey
    if (locale === 'ky') return traitNamesI18n[ruKey]?.ky ?? ruKey
    return ruKey
  }

  // Helper: get localized domain name
  const getDomainName = (d: Domain) => {
    if (locale === 'en') return domainNamesI18n[d]?.en ?? d
    if (locale === 'ky') return domainNamesI18n[d]?.ky ?? d
    return RU_DOMAIN_NAMES[d]
  }

  // Helper: get localized trait data fields
  const getTraitFields = (ruKey: string) => {
    if (locale === 'en') return traitDataEn[ruKey] ?? traitData[ruKey]
    if (locale === 'ky') return traitDataKy[ruKey] ?? traitData[ruKey]
    return traitData[ruKey]
  }

  // Helper: get biz insight (RU fallback template)
  const getBizInsight = (ruKey: string) => traitBizRu[ruKey] ?? ''

  // Helper: get love insight (RU fallback template)
  const getLoveInsight = (ruKey: string) => traitLoveRu[ruKey] ?? ''

  // Aggregate application areas from top 5
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

  // Complementary traits needed
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

  const searchParams = useSearchParams()
  const { isSuperAdmin } = useAuth()
  const [copied, setCopied] = useState(false)
  const [analysis, setAnalysis] = useState<VectorAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)
  const [isPaid, setIsPaid] = useState(false)

  // Superadmin bypass — always unlocked
  const isUnlocked = isPaid || isSuperAdmin
  const [paymentLoading, setPaymentLoading] = useState(false)
  const profileUrl = shareToken ? `${typeof window !== 'undefined' ? window.location.origin : 'https://innervector.co'}/vector-profile/${shareToken}` : null

  const copyLink = () => {
    if (!profileUrl) return
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buyAnalysis = async () => {
    if (!resultId) return
    setPaymentLoading(true)
    const sessionId = localStorage.getItem('vector-session-id') ?? ''
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_id: resultId, session_id: sessionId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setPaymentLoading(false)
    }
  }

  // Save to Supabase once per completed test
  const savedRef = useRef(false)
  const domainAverages = useMemo(() => {
    const totals = Object.fromEntries(DOMAINS.map(d => [d, { sum: 0, count: 0 }])) as Record<Domain, { sum: number; count: number }>
    traitScores.forEach(t => { totals[t.d].sum += t.pct; totals[t.d].count += 1 })
    return Object.fromEntries(DOMAINS.map(d => [d, totals[d].count > 0 ? Math.round(totals[d].sum / totals[d].count) : 0])) as Record<Domain, number>
  }, [traitScores])

  // Save result once via server API (service role — reliable)
  useEffect(() => {
    if (!hasResults || savedRef.current) return
    savedRef.current = true
    let sessionId = localStorage.getItem('vector-session-id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem('vector-session-id', sessionId)
    }
    fetch('/api/vector-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        scores,
        top5,
        domain_averages: domainAverages,
        lang: locale,
        full_name: userInfo?.fullName ?? null,
        email: userInfo?.email ?? null,
        phone: userInfo?.phone ?? null,
        test_mode: testMode,
      }),
    })
      .then(r => r.json())
      .then(result => {
        if (result?.share_token) setShareToken(result.share_token)
        if (result?.id) {
          setResultId(result.id)
          checkResultPaid(result.id).then(paid => { if (paid) setIsPaid(true) })
        }
        if (result?.error) console.error('Save failed:', result.error)
      })
      .catch(err => console.error('Save request failed:', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResults, scores, top5, domainAverages])

  // Handle return from Lemon Squeezy checkout (?paid=1&result_id=...)
  useEffect(() => {
    const paidParam = searchParams.get('paid')
    const ridParam = searchParams.get('result_id')
    if (paidParam !== '1' || !ridParam) return

    setResultId(ridParam)
    // Poll DB until webhook confirms payment (max 20s)
    let attempts = 0
    const poll = setInterval(async () => {
      attempts++
      const paid = await checkResultPaid(ridParam)
      if (paid) {
        clearInterval(poll)
        setIsPaid(true)
      } else if (attempts >= 10) {
        // Webhook might be delayed — trust the redirect param after 10 attempts
        clearInterval(poll)
        setIsPaid(true)
      }
    }, 2000)
    return () => clearInterval(poll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Trigger analysis once paid
  useEffect(() => {
    if (!isUnlocked || !resultId || analysisLoading || analysis) return
    const sessionId = localStorage.getItem('vector-session-id') ?? ''
    setAnalysisLoading(true)
    // 3-layer model: talents = WHAT, energy = FUEL, growth = trajectory
    fetch('/api/vector-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        top5,
        top10: talentScores.slice(0, 10),
        bottom5: talentScores.slice(-5),
        energyVectors: energyScores,
        growthVectors: growthScores,
        lang: locale,
        full_name: userInfo?.fullName ?? '',
        result_id: resultId,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setAnalysis(data)
          const confettiKey = `iv_vector_confetti_${sessionId}`
          if (!sessionStorage.getItem(confettiKey)) {
            sessionStorage.setItem(confettiKey, '1')
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 5000)
          }
        }
      })
      .finally(() => setAnalysisLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked, resultId])

  // Simulated progress: eases toward 92%, snaps to 100 when analysis arrives
  useEffect(() => {
    if (!analysisLoading) return
    progressRef.current = 0
    setProgress(0)
    progressTimerRef.current = setInterval(() => {
      progressRef.current = progressRef.current + (92 - progressRef.current) * 0.013
      setProgress(Math.min(92, Math.round(progressRef.current)))
    }, 120)
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current) }
  }, [analysisLoading])

  useEffect(() => {
    if (analysis) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      setProgress(100)
    }
  }, [analysis])

  if (!hasResults) {
    return (
      <div className="min-h-screen bg-radial flex flex-col items-center justify-center gap-6 text-center px-6">
        <p className="font-serif text-3xl text-slate-400">{t.takeTestFirst}</p>
        <Link href="/vector-test" className="px-8 py-3 rounded-xl border border-gold/30 text-gold text-xs tracking-widest uppercase hover:bg-gold/10 transition-all duration-200">
          {t.toStart}
        </Link>
      </div>
    )
  }

  // ── PAYWALL ── show free top-5 + unlock button until paid
  if (!isUnlocked) {
    const topTr = top5[0]
    const topCol = domainColors[topTr?.d ?? 'vliyanie']
    const includedItems = locale === 'ru'
      ? ['Портрет личности — литературный, точный', 'Карьера: роли, среды, чего избегать', 'Бизнес: что приносишь команде и кто нужен рядом', 'Любовь и отношения — сильные стороны и тени', 'Комбинации векторов: Подпись, Скрытая сила, Напряжение', 'Знаменитые люди с похожим профилем', 'Слепые зоны — что может тормозить']
      : locale === 'ky'
      ? ['Инсандык портрет — так жана так', 'Карьера: ролдор, чөйрөлөр, эмнеден качуу керек', 'Бизнес: командага эмне берет жана ким керек', 'Сүйүү жана мамилелер', 'Вектор комбинациялары', 'Окшош профилдеги белгилүү адамдар', 'Сокур зоналар']
      : ['Personal portrait — literary and precise', 'Career: roles, environments, what to avoid', 'Business: what you bring and who you need', 'Love & relationships — strengths and shadows', 'Vector combinations: Signature, Hidden Power, Tension', 'Famous people with a similar profile', 'Blind spots — what might hold you back']

    return (
      <div className="min-h-screen bg-radial">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 pb-24">

          {/* Nav */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/vector-test" className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {locale === 'ru' ? 'Пройти заново' : locale === 'ky' ? 'Кайра тапшыруу' : 'Retake'}
            </Link>
            <span className="text-slate-600 text-xs tracking-widest uppercase">Inner Vector</span>
          </div>

          {/* Free result: top vector */}
          <div className="text-center mb-10">
            <p className="text-slate-500 text-xs tracking-[0.2em] uppercase mb-3">
              {locale === 'ru' ? 'Доминирующая сила' : locale === 'ky' ? 'Башкы вектор' : 'Dominant vector'}
            </p>
            <h1 className="font-serif font-bold mb-4" style={{ fontSize: 'clamp(2.5rem,8vw,4rem)', color: topCol }}>
              {topTr?.name}
            </h1>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {top5.map((tr, i) => {
                const c = domainColors[tr.d]
                return (
                  <span key={tr.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border"
                    style={{ color: c, borderColor: c + '40', background: c + '12' }}>
                    <span className="text-[11px] opacity-50 font-bold">{i + 1}</span>
                    {tr.name}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Paywall card */}
          <div className="rounded-2xl border border-gold/20 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}>

            {/* Header */}
            <div className="px-6 py-5 border-b border-white/6 text-center">
              <p className="text-gold text-xs tracking-[0.2em] uppercase font-semibold mb-1">
                {locale === 'ru' ? 'Полный анализ профиля' : locale === 'ky' ? 'Толук профиль анализи' : 'Full profile analysis'}
              </p>
              <p className="text-slate-400 text-sm">
                {locale === 'ru' ? '7 разделов · Генерируется персонально для тебя' : locale === 'ky' ? '7 бөлүм · Жеке генерацияланат' : '7 sections · Generated personally for you'}
              </p>
            </div>

            {/* Included items */}
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {includedItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)' }}>
                    <svg className="w-2 h-2 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-sm leading-snug">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-6 py-5 border-t border-white/6 flex flex-col items-center gap-3">
              {/* Price with strikethrough */}
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-lg line-through">$49</span>
                <span className="text-gold text-2xl font-bold">$19</span>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full font-medium">-61%</span>
              </div>
              <button
                onClick={buyAnalysis}
                disabled={paymentLoading || !resultId}
                className="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-navy-900 transition-all duration-200 disabled:opacity-50"
                style={{ background: paymentLoading ? 'rgba(212,168,67,0.6)' : '#d4a843',
                         boxShadow: '0 0 24px rgba(212,168,67,0.3)' }}>
                {paymentLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                <span className="text-base">
                  {paymentLoading
                    ? (locale === 'ru' ? 'Переходим к оплате...' : 'Redirecting...')
                    : (locale === 'ru' ? 'Разблокировать за $19' : locale === 'ky' ? '$19 га ачуу' : 'Unlock for $19')}
                </span>
              </button>
              <p className="text-slate-600 text-xs text-center">
                {locale === 'ru' ? 'Разовый платёж · Безопасная оплата через Lemon Squeezy' : locale === 'ky' ? 'Бир жолку төлөм · Lemon Squeezy аркылуу' : 'One-time payment · Secure checkout via Lemon Squeezy'}
              </p>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // Show full-screen loader while AI analysis is being generated
  if (analysisLoading || !analysis) {
    const topColor = domainColors[top5[0]?.d ?? 'vliyanie']
    const firstName = userInfo?.fullName?.trim().split(' ')[0] ?? ''

    // Steps with progress thresholds
    const steps = locale === 'ru'
      ? [
          { label: 'Обрабатываем твои ответы', threshold: 5 },
          { label: 'Строим профиль из 36 векторов', threshold: 22 },
          { label: 'Анализируем карьерные траектории', threshold: 42 },
          { label: 'Составляем личный портрет', threshold: 65 },
          { label: 'Подбираем знаменитых двойников', threshold: 82 },
        ]
      : locale === 'ky'
      ? [
          { label: 'Жоопторуңду иштетүүдөбүз', threshold: 5 },
          { label: '36 вектор профилин түзүүдөбүз', threshold: 22 },
          { label: 'Карьера жолдорун талдоодобуз', threshold: 42 },
          { label: 'Жеке портретиңди даярдоодобуз', threshold: 65 },
          { label: 'Окшош адамдарды издөөдөбүз', threshold: 82 },
        ]
      : [
          { label: 'Processing your answers', threshold: 5 },
          { label: 'Building your 36-vector profile', threshold: 22 },
          { label: 'Analysing career trajectories', threshold: 42 },
          { label: 'Crafting your personal portrait', threshold: 65 },
          { label: 'Finding your famous matches', threshold: 82 },
        ]

    const activeStep = steps.reduce((acc, s, i) => progress >= s.threshold ? i : acc, -1)

    // SVG circular progress ring
    const R = 72
    const circ = 2 * Math.PI * R
    const offset = circ * (1 - progress / 100)

    return (
      <div className="min-h-screen bg-radial flex flex-col items-center justify-center px-6 relative overflow-hidden">

        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: topColor }} />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-5 blur-3xl"
            style={{ background: topColor }} />
        </div>

        {/* IV wordmark */}
        <p className="text-slate-600 text-[11px] tracking-[0.25em] uppercase font-medium mb-12">
          INNER VECTOR
        </p>

        {/* Circular progress ring */}
        <div className="relative flex items-center justify-center mb-8">
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            {/* Track */}
            <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            {/* Glow circle (blurred duplicate) */}
            <circle cx="90" cy="90" r={R} fill="none" stroke={topColor} strokeWidth="6"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round" opacity="0.25"
              style={{ filter: 'blur(6px)', transition: 'stroke-dashoffset 0.4s ease' }} />
            {/* Progress arc */}
            <circle cx="90" cy="90" r={R} fill="none" stroke={topColor} strokeWidth="3"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-0.5"
              style={{ background: `radial-gradient(circle, ${topColor}18 0%, transparent 70%)`,
                       border: `1px solid ${topColor}20` }}>
              <span className="font-serif font-bold text-3xl tabular-nums" style={{ color: topColor }}>
                {progress}
              </span>
            </div>
            <span className="text-slate-600 text-[10px] tracking-widest uppercase">%</span>
          </div>
        </div>

        {/* Agents ticker */}
        <AgentsTicker progress={progress} topColor={topColor} locale={locale} />

        {/* Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl text-white text-center mb-1">
          {locale === 'ru'
            ? (firstName ? `Анализируем тебя, ${firstName}` : 'Анализируем твой профиль')
            : locale === 'ky'
            ? (firstName ? `${firstName}, профилиңди талдоодобуз` : 'Профилиңди талдоодобуз')
            : (firstName ? `Analysing you, ${firstName}` : 'Analysing your profile')}
        </h1>
        <p className="text-slate-500 text-sm text-center mb-8">
          {locale === 'ru' ? 'Не закрывай страницу — это займёт несколько минут'
            : locale === 'ky' ? 'Барактан чыкпаңыз — бир нече мүнөт созулат'
            : 'Keep this page open — takes a few minutes'}
        </p>

        {/* Thin progress bar */}
        <div className="w-full max-w-sm h-px bg-white/8 rounded-full mb-8 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${topColor}80, ${topColor})`,
                     boxShadow: `0 0 8px ${topColor}60` }} />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {steps.map((step, i) => {
            const done = i < activeStep
            const active = i === activeStep
            return (
              <div key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500"
                style={{
                  background: active ? `${topColor}0d` : done ? 'rgba(255,255,255,0.02)' : 'transparent',
                  border: `1px solid ${active ? topColor + '25' : done ? 'rgba(255,255,255,0.05)' : 'transparent'}`,
                }}>
                {/* Icon */}
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                  style={{
                    background: done ? `${topColor}25` : active ? `${topColor}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${done ? topColor + '50' : active ? topColor + '30' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {done ? (
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      strokeWidth={2.5} style={{ color: topColor }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={2} style={{ color: topColor, animationDuration: '1.2s' }}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                  )}
                </div>

                {/* Label */}
                <span className="text-xs transition-all duration-500"
                  style={{
                    color: done ? 'rgba(148,163,184,0.7)' : active ? '#e2e8f0' : 'rgba(100,116,139,0.5)',
                    fontWeight: active ? 500 : 400,
                  }}>
                  {step.label}
                  {done && <span className="ml-2 opacity-50">✓</span>}
                </span>

                {/* Active pulse dot */}
                {active && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: topColor }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    )
  }

  const topTrait = top5[0]
  const topColor = domainColors[topTrait.d]

  return (
    <div className="min-h-screen bg-radial">

      {/* Confetti — fires once when analysis is first ready */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 140 }).map((_, i) => {
            const colors = ['#d4a843','#e8c96a','#f5d878','#b8922a','#ffd700','#c9a227','#ffe066','#a07820','#fff9c4','#ffec6e']
            const color = colors[i % colors.length]
            const x = Math.random() * 100
            const delay = Math.random() * 1.2
            const duration = 2.5 + Math.random() * 1.8
            const size = 5 + Math.random() * 10
            const rotate = Math.random() * 900
            const shape = i % 4 === 0 ? '50%' : i % 4 === 1 ? '2px' : i % 4 === 2 ? '0%' : '30%'
            const drift = (Math.random() - 0.5) * 120
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${x}%`,
                top: '-24px',
                width: `${size}px`,
                height: `${size * (i % 3 === 0 ? 1 : i % 3 === 1 ? 0.35 : 0.65)}px`,
                background: color,
                borderRadius: shape,
                animation: `confetti-fall-${i % 3} ${duration}s ${delay}s ease-in forwards`,
                transform: `rotate(${rotate}deg)`,
                opacity: 0.95,
                filter: 'drop-shadow(0 0 2px rgba(212,168,67,0.4))',
                '--drift': `${drift}px`,
              } as React.CSSProperties} />
            )
          })}
          <style>{`
            @keyframes confetti-fall-0 {
              0%   { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 1; }
              70%  { opacity: 1; }
              100% { transform: translateY(105vh) translateX(var(--drift)) rotate(800deg) scale(0.4); opacity: 0; }
            }
            @keyframes confetti-fall-1 {
              0%   { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 1; }
              60%  { opacity: 0.9; }
              100% { transform: translateY(105vh) translateX(calc(var(--drift) * -1)) rotate(600deg) scale(0.3); opacity: 0; }
            }
            @keyframes confetti-fall-2 {
              0%   { transform: translateY(0) translateX(0) rotate(0deg) scale(1.2); opacity: 1; }
              75%  { opacity: 1; }
              100% { transform: translateY(105vh) translateX(var(--drift)) rotate(1000deg) scale(0.5); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-24">

        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/vector-test" className="flex items-center gap-2 text-slate-500 hover:text-gold text-xs font-medium tracking-wide transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t.retake}
          </Link>
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Inner Vector" width={32} height={32} className="opacity-90" />
            <span className="text-xs font-semibold tracking-widest uppercase">
              <span className="text-white">Inner Vector</span>
              <span className="text-gold/40 mx-1.5">·</span>
              <span className="text-gold/60">{t.result}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <Link href="/" className="text-slate-500 hover:text-gold text-xs tracking-wide transition-colors">{t.home}</Link>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16 animate-slide-in">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            {testMode === 'express' ? t.expressResultBadge : t.fullResultBadge}
          </div>
          <p className="font-serif text-2xl md:text-3xl text-slate-400 font-normal mb-2">{t.dominantForce}</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-6"
            style={{ color: topColor, textShadow: `0 0 60px ${topColor}33` }}>
            {getTraitName(topTrait.name)}
          </h1>
          <div className="w-12 h-px bg-gold/20 mx-auto mb-6" />
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            {getTraitFields(topTrait.name)?.short}
          </p>
        </div>

        {/* ── AI Essence Hero Quote ──────────────────────────────────────── */}
        {analysis && (
          <div className="mb-16 text-center animate-slide-in">
            <p className="font-serif text-xl md:text-2xl text-white leading-relaxed max-w-2xl mx-auto mb-4"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.05)' }}>
              <span className="text-gold/50 font-serif text-3xl leading-none mr-1">&ldquo;</span>
              {analysis.essence}
              <span className="text-gold/50 font-serif text-3xl leading-none ml-1">&rdquo;</span>
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5">
              <span className="w-1 h-1 rounded-full bg-gold/60" />
              <span className="text-gold/70 text-xs font-medium tracking-widest uppercase">{analysis.dominantTheme}</span>
              <span className="w-1 h-1 rounded-full bg-gold/60" />
            </div>
          </div>
        )}

        {/* ── Top 5 Strengths ─────────────────────────────────────────────── */}
        <Section label={t.top5Label}>
          <div className="space-y-3">
            {top5.map((trait, i) => {
              const color = domainColors[trait.d]
              const fields = getTraitFields(trait.name)
              return (
                <div key={trait.name}
                  className="rounded-2xl overflow-hidden border backdrop-blur-sm"
                  style={{ borderColor: i === 0 ? color + '50' : 'rgba(255,255,255,0.07)', background: i === 0 ? color + '08' : 'rgba(255,255,255,0.02)' }}>
                  {/* progress bar */}
                  <div className="h-0.5 bg-white/5">
                    <div className="h-full transition-all duration-1000" style={{ width: `${normPct(trait.pct)}%`, background: color, boxShadow: `0 0 8px ${color}55` }} />
                  </div>
                  <div className="px-5 py-4">
                    {/* header row */}
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

        {/* ── AI Analysis loading state ───────────────────────────────────── */}
        {analysisLoading && (
          <div className="mb-10 flex items-center gap-3 px-5 py-4 rounded-2xl bg-gold/5 border border-gold/15">
            <div className="w-4 h-4 rounded-full border-2 border-gold/30 border-t-gold animate-spin flex-shrink-0" />
            <p className="text-slate-400 text-sm">
              {locale === 'en' ? 'Generating your personal analysis…' : locale === 'ky' ? 'Жеке анализ жаратылууда…' : 'Генерируем твой личный анализ…'}
            </p>
          </div>
        )}

        {/* ── Where you shine ─────────────────────────────────────────────── */}
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

        {/* ── Career ──────────────────────────────────────────────────────── */}
        {analysis?.career && (
          <Section label={locale === 'en' ? 'CAREER DIRECTIONS TO EXPLORE' : locale === 'ky' ? 'ИЗИЛДӨӨ ҮЧҮН КАРЬЕРА БАГЫТТАРЫ' : 'КАРЬЕРНЫЕ НАПРАВЛЕНИЯ ДЛЯ ИССЛЕДОВАНИЯ'}>
            <div className="space-y-4">
              <p className="text-slate-500 text-xs leading-relaxed">
                {locale === 'ru'
                  ? 'Таланты не определяют профессию — они показывают, в каких ролях и средах ты будешь в своей стихии. Это направления для исследования, не предписание.'
                  : locale === 'ky'
                  ? 'Таланттар кесипти аныктабайт — алар кайсы ролдордо жана чөйрөлөрдө өзүңдү толук ача аларыңды көрсөтөт. Бул изилдөө үчүн багыттар, буйрук эмес.'
                  : 'Talents don’t determine your profession — they show which roles and environments let you thrive. These are directions to explore, not a prescription.'}
              </p>
              {/* Summary */}
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <p className="text-slate-300 text-sm leading-relaxed">{analysis.career.summary}</p>
              </div>

              {/* Roles */}
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

              {/* Environments + Avoid */}
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

        {/* ── Business Partnership ─────────────────────────────────────────── */}
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

        {/* ── Love & Relationships ─────────────────────────────────────────── */}
        <Section label={t.loveLabel}>
          {analysis ? (
            <div className="space-y-4">
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <p className="text-slate-300 text-sm leading-relaxed">{analysis.love.summary}</p>
              </div>
              <div className="space-y-3">
                {analysis.love.dynamics.map((d, i) => {
                  const color = domainColors[top5[i]?.d ?? 'rost']
                  const icons = t.loveIcons
                  return (
                    <div key={i} className="rounded-2xl border p-5"
                      style={{ borderColor: color + '30', background: color + '06' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg">{icons[i]}</span>
                        <div className="font-serif text-base text-white font-semibold">{d.vector}</div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-2">{d.strength}</p>
                      <p className="text-slate-500 text-xs leading-relaxed italic border-l-2 pl-3"
                        style={{ borderColor: color + '40' }}>{d.shadow}</p>
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

        {/* ── Blind spots & Combinations & Famous (AI only) ──────────────── */}
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
                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                              {typeLabel}
                            </span>
                            <div className="font-serif text-white text-base font-semibold mt-1">{combo.name}</div>
                          </div>
                        </div>
                        <span className="text-slate-600 text-[10px] whitespace-nowrap flex-shrink-0 mt-1">{combo.intensity ?? combo.rarity}</span>
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
                    const initials = person.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
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

        {/* ── LAYER 2: Energy Signature ───────────────────────────────── */}
        {analysis?.energySignature && (
          <Section label={locale === 'en' ? 'ENERGY SIGNATURE' : locale === 'ky' ? 'ЭНЕРГИЯ ПОДПИСЫ' : 'ЭНЕРГЕТИЧЕСКАЯ ПОДПИСЬ'}>
            <div className="space-y-4">
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <p className="text-slate-300 text-sm leading-relaxed">{analysis.energySignature.summary}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-500/4 border border-emerald-500/15 rounded-2xl p-5">
                  <div className="text-[10px] tracking-widest text-emerald-400/70 uppercase font-medium mb-3">
                    {locale === 'en' ? 'What fuels you' : locale === 'ky' ? 'Сени заряддайт' : 'Что тебя заряжает'}
                  </div>
                  <div className="space-y-3">
                    {analysis.energySignature.energizers.map((e, i) => (
                      <div key={i}>
                        <span className="font-serif text-sm text-white font-semibold">{e.vector}</span>
                        <p className="text-slate-400 text-xs leading-relaxed mt-0.5">{e.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-red-500/4 border border-red-500/12 rounded-2xl p-5">
                  <div className="text-[10px] tracking-widest text-red-400/70 uppercase font-medium mb-3">
                    {locale === 'en' ? 'What drains you' : locale === 'ky' ? 'Сени чарчатат' : 'Что тебя истощает'}
                  </div>
                  <div className="space-y-3">
                    {analysis.energySignature.drainers.map((e, i) => (
                      <div key={i}>
                        <span className="font-serif text-sm text-white font-semibold">{e.vector}</span>
                        <p className="text-slate-400 text-xs leading-relaxed mt-0.5">{e.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* ── LAYER 3: Growth Edges ───────────────────────────────────── */}
        {analysis?.growthEdges && (
          <Section label={locale === 'en' ? 'GROWTH EDGES' : locale === 'ky' ? 'ӨСҮҮ ЧЕКТЕРИ' : 'ЗОНЫ РОСТА'}>
            <div className="space-y-4">
              <div className="bg-white/2 border border-white/7 rounded-2xl p-6">
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{analysis.growthEdges.summary}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/20 bg-gold/5">
                  <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-gold text-sm font-medium">{analysis.growthEdges.style}</span>
                </div>
              </div>
              <div className="space-y-3">
                {analysis.growthEdges.edges.map((e, i) => (
                  <div key={i} className="flex gap-3 bg-white/2 border border-white/7 rounded-xl p-4">
                    <div className="w-1 rounded-full flex-shrink-0" style={{ background: '#d4a843', minHeight: 36 }} />
                    <div>
                      <span className="font-serif text-sm text-white font-semibold">{e.vector}</span>
                      <p className="text-slate-400 text-sm leading-relaxed mt-0.5">{e.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ── All 36 by domain columns (Full only) ────────────────────────── */}
        {testMode === 'full' && traitScores.length > 0 && (
          <Section label={t.all36Label}>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">{t.all36Desc}</p>

            {/* Build rank map for quick lookup */}
            {(() => {
              const rankMap = new Map<string, number>()
              traitScores.forEach((t, i) => rankMap.set(t.name, i + 1))

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {DOMAINS.map(domain => {
                    const color = domainColors[domain]
                    const domainTraits = traitScores
                      .filter(t => t.d === domain)
                      .sort((a, b) => (rankMap.get(a.name) ?? 99) - (rankMap.get(b.name) ?? 99))

                    return (
                      <div key={domain} className="flex flex-col gap-1.5 min-w-0">
                        {/* Domain header */}
                        <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl mb-0.5 w-full"
                          style={{ background: color + '15', border: `1px solid ${color}35` }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="text-[10px] font-bold leading-none whitespace-nowrap"
                            style={{ color }}>
                            {getDomainName(domain)}
                          </span>
                        </div>

                        {/* Traits — all 36 numbered, vertical layout */}
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
              )
            })()}

            {/* Legend */}
            <div className="flex items-center gap-5 mt-5 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-gold/20 border border-gold/50" />
                <span className="text-[10px] text-slate-500">
                  {locale === 'en' ? 'Top 5' : locale === 'ky' ? 'Топ 5' : 'Топ 5'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-white/5 border border-white/15" />
                <span className="text-[10px] text-slate-500">6–12</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-white/2 border border-white/5" />
                <span className="text-[10px] text-slate-500">
                  {locale === 'en' ? 'Background' : locale === 'ky' ? 'Фондук' : 'Фоновые'}
                </span>
              </div>
            </div>
          </Section>
        )}

        {/* Methodology note */}
        <div className="mb-8 bg-white/2 border border-white/8 rounded-2xl p-5">
          <div className="text-[10px] tracking-widest text-slate-500 uppercase font-medium mb-2">
            {locale === 'en' ? 'About this report' : locale === 'ky' ? 'Отчёт жөнүндө' : 'О методе'}
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            {locale === 'en'
              ? 'Inner Vector is a reflective self-discovery and coaching tool, not a clinical or validated psychometric test. Percentages show your relative lean between vectors (within yourself), not an absolute score compared to other people.'
              : locale === 'ky'
              ? 'Inner Vector — өзүн-өзү таануу жана коучинг үчүн рефлексиялык курал, клиникалык же валидацияланган психометрикалык тест эмес. Пайыздар өзүңдүн ичиңдеги векторлордун салыштырмалуу ийилишин көрсөтөт.'
              : 'Inner Vector — рефлексивный инструмент для самопознания и коучинга, а не клинический или валидированный психометрический тест. Проценты показывают относительный наклон между твоими векторами, а не абсолютный балл в сравнении с другими.'}
            {testMode === 'express' && (locale === 'ru'
              ? ' Экспресс — это быстрый снимок твоих ведущих векторов, а не полное ранжирование всех 36. Для точной картины пройди полный тест.'
              : locale === 'ky'
              ? ' Экспресс — бул сенин негизги векторлоруңдун тез сүрөтү, 36нын толук рейтинги эмес.'
              : ' Express is a quick snapshot of your leading vectors, not a full ranking of all 36. Take the full test for the precise picture.')}
          </p>
        </div>

        {/* Share profile */}
        {profileUrl && (
          <div className="mb-8 bg-white/2 border border-gold/15 rounded-2xl p-5">
            <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-3">
              {locale === 'en' ? 'Your profile link' : locale === 'ky' ? 'Профилиңдин шилтемеси' : 'Ссылка на твой профиль'}
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
        )}

        {/* CTA */}
        <div className="flex justify-center gap-4 flex-wrap mt-4">
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

const AGENTS_RU = [
  'Агент Профиля', 'Агент Карьеры', 'Агент Бизнеса', 'Агент Отношений',
  'Агент Слепых зон', 'Агент Комбинаций', 'Агент Личности', 'Агент Векторов',
  'Агент Среды', 'Агент Знаменитостей', 'Агент Партнёрства', 'Агент Синтеза',
]
const AGENTS_EN = [
  'Profile Agent', 'Career Agent', 'Business Agent', 'Relationship Agent',
  'Blind Spot Agent', 'Combination Agent', 'Personality Agent', 'Vector Agent',
  'Environment Agent', 'Famous Match Agent', 'Partnership Agent', 'Synthesis Agent',
]
const AGENTS_KY = [
  'Профиль Агенти', 'Карьера Агенти', 'Бизнес Агенти', 'Мамиле Агенти',
  'Көр Жак Агенти', 'Айкалыш Агенти', 'Инсан Агенти', 'Вектор Агенти',
  'Чөйрө Агенти', 'Белгилүү Адам Агенти', 'Өнөктүк Агенти', 'Синтез Агенти',
]

function AgentsTicker({ progress, topColor, locale }: { progress: number; topColor: string; locale: string }) {
  const agents = locale === 'ru' ? AGENTS_RU : locale === 'ky' ? AGENTS_KY : AGENTS_EN
  const activeCount = Math.max(1, Math.min(12, Math.ceil((progress / 92) * 12)))
  const currentAgent = agents[activeCount - 1]

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      {/* Active agents count */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full border"
        style={{ borderColor: topColor + '30', background: topColor + '08' }}>
        <div className="flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: i < activeCount ? topColor : 'rgba(255,255,255,0.08)',
                boxShadow: i < activeCount ? `0 0 4px ${topColor}80` : 'none',
                transform: i === activeCount - 1 ? 'scale(1.4)' : 'scale(1)',
              }} />
          ))}
        </div>
        <span className="text-xs font-medium" style={{ color: topColor }}>
          {activeCount} / 12
        </span>
      </div>
      {/* Current agent name */}
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: topColor }} />
        <span className="text-slate-500 text-xs">{currentAgent}</span>
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


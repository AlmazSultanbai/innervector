import type { Locale } from '@/store/localeStore'

export const ui: Record<Locale, {
  back: string
  testBadge: string
  headline1: string
  headline2: string
  subtitle: string
  modeExpress: string
  modeFull: string
  subtitleExpress: string
  subtitleFull: string
  formTitle: string
  namePlaceholder: string
  phonePlaceholder: string
  emailPlaceholder: string
  nameError: string
  phoneError: string
  emailError: string
  emailInvalidError: string
  startBtn: string
  noteText: string
  // test page
  questionOf: (current: number, total: number) => string
  optionA: string
  optionB: string
  neutral: string
  // report page
  yourVector: string
  dominantForce: string
  top5Label: string
  whereYouShine: string
  whereYouShineDesc: string
  bizLabel: string
  bizWhatYouBring: string
  bizWhoYouNeed: string
  bizWhoDesc: string
  loveLabel: string
  strengthLabel: string
  darkLabel: string
  loveIcons: [string, string, string]
  retake: string
  home: string
  result: string
  takeTestFirst: string
  toStart: string
  // full report extras
  next5Label: string
  next5Desc: string
  all36Label: string
  all36Desc: string
  rankLabel: string
  expressResultBadge: string
  fullResultBadge: string
}> = {
  ru: {
    back: 'Назад',
    testBadge: 'Авторская методология',
    headline1: 'Узнай свой',
    headline2: 'внутренний вектор',
    subtitle: '108 вопросов · 36 характеристик · ~15 минут',
    modeExpress: '⚡ Express',
    modeFull: 'Full',
    subtitleExpress: '36 вопросов · 36 характеристик · ~10 минут',
    subtitleFull: '108 вопросов · 36 характеристик · ~25 минут',
    formTitle: 'Заполни форму, чтобы начать тест',
    namePlaceholder: 'Имя и Фамилия',
    phonePlaceholder: 'Телефон',
    emailPlaceholder: 'Email',
    nameError: 'Введите имя и фамилию',
    phoneError: 'Введите телефон',
    emailError: 'Введите email',
    emailInvalidError: 'Некорректный email',
    startBtn: 'Начать тест',
    noteText: 'Отвечай быстро — первый импульс точнее размышления',
    questionOf: (c, t) => `${c} / ${t}`,
    optionA: 'А',
    optionB: 'Б',
    neutral: 'Нейтрально',
    yourVector: 'Твой вектор',
    dominantForce: 'Доминирующая сила',
    top5Label: 'ТВОИ 5 СИЛЬНЫХ СТОРОН',
    whereYouShine: 'ГДЕ ТЫ В СВОЕЙ СТИХИИ',
    whereYouShineDesc: 'Твои сильные стороны раскрываются полностью в этих контекстах. Это не список профессий — это среды где твоя природа работает, а не сопротивляется.',
    bizLabel: 'В ДЕЛЕ И ПАРТНЁРСТВЕ',
    bizWhatYouBring: 'Что ты привносишь в дело',
    bizWhoYouNeed: 'Кто тебе нужен рядом',
    bizWhoDesc: 'Эти характеристики у партнёра или команды дополняют тебя и закрывают слепые зоны твоего профиля.',
    loveLabel: 'В ЛЮБВИ И БЛИЗОСТИ',
    strengthLabel: 'Сильная сторона',
    darkLabel: 'Тёмная сторона',
    loveIcons: ['❤️', '🔥', '🌊'],
    retake: 'Пройти заново',
    home: 'Главная',
    result: 'Результат',
    takeTestFirst: 'Пройди тест сначала',
    toStart: 'К началу',
    next5Label: 'СЛЕДУЮЩИЕ 5 ВЕКТОРОВ',
    next5Desc: 'Сильные стороны которые усиливают твой профиль и проявляются в нужный момент.',
    all36Label: 'ВСЕ 36 ВЕКТОРОВ',
    all36Desc: 'Полная картина твоей природы — от самых сильных до фоновых.',
    rankLabel: 'Ранг',
    expressResultBadge: 'Express · 36 вопросов',
    fullResultBadge: 'Full · 108 вопросов',
  },
  en: {
    back: 'Back',
    testBadge: 'Proprietary methodology',
    headline1: 'Discover your',
    headline2: 'inner vector',
    subtitle: '108 questions · 36 traits · ~15 min',
    modeExpress: '⚡ Express',
    modeFull: 'Full',
    subtitleExpress: '36 questions · 36 traits · ~10 min',
    subtitleFull: '108 questions · 36 traits · ~25 min',
    formTitle: 'Fill in the form to start the test',
    namePlaceholder: 'Full Name',
    phonePlaceholder: 'Phone',
    emailPlaceholder: 'Email',
    nameError: 'Enter your full name',
    phoneError: 'Enter your phone number',
    emailError: 'Enter your email',
    emailInvalidError: 'Invalid email address',
    startBtn: 'Start the test',
    noteText: 'Answer quickly — your first impulse is more accurate than reflection',
    questionOf: (c, t) => `${c} / ${t}`,
    optionA: 'A',
    optionB: 'B',
    neutral: 'Neutral',
    yourVector: 'Your vector',
    dominantForce: 'Dominant strength',
    top5Label: 'YOUR TOP 5 STRENGTHS',
    whereYouShine: 'WHERE YOU THRIVE',
    whereYouShineDesc: 'Your strengths fully unfold in these contexts. This is not a list of professions — these are environments where your nature works with you, not against you.',
    bizLabel: 'IN BUSINESS & PARTNERSHIP',
    bizWhatYouBring: 'What you bring to the table',
    bizWhoYouNeed: 'Who you need around you',
    bizWhoDesc: 'These traits in a partner or team complement you and cover the blind spots in your profile.',
    loveLabel: 'IN LOVE & INTIMACY',
    strengthLabel: 'Strength',
    darkLabel: 'Shadow side',
    loveIcons: ['❤️', '🔥', '🌊'],
    retake: 'Retake the test',
    home: 'Home',
    result: 'Result',
    takeTestFirst: 'Take the test first',
    toStart: 'To the start',
    next5Label: 'NEXT 5 VECTORS',
    next5Desc: 'Strengths that amplify your profile and emerge when needed.',
    all36Label: 'ALL 36 VECTORS',
    all36Desc: 'The complete picture of your nature — from the strongest to the background.',
    rankLabel: 'Rank',
    expressResultBadge: 'Express · 36 questions',
    fullResultBadge: 'Full · 108 questions',
  },
  ky: {
    back: 'Артка',
    testBadge: 'Авторлук методология',
    headline1: 'Өз ички',
    headline2: 'векторуңду тап',
    subtitle: '108 суроо · 36 мүнөздөмө · ~15 мин',
    modeExpress: '⚡ Express',
    modeFull: 'Full',
    subtitleExpress: '36 суроо · 36 мүнөздөмө · ~10 мин',
    subtitleFull: '108 суроо · 36 мүнөздөмө · ~25 мин',
    formTitle: 'Тестти баштоо үчүн формуну толтур',
    namePlaceholder: 'Аты-жөнү',
    phonePlaceholder: 'Телефон',
    emailPlaceholder: 'Email',
    nameError: 'Аты-жөнүңдү жаз',
    phoneError: 'Телефонуңду жаз',
    emailError: 'Email жаз',
    emailInvalidError: 'Туура эмес email',
    startBtn: 'Тестти баштоо',
    noteText: 'Тез жооп бер — биринчи сезим ой жүгүртүүдөн так',
    questionOf: (c, t) => `${c} / ${t}`,
    optionA: 'А',
    optionB: 'Б',
    neutral: 'Бейтарап',
    yourVector: 'Сенин векторуң',
    dominantForce: 'Башкы күч',
    top5Label: 'СЕНИН 5 КУЧ ЖАГЫҢ',
    whereYouShine: 'СЕНИН СТИХИЯҢ',
    whereYouShineDesc: 'Сенин күчтүү жактарың ушул чөйрөлөрдө толук ачылат. Бул кесиптердин тизмеси эмес — сенин жаратылышың каршылыксыз иштеген чөйрөлөр.',
    bizLabel: 'ИШ ЖАНА ӨНӨКТӨШТҮК',
    bizWhatYouBring: 'Сен эмне киргизесиң',
    bizWhoYouNeed: 'Сага ким керек',
    bizWhoDesc: 'Өнөктөштүн же командадагы бул сапаттар сени толуктап, профилиңдеги сокур зоналарды жабат.',
    loveLabel: 'СҮЙҮҮ ЖАНА ЖАКЫНДЫК',
    strengthLabel: 'Күчтүү жак',
    darkLabel: 'Көлөкө жак',
    loveIcons: ['❤️', '🔥', '🌊'],
    retake: 'Кайра тапшыруу',
    home: 'Башкы бет',
    result: 'Жыйынтык',
    takeTestFirst: 'Алгач тестти тапшыр',
    toStart: 'Башына',
    next5Label: 'КИЙИНКИ 5 ВЕКТОР',
    next5Desc: 'Сенин профилиңди күчөткөн жана керек учурда пайда болгон күчтүү жактар.',
    all36Label: 'БАРДЫК 36 ВЕКТОР',
    all36Desc: 'Сенин жаратылышыңдын толук сүрөтү — эң күчтүүдөн фондукка чейин.',
    rankLabel: 'Орун',
    expressResultBadge: 'Express · 36 суроо',
    fullResultBadge: 'Full · 108 суроо',
  },
}

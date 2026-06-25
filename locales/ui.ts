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
  // rules page
  rulesTitle: string
  rulesSubtitle: string
  rulesStartBtn: string
  rules: { icon: string; title: string; desc: string }[]
  // how-it-works demo
  howItWorksTitle: string
  howItWorksDesc: string
  exampleA: string
  exampleB: string
  scaleLabels: [string, string, string, string, string]
  // free trial banner
  freeBadge: string
  freeDaysLeft: (n: number) => string
}> = {
  ru: {
    back: 'Назад',
    testBadge: 'Авторская методология',
    headline1: 'Узнай свой',
    headline2: 'внутренний вектор',
    subtitle: '68 вопросов · 34 таланта · ~17 минут',
    modeExpress: '⚡ Express',
    modeFull: 'Full',
    subtitleExpress: '34 вопроса · 34 таланта · ~10 минут',
    subtitleFull: '68 вопросов · 34 таланта · ~17 минут',
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
    all36Label: 'ВСЕ 34 ТАЛАНТА',
    all36Desc: 'Полная картина твоей природы — от самых сильных до фоновых.',
    rankLabel: 'Ранг',
    expressResultBadge: 'Express · 34 вопроса',
    fullResultBadge: 'Full · 68 вопросов',
    rulesTitle: 'Как проходить тест',
    rulesSubtitle: 'Прочитай правила — это займёт 30 секунд',
    rulesStartBtn: 'Начать тест',
    rules: [
      { icon: '⚡', title: 'Доверяй первому импульсу', desc: 'У тебя 30 секунд на вопрос. Отвечай инстинктивно — первая реакция точнее долгих раздумий.' },
      { icon: '⚖️', title: 'Нет правильных ответов', desc: 'Это не экзамен. Выбирай то, что ближе тебе, а не то, что кажется «правильным» или «лучшим».' },
      { icon: '🎯', title: 'Будь честен с собой', desc: 'Тест показывает кто ты есть, а не каким хочешь казаться. Чем честнее — тем точнее результат.' },
      { icon: '🔇', title: 'Убери отвлекающие факторы', desc: 'Найди тихое место. Не отвлекайся на телефон и разговоры — каждый вопрос требует полного внимания.' },
      { icon: '⏱️', title: 'Таймер не враг', desc: 'Если время вышло — вопрос засчитывается как нейтральный. Не переживай: это тоже информация о тебе.' },
    ],
    howItWorksTitle: 'Как устроен каждый вопрос',
    howItWorksDesc: 'Два утверждения — выбери, какое из них ближе к тебе, и насколько',
    exampleA: 'Я предпочитаю действовать сразу',
    exampleB: 'Я сначала думаю, потом делаю',
    scaleLabels: ['Точно А', 'Скорее А', 'Нейтрально', 'Скорее Б', 'Точно Б'],
    freeBadge: '15 ДНЕЙ БЕСПЛАТНО',
    freeDaysLeft: (n) => {
      const mod10 = n % 10; const mod100 = n % 100
      const word = (mod10 === 1 && mod100 !== 11) ? 'день' : (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) ? 'дня' : 'дней'
      return `Осталось ${n} ${word}`
    },
  },
  en: {
    back: 'Back',
    testBadge: 'Proprietary methodology',
    headline1: 'Discover your',
    headline2: 'inner vector',
    subtitle: '68 questions · 34 talents · ~17 min',
    modeExpress: '⚡ Express',
    modeFull: 'Full',
    subtitleExpress: '34 questions · 34 talents · ~10 min',
    subtitleFull: '68 questions · 34 talents · ~17 min',
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
    all36Label: 'ALL 34 TALENTS',
    all36Desc: 'The complete picture of your nature — from the strongest to the background.',
    rankLabel: 'Rank',
    expressResultBadge: 'Express · 34 questions',
    fullResultBadge: 'Full · 68 questions',
    rulesTitle: 'How to take the test',
    rulesSubtitle: 'Read the rules — it takes 30 seconds',
    rulesStartBtn: 'Start the test',
    rules: [
      { icon: '⚡', title: 'Trust your first instinct', desc: 'You have 30 seconds per question. Answer instinctively — your first reaction is more accurate than overthinking.' },
      { icon: '⚖️', title: 'No right or wrong answers', desc: 'This is not an exam. Choose what feels true to you, not what seems "better" or "more correct".' },
      { icon: '🎯', title: 'Be honest with yourself', desc: 'The test reveals who you are, not who you want to appear to be. The more honest you are, the more accurate the result.' },
      { icon: '🔇', title: 'Remove distractions', desc: 'Find a quiet place. Put your phone away and focus — each question deserves your full attention.' },
      { icon: '⏱️', title: 'The timer is not your enemy', desc: 'If time runs out, the question is counted as neutral. That\'s fine — it\'s also information about you.' },
    ],
    howItWorksTitle: 'How each question works',
    howItWorksDesc: 'Two statements — pick which one is closer to you, and how much',
    exampleA: 'I prefer to act immediately',
    exampleB: 'I think first, then act',
    scaleLabels: ['Strongly A', 'Lean A', 'Neutral', 'Lean B', 'Strongly B'],
    freeBadge: '15 DAYS FREE',
    freeDaysLeft: (n) => `${n} day${n === 1 ? '' : 's'} left`,
  },
  ky: {
    back: 'Артка',
    testBadge: 'Авторлук методология',
    headline1: 'Өз ички',
    headline2: 'векторуңду тап',
    subtitle: '68 суроо · 34 талант · ~17 мин',
    modeExpress: '⚡ Express',
    modeFull: 'Full',
    subtitleExpress: '34 суроо · 34 талант · ~10 мин',
    subtitleFull: '68 суроо · 34 талант · ~17 мин',
    formTitle: 'Тестти баштоо үчүн форманы толтуруңуз',
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
    top5Label: 'СЕНИН 5 КҮЧ ЖАГЫҢ',
    whereYouShine: 'СЕНИН СТИХИЯҢ',
    whereYouShineDesc: 'Сенин күчтүү жактарың ушул чөйрөлөрдө толук ачылат. Бул кесиптердин тизмеси эмес — сенин жаратылышың каршылыксыз иштеген чөйрөлөр.',
    bizLabel: 'ИШ ЖАНА ӨНӨКТӨШТҮК',
    bizWhatYouBring: 'Сен эмне кошосуң',
    bizWhoYouNeed: 'Сага ким керек',
    bizWhoDesc: 'Өнөктөштүн же командадагы бул сапаттар сени толуктап, профилиңдеги алсыз жерлерди жабат.',
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
    all36Label: 'БАРДЫК 34 ТАЛАНТ',
    all36Desc: 'Сенин жаратылышыңдын толук сүрөтү — эң күчтүүдөн фондукка чейин.',
    rankLabel: 'Орун',
    expressResultBadge: 'Express · 34 суроо',
    fullResultBadge: 'Full · 68 суроо',
    rulesTitle: 'Тестти кантип өтүү керек',
    rulesSubtitle: 'Эрежелерди окуп чык — 30 секунд убакыт кетет',
    rulesStartBtn: 'Тестти баштоо',
    rules: [
      { icon: '⚡', title: 'Биринчи сезимиңе ишен', desc: 'Ар бир суроого 30 секунд берилет. Инстинктивдүү жооп бер — биринчи реакция узак ойлонуудан так.' },
      { icon: '⚖️', title: 'Туура же туура эмес жооп жок', desc: 'Бул экзамен эмес. Сага жакыныраак болгонду тандап, "туура" же "жакшы" көрүнгөндү эмес.' },
      { icon: '🎯', title: 'Өзүңө чынчыл бол', desc: 'Тест сен ким экениңди көрсөтөт, ким болгуң келгениңди эмес. Чынчыл болгон сайын натыйжа так болот.' },
      { icon: '🔇', title: 'Алаксыткан нерселерди алып кет', desc: 'Тынч жер тап. Телефонду жана сүйлөшүүлөрдү токтот — ар бир суроо толук көңүл буруунду талап кылат.' },
      { icon: '⏱️', title: 'Таймер душман эмес', desc: 'Убакыт бүтсө, суроо бейтарап деп эсептелет. Кабатырланба — бул да сен жөнүндө маалымат.' },
    ],
    howItWorksTitle: 'Ар бир суроо кантип иштейт',
    howItWorksDesc: 'Эки ырастоо — кайсынысы сага жакыныраак экенин жана канчалык деп тандап ал',
    exampleA: 'Мен дароо аракет кылганды жакшы көрөм',
    exampleB: 'Мен алдын ала ойлонуп, андан кийин жасайм',
    scaleLabels: ['Так А', 'Дээрлик А', 'Бейтарап', 'Дээрлик Б', 'Так Б'],
    freeBadge: '15 КҮН БЕКЕР',
    freeDaysLeft: (n) => `${n} күн калды`,
  },
}

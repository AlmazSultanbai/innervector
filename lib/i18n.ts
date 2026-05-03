export type Lang = 'en' | 'ru';

export const translations = {
  en: {
    // Header
    badge: 'Strengths Intelligence',
    heroTitle1: 'Discover Your',
    heroTitle2: 'Talent DNA',
    heroSubtitle: 'Select your top 5 strengths and receive a deep AI analysis of your unique talent combination.',

    // Input page
    selected: 'selected',
    clearAll: 'Clear all',
    searchPlaceholder: 'Search strengths...',
    revealBtn: 'Reveal My Talent DNA',
    selectMore: (n: number) => `Select ${n} more strength${n !== 1 ? 's' : ''}`,
    selectCount: (n: number) => `${n} of 10 selected`,
    poweredBy: 'Powered by Claude AI · Analysis takes ~10 seconds',
    footer: 'Inner Vector · Talent assessment tool. Strength theme names are property of their respective owners.',

    // Upload
    uploadTitle: 'Upload Your Strengths Report',
    uploadSubtitle: 'Drop your PDF or screenshot and Claude will extract your strengths automatically',
    uploadOr: 'or',
    uploadManualTitle: 'Select Manually',
    uploadManualSubtitle: 'Pick your top 5 strengths by hand',
    uploadDrop: 'Drop your strengths report here',
    uploadBrowse: 'or click to browse',
    uploadFormats: 'PDF · PNG · JPG · WebP — max 10 MB',
    uploadReading: 'Reading your report...',
    uploadFound: (n: number) => `Found ${n} strengths — top 5 selected`,
    uploadFoundAll: (n: number) => `Extracted ${n} strengths from your report`,
    uploadError: 'Could not read the file. Please try another image or PDF.',
    uploadRetry: 'Try another file',
    uploadChangeFile: 'Change file',
    uploadSuccessHint: 'Review the extracted strengths below, then click Reveal.',

    // Nav
    newAnalysis: 'New Analysis',
    share: 'Share',
    copied: 'Copied!',

    // Results sections
    dominantSuffix: 'Dominant',
    top5Title: 'Your Top Strengths',
    superpowerLabel: 'Your Superpower',
    interactionLabel: 'How They Interact',
    blindSpotsTitle: 'Blind Spots to Watch',
    famousTitle: 'Famous Strengths Matches',
    careersTitle: 'Ideal Careers & Activities',
    firstStepLabel: 'First step',
    analyzeAnother: 'Analyze a Different Profile',

    // Loading / error
    analyzingTitle: 'Analyzing your talent DNA...',
    analyzingSubtitle: 'Claude is mapping your unique strengths profile',
    errorMessage: 'Failed to analyze strengths. Please check your API key and try again.',
    tryAgain: 'Try Again',
    loading: 'Loading...',
  },
  ru: {
    // Header
    badge: 'Анализ профиля талантов',
    heroTitle1: 'Откройте свою',
    heroTitle2: 'ДНК талантов',
    heroSubtitle: 'Выберите 5 главных сильных сторон и получите глубокий AI-анализ вашей уникальной комбинации талантов.',

    // Input page
    selected: 'выбрано',
    clearAll: 'Очистить всё',
    searchPlaceholder: 'Поиск сильных сторон...',
    revealBtn: 'Раскрыть мою ДНК талантов',
    selectMore: (n: number) => `Выберите ещё ${n} ${n === 1 ? 'сильную сторону' : n < 5 ? 'сильные стороны' : 'сильных сторон'}`,
    selectCount: (n: number) => `${n} из 10 выбрано`,
    poweredBy: 'Работает на Claude AI · Анализ занимает ~10 секунд',
    footer: 'Inner Vector · Инструмент оценки талантов. Названия тем являются собственностью их правообладателей.',

    // Upload
    uploadTitle: 'Загрузите ваш отчёт',
    uploadSubtitle: 'Прикрепите PDF или скриншот — Claude автоматически извлечёт ваши сильные стороны',
    uploadOr: 'или',
    uploadManualTitle: 'Выбрать вручную',
    uploadManualSubtitle: 'Самостоятельно выберите 5 сильных сторон',
    uploadDrop: 'Перетащите отчёт сюда',
    uploadBrowse: 'или нажмите для выбора файла',
    uploadFormats: 'PDF · PNG · JPG · WebP — макс. 10 МБ',
    uploadReading: 'Читаем ваш отчёт...',
    uploadFound: (n: number) => `Найдено ${n} сильных сторон — выбраны топ-5`,
    uploadFoundAll: (n: number) => `Извлечено ${n} сильных сторон из вашего отчёта`,
    uploadError: 'Не удалось прочитать файл. Попробуйте другое изображение или PDF.',
    uploadRetry: 'Попробовать другой файл',
    uploadChangeFile: 'Изменить файл',
    uploadSuccessHint: 'Проверьте извлечённые сильные стороны ниже, затем нажмите «Раскрыть».',

    // Nav
    newAnalysis: 'Новый анализ',
    share: 'Поделиться',
    copied: 'Скопировано!',

    // Results sections
    dominantSuffix: 'Доминирует',
    top5Title: 'Ваши главные сильные стороны',
    superpowerLabel: 'Ваша суперсила',
    interactionLabel: 'Как они взаимодействуют',
    blindSpotsTitle: 'Слепые зоны',
    famousTitle: 'Известные люди с похожим профилем',
    careersTitle: 'Идеальные карьеры и занятия',
    firstStepLabel: 'Первый шаг',
    analyzeAnother: 'Проанализировать другой профиль',

    // Loading / error
    analyzingTitle: 'Анализируем вашу ДНК талантов...',
    analyzingSubtitle: 'Claude составляет карту вашего уникального профиля сильных сторон',
    errorMessage: 'Не удалось выполнить анализ. Проверьте API-ключ и попробуйте снова.',
    tryAgain: 'Попробовать снова',
    loading: 'Загрузка...',
  },
} as const;

export type Translations = typeof translations['en'];

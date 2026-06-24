'use client'

import Link from 'next/link'
import LangSwitcher from '@/components/LangSwitcher'
import { useLocaleStore } from '@/store/localeStore'

const content = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: June 1, 2026',
    sections: [
      { title: '1. Acceptance', paras: [
        'By using innervector.co you agree to these Terms. If you do not agree, please do not use the service.',
        'You must be at least 18 years old to use Inner Vector. By accessing the service, you confirm that you are 18 or older.',
      ]},
      { title: '2. Description of Service', intro: 'Inner Vector is a personality assessment platform that provides:', items: [
        'A free personality test (Express and Full modes)',
        'A free results summary with your top strengths',
        'An AI-generated full analysis',
        'Tools for analyzing external strengths reports',
      ]},
      { title: '3. Payments', paras: [
        'Premium features may be offered at a one-time price. Payments are processed by Lemon Squeezy, our Merchant of Record, who handles all taxes and compliance on our behalf.',
        'After successful payment your full analysis is unlocked immediately and permanently accessible via your unique profile link.',
      ]},
      { title: '4. Refunds', paras: [
        'See our Refund Policy for details. In general, we offer refunds within 7 days if the AI analysis was not delivered due to a technical error.',
      ]},
      { title: '5. Intellectual Property', paras: [
        'Your test results and profile belong to you. The platform, methodology, design, and AI prompts are proprietary to InnerVector. You may not reproduce or resell our methodology.',
      ]},
      { title: '6. Accuracy Disclaimer', paras: [
        'Inner Vector is an educational and self-reflection tool. Results are not a substitute for professional psychological assessment, career counseling, or medical advice. We make no guarantees about the accuracy of AI-generated analysis.',
      ]},
      { title: '7. Prohibited Use', items: [
        'Scraping or mass-downloading profile data',
        'Using the platform to collect data on others without their consent',
        'Attempting to reverse-engineer the scoring methodology',
      ]},
      { title: '8. Termination', paras: ['We reserve the right to remove content or restrict access if these Terms are violated.'] },
      { title: '9. Governing Law', paras: ['These Terms are governed by the laws of the Kyrgyz Republic. Disputes shall be resolved by negotiation; if unresolved, by courts of competent jurisdiction in Bishkek, Kyrgyzstan.'] },
      { title: '10. Contact', paras: ['Questions about these Terms: aldeco312@gmail.com'] },
    ],
    links: { privacy: 'Privacy Policy', refund: 'Refund Policy', home: 'Home' },
  },
  ru: {
    title: 'Условия использования',
    updated: 'Последнее обновление: 1 июня 2026',
    sections: [
      { title: '1. Принятие условий', paras: [
        'Используя innervector.co, вы соглашаетесь с настоящими Условиями. Если вы не согласны — пожалуйста, не используйте сервис.',
        'Вам должно быть не менее 18 лет для использования Inner Vector. Заходя на сайт, вы подтверждаете, что вам исполнилось 18 лет.',
      ]},
      { title: '2. Описание сервиса', intro: 'Inner Vector — платформа для оценки личности, которая предоставляет:', items: [
        'Бесплатный тест на определение личности (Express и Full режимы)',
        'Бесплатный краткий результат с вашими главными талантами',
        'Полный анализ профиля, сгенерированный с помощью ИИ',
        'Инструменты анализа внешних отчётов о сильных сторонах',
      ]},
      { title: '3. Оплата', paras: [
        'Некоторые функции могут предлагаться за разовую плату. Платежи обрабатываются через Lemon Squeezy — нашего официального торгового посредника, который берёт на себя все налоги и соответствие требованиям.',
        'После успешной оплаты ваш полный анализ разблокируется немедленно и остаётся доступным по вашей уникальной ссылке на профиль.',
      ]},
      { title: '4. Возвраты', paras: [
        'Подробности — в Политике возврата. В общем случае мы принимаем заявки на возврат в течение 7 дней, если анализ ИИ не был сгенерирован из-за технической ошибки с нашей стороны.',
      ]},
      { title: '5. Интеллектуальная собственность', paras: [
        'Ваши результаты теста и профиль принадлежат вам. Платформа, методология, дизайн и AI-промпты являются собственностью InnerVector. Воспроизведение или перепродажа нашей методологии не допускается.',
      ]},
      { title: '6. Отказ от ответственности за точность', paras: [
        'Inner Vector — образовательный инструмент для саморефлексии. Результаты не заменяют профессиональную психологическую оценку, карьерное консультирование или медицинскую помощь. Мы не гарантируем точность анализа, созданного ИИ.',
      ]},
      { title: '7. Запрещённое использование', items: [
        'Скрейпинг или массовое скачивание данных профилей',
        'Использование платформы для сбора данных о других людях без их согласия',
        'Попытки реверс-инжиниринга методологии подсчёта результатов',
      ]},
      { title: '8. Прекращение доступа', paras: ['Мы оставляем за собой право удалять контент или ограничивать доступ при нарушении настоящих Условий.'] },
      { title: '9. Применимое право', paras: ['Настоящие Условия регулируются законодательством Кыргызской Республики. Споры разрешаются путём переговоров; если соглашение не достигнуто — в судах города Бишкека.'] },
      { title: '10. Контакт', paras: ['Вопросы по настоящим Условиям: aldeco312@gmail.com'] },
    ],
    links: { privacy: 'Политика конфиденциальности', refund: 'Политика возврата', home: 'Главная' },
  },
  ky: {
    title: 'Колдонуу шарттары',
    updated: 'Акыркы жаңыртуу: 2026-жылдын 1-июню',
    sections: [
      { title: '1. Шарттарды кабыл алуу', paras: [
        'innervector.co сайтын колдонуу менен сиз ушул Шарттар менен макулдашасыз. Эгер макул болбосоңуз — сервисти колдонбоңуз.',
        'Inner Vector колдонуу үчүн сизге кеминде 18 жаш болушу керек. Сайтка киргениңизде 18 жашка толгонуңузду ырасташасыз.',
      ]},
      { title: '2. Сервисти сүрөттөө', intro: 'Inner Vector — инсандыкты баалоо платформасы, ал төмөнкүлөрдү сунуштайт:', items: [
        'Бекер инсандык тест (Express жана Full режимдер)',
        'Башкы таланттарыңыз менен бекер кыскача натыйжа',
        'ЖИ аркылуу жаратылган толук профиль анализи',
        'Тышкы күчтүү жактар отчёттарын талдоо куралдары',
      ]},
      { title: '3. Төлөм', paras: [
        'Кээ бир функциялар бир жолку акы менен сунушталышы мүмкүн. Төлөмдөр биздин расмий соода делдали Lemon Squeezy аркылуу иштетилет.',
        'Ийгиликтүү төлөмдөн кийин толук анализиңиз дароо ачылат жана уникалдуу профиль шилтемеңиз аркылуу туруктуу жеткиликтүү болот.',
      ]},
      { title: '4. Кайтаруулар', paras: [
        'Толук маалымат үчүн Кайтаруу саясатын караңыз. Жалпы учурда, биздин тараптагы техникалык ката себебинен ЖИ анализи берилбесе, 7 күн ичинде кайтаруу суранычтарын кабыл алабыз.',
      ]},
      { title: '5. Интеллектуалдык менчик', paras: [
        'Тест натыйжаларыңыз жана профилиңиз сизге таандык. Платформа, методология, дизайн жана ЖИ-суроолор InnerVectorдун менчиги. Методологиябызды көбөйтүүгө же кайра сатууга болбойт.',
      ]},
      { title: '6. Тактык боюнча жоопкерчиликтен баш тартуу', paras: [
        'Inner Vector — билим берүү жана өз-өзүңдү рефлексиялоо куралы. Натыйжалар кесипкөй психологиялык баалоонун, карьералык консультациянын же медициналык жардамдын ордун баспайт.',
      ]},
      { title: '7. Тыюу салынган колдонуу', items: [
        'Профиль маалыматтарын скрейпинг же массалык жүктөп алуу',
        'Платформаны башкалардын макулдугусуз алардын маалыматтарын чогултуу үчүн колдонуу',
        'Баллоо методологиясын кайра инженерлөөгө аракет кылуу',
      ]},
      { title: '8. Мүмкүнчүлүктү токтотуу', paras: ['Ушул Шарттар бузулса, контентти жок кылуу же мүмкүнчүлүктү чектөө укугубуз сакталат.'] },
      { title: '9. Колдонулуучу мыйзам', paras: ['Ушул Шарттар Кыргыз Республикасынын мыйзамдары менен жөнгө салынат. Талаш-тартыштар сүйлөшүү жолу менен чечилет; чечиле элек болсо — Бишкек шаарынын сотторунда.'] },
      { title: '10. Байланыш', paras: ['Ушул Шарттар боюнча суроолор: aldeco312@gmail.com'] },
    ],
    links: { privacy: 'Купуялык саясаты', refund: 'Кайтаруу саясаты', home: 'Башкы бет' },
  },
}

export default function TermsPage() {
  const locale = useLocaleStore(s => s.locale)
  const t = content[locale]

  return (
    <div className="min-h-screen bg-radial">
      <div className="max-w-2xl mx-auto px-6 py-16 pb-24">

        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="text-slate-500 hover:text-gold text-xs tracking-widest uppercase transition-colors">
            ← Inner Vector
          </Link>
          <LangSwitcher />
        </div>

        <h1 className="font-serif text-4xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-slate-500 text-sm mb-12">{t.updated}</p>

        <div className="prose-legal">
          {t.sections.map((s) => (
            <Section key={s.title} title={s.title}>
              {'paras' in s && s.paras?.map((p, i) => <p key={i}>{p}</p>)}
              {'intro' in s && s.intro && <p>{s.intro}</p>}
              {'items' in s && s.items && (
                <ul>{s.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
              )}
            </Section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex gap-6 text-xs text-slate-600">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">{t.links.privacy}</Link>
          <Link href="/refund" className="hover:text-slate-400 transition-colors">{t.links.refund}</Link>
          <Link href="/" className="hover:text-slate-400 transition-colors">{t.links.home}</Link>
        </div>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-serif text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="text-slate-400 text-sm leading-relaxed space-y-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_a]:text-gold/80 [&_a]:hover:text-gold [&_strong]:text-slate-300">
        {children}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import LangSwitcher from '@/components/LangSwitcher'
import { useLocaleStore } from '@/store/localeStore'

const content = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: June 1, 2026',
    sections: [
      { title: '1. Who We Are', body: 'InnerVector ("we", "us", "our") operates the website innervector.co — a personality assessment platform. Contact: aldeco312@gmail.com' },
      { title: '2. What Data We Collect', items: [
        'Test answers — your responses to personality questions (stored anonymously by session)',
        'Name, email, phone — provided voluntarily when you want to save your profile',
        'Payment data — processed by Lemon Squeezy; we never store card numbers',
        'Usage data — page views, browser type, collected via Vercel Analytics',
      ]},
      { title: '3. How We Use Your Data', items: [
        'To generate and display your personality profile',
        'To send you your results if you provide an email',
        'To process payments for premium analysis',
        'To improve the product (anonymized, aggregated)',
      ], note: 'We do not sell your data to third parties.' },
      { title: '4. Data Storage', body: 'Your data is stored in Supabase (EU region). We retain profile data indefinitely unless you request deletion. Test sessions without a name are stored anonymously.' },
      { title: '5. Your Rights', rights: [
        'Access the data we hold about you',
        'Request deletion of your data',
        'Correct inaccurate information',
      ], contact: 'To exercise these rights, email us at aldeco312@gmail.com' },
      { title: '6. Cookies', body: 'We use a session cookie (iv_role) solely for admin authentication. We do not use advertising or tracking cookies.' },
      { title: '7. Changes', body: 'We may update this policy. Continued use of the site after changes constitutes acceptance.' },
    ],
    links: { terms: 'Terms of Service', refund: 'Refund Policy', home: 'Home' },
  },
  ru: {
    title: 'Политика конфиденциальности',
    updated: 'Последнее обновление: 1 июня 2026',
    sections: [
      { title: '1. Кто мы', body: 'InnerVector («мы», «нас», «наш») управляет сайтом innervector.co — платформой для оценки личности. Контакт: aldeco312@gmail.com' },
      { title: '2. Какие данные мы собираем', items: [
        'Ответы на тест — ваши ответы на вопросы о личности (хранятся анонимно по сессии)',
        'Имя, email, телефон — предоставляются добровольно при сохранении профиля',
        'Платёжные данные — обрабатываются через Lemon Squeezy; номера карт мы не храним',
        'Данные об использовании — просмотры страниц, тип браузера, через Vercel Analytics',
      ]},
      { title: '3. Как мы используем ваши данные', items: [
        'Для генерации и отображения вашего профиля личности',
        'Для отправки результатов, если вы указали email',
        'Для обработки платежей за расширенный анализ',
        'Для улучшения продукта (в анонимизированном виде)',
      ], note: 'Мы не продаём ваши данные третьим лицам.' },
      { title: '4. Хранение данных', body: 'Ваши данные хранятся в Supabase (регион EU). Мы храним данные профиля бессрочно, если вы не запросите удаление. Тестовые сессии без имени хранятся анонимно.' },
      { title: '5. Ваши права', rights: [
        'Получить доступ к своим данным',
        'Запросить удаление данных',
        'Исправить неточную информацию',
      ], contact: 'Для реализации прав напишите нам: aldeco312@gmail.com' },
      { title: '6. Cookies', body: 'Мы используем сессионный cookie (iv_role) исключительно для аутентификации администратора. Рекламные и отслеживающие cookies не используются.' },
      { title: '7. Изменения', body: 'Мы можем обновлять настоящую политику. Продолжение использования сайта после изменений означает согласие с ними.' },
    ],
    links: { terms: 'Условия использования', refund: 'Политика возврата', home: 'Главная' },
  },
  ky: {
    title: 'Купуялык саясаты',
    updated: 'Акыркы жаңыртуу: 2026-жылдын 1-июню',
    sections: [
      { title: '1. Биз кимбиз', body: 'InnerVector («биз», «бизди», «биздин») innervector.co сайтын — инсандыкты баалоо платформасын башкарат. Байланыш: aldeco312@gmail.com' },
      { title: '2. Кандай маалыматтарды чогултабыз', items: [
        'Тест жооптору — инсандык суроолорго берилген жооптор (сессия боюнча анонимдүү сакталат)',
        'Аты-жөнү, email, телефон — профилди сактоодо ыктыярдуу берилет',
        'Төлөм маалыматтары — Lemon Squeezy аркылуу иштетилет; карта номерлерин биз сактабайбыз',
        'Колдонуу маалыматтары — баракча көрүүлөр, браузер түрү, Vercel Analytics аркылуу',
      ]},
      { title: '3. Маалыматтарды кантип колдонобуз', items: [
        'Инсандык профилиңизди түзүү жана көрсөтүү үчүн',
        'Email берсеңиз, натыйжаларды жөнөтүү үчүн',
        'Кеңейтилген талдоо үчүн төлөмдөрдү иштетүү үчүн',
        'Продуктту жакшыртуу үчүн (анонимдештирилген)',
      ], note: 'Биз сиздин маалыматтарыңызды үчүнчү тараптарга сатпайбыз.' },
      { title: '4. Маалыматтарды сактоо', body: 'Маалыматтарыңыз Supabase-те (EU аймагы) сакталат. Жок кылуу суранычы болмоюнча профиль маалыматтарын мөөнөтсүз сактайбыз. Аты-жөнүсүз тест сессиялары анонимдүү сакталат.' },
      { title: '5. Сиздин укуктарыңыз', rights: [
        'Биздеги маалыматтарыңызга кирүү',
        'Маалыматтарыңызды жок кылуу суранычы',
        'Туура эмес маалыматтарды оңдоо',
      ], contact: 'Бул укуктарды пайдалануу үчүн бизге жазыңыз: aldeco312@gmail.com' },
      { title: '6. Cookie файлдары', body: 'Биз iv_role сессиялык cookie файлын администраторду аутентификациялоо үчүн гана колдонобуз. Жарнамалык жана көзөмөлдөөчү cookie файлдары колдонулбайт.' },
      { title: '7. Өзгөрүүлөр', body: 'Биз бул саясатты жаңырта алабыз. Өзгөрүүлөрдөн кийин сайтты колдонуп жатуу алар менен макулдашкандыгыңызды билдирет.' },
    ],
    links: { terms: 'Колдонуу шарттары', refund: 'Кайтаруу саясаты', home: 'Башкы бет' },
  },
}

export default function PrivacyPage() {
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
              {'body' in s && s.body && <p>{s.body}</p>}
              {'items' in s && s.items && (
                <ul>{s.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
              )}
              {'note' in s && s.note && <p>{s.note}</p>}
              {'rights' in s && s.rights && (
                <ul>{s.rights.map((r, i) => <li key={i}>{r}</li>)}</ul>
              )}
              {'contact' in s && s.contact && <p>{s.contact}</p>}
            </Section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex gap-6 text-xs text-slate-600">
          <Link href="/terms" className="hover:text-slate-400 transition-colors">{t.links.terms}</Link>
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

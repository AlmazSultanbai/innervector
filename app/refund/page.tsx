'use client'

import Link from 'next/link'
import LangSwitcher from '@/components/LangSwitcher'
import { useLocaleStore } from '@/store/localeStore'

const content = {
  en: {
    title: 'Refund Policy',
    updated: 'Last updated: June 1, 2026',
    sections: [
      { title: 'Overview', paras: [
        'We want you to be satisfied with your purchase. Because our product is a digital service delivered instantly, refunds are handled on a case-by-case basis.',
      ]},
      { title: 'When You Are Eligible for a Refund', items: [
        'The AI analysis was not generated due to a technical error on our side',
        'You were charged but did not receive access to your full profile',
      ]},
      { title: 'When Refunds Are Not Available', items: [
        'You have already accessed and viewed your full AI analysis',
        'You changed your mind after the analysis was delivered',
      ]},
      { title: 'How to Request a Refund', intro: 'Email us at aldeco312@gmail.com with:', items: [
        'Your order ID (from the Lemon Squeezy confirmation email)',
        'The email used for purchase',
        'A brief description of the issue',
      ], note: 'We will respond within 2 business days.' },
      { title: 'Processing', paras: [
        'Approved refunds are processed through Lemon Squeezy and typically appear on your statement within 5–10 business days depending on your bank.',
      ]},
      { title: 'Contact', paras: ['Any questions: aldeco312@gmail.com'] },
    ],
    links: { privacy: 'Privacy Policy', terms: 'Terms of Service', home: 'Home' },
  },
  ru: {
    title: 'Политика возврата',
    updated: 'Последнее обновление: 1 июня 2026',
    sections: [
      { title: 'Общее', paras: [
        'Мы хотим, чтобы вы были довольны покупкой. Поскольку наш продукт — это цифровой сервис с мгновенной доставкой, каждый запрос на возврат рассматривается индивидуально.',
      ]},
      { title: 'Когда возврат возможен', items: [
        'Анализ ИИ не был сгенерирован из-за технической ошибки с нашей стороны',
        'С вас была снята оплата, но доступ к полному профилю не предоставлен',
      ]},
      { title: 'Когда возврат не предоставляется', items: [
        'Вы уже открыли и просмотрели полный анализ ИИ',
        'Вы передумали после того, как анализ был доставлен',
      ]},
      { title: 'Как запросить возврат', intro: 'Напишите нам на aldeco312@gmail.com, указав:', items: [
        'Номер вашего заказа (из письма-подтверждения Lemon Squeezy)',
        'Email, использованный при оплате',
        'Краткое описание проблемы',
      ], note: 'Мы ответим в течение 2 рабочих дней.' },
      { title: 'Обработка', paras: [
        'Одобренные возвраты обрабатываются через Lemon Squeezy и, как правило, отображаются в вашей выписке в течение 5–10 рабочих дней в зависимости от вашего банка.',
      ]},
      { title: 'Контакт', paras: ['По любым вопросам: aldeco312@gmail.com'] },
    ],
    links: { privacy: 'Политика конфиденциальности', terms: 'Условия использования', home: 'Главная' },
  },
  ky: {
    title: 'Кайтаруу саясаты',
    updated: 'Акыркы жаңыртуу: 2026-жылдын 1-июню',
    sections: [
      { title: 'Жалпы маалымат', paras: [
        'Биз сизди сатып алуудан канааттантууну каалайбыз. Биздин продукт дароо жеткирилүүчү санариптик кызмат болгондуктан, ар бир кайтаруу суранычы жеке карала берилет.',
      ]},
      { title: 'Кайтаруу мүмкүн болгон учурлар', items: [
        'ЖИ анализи биздин тараптагы техникалык ката себебинен жаратылган жок',
        'Сизден төлөм алынды, бирок толук профилге мүмкүнчүлүк берилген жок',
      ]},
      { title: 'Кайтаруу берилбеген учурлар', items: [
        'Сиз мурун толук ЖИ анализин ачып, көрдүңүз',
        'Анализ жеткирилгенден кийин оюңузду өзгөрттүңүз',
      ]},
      { title: 'Кайтарууну кантип суроо керек', intro: 'aldeco312@gmail.com дарегине жазыңыз, төмөнкүлөрдү кошуу менен:', items: [
        'Заказ номериңиз (Lemon Squeezy ырастоо кат)',
        'Төлөм учурунда колдонулган email',
        'Маселенин кыскача сүрөттөлүшү',
      ], note: '2 жумуш күнү ичинде жооп беребиз.' },
      { title: 'Иштетүү', paras: [
        'Бекитилген кайтаруулар Lemon Squeezy аркылуу иштетилет жана банкыңызга жараша 5–10 жумуш күнүнүн ичинде чотуңузда пайда болот.',
      ]},
      { title: 'Байланыш', paras: ['Кандайдыр бир суроолор болсо: aldeco312@gmail.com'] },
    ],
    links: { privacy: 'Купуялык саясаты', terms: 'Колдонуу шарттары', home: 'Башкы бет' },
  },
}

export default function RefundPage() {
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
              {'note' in s && s.note && <p>{s.note}</p>}
            </Section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex gap-6 text-xs text-slate-600">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">{t.links.privacy}</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">{t.links.terms}</Link>
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

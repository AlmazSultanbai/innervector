import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Inner Vector' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-radial">
      <div className="max-w-2xl mx-auto px-6 py-16 pb-24">

        <div className="mb-10">
          <Link href="/" className="text-slate-500 hover:text-gold text-xs tracking-widest uppercase transition-colors">
            ← Inner Vector
          </Link>
        </div>

        <h1 className="font-serif text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: June 1, 2026</p>

        <div className="prose-legal">

          <Section title="1. Who We Are">
            <p>InnerVector (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website innervector.co — a personality assessment platform. Contact: <a href="mailto:aldeco312@gmail.com">aldeco312@gmail.com</a></p>
          </Section>

          <Section title="2. What Data We Collect">
            <ul>
              <li><strong>Test answers</strong> — your responses to personality questions (stored anonymously by session)</li>
              <li><strong>Name, email, phone</strong> — provided voluntarily when you want to save your profile</li>
              <li><strong>Payment data</strong> — processed by Lemon Squeezy; we never store card numbers</li>
              <li><strong>Usage data</strong> — page views, browser type, collected via Vercel Analytics</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul>
              <li>To generate and display your personality profile</li>
              <li>To send you your results if you provide an email</li>
              <li>To process payments for premium analysis</li>
              <li>To improve the product (anonymized, aggregated)</li>
            </ul>
            <p>We do not sell your data to third parties.</p>
          </Section>

          <Section title="4. Data Storage">
            <p>Your data is stored in Supabase (EU region). We retain profile data indefinitely unless you request deletion. Test sessions without a name are stored anonymously.</p>
          </Section>

          <Section title="5. Third-Party Services">
            <ul>
              <li><strong>Lemon Squeezy</strong> — payment processing (<a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">their privacy policy</a>)</li>
              <li><strong>Anthropic Claude</strong> — AI analysis generation (data is not used for training)</li>
              <li><strong>Vercel</strong> — website hosting and analytics</li>
            </ul>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>Access the data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Correct inaccurate information</li>
            </ul>
            <p>To exercise these rights, email us at <a href="mailto:aldeco312@gmail.com">aldeco312@gmail.com</a></p>
          </Section>

          <Section title="7. Cookies">
            <p>We use a session cookie (iv_role) solely for admin authentication. We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="8. Changes">
            <p>We may update this policy. Continued use of the site after changes constitutes acceptance.</p>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex gap-6 text-xs text-slate-600">
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          <Link href="/refund" className="hover:text-slate-400 transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-slate-400 transition-colors">Home</Link>
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

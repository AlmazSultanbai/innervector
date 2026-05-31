import Link from 'next/link'

export const metadata = { title: 'Terms of Service — Inner Vector' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-radial">
      <div className="max-w-2xl mx-auto px-6 py-16 pb-24">

        <div className="mb-10">
          <Link href="/" className="text-slate-500 hover:text-gold text-xs tracking-widest uppercase transition-colors">
            ← Inner Vector
          </Link>
        </div>

        <h1 className="font-serif text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: June 1, 2026</p>

        <div className="prose-legal">

          <Section title="1. Acceptance">
            <p>By using innervector.co you agree to these Terms. If you do not agree, please do not use the service.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>Inner Vector is a personality assessment platform that provides:</p>
            <ul>
              <li>A free personality test (Express and Full modes)</li>
              <li>A free top-5 vector results summary</li>
              <li>A premium AI-generated full analysis (paid, one-time purchase)</li>
              <li>A Gallup CliftonStrengths analysis tool</li>
            </ul>
          </Section>

          <Section title="3. Payments">
            <p>Premium analysis is priced at $9 USD (one-time). Payments are processed by Lemon Squeezy, our Merchant of Record. They handle all taxes and compliance on our behalf.</p>
            <p>After successful payment your full analysis is unlocked immediately and permanently accessible via your unique profile link.</p>
          </Section>

          <Section title="4. Refunds">
            <p>See our <Link href="/refund">Refund Policy</Link> for details. In general, we offer refunds within 7 days if the AI analysis was not delivered due to a technical error.</p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>Your test results and profile belong to you. The platform, methodology, design, and AI prompts are proprietary to InnerVector. You may not reproduce or resell our methodology.</p>
          </Section>

          <Section title="6. Accuracy Disclaimer">
            <p>Inner Vector is an educational and self-reflection tool. Results are not a substitute for professional psychological assessment, career counseling, or medical advice. We make no guarantees about the accuracy of AI-generated analysis.</p>
          </Section>

          <Section title="7. Prohibited Use">
            <ul>
              <li>Scraping or mass-downloading profile data</li>
              <li>Using the platform to collect data on others without their consent</li>
              <li>Attempting to reverse-engineer the scoring methodology</li>
            </ul>
          </Section>

          <Section title="8. Termination">
            <p>We reserve the right to remove content or restrict access if these Terms are violated.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms are governed by the laws of the Kyrgyz Republic. Disputes shall be resolved by negotiation; if unresolved, by courts of competent jurisdiction in Bishkek, Kyrgyzstan.</p>
          </Section>

          <Section title="10. Contact">
            <p>Questions about these Terms: <a href="mailto:aldeco312@gmail.com">aldeco312@gmail.com</a></p>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex gap-6 text-xs text-slate-600">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
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

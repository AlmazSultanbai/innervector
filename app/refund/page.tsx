import Link from 'next/link'

export const metadata = { title: 'Refund Policy — Inner Vector' }

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-radial">
      <div className="max-w-2xl mx-auto px-6 py-16 pb-24">

        <div className="mb-10">
          <Link href="/" className="text-slate-500 hover:text-gold text-xs tracking-widest uppercase transition-colors">
            ← Inner Vector
          </Link>
        </div>

        <h1 className="font-serif text-4xl font-bold text-white mb-2">Refund Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: June 1, 2026</p>

        <div className="prose-legal">

          <Section title="Overview">
            <p>We want you to be satisfied with your purchase. Because our product is a digital service delivered instantly, refunds are handled on a case-by-case basis.</p>
          </Section>

          <Section title="When You Are Eligible for a Refund">
            <ul>
              <li>The AI analysis was not generated due to a technical error on our side</li>
              <li>You were charged but did not receive access to your full profile</li>
              <li>You submit a refund request within <strong>7 days</strong> of purchase</li>
            </ul>
          </Section>

          <Section title="When Refunds Are Not Available">
            <ul>
              <li>You have already accessed and viewed your full AI analysis</li>
              <li>You changed your mind after the analysis was delivered</li>
              <li>More than 7 days have passed since the purchase</li>
            </ul>
          </Section>

          <Section title="How to Request a Refund">
            <p>Email us at <a href="mailto:aldeco312@gmail.com">aldeco312@gmail.com</a> with:</p>
            <ul>
              <li>Your order ID (from the Lemon Squeezy confirmation email)</li>
              <li>The email used for purchase</li>
              <li>A brief description of the issue</li>
            </ul>
            <p>We will respond within 2 business days.</p>
          </Section>

          <Section title="Processing">
            <p>Approved refunds are processed through Lemon Squeezy and typically appear on your statement within 5–10 business days depending on your bank.</p>
          </Section>

          <Section title="Contact">
            <p>Any questions: <a href="mailto:aldeco312@gmail.com">aldeco312@gmail.com</a></p>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex gap-6 text-xs text-slate-600">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
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

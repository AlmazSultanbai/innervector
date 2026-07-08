import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { session_id, scores, top5, domain_averages, lang, full_name, email, phone, test_mode } = body

    if (!session_id || !scores || !top5 || !domain_averages) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // One row per session: intro page generates a fresh session_id for each
    // new test, so a repeat POST (page refresh / revisit of the report) must
    // return the existing row instead of inserting a duplicate.
    const { data: existing } = await supabase
      .from('vector_test_results')
      .select('id, share_token')
      .eq('session_id', session_id)
      .order('completed_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ id: existing.id, share_token: existing.share_token })
    }

    const { data: row, error } = await supabase
      .from('vector_test_results')
      .insert({
        session_id,
        scores,
        top5,
        domain_averages,
        lang: lang ?? 'ru',
        retake_count: 0,
        completed_at: new Date().toISOString(),
        full_name: full_name ?? null,
        email: email ?? null,
        phone: phone ?? null,
        test_mode: test_mode ?? 'full',
      })
      .select('id, share_token')
      .single()

    if (error) {
      console.error('vector-save error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: row.id, share_token: row.share_token })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('vector-save error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

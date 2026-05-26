import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

// Lemon Squeezy sends HMAC-SHA256 signature in X-Signature header
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  return expected === signature
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''
  const signature = req.headers.get('x-signature') ?? ''
  const body = await req.text()

  if (secret && !(await verifySignature(body, signature, secret))) {
    console.error('LS webhook: invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = (payload?.meta as Record<string, unknown>)?.event_name as string
  console.log('LS webhook event:', eventName)

  // Handle successful order
  if (eventName === 'order_created') {
    const meta = payload.meta as Record<string, unknown>
    const customData = meta?.custom_data as Record<string, string> | undefined
    const resultId = customData?.result_id
    const orderId = ((payload.data as Record<string, unknown>)?.id as string) ?? null

    if (resultId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      const { error } = await supabase
        .from('vector_test_results')
        .update({ paid_at: new Date().toISOString(), ls_order_id: orderId })
        .eq('id', resultId)

      if (error) {
        console.error('LS webhook DB error:', error.message)
        return NextResponse.json({ error: 'DB error' }, { status: 500 })
      }
      console.log('Marked paid:', resultId)
    }
  }

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { result_id, session_id } = await req.json()
    if (!result_id || !session_id) {
      return NextResponse.json({ error: 'result_id and session_id required' }, { status: 400 })
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY
    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://innervector.co'

    if (!apiKey || !storeId || !variantId) {
      console.error('Lemon Squeezy env vars missing')
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const redirectUrl = `${siteUrl}/vector-test/report?paid=1&result_id=${result_id}`

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: { result_id, session_id },
            },
            product_options: {
              redirect_url: redirectUrl,
              enabled_variants: [Number(variantId)],
            },
            checkout_options: {
              button_color: '#d4a843',
              dark: true,
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: String(storeId) } },
            variant: { data: { type: 'variants', id: String(variantId) } },
          },
        },
      }),
    })

    const data = await response.json()
    const checkoutUrl = data?.data?.attributes?.url

    if (!checkoutUrl) {
      console.error('LS checkout error:', JSON.stringify(data))
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Checkout error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

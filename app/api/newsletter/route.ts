import { NextResponse } from 'next/server'

/**
 * Newsletter signup. The provider endpoint is wired through an env var — never
 * hardcode it. See `.env.example`.
 */
export async function POST(request: Request) {
  let email: unknown

  try {
    const body = await request.json()
    email = body?.email
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  const endpoint = process.env.NEWSLETTER_ENDPOINT

  if (!endpoint) {
    // No provider configured yet. Accept the signup so the form is testable,
    // and say plainly in the logs that nothing was actually sent.
    console.warn('NEWSLETTER_ENDPOINT is not set — signup was not forwarded to a provider.')
    return NextResponse.json({ ok: true, forwarded: false })
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.NEWSLETTER_API_KEY
        ? { authorization: `Bearer ${process.env.NEWSLETTER_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Provider rejected the signup.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, forwarded: true })
}

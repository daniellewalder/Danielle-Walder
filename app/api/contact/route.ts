import { NextResponse } from 'next/server'
import { contactFormEndpoint } from '@/lib/config'

const MAX_FIELD_LENGTH = 5000

/**
 * Contact form handler.
 *
 * Refuses to pretend: with no CONTACT_FORM_ENDPOINT configured this returns an
 * error rather than a success, so the UI can never show a false confirmation.
 * The form hides its submit control in that state, so this is a backstop.
 */
export async function POST(request: Request) {
  if (!contactFormEndpoint) {
    console.warn('CONTACT_FORM_ENDPOINT is not set — contact submission refused.')
    return NextResponse.json({ error: 'Message delivery is not connected yet.' }, { status: 503 })
  }

  let payload: Record<string, unknown>

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const field = (key: string) => {
    const value = payload[key]
    return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : ''
  }

  const name = field('name')
  const email = field('email')
  const topic = field('topic')
  const message = field('message')
  const phone = field('phone')

  if (!name || !topic || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please complete the required fields.' }, { status: 400 })
  }

  const response = await fetch(contactFormEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ name, email, phone, topic, message }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'The message could not be delivered.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

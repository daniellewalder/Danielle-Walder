import { NextResponse } from 'next/server'
import { contactFormEndpoint } from '@/lib/config'

const MAX_FIELD_LENGTH = 5000

/**
 * Contact form handler. Serves two payloads.
 *
 * Refuses to pretend: with no CONTACT_FORM_ENDPOINT configured this returns an
 * error rather than a success, so the UI can never show a false confirmation.
 * Both forms hide their submit control in that state, so this is a backstop.
 *
 * GENERAL (no `intent`, or anything other than "showing") — unchanged. Name,
 * email, topic and message are all required, exactly as before.
 *
 * SHOWING (`intent: "showing"`) — a property inquiry from /contact?intent=
 * showing. Name and email are required; the listing link, area, phone and
 * message are optional, because someone who has only pasted a link has still
 * told us the useful part.
 *
 * The listing link is forwarded as TEXT. Nothing here fetches it, resolves it,
 * follows a redirect, or checks whether the listing exists — it is read by a
 * person, not by this route.
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

  const isShowing = field('intent') === 'showing'
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (isShowing) {
    if (!name || !emailLooksValid) {
      return NextResponse.json({ error: 'Please complete the required fields.' }, { status: 400 })
    }
  } else if (!name || !topic || !message || !emailLooksValid) {
    return NextResponse.json({ error: 'Please complete the required fields.' }, { status: 400 })
  }

  const payloadOut = isShowing
    ? {
        intent: 'showing',
        name,
        email,
        phone,
        listingUrl: field('listingUrl'),
        area: field('area'),
        message,
      }
    : { name, email, phone, topic, message }

  const response = await fetch(contactFormEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payloadOut),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'The message could not be delivered.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

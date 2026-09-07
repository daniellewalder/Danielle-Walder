/**
 * Quick-send link builders for the showing inquiry.
 *
 * These produce `mailto:` and `sms:` URLs and nothing else. No message is sent
 * from here, no service is contacted, and neither action depends on
 * CONTACT_FORM_ENDPOINT — they hand the composed text to whatever composer the
 * reader's device already has, and the reader presses send.
 *
 * Pure functions so the encoding rules can be tested directly: a listing URL
 * routinely contains `&`, `?` and `#`, all of which would truncate the body if
 * they were not encoded.
 */

/** Substitutes the pasted listing into a body template. */
export function fillTemplate(template: string, listing: string): string {
  return template.replace('{listing}', listing.trim())
}

/**
 * A `mailto:` URL. Opens the reader's configured email composer — not an
 * inbox, not a webmail provider, and nothing Gmail-specific.
 */
export function buildMailto(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body })
  // URLSearchParams encodes spaces as "+", which mail composers show literally.
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`
}

/**
 * Digits only, with a leading `+` preserved for an international number.
 * Returns null when the configured value has no digits in it at all.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  const digits = trimmed.replace(/\D/g, '')
  return digits ? `${plus}${digits}` : null
}

/**
 * An `sms:` URL.
 *
 * The `?&body=` form is the one that works across both iOS and Android; plain
 * `?body=` is correct per RFC 5724 but is not honoured everywhere. Desktop
 * browsers with no SMS handler may do nothing at all, which is why the button
 * never claims this works universally.
 */
export function buildSms(phone: string, body: string): string {
  const number = normalizePhone(phone)
  if (!number) return ''
  return `sms:${number}?&body=${encodeURIComponent(body)}`
}

/**
 * /contact query-param handling.
 *
 * Two params, both optional, both untrusted. Anything unrecognised falls back
 * to the ordinary contact page rather than erroring — a stale or mistyped link
 * should still land somewhere useful.
 *
 * These are pure functions so the parsing rules can be tested directly.
 */

export type ContactIntent = 'general' | 'showing'

/** Next hands a repeated param as an array; take the first value. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * `?intent=showing` switches the page into the property state. Every other
 * value — missing, misspelled, repeated, or hostile — is `general`.
 */
export function parseIntent(value: string | string[] | undefined): ContactIntent {
  return first(value)?.trim().toLowerCase() === 'showing' ? 'showing' : 'general'
}

/**
 * `?area=calabasas` prefills the area field and is shown back to the reader.
 *
 * It is displayed, so it is validated rather than trusted: letters, spaces,
 * hyphens, apostrophes and periods only, 40 characters maximum, and at least
 * one letter. Anything else is dropped entirely — the field simply renders
 * empty rather than echoing whatever was in the URL.
 *
 * React escapes markup on its own; this exists so the page never presents
 * arbitrary text as though it were the name of a real place.
 */
export function parseArea(value: string | string[] | undefined): string | null {
  const raw = first(value)?.trim()
  if (!raw) return null
  if (raw.length > 40) return null
  if (!/^[\p{L}][\p{L} .'-]*$/u.test(raw)) return null

  return raw
    .replace(/-+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** The canonical link for a showing inquiry. Used by PropertyShowingCta. */
export function showingHref(area?: string): string {
  const params = new URLSearchParams({ intent: 'showing' })
  if (area?.trim()) params.set('area', area.trim())
  return `/contact?${params.toString()}`
}

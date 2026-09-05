/**
 * Everything the site needs from the environment, read in one place.
 *
 * Each value is optional on purpose: the site must render honestly with none
 * of them set. A missing value never produces a broken link — it produces a
 * quieter, truthful version of the same block. See README launch blockers.
 */

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed.replace(/\/+$/, '') : null
}

/** Substack publication homepage, e.g. https://example.substack.com */
export const substackUrl = clean(process.env.SUBSTACK_URL)

/** Feed URL. Defaults to the publication's /feed; override for odd setups. */
export const substackFeedUrl =
  clean(process.env.SUBSTACK_RSS_URL) ?? (substackUrl ? `${substackUrl}/feed` : null)

/** Substack's hosted subscribe page — a real external destination, not a form. */
export const substackSubscribeUrl = substackUrl ? `${substackUrl}/subscribe` : null

/** Public contact address. Shown as a real mailto only when supplied. */
export const contactEmail = clean(process.env.CONTACT_EMAIL)

/** Where the contact form POSTs. Until set, the form states that plainly. */
export const contactFormEndpoint = clean(process.env.CONTACT_FORM_ENDPOINT)

/** Canonical origin, used for sitemap and robots. */
export const siteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) ?? 'https://daniellewalder.com'

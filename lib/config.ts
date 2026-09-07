/**
 * Public configuration, and the one place environment variables are read.
 *
 * Values here are PUBLIC by definition — a publication URL and a published
 * contact address, both of which appear in the rendered page anyway. They are
 * committed as defaults so the site works on any deploy with no dashboard
 * setup, and every one can still be overridden by an environment variable.
 *
 * NEVER put a secret in this file: no form endpoints, API keys, service
 * tokens, or private inbox credentials. Those are environment-only, always.
 */

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed.replace(/\/+$/, '') : null
}

/**
 * Overthinking Real Estate on Substack — the publication, which is what
 * exposes the RSS feed at /feed and the hosted subscribe page at /subscribe.
 */
export const substackUrl =
  clean(process.env.SUBSTACK_URL) ?? 'https://daniellewalder.substack.com'

/** Feed URL. Defaults to the publication's /feed; override for odd setups. */
export const substackFeedUrl =
  clean(process.env.SUBSTACK_RSS_URL) ?? (substackUrl ? `${substackUrl}/feed` : null)

/**
 * Where "Subscribe on Substack" goes.
 *
 * A publication has a /subscribe page. A profile does not — its subscribe
 * affordance is on the profile page itself. Appending /subscribe to a profile
 * URL would ship a broken external link, so it is only appended when the URL
 * is publication-shaped.
 */
function deriveSubscribeUrl(url: string | null): string | null {
  if (!url) return null

  try {
    const { hostname, pathname } = new URL(url)
    const isProfile = hostname === 'substack.com' || hostname === 'www.substack.com'
    if (isProfile || pathname !== '/') return url
    return `${url}/subscribe`
  } catch {
    return url
  }
}

export const substackSubscribeUrl =
  clean(process.env.SUBSTACK_SUBSCRIBE_URL) ?? deriveSubscribeUrl(substackUrl)

/** Published contact address. Public information, safe to commit. */
export const contactEmail = clean(process.env.CONTACT_EMAIL) ?? 'homes@daniellewalder.com'

/**
 * Where the contact form POSTs. ENVIRONMENT-ONLY — never commit a default.
 * Until it is set the form renders without a submit control and says so.
 */
export const contactFormEndpoint = clean(process.env.CONTACT_FORM_ENDPOINT)

/**
 * Public contact phone. ENVIRONMENT-ONLY — there is deliberately no committed
 * default, and one must not be added without Danielle saying so.
 *
 * A number she supplied is recorded in README under "Supplied but deliberately
 * not rendered". Publishing a phone number as a tappable link is her decision,
 * not an implementation detail, so this stays unset until she sets it.
 *
 * When it IS set, "Text Danielle" appears on the showing inquiry automatically.
 * Until then that action is not rendered at all — never as a dead button.
 */
export const contactPhone = clean(process.env.CONTACT_PHONE)

/**
 * RealScout IDX. The agent id is a public embed identifier — it appears in the
 * page source by design and is not a credential.
 */
export const realScoutAgentId =
  clean(process.env.REALSCOUT_AGENT_ID) ?? 'QWdlbnQtMzA0MjM2'

export const realScoutScriptSrc =
  'https://em.realscout.com/widgets/realscout-web-components.umd.js'

/** Canonical origin, used for sitemap and robots. */
export const siteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) ?? 'https://daniellewalder.com'

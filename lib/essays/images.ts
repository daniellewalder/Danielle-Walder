/**
 * Working out which image belongs to which essay.
 *
 * The site previously took the RSS `<enclosure>` and nothing else. That is
 * where Substack usually puts a post's cover, but "usually" is not "always" —
 * an item without one ended up with no artwork at all, even when the post
 * clearly had a cover on Substack. This module tries the enclosure first and
 * then two progressively weaker but still legitimate sources.
 *
 * WHAT THIS WILL NEVER DO: invent an image, reach for a stock asset, or reuse
 * another essay's artwork. Every candidate here comes from inside the same
 * feed item. An essay with genuinely no image stays image-less, and the page
 * renders an intentional text-only state rather than someone else's picture.
 *
 * Pure functions, no runtime imports, so the rules are testable directly.
 */

/** Anything with these in the URL is site furniture, never essay artwork. */
const FURNITURE = /(avatar|badge|logo|icon|emoji|button|profile|spacer|pixel|favicon|substack_logo)/i

/**
 * Substack serves images through a resizing CDN whose path carries the target
 * width, e.g. `/image/fetch/w_1456,c_limit,.../https%3A%2F%2F...`. A small
 * width is the reliable tell for an avatar or a subscribe widget rather than a
 * cover: covers come through at 400px and up.
 */
const MIN_CDN_WIDTH = 400

function isPlausibleImageUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false
  if (FURNITURE.test(url)) return false

  const cdnWidth = url.match(/\/image\/fetch\/[^/]*\bw_(\d+)/)
  if (cdnWidth && Number(cdnWidth[1]) < MIN_CDN_WIDTH) return false

  return true
}

/**
 * Substack attaches the post's cover image as an enclosure. Only image types
 * are taken, and only over http(s) — never a data: or javascript: URL.
 */
export function imageFromEnclosure(enclosure: unknown): string | null {
  const list = Array.isArray(enclosure) ? enclosure : enclosure ? [enclosure] : []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const type = record['@_type']
    const url = record['@_url']
    if (typeof type !== 'string' || !type.startsWith('image/')) continue
    if (typeof url !== 'string' || !isPlausibleImageUrl(url)) continue
    return url
  }

  return null
}

/**
 * Some feeds carry the cover in a media namespace instead of an enclosure.
 * Still the item's own declared artwork, just a different tag.
 */
export function imageFromMediaTags(item: Record<string, unknown>): string | null {
  for (const key of ['media:content', 'media:thumbnail', 'image']) {
    const raw = item[key]
    const list = Array.isArray(raw) ? raw : raw ? [raw] : []

    for (const candidate of list) {
      if (!candidate || typeof candidate !== 'object') continue
      const url = (candidate as Record<string, unknown>)['@_url']
      if (typeof url === 'string' && isPlausibleImageUrl(url)) return url
    }
  }

  return null
}

/**
 * Last resort: the first meaningful image inside the post's own HTML.
 *
 * Substack usually opens a post with its cover image, so this recovers the
 * right picture when the enclosure is missing. It skips subscribe widgets,
 * avatars, share buttons and tracking pixels — anything that is chrome rather
 * than part of the essay — and it only ever reads THIS item's content, so an
 * image cannot bleed in from another post.
 */
export function imageFromContent(html: string | null): string | null {
  if (!html) return null

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]

    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]
    if (!src || !isPlausibleImageUrl(src)) continue

    // A declared size this small is a pixel or an icon, not artwork.
    const width = Number(tag.match(/\bwidth\s*=\s*["']?(\d+)/i)?.[1] ?? 0)
    const height = Number(tag.match(/\bheight\s*=\s*["']?(\d+)/i)?.[1] ?? 0)
    if ((width && width < 200) || (height && height < 200)) continue

    // Class names Substack puts on non-editorial imagery.
    if (/class\s*=\s*["'][^"']*(avatar|logo|badge|button)/i.test(tag)) continue

    return src
  }

  return null
}

/**
 * The essay's artwork, from the strongest source this item actually provides.
 * Null means the item genuinely supplied none.
 */
export function pickEssayImage(
  item: Record<string, unknown>,
  contentHtml: string | null,
): string | null {
  return (
    imageFromEnclosure(item.enclosure) ?? imageFromMediaTags(item) ?? imageFromContent(contentHtml)
  )
}

/**
 * Identity of the underlying asset behind a Substack CDN URL.
 *
 * The same cover is served at different widths — `w_1456` in the body,
 * `w_1200` as the enclosure — so the URLs differ while the picture is
 * identical. The encoded original sits at the end of the transform path;
 * comparing that is what lets the essay page tell "the body repeats the cover"
 * from "the body has a different image".
 */
export function assetKey(url: string | null): string | null {
  if (!url) return null

  const encoded = url.match(/\/image\/fetch\/[^/]*\/(https?%3A%2F%2F.+)$/i)?.[1]
  const resolved = encoded ? decodeURIComponent(encoded) : url

  // Ignore query strings and trailing size hints when comparing.
  return resolved.split('?')[0].toLowerCase()
}

/**
 * Remove the post's cover image from the top of its own body.
 *
 * The essay page renders the cover above the article. Substack's HTML usually
 * opens with that same image, which would show it twice. Only a LEADING image
 * that resolves to the same asset is removed — an inline image further down,
 * or a different image at the top, is left alone. Body images are content and
 * are not stripped in general.
 */
export function stripLeadingCoverImage(html: string | null, coverUrl: string | null): string | null {
  if (!html || !coverUrl) return html

  const coverKey = assetKey(coverUrl)
  if (!coverKey) return html

  const firstImg = html.match(/<img\b[^>]*>/i)
  if (!firstImg || firstImg.index === undefined) return html

  const src = firstImg[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]
  if (!src || assetKey(src) !== coverKey) return html

  // Only if it really is at the top: no visible text before it.
  const start = firstImg.index
  if (html.slice(0, start).replace(/<[^>]*>/g, '').trim().length > 0) return html

  const end = start + firstImg[0].length

  // Substack wraps the cover in a figure or div; take the wrapper with it.
  const wrapper = html.slice(0, start).match(/<(figure|div)\b[^>]*>\s*$/i)
  if (wrapper) {
    const after = html.slice(end)
    const close = after.match(new RegExp(`^\\s*(?:</[a-z]+>\\s*)*?</${wrapper[1]}>`, 'i'))
    if (close) {
      return (html.slice(0, start - wrapper[0].length) + after.slice(close[0].length)).trim()
    }
  }

  return (html.slice(0, start) + html.slice(end)).trim()
}

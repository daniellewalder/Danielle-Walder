import sanitizeHtml from 'sanitize-html'

/**
 * Cleans essay HTML that arrives from the Substack feed before it is rendered
 * into the page.
 *
 * This is an allow-list, not a block-list: anything not named here is dropped.
 * Formatting survives — paragraphs, headings, emphasis, links, images, quotes,
 * lists — and everything else goes, including <script>, <iframe>, <style>,
 * inline event handlers, and any javascript: URL.
 *
 * It runs server-side only. Never render feed HTML without it.
 */
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'h2', 'h3', 'h4',
    'strong', 'b', 'em', 'i', 'u', 's', 'sup', 'sub', 'mark',
    'a',
    'ul', 'ol', 'li',
    'blockquote', 'cite',
    'figure', 'figcaption', 'img',
    'code', 'pre',
    'span', 'div',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'rel'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    '*': [],
  },
  // Only these schemes may appear in href/src. Blocks javascript: and data:.
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href', 'src', 'srcset'],
  // Substack demotes nothing, so an essay's own H1 would clash with the page
  // title. Everything shifts down one level.
  transformTags: {
    h1: 'h2',
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }),
  },
  // Drop the contents of these entirely rather than keeping their text.
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe'],
  allowedIframeHostnames: [],
  disallowedTagsMode: 'discard',
  /**
   * Stripping a disallowed URL leaves the tag behind. An <img> whose src was
   * removed would render as a broken-image box, so drop it outright. An <a>
   * that loses its href is left alone on purpose — the link is neutralised but
   * the words stay, which is what a reader should see.
   */
  exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
}

export function sanitizeEssayHtml(html: string): string {
  return sanitizeHtml(html, options)
}

/**
 * Rough guard for paywalled posts, whose feed content arrives truncated. Not
 * exact — Substack gives no reliable marker — so the essay page always offers
 * the original as well.
 */
export function looksTruncated(html: string): boolean {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim()
  return text.length < 900
}

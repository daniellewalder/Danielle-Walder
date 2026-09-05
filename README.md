# danielle walder — site

Personal real estate site for Danielle Walder, a Los Angeles agent, and home of
her publication *Overthinking Real Estate*. Next.js (App Router) + TypeScript +
Tailwind CSS.

## 🚨 Launch blockers

**The site must not go on a public domain until these are resolved.**

| # | Blocker | Where |
|---|---|---|
| 1 | **No brokerage disclosure language.** There is no fair-housing, privacy, terms, accessibility, or licensing statement, and none has been supplied or verified. Nothing has been drafted — this must come from Danielle's broker, verbatim. | `lib/content/site.ts` → `legal` |
| 2 | **The Substack URL is a profile, not a publication.** `https://substack.com/@daniellewalder` has no publication RSS feed at `/feed`, so `/read` and the homepage render the four verified fallback titles linking to the profile. Supply the publication URL (`name.substack.com` or a custom domain) — or set `SUBSTACK_RSS_URL` — to switch to the live feed. Nothing is broken today. | `lib/config.ts` |
| 3 | **Contact delivery.** Without `CONTACT_FORM_ENDPOINT` the contact form renders with no submit control and says delivery is being connected. It never fake-submits. Email is the working channel. | environment only |
| 4 | **Photography.** Every image is a labelled `[ADD DANIELLE PHOTO]` / `[ADD ESSAY IMAGE]` slot. | `lib/content/` |
| 5 | **Favicon is a temporary technical icon** — a plain cream square, deliberately with no glyph or mark, added only so the app does not emit a favicon 404. **Replace with an approved asset before launch.** | `app/icon.svg` |
| 6 | **No Open Graph / social share image.** Deliberately not declared rather than fabricated. | `app/layout.tsx` |

### Supplied and live

| Value | Where |
|---|---|
| Brokerage — Coldwell Banker | `lib/content/site.ts`, footer on every page |
| Licence — CalRE # 02253356 | same; rendered exactly as supplied |
| Public email — homes@daniellewalder.com | `lib/config.ts`; mailto on `/contact` |
| Substack profile URL | `lib/config.ts`; see blocker 2 |

### Supplied but not placed

Danielle also supplied a phone number, `(847) 899-9604`, and service areas,
*Beverly Hills | Hancock Park*. Neither has an approved home in the design, so
neither is rendered. They are held here rather than being placed unilaterally.

### Not to be invented, ever

Social links, legal and compliance wording, credentials, awards, years of
experience, listings, prices, statistics, transaction outcomes, and
testimonials are supplied and verified, or they are absent.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run typecheck
```

Copy `.env.example` to `.env.local`. Every value is optional — with none set the
site still builds and every page renders honestly.

## Routes

| Route | What it is |
|---|---|
| `/` | Homepage |
| `/read` | *Overthinking Real Estate* archive. Reads the Substack RSS feed, links out |
| `/search` | IDX-ready shell. No filters, map, or results — none exist yet |
| `/tuesday-test` | The Tuesday Test landing page with a static, non-interactive preview |
| `/la-actually` | LA, Actually — editorial landing page |
| `/about` | About Danielle |
| `/contact` | Say Hello — contact form |
| `/homes`, `/sold` | Intentional empty states. **Not linked from nav, footer, or homepage**, and excluded from the sitemap |
| `/api/contact` | Contact handler. Refuses with 503 when no endpoint is configured |

Redirects (308): `/overthinking-real-estate/*` → `/read` · `/quizzes/*` →
`/tuesday-test` · `/listings/*` → `/search` · `/home-valuation` → `/contact`

## The honesty rules this codebase follows

Every visible link and button resolves to a working page, a verified external
URL, or an honest non-interactive state. Specifically:

- **No fake search.** `/search` has no input, filters, or map. The hero has no
  search field — a text box that cannot search is fake functionality, so the
  hero action is a `Search Homes` link.
- **No fake quiz.** The Tuesday Test preview options are styled `<li>` text.
  They are not buttons, links, inputs, or focusable, they carry no hover state,
  and nothing is selected, scored, or saved.
- **No fake form submission.** With no endpoint, the contact form hides its
  submit control and says so. `/api/contact` returns 503 rather than a false
  success. There is no newsletter form at all — subscribing goes to Substack.
- **No invented content.** No listings, addresses, prices, property photos,
  statistics, transaction outcomes, testimonials, credentials, awards, or
  neighborhood claims appear anywhere. Sections without verified data are not
  rendered rather than filled with placeholders.
- **No broken links.** Verified by a crawl of every route on every build.

## Overthinking Real Estate feed

Essays live on Substack and stay there — nothing is migrated into the repo.

`lib/essays/index.ts` is the seam. It fetches the publication's public RSS feed
server-side (`fast-xml-parser`, 5s timeout, `revalidate: 1800`), and falls back
to the four verified titles on any failure — non-200, malformed XML, empty feed,
or unreachable host. Failures are logged server-side and never shown to a
visitor. Titles, permalinks, and dates only ever come from the feed; nothing is
invented, and a feed item without a link is dropped rather than rendered.

In fallback mode with no `SUBSTACK_URL`, titles render as plain text — not as
links to nowhere.

## Listings

`components/listings/ListingCard.tsx` and `SoldCard.tsx` are kept intentionally
and are **not rendered anywhere**. See `components/listings/README.md`. The mock
adapter that used to feed them has been deleted; do not reintroduce placeholder
property data.

## Design tokens

`tailwind.config.ts` carries the locked palette, the four typefaces, the
letter-spacing values, and the radii. `app/tokens.css` holds the same values as
CSS custom properties. Both mirror `design_handoff/tokens.css`, which is the
source of truth. See `CLAUDE.md` for the standing rules.

Image placeholder labels are Ink Soft `#6B5F55` on sand `#E3DBCB`.

## Responsive

Three approved breakpoints: desktop, `tablet` ≤1024px, `mobile` ≤640px, plus
`navstack` ≤900px where the nav row stops fitting and collapses to the mark plus
a hamburger. Verified free of horizontal overflow at 320, 375, 768, 900, 1024,
and 1440px.

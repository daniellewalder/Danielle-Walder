# danielle walder — site

Personal real estate site for Danielle Walder, a Los Angeles agent, and home of
her publication *Overthinking Real Estate*. Next.js (App Router) + TypeScript +
Tailwind CSS.

## 🚨 Launch blockers

**The site must not go on a public domain until these are resolved.**

| # | Blocker | Where |
|---|---|---|
| 1 | **Brokerage name and DRE licence number.** Legally required on every page. Currently the calm placeholders `[BROKERAGE — TO BE SUPPLIED]` and `[DRE # — TO BE SUPPLIED]`. | `lib/content/site.ts` → `legal` |
| 2 | **No other legal or compliance language exists.** There is no equal-housing statement, privacy policy, terms, or accessibility statement, and none has been written or verified. Do not draft these — they must be supplied. | — |
| 3 | **Substack publication URL.** Until `SUBSTACK_URL` is set, `/read` shows the four verified essay titles as plain text and the newsletter block says the subscribe link is not connected yet. | `.env` |
| 4 | **Contact delivery.** Without `CONTACT_FORM_ENDPOINT` the contact form renders with no submit control and says delivery is being connected. It never fake-submits. | `.env` |
| 5 | **Public contact email.** No address is shown anywhere until `CONTACT_EMAIL` is set. None has been invented. | `.env` |
| 6 | **Photography.** Every image is a labelled `[ADD DANIELLE PHOTO]` / `[ADD ESSAY IMAGE]` slot. | `lib/content/` |
| 7 | **Favicon is a temporary technical icon** — a plain cream square, deliberately with no glyph or mark, added only so the app does not emit a favicon 404. **Replace with an approved asset before launch.** | `app/icon.svg` |
| 8 | **No Open Graph / social share image.** Deliberately not declared rather than fabricated. Add with approved artwork. | `app/layout.tsx` |

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

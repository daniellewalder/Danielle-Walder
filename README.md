# danielle walder — site

Personal real estate site for Danielle Walder, a Los Angeles agent, and home of
her publication *Overthinking Real Estate*. Next.js (App Router) + TypeScript +
Tailwind CSS.

## 🚨 Launch blockers

**The site must not go on a public domain until these are resolved.**

| # | Blocker | Where |
|---|---|---|
| 1 | **Danielle's own agent licence number is not displayed.** The footer carries the responsible broker's line, `COLDWELL BANKER RESIDENTIAL \| CA DRE# 00616212`. Her personal licence (`02253356`) is not shown. California requires a licensee to disclose their own licence number on solicitation material, so **confirm with her office whether her agent number must also appear** — then supply the exact string and it goes in verbatim. | `lib/content/site.ts` → `legal` |
| 2 | **The live Substack feed is unverified.** The publication is `https://daniellewalder.substack.com`, so the feed and subscribe links are correct. The feed could not be exercised from the build sandbox, which blocks all outbound requests — **confirm on the first deploy** that `/read` shows real publish dates. Until it does, entries fall back to Danielle's curated titles linking to the publication, which is a correct page either way. | `lib/config.ts` |
| 3 | **Contact delivery.** Without `CONTACT_FORM_ENDPOINT` the contact form renders with no submit control and says delivery is being connected. It never fake-submits. Email is the working channel. | environment only |
| 4 | **Photography.** Every image is a labelled `[ADD DANIELLE PHOTO]` / `[ADD ESSAY IMAGE]` slot. | `lib/content/` |
| 5 | **Favicon is a temporary technical icon** — a plain cream square, deliberately with no glyph or mark, added only so the app does not emit a favicon 404. **Replace with an approved asset before launch.** | `app/icon.svg` |
| 6 | **No Open Graph / social share image.** Deliberately not declared rather than fabricated. | `app/layout.tsx` |

### Supplied and live

| Value | Where |
|---|---|
| Responsible broker — `COLDWELL BANKER RESIDENTIAL \| CA DRE# 00616212` | `lib/content/site.ts`; footer on every page, verbatim |
| Coldwell Banker–approved website disclosure | same; footer on every page, verbatim |
| Public email — homes@daniellewalder.com | `lib/config.ts`; mailto on `/contact` |
| Substack publication — `https://daniellewalder.substack.com` | `lib/config.ts`; drives `/read`, the homepage essays, and the real `/subscribe` link |

The brokerage line and the disclosure are rendered **verbatim**. Do not reword,
re-case, reformat, abridge, or split them, and do not update the copyright year
by inference — a new year needs newly approved text.

### Supplied but deliberately not rendered

Held here rather than placed on the site:

- **Danielle's agent licence** — `02253356`. Held pending confirmation that it
  must appear alongside the broker's line. See blocker 1.
- **Phone** — `(847) 899-9604`, and **service areas**, *Beverly Hills | Hancock
  Park*. Neither has an approved home in the design.

### Not to be invented, ever

The footer now carries exactly the disclosure the brokerage approved, and
nothing beyond it. Office names and addresses, brokerage logos, any further
Equal Housing Opportunity or REALTOR® wording, privacy policies, terms,
accessibility statements, social links, credentials, awards, years of
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

# danielle walder — site

Personal real estate site for Danielle Walder, a Los Angeles agent, and home of
her publication *Overthinking Real Estate*. Next.js (App Router) + TypeScript +
Tailwind CSS.

## 🚨 Blocks public launch

**Do not put this on a public domain until all three are resolved.**

| # | Blocker |
|---|---|
| 1 | **No privacy policy.** RealScout introduces third-party lead capture, data collection, and cookies, which makes this a genuine public-launch requirement. **Do not draft legal language.** Danielle needs approved wording from Coldwell Banker / compliance or another appropriate legal source. Once supplied: create the page and put a conspicuous link in the footer. |
| 2 | **RealScout has not been observed working in a real browser.** Search and listings are public core functionality, so all four widgets must be watched running before launch. DOM structure and a clean build are not evidence of runtime behaviour. Checklist below. |
| 3 | **Visible `[ADD DANIELLE PHOTO]` placeholders.** The site must not launch publicly with literal placeholders on the homepage hero, the homepage About block, or `/about`. The conditional `[ADD ESSAY IMAGE]` fallback does **not** block launch as long as real Substack cover images are loading. |

## Real-browser testing

Four RealScout integrations. **None can be verified from a build environment** —
`em.realscout.com` is blocked there, so the custom elements never upgrade.

| Widget | Page |
|---|---|
| Simple Search | homepage hero |
| Advanced Search | `/search` |
| Home Value | `/home-valuation` |
| Your Listings | `/homes` |

For **each** of the four, confirm:

- [ ] it actually renders
- [ ] desktop sizing and layout
- [ ] mobile sizing and layout
- [ ] the interaction actually works
- [ ] where search / results / interactions open
- [ ] whether the user stays on this domain or moves to RealScout
- [ ] whether a login or signup gate appears
- [ ] exactly what information a lead is asked to provide
- [ ] whether SMS / text-message opt-in or disclaimer language appears

Separately, and **not inferable from this repo**:

- [ ] Danielle confirms the appropriate **TCR / SMS opt-in setting inside her
      RealScout account** before lead-capture functionality is distributed
      publicly. Do not assume this from the code — it is an account setting.

## Polish before sharing

Not broken functionality and not compliance. Finish before the link goes out:

- **Favicon** is a plain cream square with no glyph, present only so the app
  does not emit a 404. Replace with an approved asset.
- **No Open Graph / social share image.** Deliberately not declared rather than
  fabricated. Without one, a pasted link shows no preview card.

### Supplied and live

| Value | Where |
|---|---|
| Agent licence — `Danielle Walder \| CA DRE# 02253356` | `lib/content/site.ts`, footer on every page |
| Responsible broker — `COLDWELL BANKER RESIDENTIAL \| CA DRE# 00616212` | same |
| Coldwell Banker–approved disclosure | same, rendered verbatim |
| Public email — homes@daniellewalder.com | `lib/config.ts`; mailto on `/contact` |
| Substack publication — `https://daniellewalder.substack.com` | `lib/config.ts` |
| RealScout agent id — `QWdlbnQtMzA0MjM2` | `lib/config.ts`; public embed id, not a credential |

The two licence numbers are **not interchangeable**: `02253356` is Danielle's
own agent licence, `00616212` is the brokerage's. The brokerage line and the
disclosure are rendered **verbatim** — do not reword, re-case, reformat,
abridge, or split them, and do not update the copyright year by inference.

### Content Danielle still needs to supply

- **Photography** — the three `[ADD DANIELLE PHOTO]` slots above. This is
  launch blocker 3.
- **Sold data**, only if `/sold` is ever to return to the nav.

### Supplied but deliberately not rendered

- **Phone** — `(847) 899-9604`, and **service areas**, *Beverly Hills | Hancock
  Park*. Neither has an approved home in the design.

### Not to be invented, ever

The footer carries exactly the disclosure the brokerage approved and nothing
beyond it. Office names and addresses, brokerage logos, any further Equal
Housing Opportunity or REALTOR® wording, privacy policies, terms, accessibility
statements, social links, credentials, awards, years of experience, listings,
prices, statistics, transaction outcomes, and testimonials are supplied and
verified, or they are absent.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run typecheck
```

Copy `.env.example` to `.env.local`. Every value is an optional override — the
public defaults are committed in `lib/config.ts`, so the site works on any
deploy with no dashboard setup.

Next caches feed fetches for the revalidation window. If a content change does
not show up locally, `rm -rf .next` and restart.

## Routes

| Route | What it is |
|---|---|
| `/` | Homepage. Hero carries a **real RealScout Simple Search field** |
| `/read` | *Overthinking Real Estate*, as an editorial front page |
| `/read/[slug]` | Full essay, rendered on-site from the Substack feed |
| `/search` | Home search — **RealScout Advanced Search**, live |
| `/home-valuation` | **RealScout Home Value**, live. No longer redirects anywhere |
| `/tuesday-test` | The Tuesday Test landing page, static non-interactive preview |
| `/la-actually` | LA, Actually — editorial landing page |
| `/about` | About Danielle |
| `/contact` | Say Hello. **Email only** — no form at launch |
| `/homes` | In the nav as "listings". **RealScout Your Listings**, live |
| `/sold` | Kept for route stability. **Not in the nav or footer**, not redirected, excluded from the sitemap |
| `/api/contact` | Dormant. The form is not rendered at launch; the route is kept for when a provider is chosen |

Redirects (308): `/overthinking-real-estate/*` → `/read` · `/quizzes/*` →
`/tuesday-test` · `/listings/*` → `/search`

### Labels vs routes

The nav shows Danielle's words; the routes stay clean. They are deliberately
different and both are approved:

| Nav label | Route |
|---|---|
| search | `/search` |
| listings | `/homes` |
| sold | `/sold` |
| overthinking real estate | `/read` |
| quizzes | `/tuesday-test` |
| about | `/about` |
| say hello | `/contact` |

Do not reintroduce `/overthinking-real-estate`, `/quizzes`, or `/listings` as
public routes — they redirect.

## The honesty rules this codebase follows

Every visible link and button resolves to a working page, a verified external
URL, or an honest non-interactive state. Specifically:

- **Search is real.** The homepage hero and `/search` both run RealScout IDX
  widgets. The hero field was absent through earlier builds precisely because a
  box that cannot search is fake functionality; it returned when it could.
- **No fake quiz.** The Tuesday Test preview options are styled `<li>` text —
  not buttons, links, inputs, or focusable, with no hover state. Nothing is
  selected, scored, or saved.
- **No fake form submission.** There is no contact form at launch — email is
  the contact method, because an unfinished form that says "delivery is being
  connected" is worse than an address that works. ContactForm.tsx and
  `/api/contact` are kept, dormant, for when Danielle picks a provider. **Do
  not choose or install one without asking her.** There is no newsletter form
  either — subscribing goes to Substack.
- **No inferred claims about content.** The site does not guess whether a
  Substack post is subscriber-only. There is no reliable signal, and a wrong
  guess would put a false statement about Danielle's writing on her own site.
- **No invented content.** No listings, addresses, prices, property photos,
  statistics, transaction outcomes, testimonials, credentials, or neighbourhood
  claims appear anywhere.
- **No broken links.** Verified by a crawl of every route on every build.

## Overthinking Real Estate

Essays are written on Substack and also rendered here.

`lib/essays/index.ts` is the seam, and **the feed is the source of truth** —
whatever Danielle publishes appears on the next revalidation with its own page,
with no repo edit. This must never be driven by a hardcoded list. Her curated
deks in `lib/content/essays.ts` are merged in by title where she has written
one; a post without one shows no dek rather than an invented one. The curated
list is the whole list only when the feed is unreachable, so the page is never
empty.

- Fetched server-side with `fast-xml-parser`, 5s timeout, `revalidate: 1800`.
- Post HTML comes from `content:encoded` and is **sanitised** in
  `lib/essays/sanitize.ts` against an allow-list before it can reach a page.
  Never render feed HTML without it.
- Cover images come from the feed's `<enclosure>`, image types over http(s)
  only.
- Each essay page sets `rel=canonical` to the Substack original and links to
  it. Essay routes stay out of the sitemap for the same reason.
- Feed `<description>` is never rendered — it is arbitrary HTML.

## RealScout IDX

Three widgets, all in `components/realscout/RealScout.tsx`, themed with locked
palette tokens from Danielle's own embed snippets:

| Widget | Page |
|---|---|
| Simple Search | homepage hero |
| Advanced Search | `/search` |
| Home Value | `/home-valuation` |
| Your Listings | `/homes` |

RealScout's drop shadow is switched off on all three — the design system has no
shadows. Width is controlled here, not in RealScout's dashboard: each component
fills a capped container, because a fixed pixel width from their config
overflows narrow screens. The script loads only on pages that use a widget.

**Not yet verified in a real browser.** Before launch, confirm on the deployed
preview: each of the three widgets renders; mobile sizing; whether results stay
on this site or redirect to a RealScout-hosted experience; and any
login/signup behaviour the widgets introduce. A redirect would also decide
whether RealScout's paid branding tier is worth buying.

**Your Listings** on `/homes` carries Danielle's exact configuration — agent
id, `sort-order="STATUS_AND_SIGNIFICANT_CHANGE"`, the full
`listing-status="For Sale,For Rent,In Contract,Sold,Rented"`, and
`property-types="SFR,MF,TC,LAL,MOBILE,OTHER"`. Do not trim or reorder them.
Unlike the other three it fills the content width rather than sitting in a
capped container, because listing cards need the room.

Its divider colour, `rgb(101, 141, 172)` / `#658DAC`, is preserved exactly as
it came in the supplied RealScout configuration. It sits **outside the locked
site palette**. This is not a stated brand decision — it is the value the
snippet carried — so do not "correct" it to a palette token, and do not treat
it as licence to introduce other off-palette colours. It changes only if we
deliberately restyle the RealScout widget.

Note the status list includes Sold and Rented, so `/homes` already surfaces
sold work. That may make a separate `/sold` page redundant — a question for
Danielle, not something to change unilaterally.

## Images

Local assets go through `next/image` and are optimised. **Remote images do
not** — they render as a plain `<img>`. This is deliberate: `next/image` throws
a hard runtime error on any hostname missing from `next.config.ts`, essay
covers come from whatever host Substack happens to use, and a crashed page is a
far worse trade than an unoptimised image. Do not reintroduce a hostname
allowlist.

## Design tokens

`tailwind.config.ts` carries the locked palette, the four typefaces, the
letter-spacing values, and the radii. `app/tokens.css` holds the same values as
CSS custom properties. Both mirror `design_handoff/tokens.css`, the source of
truth. See `CLAUDE.md` for the standing rules.

Image placeholder labels are Ink Soft `#6B5F55` on sand `#E3DBCB`.

## Responsive

Breakpoints: `tablet` ≤1024px, `mobile` ≤640px, plus `navstack` ≤1120px where
the nav collapses to the mark and a hamburger, and `navtight` ≤1400px where the
seven-item row tightens to stay on one line. Verified free of horizontal
overflow at 320, 375, 640, 768, 900, 1024, 1120, 1200, 1280 and 1440px.

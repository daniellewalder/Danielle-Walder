# danielle walder — site

Personal real estate site for Danielle Walder, a Los Angeles agent. Next.js
(App Router) + TypeScript + Tailwind CSS.

The homepage is built to the approved design at full fidelity. Every other page
in the sitemap is still to come — build it from the patterns in
`design_handoff/README.md`, never from new colors or layouts.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run typecheck
```

Copy `.env.example` to `.env.local` before wiring the newsletter provider or an
IDX feed. Neither is required to run the site.

## What's here

```
app/
  layout.tsx              nav + footer shell, the four Google Fonts
  page.tsx                homepage composition
  globals.css             base styles, focus ring, the three shared classes
  tokens.css              the locked palette as CSS custom properties
  api/newsletter/route.ts signup handler; provider endpoint comes from env
components/
  SiteNav.tsx             nav; collapses to a full-screen cream menu ≤900px
  SiteFooter.tsx          footer, including the required brokerage + DRE line
  home/                   one component per homepage section, in page order
  listings/               ListingCard, SoldCard, and their skeletons
  ui/                     ImageSlot, Badge
lib/
  types.ts                Listing, Essay, Quiz, Testimonial, Stat
  listings/               the listing source seam + the mock adapter
  content/                homepage and site copy, editable without touching JSX
design_handoff/           the design bundle, unchanged — read before building
tailwind.config.ts        the design tokens
```

## Design tokens

`tailwind.config.ts` carries the palette, the four typefaces, the letter-spacing
values, and the radii — so colors and type are named, not hex codes scattered
through JSX. `app/tokens.css` holds the same values as CSS custom properties for
the few places a raw value is clearer (base element styles, the focus ring).

Both mirror `design_handoff/tokens.css`, which is the source of truth. The system
is locked: never introduce a color, typeface, radius, or shadow that isn't in it.
See `CLAUDE.md` for the standing rules.

Fonts are self-hosted through `next/font/google` — Unbounded, Rozha One, Kalnia,
Figtree, exposed to Tailwind as `font-mark`, `font-display`, `font-serif`, and
`font-sans`.

## Placeholders — read this before showing anyone

Two things in the homepage are deliberately, visibly unfinished:

**Copy.** Everything in `[SQUARE BRACKETS]` is placeholder and stays bracketed
until Danielle supplies real text. It lives in `lib/content/`. The essay titles
in the Overthinking Real Estate section are real; their standfirst is not. The
brokerage name and DRE number in the footer are legally required and are
currently `[BROKERAGE]` and `DRE [DRE NUMBER]` — those must be filled in before
launch.

**Photography.** Every image renders as a labelled sand-colored rectangle via
`components/ui/ImageSlot.tsx`. Never fill one with stock or generated
photography — a visible empty slot is honest, a stock kitchen is a lie about the
listing. Supplying a real photo is one prop: give the `ImageRef` a `src`. The
asset list and specs are in `design_handoff/README.md`. There is also no favicon
or social share image yet; both should be derived from the Unbounded wordmark,
which is the logo.

## Listings data

Listings and sold properties come from `lib/listings/index.ts`, which today
resolves to `lib/listings/mock-adapter.ts`. The mock returns the real shape with
bracketed placeholder values.

Swapping to a real feed is meant to be a one-file change: write something that
satisfies `ListingSource` and assign it in `lib/listings/index.ts`.

**Before promising MLS-wide search, read the IDX section of
`design_handoff/README.md`.** Live MLS data needs an IDX agreement with Danielle's
MLS plus her broker's authorization, and widget-based providers inject their own
iframes and CSS that will not match this design — in that case these styled cards
apply only to her own listings. That trade-off should be raised with her early.

## Behavior notes

- **URL is the source of truth** for search and listing filters, so results are
  shareable and back/forward work. The hero search posts to `/listings?q=…` and
  also submits natively without JavaScript.
- **The homepage quiz block is the entry point, not the whole quiz.** Picking an
  answer carries it to `/quizzes/[slug]`, where the remaining questions and the
  result screen with its email capture will live.
- **Newsletter** validates client-side and POSTs to `/api/newsletter`, which
  forwards to `NEWSLETTER_ENDPOINT`. With no endpoint configured it accepts the
  signup and logs a warning rather than pretending to have sent it.
- **Motion is nearly absent by design.** Hover is a color swap in ~150ms. The
  only other motion is the optional 1.02 photo scale on card hover, and it is
  skipped under `prefers-reduced-motion`.

## Deviations from the handoff, and why

Two, both small, both to keep a spec'd rule from breaking:

1. **The nav collapses to the hamburger at ≤900px, not ≤640px.** The full nav row
   stops fitting on one line below about 900px and overflowed the page. It now
   collapses to the mark plus the hamburger there, using the same full-screen
   cream menu the mobile spec describes.
2. **Stat values wrap.** `[TRANSACTIONS]` set in Rozha One at 32px is wider than a
   mobile grid column and pushed the page sideways. The stat value is allowed to
   break; real values ("$180M", "142") never will.

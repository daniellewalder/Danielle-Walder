# Handoff: Danielle Walder — real estate site (homepage + brand system)

## Overview

A personal real estate brand site for Danielle Walder, a Los Angeles agent. Three jobs, in priority order:

1. **Get people into listings** — search, current listings, sold work.
2. **Make Danielle the reason they stay** — she is the brand, not a brokerage logo.
3. **Publish her newsletter, _Overthinking Real Estate_** — long-form essays on how real estate actually works. This is her voice differentiator and gets first-class treatment, not a blog afterthought.

There are also "quizzes" — short interactive quizzes (e.g. "what kind of buyer are you") used as lead capture and as personality.

The deliverable in this bundle is the **homepage** design at full fidelity, plus the **complete brand system** (color, type, shape, photography rules) needed to build every other page consistently.

## About the design files

The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior. They are **not production code to copy directly**.

- `homepage-b-v3.dc.html` and `brand-sheet-v2.dc.html` use a custom component runtime (`<x-dc>`, `image-slot`) that is **not part of the target stack**. Read them for exact values and structure; do not port the runtime.
- `danielle-walder-homepage.wordpress.html` is the closest thing to plain, portable markup — a single-section WordPress-safe HTML/CSS build of the same homepage, with namespaced classes and responsive rules. **This is the best structural starting point** if you want real markup to read, including the mobile behavior.
- Your task: **recreate these designs in a real codebase.** No codebase exists yet, so pick the stack (recommendation below) and implement.

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii, and hover states are all final and approved. Build pixel-accurate at desktop. Every hex, size, and weight in this README is the approved value — do not substitute, and do not "improve" the palette or type scale.

**Content is not final.** All copy in the mocks is bracketed placeholder (`[HERO HEADLINE]`, `[PRICE]`, `[ABOUT COPY]`). Keep placeholders in place, clearly marked, until Danielle supplies real copy. Same for photography — every image is an empty slot. Build with visible, labeled placeholder boxes; never fill with stock photos or AI images.

---

## Recommended stack

Nothing is built yet. Recommendation, optimized for "Danielle can hand this to Claude Code and keep vibe-coding it":

- **Next.js (App Router) + TypeScript + Tailwind CSS**, deployed on Vercel.
- **Tailwind config carries the design tokens** (see `tokens.css` and the token table below) so colors and type are named, not hardcoded hexes scattered through JSX.
- **Content in MDX or a lightweight CMS.** Essays for _Overthinking Real Estate_ as MDX files in the repo is the simplest thing that works and is the right call unless Danielle wants to publish without touching code — in which case use Sanity or Contentful.
- **Listings come from an IDX/MLS feed, not the CMS** (see IDX section). Model listings as a typed data source with a mock adapter so the whole site can be built and iterated before IDX access exists.
- Fonts self-hosted via `next/font/google` (all four are Google Fonts).

If you prefer Astro or plain Vite + React, that is fine — the design has almost no client-side state. Do not introduce a component library (MUI, Chakra, shadcn defaults) whose visual opinions fight the brand; the design is specific enough that raw Tailwind is less work than overriding a library.

---

## Design tokens

### Color

The palette is **locked and approved. Do not add, remove, or adjust any value.**

The system is organized into **five families**. The governing rule: **one family owns a section**, and within that section the family's own dark tone writes on the family's own light field. That is what makes each section read as monochromatic rather than colorful.

**Brown — structure. The spine of the site.**

| Hex | Name | Use |
|---|---|---|
| `#F4F1E2` | cream | page background, the connective tissue between colored sections |
| `#FBF9F0` | paper | inputs, cards on cream |
| `#E3DBCB` | sand field | secondary field |
| `#DCD4C2` | hairline | 1px section dividers |
| `#897D6D` | taupe | secondary text, placeholders, small labels |
| `#6B5F55` | warm gray | body text at secondary weight |
| `#513229` | rustic brown | the only true dark; dark sections, primary buttons |
| `#3B2620` | espresso | body text |

**Blue — hero, search, tools.**

| Hex | Name | Use |
|---|---|---|
| `#EAF4FC` | mist | palest blue |
| `#D8EBF9` | frosted field | hero block background, quiz answer chip |
| `#A8C4DA` | steel | borders, charts |
| `#3A5B75` | deep blue | body text on frosted |
| `#24425A` | ink blue | headlines on frosted |

**Butter — about, quizzes, flags.**

| Hex | Name | Use |
|---|---|---|
| `#FDF2D8` | pale butter | |
| `#FCE6B7` | butter field | about block background, badges, quiz eyebrow |
| `#F3D79C` | deep butter | playful button hover |
| `#EBD3A2` | butter hairline | rules inside butter blocks |
| `#96773A` | bronze | labels on butter |
| `#6A4E12` | olive brown | text and headlines on butter |

**Sage — editorial, neighborhoods.**

| Hex | Name | Use |
|---|---|---|
| `#E4E6CE` | pale sage | |
| `#D4D7B5` | sage field | |
| `#CFD3AE` | sage chip | tertiary button |
| `#A9AE7F` | mid sage | rules |
| `#6B6C38` | olive sage | **text links and hovers site-wide**, "everything I've sold →" style links |
| `#4A4B25` | deep olive | text on sage |

**Inks — hints only, never a field.**

| Hex | Name | Use |
|---|---|---|
| `#7A1F2E` | deep wine | prices, the _Overthinking Real Estate_ wordmark, one accent word per screen, hover on primary buttons |
| `#5A1522` | wine pressed | active/pressed state only |
| `#33452F` | pine ink | links, hovers |
| `#205A66` | petrol ink | data, charts, notes |

Inks appear **only** as type, hairlines, or a small badge on a neutral or pale field. **Burgundy is never a background.**

Additional tones used in the dark brown sections: `#DACFC4` (body text on brown), `#C4B9AC` (labels on brown), `#A8998C` (fine print on brown), `#6A5347` (hairline on brown).

### Typography

Four families, all Google Fonts. **Do not add a fifth.**

Load: `Unbounded` 400/500/600/700, `Rozha One` 400, `Kalnia` 300/400/500, `Figtree` 300/400/500/600/700.

**Unbounded — the Danielle mark and big statements.**
- Always **lowercase**. Never below 16px.
- Letter-spacing `-0.055em` at display sizes, `-0.045em` at utility sizes.
- Line-height `0.92`–`0.98` at display sizes.
- Weight **600** for hero, section statements, quiz titles, the nav mark (40px+ is display).
- Weight **500** for listing addresses and short labels only. Never body copy.
- Nav mark: 18px / 600 / `-0.045em` — the smallest the mark ever goes.

**Rozha One — section headers, prices, stats.**
- Sentence case. Never letter-spaced. **Never in paragraphs.** It exists to be big.
- Typical sizes: 54px section headers, 40px sub-headers, 32px stat numbers, 24px listing prices.

**Kalnia — _Overthinking Real Estate_, pull quotes, accent words.**
- Weight 400 default; 300 for large pull quotes.
- Line-height `1.02`–`1.2`.
- `overthinking real estate` **lowercase** in nav, footer, and inline references — it reads as a voice.
- `Overthinking Real Estate` **title case** only as the section heading on the homepage and the section landing page. **Never larger than Danielle's name on the same screen.**

**Figtree — facts, forms, everything practical.**
- Body copy 16–19px, line-height 1.45–1.6.
- Weights 400 body, 500 nav/meta, 600 buttons, 700 labels.
- Uppercase labels: 11–12.5px, weight 700, letter-spacing 0.14em–0.22em.

### Shape

- **Radii:** 6–8px badges · 10–12px buttons and inputs · **0–4px photography of property** · 20px reserved for the two or three soft color blocks that genuinely need to be containers (hero, about, newsletter row). **No circles. No 999px pills. Nothing at 28px.**
- **Photography corners carry meaning:** square/2–4px corners = property. 20px soft corners = Danielle and editorial. Keep that distinction.
- **Containers are earned.** Most sections are separated by whitespace plus a 1px `#DCD4C2` hairline, not a rounded card. If two rounded blocks would sit adjacent, one becomes plain cream.
- **No drop shadows. No gradients. No duotone, no filters, no gradient scrims on photos.**

### Spacing

- Page gutters: **40px** desktop.
- Between siblings: 20–26px.
- Between sections: 72–88px.
- Exactly **one full-bleed dark (`#513229`) section** in the body, plus the footer.

---

## Screens / views

### Homepage (the fully designed screen)

Desktop reference: `danielle-walder-homepage.wordpress.html` and `homepage-b-v3.dc.html`. Vertical order, top to bottom:

#### 1. Nav

- Container `padding: 26px 40px 0`. Inner row: flex, space-between, `gap: 28px`, `border-bottom: 1px solid #DCD4C2`, `padding-bottom: 18px`.
- Left: `danielle walder` — Unbounded 600, 18px, `-0.045em`, lowercase, `#3B2620`.
- Right: flex row, `gap: 18px`, Figtree 500, 14.5px: `search`, `listings`, `sold`, then `overthinking real estate` in **Kalnia 16.5px `#7A1F2E`**, then `quizzes`, `about`. Hover on plain items: `#7A1F2E`.
- CTA `say hello`: bg `#513229`, text `#F4F1E2`, `padding: 11px 20px`, radius 12px, Figtree 600. Hover bg `#7A1F2E`.
- Nav is **not sticky** in the current design. If you make it sticky, it must stay on cream with the hairline — no shadow, no blur.

#### 2. Hero — Danielle-led (approved direction "Hero A")

- Wrapper `padding: 22px 40px 0`. Block: bg `#D8EBF9`, radius 20px, `padding: 54px 46px`, `display: grid; grid-template-columns: 1.04fr 0.96fr; gap: 50px; align-items: center`.
- Left column, flex column `gap: 26px`:
  - Headline `[HERO HEADLINE]` — Unbounded 600, **66px**, line-height 0.94, `-0.055em`, `#24425A`.
  - Intro `[INTRO COPY]` — Figtree 19px, line-height 1.45, `max-width: 400px`, `#3A5B75`.
  - Search field: flex row, bg `#FBF9F0`, radius 14px, `padding: 8px 8px 8px 22px`, `max-width: 500px`. Input placeholder "where are you looking?" 16.5px `#897D6D`. Button `search homes` — bg `#513229`, `#F4F1E2`, 15px/600, `padding: 14px 24px`, radius 10px, hover `#7A1F2E`.
- Right column: portrait of Danielle, **height 520px**, radius **4px**, `object-fit: cover`, fills column width.
- The hero is Danielle's portrait, not a house. That was a deliberate, approved decision.

#### 3. Utility strip — "start here"

- `padding: 22px 40px 0`. Flex row, `gap: 26px`, wrap, `border-bottom: 1px solid #DCD4C2`, `padding-bottom: 20px`.
- Eyebrow `start here`: 11.5px/700/0.18em/uppercase, `#897D6D`.
- Links, Figtree 500 14.5px `#6B5F55`, hover `#7A1F2E`: `map search`, `new this week`, `open houses`, `what I've sold`, `what's my home worth`.

#### 4. Now showing — current listings

- Header row: `padding: 56px 40px 0`, flex, `align-items: flex-end`, space-between.
  - `Now showing` — Rozha One 54px, line-height 1, `#3B2620`.
  - `every listing →` — Figtree 15px/600, `#6B6C38`, `border-bottom: 2px solid #6B6C38`, `padding-bottom: 2px`.
- Grid: `repeat(3, 1fr)`, `gap: 24px`, `padding: 26px 40px 0`.
- Each card, flex column `gap: 16px`:
  - Photo: **height 420px**, radius **2px**, cover.
  - Info block, flex column `gap: 7px`:
    - Row (flex, space-between, `align-items: baseline`, `gap: 12px`): address — Unbounded **500**, 17px, `-0.045em`; price — **Rozha One 24px `#7A1F2E`**.
    - Meta: `[NEIGHBORHOOD] · [BEDS] bd · [BATHS] ba · [SQ FT] sq ft` — Figtree 15px `#6B5F55`.
    - Optional badge, `align-self: flex-start`, `margin-top: 3px`: e.g. `open sun 2–4` — bg `#FCE6B7`, text `#6A4E12`, 11.5px/700/0.14em/uppercase, `padding: 6px 11px`, radius 6px.
- **Badge rules:** at most one badge per listing, only when it carries real information, and it sits **in the row under the photo — never floating on top of it.** Badge variants: `open sun 2–4` butter; `just listed` bg `#D8EBF9` text `#24425A`; `in escrow` bg `#D4D7B5` text `#4A4B25`; `sold` bg `#513229` text `#F4F1E2`.

#### 5. Sold

- Header: `margin: 76px 40px 0`, `padding-top: 34px`, `border-top: 1px solid #DCD4C2`, flex space-between, `align-items: flex-end`.
  - Eyebrow `past sales` 11.5px/700/0.2em/uppercase `#897D6D`; title `Sold` — Rozha One 40px.
  - Link `everything I've sold →` same style as above.
- Grid: `repeat(4, 1fr)`, `gap: 20px`, `padding: 22px 40px 0`. Card: photo **height 190px**, radius 2px; address Figtree 14.5px/600; meta `[NEIGHBORHOOD] · sold [PRICE]` 14px `#6B5F55`. Card `gap: 11px`.
- Note the deliberate hierarchy: sold cards are smaller and quieter than active listings.

#### 6. About — "hi, I'm Danielle"

- `padding: 80px 40px 0`. Block: bg `#FCE6B7`, radius 20px, `padding: 56px 48px`, grid `0.85fr 1.15fr`, `gap: 48px`, centered.
- Left: portrait, **height 420px**, radius **20px** (soft — this is Danielle, not property).
- Right, flex column `gap: 24px`:
  - `hi, I'm Danielle` — Unbounded 600, 50px, line-height 0.96, `-0.055em`, `#6A4E12`.
  - About copy — Figtree 18px, line-height 1.55, `max-width: 470px`, `#6A4E12`.
  - Stats row: flex, `gap: 40px`, `border-top`/`border-bottom: 1px solid #EBD3A2`, `padding: 20px 0`. Each stat: number in **Rozha One 32px `#6A4E12`**, label 11.5px/700/0.18em/uppercase `#96773A`. Three stats: `[SALES VOLUME]` / closed, `[TRANSACTIONS]` / homes, `[YEARS]` / years in LA.
  - Buttons, flex `gap: 10px`: primary `[CTA]` — bg `#513229`, text `#FCE6B7`, 15px/600, `padding: 14px 26px`, radius 12px, hover bg `#7A1F2E`. Secondary `more about me` — `1.5px solid #513229`, `padding: 12.5px 26px`, radius 12px; hover bg `#6B6C38`, text `#F4F1E2`, border `#6B6C38`.

#### 7. Overthinking Real Estate

- Header: `padding: 88px 40px 0`, flex space-between, `align-items: flex-end`.
  - Eyebrow `the reading part` 11.5px/700/0.2em/uppercase **`#6B6C38`**.
  - Title `Overthinking Real Estate` — **Kalnia 400, 54px**, line-height 1, `#7A1F2E`.
  - Link `read everything →`.
- Body: `padding: 28px 40px 0`, grid `1.4fr 1fr`, `gap: 44px`, `align-items: start`.
  - **Lead essay** (left), flex column `gap: 16px`: image height 340px radius **20px**; title `The Cost Per Tuesday` — Kalnia 400, 46px, line-height 1.02; standfirst 16.5px, line-height 1.5, `#6B5F55`, `max-width: 460px`.
  - **Essay list** (right): each row flex column `gap: 10px`, `border-top: 1px solid #DCD4C2`, `padding: 22px 0` (last row also `border-bottom`). Title Kalnia 400, 27px, line-height 1.12; kicker `essay` 12.5px/700/0.16em/uppercase `#897D6D`.
  - Real essay titles currently in the design: "Everybody Says They Want a Deal.", "Who Actually Has Access to Your Transaction?", "Is the Kitchen Actually Outdated, or Are You Just Tired of Looking at It?"

#### 8. Quiz — the one dark section

- `margin-top: 88px`, **full-bleed** bg `#513229`, text `#F4F1E2`, `padding: 80px 40px`, grid `1fr 1fr`, `gap: 56px`, centered.
- Left, flex column `gap: 20px`: badge `quiz · [N] questions` (bg `#FCE6B7`, text `#513229`, 11.5px/700/0.18em/uppercase, `padding: 7px 13px`, radius 6px, `align-self: flex-start`); title `[QUIZ TITLE]` Unbounded 600, 54px, line-height 0.94, `-0.055em`; intro 17.5px, line-height 1.5, `#DACFC4`, `max-width: 380px`.
- Right, flex column `gap: 12px`: question label `[QUESTION 1]` 11.5px/700/0.18em/uppercase `#C4B9AC`. Answers, 18px/500, `padding: 19px 26px`, radius 12px:
  - Answer A: bg `#D8EBF9`, text `#24425A` (the "selected/first" tone). Hover bg `#FCE6B7`, text `#513229`.
  - Answers B–D: bg `#F4F1E2`, text `#513229`. Hover bg `#FCE6B7`.

#### 9. Testimonial

- `padding: 88px 40px`, flex column, centered, `gap: 18px`, `text-align: center`.
- Quote — **Kalnia 300**, 42px, line-height 1.2, `max-width: 860px`, wrapped in curly quotes.
- Attribution `[CLIENT] · [NEIGHBORHOOD]` — 12.5px/700/0.2em/uppercase `#897D6D`.

#### 10. Newsletter

- `padding: 0 40px`; inner `border-top: 1px solid #DCD4C2`, `padding-top: 44px`, grid `1.1fr 1fr`, `gap: 46px`, `align-items: end`.
- Headline: Unbounded 600, 44px, line-height 0.98, `-0.055em` — `one letter, twice a month.` followed by `occasionally a house.` in **Kalnia 400, `-0.01em`, `#7A1F2E`** inline. This mixed-typeface headline is intentional; keep it.
- Form: flex row, bg `#FBF9F0`, `border: 1px solid #E3DBCB`, radius 14px, `padding: 8px 8px 8px 22px`. Input placeholder `your email` 16px `#897D6D`. Button `subscribe` — bg **`#7A1F2E`**, text `#F4F1E2`, 15px/600, `padding: 14px 24px`, radius 10px, hover `#5A1522`.

#### 11. Footer

- `margin-top: 76px`, bg `#513229`, text `#F4F1E2`, `padding: 52px 40px 40px`, flex column `gap: 34px`.
- Top row (flex, space-between, `align-items: flex-end`, wrap): `danielle walder` Unbounded 600 34px `-0.055em`; `overthinking real estate` Kalnia 22px `#FCE6B7`.
- Bottom row: `border-top: 1px solid #6A5347`, `padding-top: 24px`, flex space-between, wrap. Left: nav links, `gap: 22px`, 14px `#C4B9AC` — search, listings, sold, overthinking real estate, quizzes, about, contact. Right: `gap: 22px`, 13px `#A8998C` — `[BROKERAGE]`, `DRE [DRE NUMBER]`.
- **Legal:** the brokerage name and DRE license number are legally required and must be present on every page.

### Pages to build beyond the homepage (not yet designed)

Build these using the system above. Do not invent new colors or layouts; compose from the patterns already established.

- **Listings index** — filterable grid; reuse the "Now showing" card exactly. Blue family owns filter UI.
- **Listing detail** — photo-led, square corners, price in Rozha One `#7A1F2E`, facts in Figtree, one CTA to contact Danielle.
- **Sold index** — reuse the 4-up sold card.
- **Overthinking Real Estate index + essay template** — Kalnia headings, Figtree body at 18–19px / line-height 1.6, generous measure (~68ch max), cream background. This should feel like a publication, not a blog sidebar.
- **About** — butter family owns it.
- **Quizzes index + quiz flow** — brown dark sections, butter accents.
- **Contact** — paper `#FBF9F0` form on cream.
- **Home valuation** ("what's my home worth") — blue family, form-led.

---

## Interactions & behavior

The design is intentionally restrained. **No scroll animations, no parallax, no fade-in-on-scroll, no shadows growing on hover.**

- **Hover states** (all listed inline above): the pattern is a color swap, ~150ms ease. Nav/utility links → `#7A1F2E`. Editorial links → already `#6B6C38`, hover darkens to `#4A4B25`. Primary brown button → `#7A1F2E`. Wine button → `#5A1522`. Secondary outline → fills `#6B6C38`.
- **Listing cards:** whole card is one link. On hover, the photo may scale to `1.02` with `overflow: hidden` on the frame, ~300ms — this is the only motion in the design and is optional. No lift, no shadow.
- **Focus states:** every interactive element needs a visible keyboard focus ring. Use `outline: 2px solid #7A1F2E; outline-offset: 2px`. Do not remove outlines.
- **Search field (hero):** submitting routes to the listings/search page with the query. Real behavior depends on IDX (below).
- **Newsletter form:** email input, client-side validation on submit (`type="email"`, required, inline error in `#7A1F2E` at 14px below the field), then POST to the email provider. Success replaces the form with a confirmation line in the same box, same typography. Wire the provider through an env var; do not hardcode an endpoint.
- **Quiz:** progressive — one question at a time, click an answer to advance, no back button needed for the short version. Result screen ends with an email capture. Quiz state is client-side only; nothing needs to persist.
- **Loading states:** listing grids render skeletons matching the card geometry (420px / 190px blocks in `#E3DBCB`, no shimmer animation — a static tone is fine and on-brand).
- **Error/empty states:** plain Figtree copy on cream, in Danielle's voice. "Nothing matches that yet — try widening the map." No illustration, no icon.

### Responsive

Three breakpoints, matching the approved design:

- **Desktop ≥ 1200px** — as specified above.
- **Tablet ≤ 1024px** — page gutters 32px. Listings grid → 2 columns. Sold grid → 2 columns. Hero → single column, portrait moves below the copy at ~420px height. About → single column. Overthinking Real Estate → single column, essay list below lead. Quiz → single column. Hero headline → ~52px. Section headers → ~44px.
- **Mobile ≤ 640px** — gutters 20px. Everything single column. Nav collapses to the mark + a hamburger opening a full-screen cream menu (Unbounded 600 at 28px for items, generous 56px+ tap rows). Hero headline 38–42px. Section headers 34px. Body stays ≥16px. Search and newsletter fields stack: input full width, button full width below. Listing photos ~300px, sold photos ~200px. **All tap targets ≥ 44px.** The stats row in About wraps to 2×2 rather than shrinking type.

Type minimums: body never below 16px; the Unbounded mark never below 16px.

---

## State management

Very little. Do not add a global state library.

- `mobileNavOpen: boolean` — nav.
- `searchQuery: string` — hero search input, then handed to the listings route as a URL param. **URL is the source of truth for search and filters**, so results are shareable and back/forward work.
- Listings index filters (price, beds, baths, neighborhood, type) — all in the URL query string.
- `quizStep: number`, `quizAnswers: Answer[]` — local component state.
- Newsletter form: `idle | submitting | success | error`.

### Data fetching

- **Listings and sold** come from the IDX/MLS feed — fetch server-side, cache, revalidate on a timer (15–60 min is plenty).
- **Essays** from MDX/CMS at build time.
- **Testimonials, stats, about copy** — small local content files; Danielle should be able to edit them without touching components.

Define TypeScript types up front (`Listing`, `Essay`, `Quiz`, `Testimonial`) and build against a **mock data adapter** so the entire site can be developed and iterated before IDX credentials exist. Swapping the adapter later should be a one-file change.

---

## IDX / MLS — read this before starting

This is the single biggest constraint on the project and it is not a design problem.

- Live MLS listing data is **not publicly available**. Access requires an IDX feed, which means an agreement with Danielle's local MLS (in Los Angeles, typically CRMLS) plus her broker's authorization.
- Practical routes: a provider like IDX Broker, Showcase IDX, Realtyna, or Spark/Bridge Interactive API; or a RESO Web API feed direct from the MLS.
- **Widget-based providers inject their own iframes and CSS and will not match this design.** If Danielle uses one, the styled listing cards in this design apply only to *her own* listings (which she can enter manually or via a small CMS collection), and MLS-wide search may have to live on a provider-styled page. Flag this trade-off to her early rather than discovering it late.
- MLS rules commonly dictate required disclaimers, attribution, and refresh frequency. Whatever the feed contract says overrides design preferences.
- **Build order recommendation:** implement everything against mock listings first. The design is fully buildable and reviewable without IDX. Treat IDX as an integration milestone, not a prerequisite.

---

## Assets

**Nothing has been supplied yet.** Every image in the mocks is an empty placeholder slot. Needed:

| Slot | Spec |
|---|---|
| Hero portrait of Danielle | portrait orientation, ~1000×1400 min, natural light, renders at 520px tall |
| About portrait of Danielle | different shot from the hero, ~1200×1200, renders 420px tall, 20px corners |
| 3 active listing photos | landscape/portrait mix, ~1600px wide min, renders 420px tall |
| 4 sold photos | ~1200px wide, renders 190px tall |
| 1 lead essay image | landscape, ~1600×1000, renders 340px tall |
| Brokerage logo | required in footer alongside DRE number |
| Favicon / social share image | derive from the Unbounded `danielle walder` mark on cream |

**Photography rules:** natural light. No filters, no duotone, no gradient scrims, no drop shadows. Vary proportion between neighboring images rather than adding treatments. Nothing floats on top of a photo except a real, useful label — and per the badge rule, even those sit underneath.

Until real photos exist, render labeled placeholder rectangles in `#E3DBCB` with the slot name in `#897D6D`. Do not use stock photography or generated images — a visible empty slot is honest; a stock kitchen is a lie about the listing.

There is **no logo mark or icon** — the wordmark set in Unbounded *is* the logo. Do not design or add one. (`logo-finals.dc.html` in the parent project holds the wordmark studies if you want to see how it was arrived at.)

---

## Accessibility

- Contrast: the palette was built for dark-on-light within each family and passes at the specified pairings. **Do not lighten text tones.** Specifically: never put `#897D6D` on anything darker than `#FBF9F0` for body-size text, and keep `#DACFC4` for text on `#513229` only.
- Every image needs meaningful `alt`. Listings: address plus what the photo shows.
- Semantic landmarks: `header`, `nav`, `main`, `section` with headings in order, `footer`. Section eyebrows are not headings — the Rozha One / Kalnia line is the `h2`.
- The nav uses `<a>` and `<button>` elements, not clickable `<span>`s. (The mocks use `<span>` because they are static prototypes — **do not copy that**.)
- Forms need real `<label>`s, visually hidden where the design shows only a placeholder.
- Respect `prefers-reduced-motion`: disable the optional photo scale.

---

## Files in this bundle

| File | What it is |
|---|---|
| `README.md` | This document. Self-sufficient — build from it. |
| `CLAUDE.md` | Drop into the new repo root. Standing rules for Claude Code so the brand doesn't drift across sessions. |
| `tokens.css` | The locked palette and type scale as CSS custom properties, plus a Tailwind theme block to paste into config. |
| `homepage-b-v3.html` | The approved homepage design. Uses a custom prototype runtime — read for values, don't port. |
| `brand-sheet-v2.html` | The full brand system: color families, type specs, buttons, badges, shape, photography rules, do/don't. |
| `danielle-walder-homepage.wordpress.html` | Portable HTML/CSS build of the homepage including responsive rules. **Best structural reference.** |

## Approved decisions worth not relitigating

- **Unbounded** is the Danielle mark. Locked.
- The **palette is locked**, unchanged through two brand-sheet revisions.
- **Hero A (Danielle-led portrait)** beat the property-led hero. Her face is the hero.
- **Homepage B v3** is the canonical layout.
- _Overthinking Real Estate_ gets **Kalnia** and its own homepage section — it is a pillar, not a blog link.
- **One dark section** in the page body (the quiz), plus the footer.

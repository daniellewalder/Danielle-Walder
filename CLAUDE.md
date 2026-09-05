# Danielle Walder — site

Personal real estate site for Danielle Walder, LA agent. Three jobs: get people into listings, make Danielle the reason they stay, publish her newsletter *Overthinking Real Estate*.

Full design spec: `design_handoff/README.md`. Read it before building any new page.

## Standing rules

**The design system is locked.** Colors, typefaces, and the type scale were approved after multiple rounds. Never introduce a color, typeface, radius, or shadow that isn't in `tokens.css`. If something seems to need a new value, it needs a different composition of existing values instead.

**One color family per section.** Families are brown, blue, butter, sage, plus inks. Within a section, that family's dark tone writes on that family's light field. Cream (`--cream`) is the connective tissue between colored sections. Never stack three families in one block. Sage and butter never share a block.

**Burgundy (`--wine`, #7A1F2E) is ink, never a field.** It's for prices, the *Overthinking Real Estate* wordmark, and one accent word per screen.

**Four typefaces, no more:**
- Unbounded — Danielle's mark and big statements. Always lowercase, tracking −0.055em display / −0.045em utility, never below 16px.
- Rozha One — section headers, prices, stats. Sentence case, never tracked, never in paragraphs.
- Kalnia — *Overthinking Real Estate*, pull quotes, accent words.
- Figtree — body, forms, labels, everything practical.

**Shape:** 6–8px badges, 10–12px buttons and inputs, 0–4px property photography, 20px only for hero/about/newsletter blocks. No circles, no 999px pills, no drop shadows, no gradients.

**Photography corners carry meaning:** square = property, 20px soft = Danielle and editorial. Keep the distinction. Never a filter, duotone, or gradient scrim.

**Containers are earned.** Most sections separate with whitespace and a 1px `--hairline` rule, not a rounded card. Two adjacent rounded blocks → one becomes plain cream.

**Motion is nearly absent by design.** No scroll animations, no parallax, no fade-in-on-scroll. Hover = a color swap in ~150ms. The only optional motion is a 1.02 photo scale on listing card hover.

**Copy is Danielle's, not ours.** Placeholder copy stays bracketed and obvious (`[HERO HEADLINE]`) until she supplies real text. Never write filler in her voice and never fill an image slot with stock or generated photography — a labeled empty slot is honest.

**Legal:** brokerage name and DRE license number in the footer of every page. Non-negotiable.

**Accessibility:** real `<a>`/`<button>` elements, visible focus rings (`outline: 2px solid var(--wine); outline-offset: 2px`), meaningful alt text, body type never below 16px, tap targets ≥44px, respect `prefers-reduced-motion`.

## Architecture notes

- **Search and home valuation are RealScout IDX web components**, not something built here. They live in `components/realscout/RealScout.tsx` and are configured from embed snippets Danielle supplies. There is no listing data in this repo and no mock adapter — the old one was deleted deliberately. Never invent listings to fill a page.
- **Essays come from the Substack RSS feed, and the feed is the source of truth.** Whatever Danielle publishes appears on the next revalidation without a repo edit. Never drive the essay list from a hardcoded array. Post HTML is sanitised in `lib/essays/sanitize.ts` before it can reach a page.
- **Remote images bypass `next/image`** and render as a plain `<img>`. `next/image` hard-crashes on any hostname not in `next.config.ts`, and feed images come from hosts we do not control. Do not reintroduce a hostname allowlist.
- No global state library. Local component state and URL params are enough.
- Don't add a component library whose visual defaults fight the brand.

## Where things live

- `design_handoff/` — the original bundle, unchanged. `README.md` there is the design spec; read it before building any new page.
- `tailwind.config.ts` and `app/tokens.css` — the tokens, mirroring `design_handoff/tokens.css`. Change nothing here without changing that.
- `lib/content/` — all copy. Edit copy there, not in components.
- `lib/essays/` — the Overthinking Real Estate seam: feed fetch, sanitiser, and the merge with Danielle's curated deks.
- `lib/config.ts` — the one place env is read, plus committed public defaults. **Never put a secret here.**
- `components/realscout/` — the three IDX widgets.
- `components/home/` — one component per homepage section, in page order.
- `components/ui/` — `ImageSlot` (the labelled empty photo slot), `PageHeader`, `CtaLink`, `Badge`.
- `components/listings/` — unwired card patterns. `/homes` will be fed by RealScout, not by these. See the README in that folder.
- Launch blockers are the table at the top of the root `README.md`.

## Standing rule: never ship fake functionality

Every visible link and button must resolve to a working page, a verified
external URL, or an honest non-interactive state. This outranks visual fidelity
to the mocks.

- A control that cannot do its job does not ship as a control. No search input
  without a search, no form without an endpoint, no quiz answers without a quiz.
  The hero search field was absent until RealScout made it real.
- A section without verified data is **not rendered** — not filled with
  placeholder or invented content. That covers listings, sold properties,
  prices, photography, statistics, transaction outcomes, and testimonials.
- Never invent credentials, awards, years of experience, brokerage names, DRE
  numbers, or legal, privacy, and equal-housing language. These are supplied and
  verified, or they are absent.
- **Never infer a claim about Danielle's content.** The site does not guess
  whether a Substack post is subscriber-only or anything else about it. A wrong
  guess puts a false statement about her own writing on her own site.
- **Never guess an external value** — a hostname, an endpoint, an id, an API
  shape. If it was not observed in the repo, in a snippet Danielle supplied, or
  on the deployed site, ask her. A guessed hostname in `next.config.ts` once
  crashed every page carrying an essay image.
- Bracketed placeholders (`[ADD DANIELLE PHOTO]`) are for content Danielle will
  supply. They are not a licence to ship a broken interaction.
- **Public routes:** `/`, `/read`, `/read/[slug]`, `/search`, `/home-valuation`,
  `/tuesday-test`, `/la-actually`, `/about`, `/contact`, `/homes`, `/sold`.
  `/overthinking-real-estate`, `/quizzes` and `/listings` redirect and must not
  come back as real routes.
- **Nav labels are not routes.** The nav says Danielle's words — search,
  listings, sold, overthinking real estate, quizzes, about, say hello — while
  the URLs stay clean. Both are approved; do not "fix" one to match the other.

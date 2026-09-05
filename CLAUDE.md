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

- URL is the source of truth for search and listing filters — results must be shareable and work with back/forward.
- Listings come from an IDX/MLS feed, not the CMS. Build against the mock adapter; swapping to a real feed should be one file. See the IDX section of the README before promising MLS-wide search.
- No global state library. Local component state and URL params are enough.
- Don't add a component library whose visual defaults fight the brand.

## Where things live

- `design_handoff/` — the original bundle, unchanged. `README.md` there is the design spec; read it before building any new page.
- `tailwind.config.ts` and `app/tokens.css` — the tokens, mirroring `design_handoff/tokens.css`. Change nothing here without changing that.
- `lib/content/` — all copy. Edit copy there, not in components.
- `lib/essays/` — the Overthinking Real Estate seam. Essays live on Substack and are read from its RSS feed; they are never migrated into the repo.
- `components/home/` — one component per homepage section, in page order.
- `components/ui/` — `ImageSlot` (the labelled empty photo slot), `PageHeader`, `CtaLink`, `Badge`.
- `components/listings/` — kept but unwired. See the README in that folder.
- Launch blockers are the table at the top of the root `README.md`.

## Standing rule: never ship fake functionality

Every visible link and button must resolve to a working page, a verified
external URL, or an honest non-interactive state. This outranks visual fidelity
to the mocks.

- A control that cannot do its job does not ship as a control. No search input
  without a search, no form without an endpoint, no quiz answers without a quiz.
- A section without verified data is **not rendered** — not filled with
  placeholder or invented content. That covers listings, sold properties,
  prices, photography, statistics, transaction outcomes, and testimonials.
- Never invent credentials, awards, years of experience, brokerage names, DRE
  numbers, or legal, privacy, and equal-housing language. These are supplied and
  verified, or they are absent.
- Bracketed placeholders (`[ADD DANIELLE PHOTO]`) are for content Danielle will
  supply. They are not a licence to ship a broken interaction.
- The public route vocabulary is `/read`, `/search`, `/tuesday-test`, `/about`,
  `/contact`. Do not reintroduce `/overthinking-real-estate` or `/quizzes`.

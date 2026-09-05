# Unwired listing components

`ListingCard` and `SoldCard` are the approved card patterns from the design
handoff, kept here intentionally and **not rendered anywhere**.

They are unwired on purpose: no verified listing or sold-property data exists
yet, and the site must never display fictional addresses, prices, photography,
or transaction outcomes. The mock adapter that used to feed them was deleted —
do not recreate it.

## What actually happens next

`/homes` is fed by Danielle's **RealScout "Your Listings" widget**, not by
these components and not by a data adapter in this repo. Wire it the same way
`/search` and `/home-valuation` do, through
`components/realscout/RealScout.tsx`. See the launch blockers in the root
`README.md`.

These components remain useful only if Danielle later supplies verified
listing data as structured content (see the `Listing` type in `lib/types.ts`).
That is not the current plan.

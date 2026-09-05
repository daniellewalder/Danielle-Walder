# Unwired listing components

`ListingCard` and `SoldCard` are the approved card patterns from the design
handoff, kept here intentionally and **not rendered anywhere**.

They are unwired on purpose: no verified listing or sold-property data exists
yet, and the site must never display fictional addresses, prices, photography,
or transaction outcomes. The mock adapter that used to feed them was deleted —
do not recreate it.

## What actually happens

`/homes` is fed by Danielle's **RealScout "Your Listings" widget** — see
`components/realscout/RealScout.tsx`. Not by these components, and not by any
data adapter in this repo.

These components remain useful only if Danielle later supplies verified
listing data as structured content (see the `Listing` type in `lib/types.ts`).
That is not the current plan.

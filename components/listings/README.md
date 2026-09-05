# Unwired listing components

`ListingCard` and `SoldCard` are the approved card patterns from the design
handoff, kept here intentionally and **not rendered anywhere**.

They are unwired on purpose: no verified listing or sold-property data exists
yet, and the site must never display fictional addresses, prices, photography,
or transaction outcomes. The mock adapter that used to feed them has been
deleted.

When Danielle supplies verified listings, add a data source that returns
`Listing[]` (see `lib/types.ts`) and wire these components into `/homes` and
`/sold`. Do not reintroduce placeholder property data to preview them.

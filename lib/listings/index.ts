import type { Listing } from '@/lib/types'
import { mockAdapter } from './mock-adapter'

/**
 * The single seam between the site and the listing feed.
 *
 * Today everything resolves to the mock adapter. When IDX credentials exist,
 * write an adapter with the same two methods and swap it in here — that is the
 * one-file change the handoff asks for. Read the IDX section of
 * design_handoff/README.md first: widget-based providers inject their own CSS
 * and will not match this design.
 */
export interface ListingSource {
  getActiveListings(limit?: number): Promise<Listing[]>
  getSoldListings(limit?: number): Promise<Listing[]>
}

const source: ListingSource = mockAdapter

export function getActiveListings(limit?: number): Promise<Listing[]> {
  return source.getActiveListings(limit)
}

export function getSoldListings(limit?: number): Promise<Listing[]> {
  return source.getSoldListings(limit)
}

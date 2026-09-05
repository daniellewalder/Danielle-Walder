import type { Listing } from '@/lib/types'

/**
 * Mock listing source.
 *
 * Field values are bracketed placeholders on purpose: copy is Danielle's, not
 * ours, and photography is not supplied yet. The shape is the real shape — an
 * IDX adapter drops in behind the same functions without touching a component.
 */

const activeListings: Listing[] = [
  {
    id: 'active-1',
    slug: 'listing-1',
    address: '[LISTING ADDRESS]',
    neighborhood: '[NEIGHBORHOOD]',
    price: '[PRICE]',
    beds: '[BEDS]',
    baths: '[BATHS]',
    sqft: '[SQ FT]',
    status: 'active',
    photo: { label: 'Listing', alt: '[LISTING ADDRESS] — listing photo', src: null },
    badge: { label: 'open sun 2–4', variant: 'butter' },
  },
  {
    id: 'active-2',
    slug: 'listing-2',
    address: '[LISTING ADDRESS]',
    neighborhood: '[NEIGHBORHOOD]',
    price: '[PRICE]',
    beds: '[BEDS]',
    baths: '[BATHS]',
    sqft: '[SQ FT]',
    status: 'active',
    photo: { label: 'Listing', alt: '[LISTING ADDRESS] — listing photo', src: null },
  },
  {
    id: 'active-3',
    slug: 'listing-3',
    address: '[LISTING ADDRESS]',
    neighborhood: '[NEIGHBORHOOD]',
    price: '[PRICE]',
    beds: '[BEDS]',
    baths: '[BATHS]',
    sqft: '[SQ FT]',
    status: 'active',
    photo: { label: 'Listing', alt: '[LISTING ADDRESS] — listing photo', src: null },
  },
]

const soldListings: Listing[] = Array.from({ length: 4 }, (_, i) => ({
  id: `sold-${i + 1}`,
  slug: `sold-${i + 1}`,
  address: '[LISTING ADDRESS]',
  neighborhood: '[NEIGHBORHOOD]',
  price: '[PRICE]',
  beds: '[BEDS]',
  baths: '[BATHS]',
  sqft: '[SQ FT]',
  status: 'sold' as const,
  photo: { label: 'Sold', alt: '[LISTING ADDRESS] — sold photo', src: null },
}))

export const mockAdapter = {
  async getActiveListings(limit?: number): Promise<Listing[]> {
    return typeof limit === 'number' ? activeListings.slice(0, limit) : activeListings
  },
  async getSoldListings(limit?: number): Promise<Listing[]> {
    return typeof limit === 'number' ? soldListings.slice(0, limit) : soldListings
  },
}

/**
 * Content and data types for the site.
 *
 * Listings come from an IDX/MLS feed, not the CMS — see the IDX section of
 * design_handoff/README.md. Everything is modelled against these types so the
 * mock adapter in `lib/listings/` can be swapped for a real feed in one file.
 */

/** An image that has not been supplied yet renders as a labelled empty slot. */
export interface ImageRef {
  /** Slot name shown inside the placeholder rectangle, e.g. "Listing". */
  label: string
  /** Meaningful alt text. Listings: address plus what the photo shows. */
  alt: string
  /** Real photography URL. `null` until Danielle supplies the asset. */
  src: string | null
}

export type ListingStatus = 'active' | 'in-escrow' | 'sold'

/**
 * Badge rules: at most one per listing, only when it carries real information,
 * and it sits in the row under the photo — never floating on top of it.
 */
export type BadgeVariant = 'butter' | 'blue' | 'sage' | 'brown'

export interface ListingBadge {
  label: string
  variant: BadgeVariant
}

export interface Listing {
  id: string
  /** Route segment for the listing detail page. */
  slug: string
  address: string
  neighborhood: string
  /** Pre-formatted for display — the feed decides precision, not the view. */
  price: string
  beds: string
  baths: string
  sqft: string
  status: ListingStatus
  photo: ImageRef
  badge?: ListingBadge
}

export interface Essay {
  slug: string
  title: string
  /** Standfirst, shown on the lead essay only. */
  standfirst?: string
  /** Lead essays carry an image; list rows do not. */
  image?: ImageRef
  kicker: string
}

export interface QuizAnswer {
  id: string
  label: string
}

export interface QuizQuestion {
  id: string
  /** Uppercase label above the answers, e.g. "[QUESTION 1]". */
  label: string
  answers: QuizAnswer[]
}

export interface Quiz {
  slug: string
  title: string
  intro: string
  questions: QuizQuestion[]
}

export interface Testimonial {
  quote: string
  client: string
  neighborhood: string
}

export interface Stat {
  value: string
  label: string
}

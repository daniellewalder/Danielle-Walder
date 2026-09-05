import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ImageSlot } from '@/components/ui/ImageSlot'
import type { Listing } from '@/lib/types'

/**
 * "Now showing" card. The whole card is one link. On hover the photo may scale
 * to 1.02 inside its frame — the only motion in the design. No lift, no shadow.
 */
export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="min-w-0">
      <Link href={`/listings/${listing.slug}`} className="group flex flex-col gap-4">
        <ImageSlot
          image={listing.photo}
          hoverScale
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-[420px] rounded-photo tablet:h-[340px] mobile:h-[300px]"
        />

        <div className="flex flex-col gap-[7px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mark text-[17px] font-medium tracking-utility text-espresso group-hover:text-wine">
              {listing.address}
            </span>
            <span className="whitespace-nowrap font-display text-[24px] text-wine">
              {listing.price}
            </span>
          </div>

          <p className="font-sans text-[15px] text-warmgray">
            {listing.neighborhood} &middot; {listing.beds} bd &middot; {listing.baths} ba &middot;{' '}
            {listing.sqft} sq ft
          </p>

          {listing.badge ? (
            <Badge variant={listing.badge.variant} className="mt-[3px] self-start">
              {listing.badge.label}
            </Badge>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

/**
 * Skeleton matching the card geometry. A static tone, no shimmer — that is
 * on-brand and deliberate.
 */
export function ListingCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4" aria-hidden="true">
      <div className="h-[420px] rounded-photo bg-sand tablet:h-[340px] mobile:h-[300px]" />
      <div className="flex flex-col gap-[7px]">
        <div className="h-[17px] w-3/4 bg-sand" />
        <div className="h-[15px] w-1/2 bg-sand" />
      </div>
    </div>
  )
}

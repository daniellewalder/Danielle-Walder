import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import type { Listing } from '@/lib/types'

/**
 * Sold cards are deliberately smaller and quieter than active listings — the
 * hierarchy is the point. Address drops to Figtree, no price in Rozha One.
 */
export function SoldCard({ listing }: { listing: Listing }) {
  return (
    <article className="min-w-0">
      <Link href={`/sold/${listing.slug}`} className="group flex flex-col gap-[11px]">
        <ImageSlot
          image={listing.photo}
          hoverScale
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="h-[190px] rounded-photo mobile:h-[200px]"
        />
        <p className="font-sans text-[14.5px] font-semibold text-espresso group-hover:text-wine">
          {listing.address}
        </p>
        <p className="font-sans text-[14px] text-warmgray">
          {listing.neighborhood} &middot; sold {listing.price}
        </p>
      </Link>
    </article>
  )
}

export function SoldCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-[11px]" aria-hidden="true">
      <div className="h-[190px] rounded-photo bg-sand mobile:h-[200px]" />
      <div className="h-[14.5px] w-3/4 bg-sand" />
      <div className="h-[14px] w-1/2 bg-sand" />
    </div>
  )
}

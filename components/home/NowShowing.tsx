import Link from 'next/link'
import { ListingCard } from '@/components/listings/ListingCard'
import { getActiveListings } from '@/lib/listings'

export async function NowShowing() {
  const listings = await getActiveListings(3)

  return (
    <section aria-labelledby="now-showing" className="wrap pt-14">
      <div className="section-head">
        <h2
          id="now-showing"
          className="font-display text-section leading-none text-espresso tablet:text-section-tablet mobile:text-section-mobile"
        >
          Now showing
        </h2>
        <Link href="/listings" className="more-link whitespace-nowrap">
          every listing &rarr;
        </Link>
      </div>

      <div className="mt-[26px] grid grid-cols-3 gap-6 tablet:grid-cols-2 mobile:grid-cols-1 mobile:gap-8">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}

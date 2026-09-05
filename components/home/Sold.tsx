import Link from 'next/link'
import { SoldCard } from '@/components/listings/SoldCard'
import { getSoldListings } from '@/lib/listings'

export async function Sold() {
  const listings = await getSoldListings(4)

  return (
    <section aria-labelledby="sold" className="wrap">
      <div className="section-head mt-[76px] border-t border-hairline pt-[34px]">
        <div className="flex flex-col gap-[5px]">
          <span className="eyebrow">past sales</span>
          <h2
            id="sold"
            className="font-display text-sub leading-none text-espresso tablet:text-sub-tablet mobile:text-sub-mobile"
          >
            Sold
          </h2>
        </div>
        <Link href="/sold" className="more-link whitespace-nowrap">
          everything I&rsquo;ve sold &rarr;
        </Link>
      </div>

      <div className="mt-[22px] grid grid-cols-4 gap-5 tablet:grid-cols-2 mobile:grid-cols-1 mobile:gap-8">
        {listings.map((listing) => (
          <SoldCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}

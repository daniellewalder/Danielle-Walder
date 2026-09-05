import type { Metadata } from 'next'
import { YourListings } from '@/components/realscout/RealScout'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { homesPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'Listings — Danielle Walder',
  description: "Los Angeles listings from Danielle Walder.",
}

/**
 * Reached from the nav and the footer as "listings".
 *
 * Listings come from RealScout's Your Listings web component — Danielle's real
 * MLS data. There is no listing data in this repo and no mock adapter; do not
 * build a hand-rolled listing grid, recreate RealScout's cards, or duplicate
 * listing data here.
 *
 * The configured statuses are For Sale, For Rent, In Contract, Sold and
 * Rented, so this page is not only current inventory. Copy here must not call
 * it "current listings".
 */
export default function HomesPage() {
  return (
    <>
      <PageHeader eyebrow={homesPage.eyebrow} heading={homesPage.heading} intro={homesPage.intro} />

      <section aria-label="Listings" className="wrap pt-12 mobile:pt-8">
        <YourListings />
      </section>

      <section aria-label="Where to go next" className="wrap pt-12 mobile:pt-8">
        <div className="flex flex-wrap gap-[10px] border-t border-hairline pt-10">
          {homesPage.ctas.map((cta, index) => (
            <CtaLink key={cta.href} href={cta.href} variant={index === 0 ? 'primary' : 'secondary'}>
              {cta.label}
            </CtaLink>
          ))}
        </div>
      </section>
    </>
  )
}

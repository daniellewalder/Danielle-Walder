import type { Metadata } from 'next'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { soldPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'Sold — Danielle Walder',
  description: 'Homes Danielle Walder has helped move through Los Angeles.',
}

/**
 * Deliberately unlinked. Kept as a route so any existing link to /sold still
 * resolves, but removed from the nav and footer because there is no verified
 * sold data — and the Your Listings widget on /homes already covers Sold and
 * Rented.
 *
 * Do not add it back to the nav, do not redirect it to /homes, and do not
 * invent sold properties, prices, or transaction outcomes to fill it. It is
 * also excluded from the sitemap.
 */
export default function SoldPage() {
  return (
    <>
      <PageHeader eyebrow={soldPage.eyebrow} heading={soldPage.heading} intro={soldPage.intro} />

      <section aria-label="Where to go next" className="wrap pt-10 mobile:pt-8">
        <div className="flex flex-wrap gap-[10px]">
          {soldPage.ctas.map((cta) => (
            <CtaLink key={cta.href} href={cta.href} variant="primary">
              {cta.label}
            </CtaLink>
          ))}
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { homesPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'Homes — Danielle Walder',
  description: 'Selected Los Angeles homes and useful context.',
}

/**
 * An intentional empty state so direct visitors do not hit a 404. Not linked
 * from navigation, the footer, or the homepage.
 *
 * No listings, addresses, prices, photography, or property data of any kind
 * appear here until Danielle supplies verified information.
 */
export default function HomesPage() {
  return (
    <>
      <PageHeader eyebrow={homesPage.eyebrow} heading={homesPage.heading} intro={homesPage.intro} />

      <section aria-label="Where to go next" className="wrap pt-10 mobile:pt-8">
        <div className="flex flex-wrap gap-[10px]">
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

import type { Metadata } from 'next'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { soldPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'Sold — Danielle Walder',
  description: 'Homes Danielle Walder has helped move through Los Angeles.',
}

/**
 * An intentional empty state so direct visitors do not hit a 404. Not linked
 * from navigation, the footer, or the homepage.
 *
 * No sold properties, addresses, prices, photography, or transaction outcomes
 * appear here until Danielle supplies verified information.
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

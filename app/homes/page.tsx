import type { Metadata } from 'next'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { homesPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'Homes — Danielle Walder',
  description: 'Selected Los Angeles homes and useful context.',
}

/**
 * LAUNCH BLOCKER — this page is reached from the nav and the footer as
 * "listings", and it has no listings on it.
 *
 * The fix is Danielle's RealScout "Your Listings" widget, which she will
 * supply as an embed snippet. Wire that in here, the same way /search and
 * /home-valuation use components/realscout/RealScout.tsx. Do NOT substitute
 * invented listings, a mock adapter, or a different integration to make the
 * page look finished — the previous mock adapter was deleted on purpose.
 * Until the widget is connected, this page is not launch-ready.
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

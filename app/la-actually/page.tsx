import type { Metadata } from 'next'
import { AreaIndex } from '@/components/areas/AreaIndex'
import { CtaLink } from '@/components/ui/CtaLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { getPublishedAreas } from '@/lib/areas'
import { laActuallyPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'LA, Actually — Danielle Walder',
  description:
    'Neighborhood intelligence about routines, access, tradeoffs, and housing across Los Angeles.',
}

/**
 * The LA, Actually hub, and the area-discovery index in Phase 1.
 *
 * The area section lists PUBLISHED guides only. Areas still being researched
 * are absent rather than stubbed — no placeholder rows, no "coming soon".
 *
 * Still no maps, commute times, school statements, rankings, or local factual
 * claims beyond what each guide verifies for itself.
 */
export default function LaActuallyPage() {
  const areas = getPublishedAreas()

  return (
    <>
      <PageHeader
        eyebrow={laActuallyPage.eyebrow}
        heading={laActuallyPage.heading}
        intro={laActuallyPage.intro}
      />

      <AreaIndex areas={areas} />

      <section aria-label="Where to go next" className="wrap pt-12 mobile:pt-8">
        <div className="flex flex-col items-start gap-8 rounded-block bg-sage-field px-12 py-14 mobile:rounded-[16px] mobile:px-6 mobile:py-9">
          <div className="flex flex-wrap gap-[10px]">
            <CtaLink href={laActuallyPage.ctas[0].href} variant="primary">
              {laActuallyPage.ctas[0].label}
            </CtaLink>
            <CtaLink href={laActuallyPage.ctas[1].href} variant="secondary">
              {laActuallyPage.ctas[1].label}
            </CtaLink>
          </div>
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TuesdayTest } from '@/components/tuesday/TuesdayTest'
import { TuesdayTestV2 } from '@/components/tuesday/v2/TuesdayTestV2'
import { VersionGate } from '@/components/tuesday/v2/VersionGate'
import { PageHeader } from '@/components/ui/PageHeader'
import { tuesdayTestPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'The Tuesday Test · Danielle Walder',
  description:
    'A few decisions about what you would actually regret compromising on, and what that means for the search.',
}

/**
 * Answers live in the URL, so this page reads them from the query, which is
 * why the interaction sits behind Suspense.
 *
 * A visit with no payload starts V2. A V1 payload keeps running V1, so anyone
 * part way through an old link is not dropped into a different instrument.
 */
export default function TuesdayTestPage() {
  /*
   * THE HEADER BELONGS TO THE SCREEN, NOT TO THE ROUTE.
   *
   * V1 keeps it on every question, exactly as it shipped. V2 shows it on the
   * screen you arrive at and drops it once answering begins, so a phone is not
   * asked to scroll past the same title ten times. Which means V2 renders its
   * own, and the page no longer renders one above both.
   */
  return (
    <Suspense fallback={<div className="wrap pt-12 mobile:pt-8" aria-hidden="true" />}>
      <VersionGate
        v1={
          <>
            <PageHeader
              eyebrow={tuesdayTestPage.eyebrow}
              heading={tuesdayTestPage.heading}
              intro={tuesdayTestPage.intro}
              headingFont="mark"
            />
            <TuesdayTest />
          </>
        }
        v2={<TuesdayTestV2 />}
      />
    </Suspense>
  )
}

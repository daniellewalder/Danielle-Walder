import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TuesdayTest } from '@/components/tuesday/TuesdayTest'
import { PageHeader } from '@/components/ui/PageHeader'
import { tuesdayTestPage } from '@/lib/content/pages'

export const metadata: Metadata = {
  title: 'The Tuesday Test — Danielle Walder',
  description:
    'Seven decisions about what you would actually regret compromising on, and what that means for the search.',
}

/**
 * The real thing, replacing the static preview that said "the full version is
 * coming". Answers live in the URL, so this page reads them from the query —
 * which is why the interaction sits behind Suspense.
 */
export default function TuesdayTestPage() {
  return (
    <>
      <PageHeader
        eyebrow={tuesdayTestPage.eyebrow}
        heading={tuesdayTestPage.heading}
        intro={tuesdayTestPage.intro}
        headingFont="mark"
      />

      <Suspense fallback={<div className="wrap pt-12 mobile:pt-8" aria-hidden="true" />}>
        <TuesdayTest />
      </Suspense>
    </>
  )
}

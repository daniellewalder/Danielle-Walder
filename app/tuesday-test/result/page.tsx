import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TuesdayResult } from '@/components/tuesday/TuesdayResult'

export const metadata: Metadata = {
  title: 'Your search hierarchy — The Tuesday Test',
  description: 'What your answers say you should protect, look at closely, and stay open on.',
  // A result belongs to the person who made it, not to search engines.
  robots: { index: false, follow: true },
}

export default function TuesdayResultPage() {
  return (
    <Suspense fallback={<div className="wrap pt-14" aria-hidden="true" />}>
      <TuesdayResult />
    </Suspense>
  )
}

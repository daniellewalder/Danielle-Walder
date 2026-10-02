import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TuesdayResult } from '@/components/tuesday/TuesdayResult'
import { TuesdayResultV2 } from '@/components/tuesday/v2/TuesdayResultV2'
import { VersionGate } from '@/components/tuesday/v2/VersionGate'

export const metadata: Metadata = {
  title: 'Your result · The Tuesday Test',
  description: 'How this search should actually be run, from what you said.',
  // A result belongs to the person who made it, not to search engines.
  robots: { index: false, follow: true },
}

/**
 * A V1 result link still renders the V1 result, exactly as it did. V2 payloads
 * render the V2 buyer result. Nothing is reinterpreted across the versions.
 */
export default function TuesdayResultPage() {
  return (
    <Suspense fallback={<div className="wrap pt-14" aria-hidden="true" />}>
      <VersionGate v1={<TuesdayResult />} v2={<TuesdayResultV2 />} />
    </Suspense>
  )
}

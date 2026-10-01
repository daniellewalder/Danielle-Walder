'use client'

import { useSearchParams } from 'next/navigation'
import { detectVersion } from '@/lib/tuesday/v2/encode'

/**
 * Which instrument this URL belongs to.
 *
 * NEW SESSIONS GET V2. An address with no payload is a new test, and a new
 * test is the current instrument.
 *
 * AN OLD LINK STAYS OLD. V1 result links have been shared. A V1 payload read
 * through the V2 decoder would parse, drop everything it did not recognise and
 * quietly mean something else, which is the one outcome that is not allowed.
 * So the version is read from the payload and nothing else: V1 payloads go to
 * the V1 components untouched, and nothing is ever silently upgraded.
 *
 * `detectVersion` is the frozen reader. It looks at the declared version and
 * never sniffs the shape, because a V1 and a V2 string can look alike.
 */
export function useInstrument(): 1 | 2 {
  const params = useSearchParams()
  const detected = detectVersion(params.get('a'))
  switch (detected.version) {
    case 1:
      return 1
    case 2:
      return 2
    // Empty is a new session. An unknown declared version is a payload from a
    // build we do not have; V2 is the only instrument that can honestly say it
    // does not recognise it, and it degrades to a fresh start rather than
    // guessing at someone else's answers.
    default:
      return 2
  }
}

export function VersionGate({
  v1, v2,
}: {
  v1: React.ReactNode
  v2: React.ReactNode
}) {
  return useInstrument() === 1 ? <>{v1}</> : <>{v2}</>
}

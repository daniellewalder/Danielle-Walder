/**
 * Development-time staleness and publishability report.
 *
 * Run: npm run areas:report
 *
 * No dashboard, no runtime cost, no dependency. It reads the content modules
 * directly and prints what a human needs to review. A stale record is
 * surfaced, never removed — dropping content because a date passed would
 * silently shrink a guide with nobody noticing.
 *
 * Imports carry explicit .ts extensions because Node resolves this file
 * directly. Every module it touches imports only types, which are erased, so
 * there is no runtime dependency chain to resolve.
 */
import { calabasas } from '../lib/areas/areas/calabasas.ts'
import { places } from '../lib/areas/places.ts'
import {
  areaInvariantViolations,
  isPublishable,
  publicationBlockers,
  renderablePlaces,
  stalenessReport,
} from '../lib/areas/verify.ts'

const areas = [calabasas]
const today = new Date().toISOString().slice(0, 10)

console.log(`\nAREA CONTENT REPORT — ${today}\n${'='.repeat(46)}`)

console.log('\nAREAS')
for (const area of areas) {
  const blockers = publicationBlockers(area)
  const state = isPublishable(area) ? 'PUBLISHED' : area.published ? 'BLOCKED' : 'draft'
  console.log(`  ${state.padEnd(10)} ${area.name}  (/la-actually/areas/${area.slug})`)
  console.log(`             verified ${area.provenance.lastVerified ?? '—'}, next review ${area.provenance.nextReview ?? '—'}`)
  console.log(`             ${renderablePlaces(places, area.id).length} places render`)
  for (const blocker of blockers) console.log(`             ! ${blocker}`)
}

console.log('\nPLACES ON HOLD (researched, not rendered)')
const held = places.filter((place) => place.provenance.hold)
if (held.length === 0) console.log('  none')
for (const place of held) {
  console.log(`  ${place.name}`)
  console.log(`    ${place.provenance.holdReason ?? 'no reason stated'}`)
}

console.log('\nDUE FOR REVIEW')
const stale = stalenessReport(areas, places, today)
if (stale.length === 0) console.log('  nothing is past its review date')
for (const record of stale) {
  console.log(`  ${record.kind.padEnd(5)} ${record.id} — ${record.reason} (${record.nextReview ?? 'none set'})`)
}

console.log('\nINVARIANTS')
const problems = areaInvariantViolations(areas, places)
if (problems.length === 0) console.log('  all checks pass')
for (const problem of problems) console.log(`  ! ${problem}`)

console.log('')
if (problems.length > 0) process.exitCode = 1

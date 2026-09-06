import type { Area, FactBlock, Place, Provenance } from './types'

/**
 * Verification gates, invariants and the staleness report.
 *
 * Everything here is a PURE function over data passed in as arguments. That is
 * deliberate on two counts: the gates can be tested against fixtures without
 * touching the real registry, and this module imports nothing at runtime (only
 * types, which are erased), so the report script and the tests can load it
 * directly under Node.
 *
 * The gates are the whole safety model. A component must never decide for
 * itself whether a record is fit to render — it asks these.
 */

/**
 * The single rule that decides whether a factual record may be shown.
 *
 * A record renders only when it is not suppressed, not on hold, carries a
 * verification date, and cites at least one source. A verification date with
 * no source is not a verification, so both are required.
 */
export function isRenderable(provenance: Provenance): boolean {
  if (provenance.suppressed) return false
  if (provenance.hold) return false
  if (!provenance.lastVerified) return false
  return provenance.sources.length > 0
}

/** A fact block, or null when it does not pass. Null renders nothing at all. */
export function renderableFact(block: FactBlock | null): FactBlock | null {
  if (!block) return null
  if (!isRenderable(block.provenance)) return null
  if (block.body.length === 0) return null
  return block
}

/**
 * Places for one area, in the ordinary guide list.
 *
 * Beyond the shared gate a place must also be currently open: a closed
 * business stays in the data as a record of what was checked, but a guide
 * never lists it as somewhere to go.
 */
export function renderablePlaces(places: Place[], areaId: string): Place[] {
  return places.filter(
    (place) =>
      place.areaIds.includes(areaId) && place.status === 'open' && isRenderable(place.provenance),
  )
}

/**
 * Whether an area may have a URL.
 *
 * `published` is Danielle's switch; the rest is the floor. An area with no
 * renderable factual content is not a guide, whatever the flag says.
 */
export function isPublishable(area: Area): boolean {
  if (!area.published) return false
  if (!isRenderable(area.provenance)) return false
  return [area.facts.orientation, area.facts.housing, area.facts.access].some(
    (block) => renderableFact(block) !== null,
  )
}

export function publishedAreas(areas: Area[]): Area[] {
  return areas.filter(isPublishable)
}

// ---------------------------------------------------------------- invariants

/**
 * Structural checks that must hold for the content set as a whole. Run by the
 * tests and by the report — a violation is a data bug, not a rendering choice.
 */
export function areaInvariantViolations(areas: Area[], places: Place[]): string[] {
  const problems: string[] = []

  const seenAreaIds = new Set<string>()
  const seenSlugs = new Set<string>()
  for (const area of areas) {
    if (seenAreaIds.has(area.id)) problems.push(`Duplicate area id: ${area.id}`)
    if (seenSlugs.has(area.slug)) problems.push(`Duplicate area slug: ${area.slug}`)
    seenAreaIds.add(area.id)
    seenSlugs.add(area.slug)

    if (area.published && !isPublishable(area)) {
      problems.push(`Area "${area.id}" is published:true but has no renderable factual content`)
    }

    for (const other of area.compareWith) {
      if (!areas.some((candidate) => candidate.id === other && isPublishable(candidate))) {
        problems.push(`Area "${area.id}" compares with "${other}", which is not a published area`)
      }
    }
  }

  const seenPlaceIds = new Set<string>()
  for (const place of places) {
    if (seenPlaceIds.has(place.id)) problems.push(`Duplicate place id: ${place.id}`)
    seenPlaceIds.add(place.id)

    for (const areaId of place.areaIds) {
      if (!seenAreaIds.has(areaId) && !areas.some((area) => area.id === areaId)) {
        problems.push(`Place "${place.id}" belongs to unknown area "${areaId}"`)
      }
    }

    if (place.provenance.lastVerified && place.provenance.sources.length === 0) {
      problems.push(`Place "${place.id}" has a verification date but cites no source`)
    }

    if (place.provenance.hold && !place.provenance.holdReason) {
      problems.push(`Place "${place.id}" is on hold without a stated reason`)
    }

    if (place.officialUrl && !/^https?:\/\//i.test(place.officialUrl)) {
      problems.push(`Place "${place.id}" has a non-http officialUrl`)
    }
  }

  for (const source of [...areas, ...places].flatMap((record) => record.provenance.sources)) {
    if (!/^https?:\/\//i.test(source.url)) {
      problems.push(`Source "${source.label}" has a non-http url`)
    }
  }

  return problems
}

// ----------------------------------------------------------------- staleness

export interface StaleRecord {
  kind: 'area' | 'place'
  id: string
  nextReview: string | null
  reason: 'past-review' | 'no-review-date'
}

/**
 * Records due for a re-check.
 *
 * A stale record is SURFACED, never removed: dropping content automatically
 * because a date passed would silently shrink a guide with nobody noticing.
 * `today` is a parameter so the report is deterministic in tests.
 */
export function stalenessReport(areas: Area[], places: Place[], today: string): StaleRecord[] {
  const stale: StaleRecord[] = []

  const check = (kind: StaleRecord['kind'], id: string, provenance: Provenance) => {
    // Held and suppressed records do not render, so they cannot go stale.
    if (provenance.hold || provenance.suppressed) return
    if (!provenance.lastVerified) return

    if (!provenance.nextReview) {
      stale.push({ kind, id, nextReview: null, reason: 'no-review-date' })
      return
    }
    if (provenance.nextReview < today) {
      stale.push({ kind, id, nextReview: provenance.nextReview, reason: 'past-review' })
    }
  }

  for (const area of areas) {
    check('area', area.id, area.provenance)
    const blocks: [string, FactBlock | null][] = [
      ['orientation', area.facts.orientation],
      ['housing', area.facts.housing],
      ['access', area.facts.access],
    ]
    for (const [name, block] of blocks) {
      if (block) check('area', `${area.id}.${name}`, block.provenance)
    }
  }

  for (const place of places) check('place', place.id, place.provenance)

  return stale
}

/** What is stopping an area from being published. Empty means it is ready. */
export function publicationBlockers(area: Area): string[] {
  const blockers: string[] = []
  if (!isRenderable(area.provenance)) blockers.push('area provenance incomplete')
  if (!renderableFact(area.facts.orientation)) blockers.push('no renderable orientation')
  if (!renderableFact(area.facts.housing)) blockers.push('no renderable housing block')
  if (!renderableFact(area.facts.access)) blockers.push('no renderable access block')
  return blockers
}

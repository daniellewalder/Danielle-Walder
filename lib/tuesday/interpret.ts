import { PERSONAL_LAYERS, phraseFor, type AttributeState } from './model.ts'
import { byState, type ReadAttribute, type Result } from './score.ts'

/**
 * The spoken half of the result.
 *
 * COPY STATUS: a draft in Danielle's register, awaiting her line edit.
 *
 * Three rules govern every branch:
 *
 * 1. NO ARCHETYPES. It reports what this buyer demonstrated and what follows.
 * 2. NO MORALISING. Wanting a finished house is not worse than wanting a
 *    project; a fixed map is not worse than an open one.
 * 3. NOTHING IS CLAIMED WITHOUT EVIDENCE. "You have room here" is never said
 *    about a thing the test did not raise. Unasked is not flexible.
 */

function list(entries: readonly ReadAttribute[], limit = 3): string {
  const phrases = entries.slice(0, limit).map((entry) => phraseFor(entry.attribute))
  if (phrases.length === 0) return ''
  if (phrases.length === 1) return phrases[0]
  return `${phrases.slice(0, -1).join(', ')} and ${phrases[phrases.length - 1]}`
}

function protectLine(grouped: Record<AttributeState, ReadAttribute[]>): string | null {
  if (grouped.protect.length === 0) return null
  return `You were consistent about ${list(grouped.protect)}. I would stay strict there and let the search bend somewhere else.`
}

/**
 * The permanence caveat.
 *
 * This is how changeability is allowed to speak: it changes what we say about
 * a compromise, never whether the compromise counts as a priority. Someone who
 * chose the finished house over the better lot has made a real decision, and
 * the useful thing to tell them is what kind of compromise it is.
 */
function tradedAwayLine(result: Result): string | null {
  const permanent = result.attributes.filter((entry) => entry.tradedAwayPermanently)
  if (permanent.length === 0) return null
  return `You traded ${list(permanent, 2)} for a house that already works. That is a legitimate call — it is just the kind of compromise you live with rather than fix later, so it is worth going in with your eyes open.`
}

function adaptationLine(result: Result): string | null {
  const { willLayer, needsDayOne } = result.findings

  if (willLayer && needsDayOne) {
    return 'You want the construction and the function handled, and you still want to put your own layers on it. Those are not in conflict — it means the house has to work on arrival, and then it is yours to dress.'
  }
  if (willLayer && result.scales.renovationTolerance <= 0.38) {
    return 'You are happy to give a house its personality — paper, paint, lighting, the things you can change on a weekend — and you have no interest in a build. Those are different appetites and worth keeping apart: a blank room is an opportunity for you, a gut job is not.'
  }
  if (willLayer) return 'You will put your own character into it, which widens what is worth looking at.'
  if (needsDayOne) {
    return 'You do not want your house to become your second job. That is a real search criterion, not fussiness — condition and function should be filters, not things we assume you will fix later.'
  }
  if (result.scales.renovationTolerance >= 0.62) {
    return 'You will take on real work, which genuinely widens the search. It also raises the stakes on the lot and the location, because those are the parts your appetite cannot fix.'
  }
  return null
}

/** Architecture and personal layering are independent. Both can be high. */
function architectureLine(result: Result): string | null {
  const wantsBones = result.scales.architecturalRequirement >= 0.62
  if (!wantsBones) return null
  return result.findings.willLayer
    ? 'You want the house to have real bones of its own and you want to add your own layers on top. That is one taste, not two competing ones.'
    : 'You want the house to arrive with character of its own rather than be a shell you fill in.'
}

/** Outdoor life is not the same request as grounds to run. */
function outdoorLine(result: Result): string | null {
  if (!result.findings.outdoorWithoutBurden) return null
  return 'You want somewhere outside you would actually use — not a property that turns into another job. Worth saying out loud, because those get advertised as the same thing.'
}

function mapLine(result: Result): string | null {
  switch (result.findings.map) {
    case 'fixed':
      return 'Your location constraint is real. I would not widen the map to manufacture inventory — we get flexible somewhere else instead.'
    case 'strongPreference':
      return 'You have a strong preference rather than a hard boundary, which is worth knowing: it means the right house just outside it deserves a look before you rule it out.'
    case 'fewAreas':
      return 'A handful of areas genuinely work, which is the most useful kind of map to search — wide enough for inventory, tight enough to mean something.'
    case 'propertyLed':
      return 'You are describing a way of living rather than a postcode, which opens up more of Los Angeles than most people expect. That is the part I can help with.'
    case null:
      return null
  }
}

/** Said only when we genuinely did not establish something. */
export function unknownsLine(result: Result): string | null {
  if (result.unknowns.length === 0) return null
  return "There are things this didn't ask about — parking, storage, stairs, upkeep. I'd rather figure those out against real houses than pretend they don't matter."
}

/**
 * Two to three sentences, composed in a fixed order so the paragraph reads as
 * one thought rather than a stack of findings.
 */
export function interpret(result: Result): string[] {
  if (result.answered === 0) return []

  const grouped = byState(result)
  return [
    protectLine(grouped),
    adaptationLine(result),
    architectureLine(result),
    outdoorLine(result),
    tradedAwayLine(result),
    mapLine(result),
  ]
    .filter((line): line is string => line !== null)
    .slice(0, 3)
}

/** The one line at the top. A finding, never an archetype. */
export function resultHeadline(result: Result): string {
  const { willLayer, needsDayOne } = result.findings
  if (willLayer && needsDayOne) return 'It has to work on arrival. Then it is yours to dress.'
  if (needsDayOne) return 'You want it to feel right on day one.'
  if (willLayer && result.scales.renovationTolerance <= 0.38)
    return 'You will add the character. You will not do the build.'
  if (willLayer) return 'You are willing to make it yours.'
  if (result.scales.renovationTolerance >= 0.62) return 'You will do the work that matters.'
  if (result.findings.map === 'fixed') return 'Your map is tight, and that is fine.'
  return 'Here is what your search should protect.'
}

export const STATE_HEADINGS: Record<AttributeState, string> = {
  protect: 'Protect these',
  scrutinize: 'Scrutinise closely',
  flexibilityToTest: 'Worth testing against real houses',
  unknown: 'Not established yet',
}

export const STATE_NOTES: Record<AttributeState, string> = {
  protect: 'You showed this matters. Losing it is the thing you would notice.',
  scrutinize:
    'You care about this, and it is expensive, permanent or entirely property-specific. Check it properly rather than assuming.',
  flexibilityToTest:
    'This looks like somewhere you can compare real houses before ruling one out. It does not mean you do not care.',
  unknown: 'This test did not establish it. Worth raising against actual properties.',
}

/** The layers a high-personalization buyer supplies. Never scored attributes. */
export function personalLayers(result: Result): readonly string[] {
  return result.findings.willLayer ? PERSONAL_LAYERS : []
}

/**
 * What has to work on arrival.
 *
 * Derived from the combination rather than from a separate scale: if you
 * protect something that would be a real project to change, you are not going
 * to change it, so it has to be right when you buy. That is what lets the
 * decorator be told "paint is yours, the kitchen is not" in the same result.
 */
export function dayOneItems(result: Result): readonly ReadAttribute[] {
  return result.attributes.filter(
    (entry) => entry.state === 'protect' && entry.attribute.changeability === 'realProject',
  )
}

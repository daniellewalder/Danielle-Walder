import { OUTDOOR_LAYER, PERSONAL_LAYERS, phraseFor, type AttributeState } from './model.ts'
import { HIGH, LOW, byState, type ReadAttribute, type Result } from './score.ts'

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
  return `You kept coming back to ${list(grouped.protect)}. I'd stay strict there and let the search bend somewhere else.`
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
  return `You traded ${list(permanent, 2)} for something you care about more. That's a legitimate call — just remember this is the kind of compromise you live with, not one you fix later.`
}

function adaptationLine(result: Result): string | null {
  const { willLayer, needsDayOne } = result.findings

  if (willLayer && needsDayOne) {
    return "You want the construction and the function handled, but you still want to make it yours. Those aren't in conflict. The house needs to work when you get the keys; the personality can come after."
  }
  if (willLayer && result.scales.renovationTolerance <= 0.38) {
    return "You're happy to give a house its personality — wallpaper, paint, lighting, all the things you can change without turning it into a construction site. A blank room is an opportunity. A gut job is not."
  }
  if (willLayer) return "You seem open to making the cosmetic part your own, which means a house doesn't have to arrive completely finished to be worth a look."
  if (needsDayOne) {
    return "You don't want your house to become your second job. That's a real search criterion, not fussiness. Condition and function should be filters, not things we assume you'll fix later."
  }
  if (result.scales.renovationTolerance >= 0.62) {
    return "You're genuinely open to real work, so condition doesn't have to do as much filtering for you. That doesn't make the fixed stuff negotiable — whatever you protected still stays protected."
  }
  return null
}

/** Architecture and personal layering are independent. Both can be high. */
function architectureLine(result: Result): string | null {
  const wantsBones = result.scales.architecturalRequirement >= 0.62
  if (!wantsBones) return null
  return result.findings.willLayer
    ? "You want the house to have real bones of its own, and you want to add your own layers on top. That's one taste, not two competing ones."
    : "You want the house itself to bring some character. You're not looking for a blank shell and a decorating assignment."
}

/** Outdoor life is not the same request as grounds to run. */
function outdoorLine(result: Result): string | null {
  if (!result.findings.outdoorWithoutBurden) return null
  return "You want somewhere outside you'd actually use — not a property that turns into another job. Worth saying out loud, because those get advertised as the same thing."
}

function mapLine(result: Result): string | null {
  switch (result.findings.map) {
    case 'fixed':
      return "Your map is actually tight. That's useful to know. I'd look for flexibility somewhere else rather than pretend geography isn't one of the constraints."
    case 'strongPreference':
      return 'You have a real geographic preference, just not an absolute boundary. The right house slightly outside your usual line is probably worth seeing before you rule it out.'
    case 'fewAreas':
      return 'You have a real map, just not one ZIP code. That gives us enough room for inventory without turning the search into all of Los Angeles.'
    case 'propertyLed':
      return "You're describing the life more than the ZIP code. That gives us more of Los Angeles to work with — as long as the property still gets the important things right."
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
  if (willLayer && needsDayOne) return 'It needs to work on arrival. Then make it yours.'
  if (needsDayOne) return 'You want it to feel right on day one.'
  if (willLayer && result.scales.renovationTolerance <= LOW)
    return "You'll add the character. You won't do the build."
  if (willLayer) return "You're happy to make it yours."
  // Not "the work that matters" — we do not get to decide which work that is.
  if (result.scales.renovationTolerance >= HIGH) return "You're open to the right project."
  // The shortest version, deliberately: anything longer starts implying we
  // know WHY the map is tight, and the reason is the one thing we never ask.
  if (result.findings.map === 'fixed') return 'Your map is tight.'
  return "Here's what your search should protect."
}

/**
 * UI headings. The state ids stay internal and clinical; what a reader sees
 * does not have to match them — "scrutinize" is a product word, not one of
 * Danielle's.
 */
export const STATE_HEADINGS: Record<AttributeState, string> = {
  protect: 'Protect these',
  scrutinize: 'Look closely',
  flexibilityToTest: 'Worth testing against real houses',
  unknown: 'Not established yet',
}

/*
 * No reassurance that has not been earned. A result that keeps telling you it
 * is okay starts sounding therapeutic rather than useful; the one place it is
 * kept — "not fussiness" — is where the finding genuinely contradicts the
 * advice buyers usually get.
 */
export const STATE_NOTES: Record<AttributeState, string> = {
  protect: "You kept coming back to these. I'd stay strict here.",
  scrutinize:
    'This matters, and the reality can change a lot from one house to the next. Check the actual property instead of assuming.',
  flexibilityToTest:
    'This may be somewhere you have more room than you think. The only way to know is to compare actual houses — not decide it in the abstract.',
  unknown: "This test didn't establish it. Ask before assuming either way.",
}

/**
 * The layers a high-personalization buyer supplies. Never scored attributes.
 *
 * Outdoor styling is added only when the answers actually support cosmetic
 * outdoor work: they have to want outdoor space AND not have told us that
 * looking after a property is one of the things that would grind on them.
 * Handing "landscaping" to someone who flagged upkeep as a daily frustration
 * would be the exact mistake this model exists to avoid.
 */
export function personalLayers(result: Result): readonly string[] {
  if (!result.findings.willLayer) return []

  const wantsOutdoor = result.attributes.some(
    (entry) => entry.attribute.id === 'outdoor' && entry.evidence.direct > 0,
  )
  const upkeepIsFine = result.scales.operationalBurdenTolerance > LOW

  return wantsOutdoor && upkeepIsFine ? [...PERSONAL_LAYERS, OUTDOOR_LAYER] : PERSONAL_LAYERS
}

/**
 * What has to work on arrival.
 *
 * Derived from the combination rather than from a separate scale: if you
 * protect something that would be a real project to change AND you are not
 * someone who takes on real projects, you are not going to change it, so it
 * has to be right when you buy. That is what lets the decorator be told
 * "paint is yours, the kitchen is not" in the same result.
 *
 * The renovation gate matters. Someone genuinely open to a build who protects
 * the square footage has not said "it must already be big" — they have said
 * space matters, and adding it is on the table. Listing it as a day-one
 * requirement would contradict the sentence directly above it.
 */
export function dayOneItems(result: Result): readonly ReadAttribute[] {
  if (result.scales.renovationTolerance >= HIGH) return []
  return result.attributes.filter(
    (entry) => entry.state === 'protect' && entry.attribute.changeability === 'realProject',
  )
}

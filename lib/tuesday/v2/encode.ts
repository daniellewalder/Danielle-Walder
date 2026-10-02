import { INSTRUMENT_VERSION, type Pick, type V2Answers } from './answers.ts'
import { questionById } from './questions.ts'
import { ALLOWED, MAP } from './tradeoff.ts'

/**
 * Answers ↔ URL, versioned.
 *
 * WHY A VERSION. V2 changed the question structure, the answer ids, the
 * attribute taxonomy and the scoring semantics. A V1 link fed to the V2 model
 * would still parse and would quietly mean something else, which is the one
 * outcome that is not allowed: people have shared those links.
 *
 * So the payload names its instrument. A string with no version segment is V1
 * and is handed back untouched for the V1 interpreter. A version this build
 * does not know is refused rather than guessed at.
 *
 * WHY THE TRADEOFF PAIR IS STORED. Question eight is selected at run time. If
 * only the winner were stored, a later change to the selection algorithm would
 * silently rewrite what an old result meant. The pair that was actually shown
 * travels with the answer.
 *
 * Every separator is an RFC 3986 unreserved character, so the whole string
 * passes through a URL untouched and stays readable in an address bar.
 */

const SEGMENT = '_'
const KEY = '.'
const MULTI = '-'
const QUALIFIER = '~'
/** Reserved winner token for "I'd keep looking". Never a real concept id. */
const DECLINED = 'none'

const KEYS = {
  version: 'v',
  tuesday: 't',
  dealbreaker: 'd',
  daily: 'y',
  architecture: 'a',
  personalization: 'p',
  project: 'j',
  location: 'l',
  tradeoff: 'x',
  depends: 'c',
  sizeRoute: 's',
} as const

// ---------------------------------------------------------------------------
// Version detection
// ---------------------------------------------------------------------------

export type Detected =
  | { version: 1; raw: string }
  | { version: 2; raw: string }
  | { version: 'unknown'; declared: string; raw: string }
  | { version: 'empty' }

/**
 * What instrument produced this payload.
 *
 * Detection reads the declared version and nothing else. It never sniffs the
 * shape, because a V1 string and a V2 string can look alike and a wrong guess
 * is exactly the failure this exists to prevent.
 */
export function detectVersion(encoded: string | null | undefined): Detected {
  if (!encoded) return { version: 'empty' }
  const declared = encoded
    .split(SEGMENT)
    .map((segment) => segment.split(KEY))
    .find(([key]) => key === KEYS.version)?.[1]

  if (declared === undefined) return { version: 1, raw: encoded }
  if (declared === String(INSTRUMENT_VERSION)) return { version: 2, raw: encoded }
  return { version: 'unknown', declared, raw: encoded }
}

// ---------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------

function encodePick(pick: Pick): string {
  return pick.qualifier ? `${pick.option}${QUALIFIER}${pick.qualifier}` : pick.option
}

export function encode(answers: V2Answers): string {
  const segments: string[] = [`${KEYS.version}${KEY}${INSTRUMENT_VERSION}`]
  const put = (key: string, value: string | undefined) => {
    if (value) segments.push(`${key}${KEY}${value}`)
  }

  put(KEYS.tuesday, answers.tuesday)
  for (const [key, picks] of [
    [KEYS.dealbreaker, answers.dealbreaker],
    [KEYS.daily, answers.daily],
  ] as const) {
    if (picks && picks.length > 0) put(key, picks.slice(0, 2).map(encodePick).join(MULTI))
  }
  put(KEYS.architecture, answers.architecture)
  put(KEYS.personalization, answers.personalization)
  put(KEYS.project, answers.project)
  put(KEYS.location, answers.location)
  if (answers.tradeoff) {
    const { pair, winner, family } = answers.tradeoff
    put(KEYS.tradeoff, [pair[0], pair[1], winner ?? DECLINED, family].join(MULTI))
  }
  put(KEYS.depends, answers.depends)
  put(KEYS.sizeRoute, answers.sizeRoute)
  return segments.join(SEGMENT)
}

// ---------------------------------------------------------------------------
// Decode
// ---------------------------------------------------------------------------

export interface DecodeResult {
  answers: V2Answers
  /**
   * Segments that were thrown away, and why.
   *
   * Nothing is ever defaulted. A link that outlives a question-set edit
   * degrades to a partial result and says what it lost; it never invents an
   * answer to fill the gap, and it never becomes an error page.
   */
  dropped: readonly string[]
}

/** Key → the single-answer field it fills. Typed, so the two cannot drift. */
const SINGLE_FIELDS = {
  [KEYS.tuesday]: 'tuesday',
  [KEYS.architecture]: 'architecture',
  [KEYS.personalization]: 'personalization',
  [KEYS.project]: 'project',
  [KEYS.location]: 'location',
  [KEYS.depends]: 'depends',
  [KEYS.sizeRoute]: 'sizeRoute',
} as const satisfies Record<string, keyof V2Answers>

const CONCEPTS = new Set([...Object.keys(ALLOWED), MAP])

function validOption(questionId: string, optionId: string): boolean {
  return Boolean(questionById(questionId)?.options.some((option) => option.id === optionId))
}

function decodePicks(questionId: string, value: string, dropped: string[]): Pick[] {
  const picks: Pick[] = []
  for (const raw of value.split(MULTI)) {
    if (picks.length === 2) {
      dropped.push(`${questionId}: more than two picks`)
      break
    }
    const [option, qualifier] = raw.split(QUALIFIER)
    if (!validOption(questionId, option)) {
      dropped.push(`${questionId}.${option}: unknown option`)
      continue
    }
    if (picks.some((existing) => existing.option === option)) {
      dropped.push(`${questionId}.${option}: duplicate`)
      continue
    }
    const question = questionById(questionId)
    const needsQualifier = question?.options.find((o) => o.id === option)?.qualifies
    if (qualifier && !needsQualifier) {
      dropped.push(`${questionId}.${option}: qualifier on an unbundled option`)
      picks.push({ option })
      continue
    }
    picks.push(qualifier ? { option, qualifier } : { option })
  }
  return picks
}

export function decode(encoded: string | null | undefined): DecodeResult {
  const dropped: string[] = []
  const answers: V2Answers = { version: INSTRUMENT_VERSION }
  if (!encoded) return { answers, dropped }

  const seen = new Set<string>()
  for (const segment of encoded.split(SEGMENT)) {
    const index = segment.indexOf(KEY)
    if (index <= 0) {
      if (segment) dropped.push(`${segment}: malformed segment`)
      continue
    }
    const key = segment.slice(0, index)
    const value = segment.slice(index + 1)
    if (!value) {
      dropped.push(`${key}: empty value`)
      continue
    }
    if (seen.has(key)) {
      dropped.push(`${key}: repeated key`)
      continue
    }
    seen.add(key)

    switch (key) {
      case KEYS.version:
        break
      case KEYS.tuesday:
      case KEYS.architecture:
      case KEYS.personalization:
      case KEYS.project:
      case KEYS.location:
      case KEYS.depends:
      case KEYS.sizeRoute: {
        const field = SINGLE_FIELDS[key]
        if (!validOption(field, value)) {
          dropped.push(`${field}.${value}: unknown option`)
          break
        }
        answers[field] = value
        break
      }
      case KEYS.dealbreaker:
      case KEYS.daily: {
        const field = key === KEYS.dealbreaker ? 'dealbreaker' : 'daily'
        const picks = decodePicks(field, value, dropped)
        if (picks.length > 0) answers[field] = picks
        break
      }
      case KEYS.tradeoff: {
        const [a, b, winner, family] = value.split(MULTI)
        if (!CONCEPTS.has(a) || !CONCEPTS.has(b) || a === b) {
          dropped.push(`tradeoff.${value}: unknown pair`)
          break
        }
        if (winner !== DECLINED && winner !== a && winner !== b) {
          dropped.push(`tradeoff.${value}: winner is not in the pair`)
          break
        }
        answers.tradeoff = {
          pair: [a, b],
          winner: winner === DECLINED ? null : winner,
          family: family || 'unrecorded',
        }
        break
      }
      default:
        dropped.push(`${key}: unknown key`)
    }
  }

  return { answers, dropped }
}

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FIXTURES } from '../fixtures.ts'
import { HANDOFFS } from '../handoff.fixtures.ts'
import { score } from '../score.ts'
import { strategyFor } from '../strategy.ts'
import { assembleBrief, GAP_TEXT, type StructuredBrief, type Trace } from '../brief.ts'
import { clipboardBrief, emailBody } from '../handoffBrief.ts'
import { compose, renderBuyerCopy } from './index.ts'
import * as PHRASES from './phrases.ts'
import { CRITERION, CRITERION_BUYER, GAP, PROGRAM, PROGRAM_QUALIFIED, SHOWING, TRADEOFF } from './phrases.ts'

/**
 * THE BUYER IS NEVER "THEY".
 *
 * Two registers come out of one composition, and the failure mode is silent:
 * a phrase with no buyer variant falls back to the agent's, and Danielle's
 * vocabulary turns up inside a document written in the buyer's own voice. It
 * shipped that way in eleven catalogue entries and one composed sentence, and
 * no fixture happened to reach any of them.
 *
 * So this does not test the fixtures. It walks the catalogue, and it drives
 * every generated sentence through every value it can take.
 *
 * WHAT IS NOT SCANNED: anything the buyer typed. Their note, their areas,
 * their boundary and their free-text requirements are quoted verbatim, and a
 * buyer who writes "they keep outbidding us" is not a voice bug.
 */
const THIRD_PERSON = /\b(they|their|them|theirs|they'd|they're|they've)\b/i

const clean = (text: string, where: string) =>
  assert.ok(!THIRD_PERSON.test(text), `${where}: buyer copy says "${text}"`)

const trace: Trace = { layer: 'derived', sources: [] }

// ---------------------------------------------------------------------------
// The catalogue
// ---------------------------------------------------------------------------

/**
 * Agent-only tables, with a named first-person mirror. Every other exported
 * table is read in the buyer register directly, so it has to be clean.
 */
const AGENT_ONLY = new Set(['CRITERION'])

test('every phrase in the catalogue resolves to a first-person buyer register', () => {
  let checked = 0
  for (const [table, value] of Object.entries(PHRASES)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue
    if (AGENT_ONLY.has(table)) continue
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (typeof entry === 'string') {
        clean(entry, `${table}.${key}`)
        checked += 1
      } else if (entry && typeof entry === 'object') {
        const phrase = entry as { agent?: string; buyer?: string }
        if (!phrase.agent) continue
        clean(phrase.buyer ?? phrase.agent, `${table}.${key}`)
        checked += 1
      }
    }
  }
  assert.ok(checked >= 190, `only ${checked} phrases were reachable`)
})

test('the first-person mirror covers every criterion, and says I', () => {
  for (const concept of Object.keys(CRITERION)) {
    assert.ok(CRITERION_BUYER[concept], `${concept} has no buyer register`)
    clean(CRITERION_BUYER[concept], `CRITERION_BUYER.${concept}`)
  }
  assert.deepEqual(
    Object.keys(CRITERION_BUYER).sort(),
    Object.keys(CRITERION).sort(),
    'the two registers describe different sets of concepts',
  )
})

test('every gap the contract can record has a buyer register', () => {
  for (const [id, sentence] of Object.entries(GAP_TEXT)) {
    assert.ok(GAP[sentence], `GAP_TEXT.${id} reaches the buyer in Danielle's words`)
    clean(GAP[sentence].buyer ?? GAP[sentence].agent, `GAP.${id}`)
  }
})

// ---------------------------------------------------------------------------
// Every value every generated sentence can take
// ---------------------------------------------------------------------------

const baseBrief = (): StructuredBrief => {
  const result = score(FIXTURES.turnkey.answers)
  return assembleBrief(result, strategyFor(result))
}

const buyerLines = (brief: StructuredBrief) =>
  compose(brief).sections.filter((section) => section.id !== 'facts')
    .flatMap((section) => section.lines.map((entry) => entry.buyer))
    .concat(compose(brief).snapshot.map((entry) => entry.buyer))

test('the tradeoff sentence is first person for every pair of concepts', () => {
  const concepts = Object.keys(CRITERION)
  const base = baseBrief()
  let pairs = 0
  for (const sideA of concepts) {
    for (const sideB of concepts) {
      if (sideA === sideB) continue
      for (const why of Object.keys(TRADEOFF)) {
        for (const ordering of ['sideAWins', 'none'] as const) {
          const brief: StructuredBrief = {
            ...base,
            expectedTradeoff: { sideA, sideB, ordering, why, confidence: 'established', trace },
          }
          const section = compose(brief).sections.find((entry) => entry.id === 'tradeoff')
          if (!section) continue
          for (const entry of section.lines) clean(entry.buyer, `tradeoff ${sideA}/${sideB}/${why}`)
          pairs += 1
        }
      }
    }
  }
  assert.ok(pairs > 500, `only ${pairs} tradeoff sentences were generated`)
})

test('the practical list is first person for every program item', () => {
  const base = baseBrief()
  const keys = [
    ...Object.keys(PROGRAM).map((subject) => ({ subject, qualifier: undefined })),
    ...Object.keys(PROGRAM_QUALIFIED).map((key) => {
      const [subject, qualifier] = key.split(':')
      return { subject, qualifier }
    }),
  ]
  for (const { subject, qualifier } of keys) {
    const brief: StructuredBrief = {
      ...base,
      nonNegotiables: [],
      skipFaster: [],
      showingTests: [],
      practicalProgram: [{ id: `program.${subject}`, subject, ...(qualifier ? { qualifier } : {}), trace }],
    }
    const section = compose(brief).sections.find((entry) => entry.id === 'program')
    assert.ok(section, `${subject}${qualifier ? `:${qualifier}` : ''} rendered no practical list`)
    for (const entry of section.lines) clean(entry.buyer, `program ${subject}:${qualifier}`)
  }
})

test('every showing check in the catalogue is first person', () => {
  const base = baseBrief()
  for (const key of Object.keys(SHOWING)) {
    const [id, qualifier] = key.split('~')
    const brief: StructuredBrief = {
      ...base,
      showingTests: [{
        id, subject: id.replace('inspect.', ''), ...(qualifier ? { qualifier } : {}),
        origin: 'derived', trace,
      }],
    }
    const section = compose(brief).sections.find((entry) => entry.id === 'showing')
    assert.ok(section, `${key} rendered no showing section`)
    for (const entry of section.lines) clean(entry.buyer, `showing ${key}`)
  }
})

test('every recorded gap reaches the buyer in their own voice', () => {
  const base = baseBrief()
  for (const sentence of Object.values(GAP_TEXT)) {
    const brief: StructuredBrief = {
      ...base,
      flexOrder: { ...base.flexOrder, state: 'notEstablished', missing: [sentence] },
    }
    const section = compose(brief).sections.find((entry) => entry.id === 'leverUnknown')
    assert.ok(section, `${sentence} rendered no section`)
    for (const entry of section.lines) clean(entry.buyer, `leverUnknown "${sentence}"`)
  }
})

// ---------------------------------------------------------------------------
// The three things a buyer actually reads
// ---------------------------------------------------------------------------

/**
 * The buyer's own words, which are quoted and must not be scanned.
 *
 * Collected from the handoff itself rather than guessed from the output, so a
 * new free-text field cannot quietly widen what this test ignores.
 */
const buyerTyped = (handoff: (typeof HANDOFFS)[keyof typeof HANDOFFS]['handoff']): string[] => [
  ...(handoff.geography?.considering ?? []),
  ...(handoff.geography?.ruledOut ?? []),
  ...(handoff.hardFilters?.other ?? []),
  ...(handoff.destinations ?? []),
  ...(handoff.propertyBasics?.types ?? []),
  handoff.geography?.note ?? '',
  handoff.timing?.note ?? '',
  handoff.schoolBoundary ?? '',
  handoff.buyerNote ?? '',
].filter(Boolean)

test('the result page, the clipboard and the email are all first person', () => {
  const cases: { name: string; brief: StructuredBrief; typed: string[] }[] = []
  for (const name of Object.keys(FIXTURES) as (keyof typeof FIXTURES)[]) {
    const result = score(FIXTURES[name].answers)
    cases.push({ name, brief: assembleBrief(result, strategyFor(result)), typed: [] })
    for (const key of Object.keys(HANDOFFS) as (keyof typeof HANDOFFS)[]) {
      cases.push({
        name: `${name}+${key}`,
        brief: assembleBrief(result, strategyFor(result), HANDOFFS[key].handoff),
        typed: buyerTyped(HANDOFFS[key].handoff),
      })
    }
  }
  assert.ok(cases.length >= 300, `only ${cases.length} briefs were rendered`)

  for (const { name, brief, typed } of cases) {
    // The result page: every line the component can print, facts excluded
    // because that section is the buyer's own typing read back.
    for (const text of buyerLines(brief)) clean(text, `result ${name}`)

    // The clipboard and the email, with the quoted free text removed first.
    const url = 'https://x.test/r'
    for (const [label, text] of [
      ['clipboard', clipboardBrief(brief, url)],
      ['email', emailBody(brief, { resultUrl: url })],
      ['buyer copy', renderBuyerCopy(brief, { resultUrl: url })],
    ] as const) {
      const stripped = typed.reduce((acc, quote) => acc.split(quote).join(''), text)
      clean(stripped, `${label} ${name}`)
    }
  }
})

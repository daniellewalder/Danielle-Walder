import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FIXTURES, dump } from './fixtures.ts'
import { decode, encode } from './encode.ts'
import { bandOf, score } from './score.ts'
import { MAP, candidatesFrom, selectPair } from './tradeoff.ts'

const fixture = (name: keyof typeof FIXTURES) => score(FIXTURES[name].answers)
const of = (name: keyof typeof FIXTURES, id: string) =>
  fixture(name).attributes.find((entry) => entry.attribute.id === id)

test('there are at least sixteen fixtures and each one dumps', () => {
  const names = Object.keys(FIXTURES)
  assert.ok(names.length >= 16, `only ${names.length} fixtures`)
  for (const name of names) {
    const text = dump(name, FIXTURES[name as keyof typeof FIXTURES].answers)
    assert.ok(text.includes('STATE'), `${name} produced no table`)
  }
})

test('every fixture round-trips through the URL unchanged', () => {
  for (const [name, { answers }] of Object.entries(FIXTURES)) {
    const { answers: parsed, dropped } = decode(encode(answers))
    assert.deepEqual(parsed, answers, `${name} did not round-trip`)
    assert.deepEqual(dropped, [], `${name} lost something`)
  }
})

test('01 two dealbreakers are both protected, from one source', () => {
  assert.equal(of('twoDealbreakers', 'light')?.state, 'protect')
  assert.equal(of('twoDealbreakers', 'privacy')?.state, 'protect')
  assert.equal(of('twoDealbreakers', 'light')?.evidence.statedRank, 1)
  assert.equal(of('twoDealbreakers', 'privacy')?.evidence.statedRank, 2)
  assert.deepEqual([...(of('twoDealbreakers', 'light')?.evidence.corroboration ?? [])], ['dealbreaker'])
})

test('02 the daily secondary is weaker than the primary', () => {
  assert.equal(of('dailyPrimaryAndSecondary', 'separation')?.evidence.direct, 3)
  assert.equal(of('dailyPrimaryAndSecondary', 'circulation')?.evidence.direct, 2)
})

test('03 two bundled picks each carry their own qualifier', () => {
  assert.equal(of('twoBundledQualifiers', 'utility')?.qualifier, 'storage')
  assert.equal(of('twoBundledQualifiers', 'upkeep')?.qualifier, 'pool')
})

test('04 architecture high and personalization high, in one pass', () => {
  const result = fixture('architectureAndPersonalization')
  assert.equal(of('architectureAndPersonalization', 'architecturalCharacter')?.state, 'protect')
  assert.equal(bandOf('personalizationAppetite', result), 'yes')
  assert.equal(result.conflict.present, false, 'this is one coherent person, not a contradiction')
})

test('05 wants it plain and will still decorate', () => {
  const result = fixture('neutralAndPersonalization')
  assert.ok(result.stances.has('wantsNeutral'))
  assert.equal(bandOf('personalizationAppetite', result), 'yes')
  assert.equal(of('neutralAndPersonalization', 'architecturalCharacter'), undefined)
})

test('06 turnkey reads as day-one ready and renovation averse', () => {
  const result = fixture('turnkey')
  assert.equal(bandOf('dayOneReadiness', result), 'yes')
  assert.equal(bandOf('renovationTolerance', result), 'no')
  assert.equal(of('turnkey', 'condition')?.state, 'protect')
})

test('07 the structural builder establishes no expansion attribute', () => {
  const result = fixture('structuralBuilder')
  assert.ok(result.stances.has('structuralWorkOkay'))
  assert.equal(bandOf('renovationTolerance', result), 'yes')
  assert.ok(!result.attributes.some((entry) => entry.attribute.id === 'expansion'))
  assert.equal(of('structuralBuilder', 'site')?.qualifier, 'land')
})

test('08 to 11 every map posture is recorded, and only two are movable', () => {
  assert.equal(fixture('fixedMap').map, 'fixed')
  assert.equal(fixture('strongPreferenceMap').map, 'strongPreference')
  assert.equal(fixture('fewAreasMap').map, 'fewAreas')
  assert.equal(fixture('propertyLedMap').map, 'propertyLed')

  for (const [name, movable] of [
    ['fixedMap', false],
    ['strongPreferenceMap', true],
    ['fewAreasMap', true],
    ['propertyLedMap', false],
  ] as const) {
    const result = fixture(name)
    const evidence = new Map(result.attributes.map((entry) => [entry.attribute.id, entry.evidence]))
    const offered = candidatesFrom(evidence, result.map).some((c) => c.concept === MAP)
    assert.equal(offered, movable, `${name} offered the map: ${offered}`)
  }
})

test('12 an adaptive pair between two protected property attributes', () => {
  const result = fixture('tradeoffTwoProperties')
  assert.deepEqual(result.tradeoff?.pair, ['light', 'privacy'])
  assert.equal(result.tradeoff?.family, 'setting')
  assert.ok(!result.tradeoff?.pair.includes(MAP), 'a fixed map was offered')
})

test('13 an adaptive pair involving movable geography', () => {
  const result = fixture('tradeoffAgainstMap')
  assert.ok(result.tradeoff?.pair.includes(MAP))
  assert.equal(result.map, 'strongPreference')
  assert.equal(result.tradeoff?.winner, 'outdoor')
})

test('14 a protected attribute loses and stays protected', () => {
  const privacy = of('protectedLoser', 'privacy')
  assert.equal(privacy?.state, 'protect')
  assert.equal(privacy?.evidence.direct, 3)
  assert.deepEqual(privacy?.evidence.ordering, [
    { against: 'light', outcome: 'lost', question: 'tradeoff' },
  ])
})

test('15 a low-information buyer gets no invented verdict', () => {
  const result = fixture('lowInformation')
  assert.equal(result.attributes.filter((entry) => entry.state === 'protect').length, 0)
  assert.ok(result.answered > 0, 'they did answer; there is just nothing to conclude')
  assert.equal(result.unknowns.length >= 15, true)
})

test('16 the contradiction fires, and the follow-up settles it', () => {
  const open = fixture('contradictionOpen')
  assert.equal(open.conflict.present, true)
  assert.equal(open.needs, 'contradiction')

  const settled = fixture('contradictionResolved')
  assert.equal(settled.conflict.resolvedBy, 'cosmetic')
  assert.equal(settled.needs, null)
})

test('the pair the engine would choose is always allowed and never invented', () => {
  for (const [name, { answers }] of Object.entries(FIXTURES)) {
    const result = score(answers)
    const evidence = new Map(result.attributes.map((entry) => [entry.attribute.id, entry.evidence]))
    const selected = selectPair(candidatesFrom(evidence, result.map), {
      map: result.map,
      projectIsMajor: result.stances.has('structuralWorkOkay'),
      wantsNeutral: result.stances.has('wantsNeutral'),
      qualified: new Set(
        result.attributes.filter((entry) => entry.qualifier).map((entry) => entry.attribute.id),
      ),
    })
    assert.equal(selected.pair.length, 2, `${name} produced no pair`)
    assert.notEqual(selected.pair[0], selected.pair[1], `${name} paired something with itself`)
    if (result.map === 'fixed' || result.map === 'propertyLed') {
      assert.ok(!selected.pair.includes(MAP), `${name} offered an immovable map`)
    }
  }
})

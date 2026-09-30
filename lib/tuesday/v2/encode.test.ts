import assert from 'node:assert/strict'
import { test } from 'node:test'
import { INSTRUMENT_VERSION, type V2Answers } from './answers.ts'
import { decode, detectVersion, encode } from './encode.ts'

const FULL: V2Answers = {
  version: 2,
  tuesday: 'quiet',
  dealbreaker: [{ option: 'site', qualifier: 'land' }, { option: 'dark' }],
  daily: [{ option: 'utility', qualifier: 'storage' }, { option: 'parking', qualifier: 'charging' }],
  architecture: 'alot',
  personalization: 'all',
  project: 'depends',
  location: 'strong',
  tradeoff: { pair: ['light', 'site'], winner: 'light', family: 'siteVsHouse' },
  depends: 'money',
}

test('a full answer set round-trips exactly', () => {
  const { answers, dropped } = decode(encode(FULL))
  assert.deepEqual(answers, FULL)
  assert.deepEqual(dropped, [])
})

test('the ordered picks keep their order through a round trip', () => {
  const { answers } = decode(encode(FULL))
  assert.deepEqual(answers.dealbreaker?.map((pick) => pick.option), ['site', 'dark'])
  assert.deepEqual(answers.daily?.map((pick) => pick.option), ['utility', 'parking'])
})

test('qualifiers survive, attached to the pick they belong to', () => {
  const { answers } = decode(encode(FULL))
  assert.equal(answers.dealbreaker?.[0].qualifier, 'land')
  assert.equal(answers.dealbreaker?.[1].qualifier, undefined)
  assert.equal(answers.daily?.[0].qualifier, 'storage')
  assert.equal(answers.daily?.[1].qualifier, 'charging')
})

test('the tradeoff round-trips the pair, the winner and the family', () => {
  const { answers } = decode(encode(FULL))
  assert.deepEqual(answers.tradeoff, FULL.tradeoff)
})

test('declining the tradeoff round-trips as a decline, not as a missing answer', () => {
  const declined: V2Answers = {
    version: 2,
    tradeoff: { pair: ['light', 'privacy'], winner: null, family: 'setting' },
  }
  const { answers } = decode(encode(declined))
  assert.equal(answers.tradeoff?.winner, null)
  assert.deepEqual(answers.tradeoff?.pair, ['light', 'privacy'])
})

test('a partial answer set round-trips without inventing the rest', () => {
  const partial: V2Answers = { version: 2, tuesday: 'room', location: 'fixed' }
  const { answers, dropped } = decode(encode(partial))
  assert.deepEqual(answers, partial)
  assert.deepEqual(dropped, [])
  assert.equal(answers.project, undefined, 'a missing answer was filled in')
})

test('it survives a real URL', () => {
  const url = new URL('https://daniellewalder.com/tuesday-test/result')
  url.searchParams.set('a', encode(FULL))
  assert.equal(url.searchParams.get('a'), encode(FULL), 'a separator needed escaping')
  assert.deepEqual(decode(url.searchParams.get('a')).answers, FULL)
})

// ---------------------------------------------------------------------------
// Versioning: the thing that protects every link already shared
// ---------------------------------------------------------------------------

test('a V2 payload declares its version', () => {
  assert.match(encode(FULL), /(^|_)v\.2(_|$)/)
  assert.deepEqual(detectVersion(encode(FULL)), { version: 2, raw: encode(FULL) })
})

test('a V1 link is detected as V1 and never handed to the V2 model', () => {
  const v1 = 'tuesday.quiet_dealbreaker.dark_daily.utility-parking_inherit.renovation_whitehouse.mine_kitchen.never_location.strong'
  const detected = detectVersion(v1)
  assert.equal(detected.version, 1)
  assert.equal(detected.version === 1 && detected.raw, v1, 'the raw payload must reach the V1 interpreter intact')
})

test('a V1 link that happens to share option ids still reads as V1', () => {
  // `location.strong` is a valid token in both instruments. Detection must key
  // off the declared version and never sniff the shape.
  assert.equal(detectVersion('location.strong').version, 1)
  assert.equal(detectVersion('v.2_l.strong').version, 2)
})

test('an unknown version is refused rather than guessed at', () => {
  const detected = detectVersion('v.7_t.quiet')
  assert.equal(detected.version, 'unknown')
  assert.equal(detected.version === 'unknown' && detected.declared, '7')
})

test('an empty payload is empty, not a default result', () => {
  assert.deepEqual(detectVersion(null), { version: 'empty' })
  assert.deepEqual(detectVersion(''), { version: 'empty' })
  assert.deepEqual(decode(null).answers, { version: INSTRUMENT_VERSION })
})

// ---------------------------------------------------------------------------
// Malformed input degrades, and says what it lost
// ---------------------------------------------------------------------------

test('unknown options are dropped and reported, never defaulted', () => {
  const { answers, dropped } = decode('v.2_t.doesnotexist_l.fixed')
  assert.equal(answers.tuesday, undefined)
  assert.equal(answers.location, 'fixed')
  assert.ok(dropped.some((entry) => entry.includes('unknown option')))
})

test('a third pick is dropped rather than silently accepted', () => {
  const { answers, dropped } = decode('v.2_d.dark-privacy-street')
  assert.equal(answers.dealbreaker?.length, 2)
  assert.deepEqual(answers.dealbreaker?.map((pick) => pick.option), ['dark', 'privacy'])
  assert.ok(dropped.some((entry) => entry.includes('more than two')))
})

test('a duplicate pick is dropped', () => {
  const { answers, dropped } = decode('v.2_d.dark-dark')
  assert.equal(answers.dealbreaker?.length, 1)
  assert.ok(dropped.some((entry) => entry.includes('duplicate')))
})

test('a qualifier on an unbundled option is dropped, the pick is kept', () => {
  const { answers, dropped } = decode('v.2_d.dark~land')
  assert.deepEqual(answers.dealbreaker, [{ option: 'dark' }])
  assert.ok(dropped.some((entry) => entry.includes('unbundled')))
})

test('a tradeoff naming a concept that no longer exists is dropped whole', () => {
  const { answers, dropped } = decode('v.2_x.light-expansion-light-setting')
  assert.equal(answers.tradeoff, undefined, 'a half-parsed tradeoff is worse than none')
  assert.ok(dropped.some((entry) => entry.includes('unknown pair')))
})

test('a tradeoff whose winner is not in the pair is refused', () => {
  const { answers, dropped } = decode('v.2_x.light-privacy-size-setting')
  assert.equal(answers.tradeoff, undefined)
  assert.ok(dropped.some((entry) => entry.includes('winner is not in the pair')))
})

test('hostile and malformed payloads never throw', () => {
  for (const hostile of [
    '_____',
    'v.2_',
    'v.2_d.',
    'v.2_..._',
    'v.2_x.light',
    'v.2_x.light-light-light-setting',
    'v.2_d.dark_d.privacy',
    'v.2_zzz.qqq',
    '%%%%',
    'v.2_' + 'd.dark-'.repeat(200),
  ]) {
    const { answers } = decode(hostile)
    assert.equal(answers.version, INSTRUMENT_VERSION, `threw or lost its version on: ${hostile}`)
  }
})

test('a repeated key is dropped rather than letting the last one win silently', () => {
  const { answers, dropped } = decode('v.2_t.quiet_t.room')
  assert.equal(answers.tuesday, 'quiet')
  assert.ok(dropped.some((entry) => entry.includes('repeated key')))
})

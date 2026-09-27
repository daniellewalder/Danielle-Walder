import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ATTRIBUTES } from './model.ts'
import { score, type Answers } from './score.ts'
import { combinations, figureOutNext, interpretation, signalsOf, theRead } from './read.ts'

const PERSONAS: Record<string, Answers> = {
  spatialUnresolved: {
    tuesday: 'close', dealbreaker: 'outgrow', daily: ['public', 'separation'],
    inherit: 'both', whitehouse: 'personality', kitchen: 'depends', location: 'fixed',
  },
  decorator: {
    tuesday: 'quiet', dealbreaker: 'outside', daily: ['utility', 'parking'],
    inherit: 'renovation', whitehouse: 'mine', kitchen: 'never', location: 'strong',
  },
  renovator: {
    tuesday: 'room', dealbreaker: 'outgrow', daily: ['separation', 'stairs'],
    inherit: 'lot', whitehouse: 'personality', kitchen: 'fixable', location: 'property',
  },
  turnkey: {
    tuesday: 'errands', dealbreaker: 'layout', daily: ['public', 'separation'],
    inherit: 'renovation', whitehouse: 'finished', kitchen: 'done', location: 'fixed',
  },
  outdoor: {
    tuesday: 'quiet', dealbreaker: 'outside', daily: ['outdoor', 'upkeep'],
    inherit: 'renovation', whitehouse: 'bones', kitchen: 'depends', location: 'few',
  },
  characterAndLayers: {
    tuesday: 'close', dealbreaker: 'dark', daily: ['dark', 'public'],
    inherit: 'lot', whitehouse: 'personality', kitchen: 'done', location: 'few', clarify: 'cosmetic',
  },
  lowCertainty: {
    tuesday: 'errands', dealbreaker: 'none', daily: ['unsure'],
    inherit: 'both', whitehouse: 'bones', kitchen: 'depends', location: 'strong',
  },
  everythingMatters: {
    tuesday: 'quiet', dealbreaker: 'dark', daily: ['outdoor', 'public'],
    inherit: 'lot', whitehouse: 'personality', kitchen: 'never', location: 'fixed',
  },
}

const each = (run: (name: string, answers: Answers) => void) => {
  for (const [name, answers] of Object.entries(PERSONAS)) run(name, answers)
}

/*
 * THE SUCCESS TEST, MECHANISED.
 *
 * Danielle's standard is "could the buyer have written this themselves from
 * memory of what they clicked?". A machine cannot judge insight, but it can
 * catch the failure mode exactly: a read whose sentences are the labels of
 * the things the buyer selected, strung together. So the interpretation is
 * required to carry language that is not in the attribute registry at all.
 */
test('the read is not a transcript of the answers', () => {
  const registry = ATTRIBUTES.map((attribute) => attribute.label.toLowerCase())
  each((name, answers) => {
    const read = theRead(score(answers))
    assert.ok(read, `${name} produced no read`)
    const prose = read.paragraphs.join(' ')
    const labelsQuoted = registry.filter((label) => prose.toLowerCase().includes(label))
    assert.ok(
      labelsQuoted.length <= 1,
      `${name} reads back ${labelsQuoted.length} attribute labels verbatim: ${labelsQuoted.join(', ')}`,
    )
    assert.ok(prose.length > 160, `${name} read is too thin to have combined anything`)
  })
})

/*
 * Testing for insight with a word list turns into a game of widening the word
 * list until it matches anything. The structural guarantee is the real one:
 * the lead paragraph is always an evidence clause plus a consequence clause
 * taken from the combination that fired, and the two are different pieces of
 * writing. A rule cannot ship a conclusion with nothing to do about it.
 */
test('every read pairs its evidence with a separate consequence', () => {
  each((name, answers) => {
    const result = score(answers)
    const firing = combinations(signalsOf(result))
    const read = theRead(result)
    assert.ok(read, `${name} produced no read`)
    if (firing.length === 0) return

    const lead = firing[0]
    assert.equal(read.paragraphs[0], `${lead.evidence} ${lead.consequence}`, `${name} lost its structure`)
    assert.notEqual(lead.consequence, lead.evidence, `${name} restates its evidence as its conclusion`)
    assert.ok(
      lead.consequence.length >= 90,
      `${name} has a consequence too short to say what to do differently`,
    )
    assert.equal(read.headline, lead.headline)
  })
})

test('a headline is never generated from one attribute scoring highest', () => {
  const registry = ATTRIBUTES.map((attribute) => attribute.label.toLowerCase())
  each((name, answers) => {
    const headline = theRead(score(answers))?.headline ?? ''
    for (const label of registry) {
      assert.ok(!headline.toLowerCase().includes(label), `${name} headlined the attribute "${label}"`)
    }
  })
})

test('no attribute is named in two prominent sections at once', () => {
  each((name, answers) => {
    const result = interpretation(score(answers))
    const sections: Record<string, string> = {
      read: result.read?.paragraphs.join(' ') ?? '',
      ...Object.fromEntries(result.changes.map((change) => [change.heading, change.body])),
    }
    const keys = Object.keys(sections)
    for (const attribute of ATTRIBUTES) {
      const label = attribute.label.toLowerCase()
      const hits = keys.filter((key) => sections[key].toLowerCase().includes(label))
      assert.ok(hits.length <= 1, `${name} names "${attribute.label}" in ${hits.join(' and ')}`)
    }
  })
})

test('the brief never reprints the priorities under a second heading', () => {
  each((name, answers) => {
    const brief = interpretation(score(answers)).brief
    if (!brief.mustWorkNote) return
    for (const priority of brief.priorities) {
      // The note may name what could come LATER. It must never restate the
      // whole list, which is the repetition this layer exists to remove.
      const restated = brief.priorities.every((item) => brief.mustWorkNote?.includes(item))
      assert.ok(!restated || brief.priorities.length === 0, `${name} reprinted the priorities`)
      void priority
    }
  })
})

test('priorities and practical flags are disjoint', () => {
  each((name, answers) => {
    const brief = interpretation(score(answers)).brief
    for (const flag of brief.practicalFlags) {
      assert.ok(!brief.priorities.includes(flag), `${name} lists "${flag}" twice`)
    }
  })
})

test('nothing claims flexibility the answers did not establish', () => {
  each((name, answers) => {
    const result = score(answers)
    const { changes } = interpretation(result)
    const lookTwice = changes.find((change) => change.heading === 'Look twice')
    if (!lookTwice) return
    const signals = signalsOf(result)
    const earned =
      signals.personalization === 'yes' ||
      signals.renovation === 'yes' ||
      signals.renovation === 'conditional' ||
      signals.tradedPermanently.length > 0
    assert.ok(earned, `${name} invented flexibility with no evidence behind it`)
  })
})

test('reject faster never fires against something the buyer would renovate', () => {
  each((name, answers) => {
    const result = score(answers)
    const signals = signalsOf(result)
    const reject = interpretation(result).changes.find((c) => c.heading === 'Reject faster')
    if (!reject || signals.renovation !== 'yes') return
    // Someone who takes on work can only be told to skip what work cannot fix.
    assert.ok(
      signals.site.length > 0,
      `${name} told a renovator to reject something a renovation would solve`,
    )
  })
})

test('the open question is stated once, not printed twice on the page', () => {
  each((name, answers) => {
    const result = score(answers)
    const { read, openQuestion } = interpretation(result)
    if (!openQuestion || !read) return
    assert.ok(
      !read.paragraphs.some((paragraph) => paragraph.includes(openQuestion.why)),
      `${name} prints the open question's reasoning in the read as well`,
    )
  })
})

test('an unresolved conflict outranks every other open question', () => {
  const conflicted = score({
    inherit: 'lot', kitchen: 'done', whitehouse: 'personality', location: 'fixed',
  })
  assert.ok(signalsOf(conflicted).conflictUnresolved)
  assert.match(figureOutNext(signalsOf(conflicted))?.question ?? '', /how much work would you really take on/i)
})

test('a scale that could only move one way, and did not, reads as unset', () => {
  // Only one option in the test lowers operational burden. Not choosing it is
  // silence, and silence must not be reported as a high tolerance for upkeep.
  const quiet = score({ daily: ['public', 'separation'], location: 'few' })
  assert.equal(signalsOf(quiet).upkeep, 'unset')

  const said = score({ daily: ['outdoor', 'upkeep'], location: 'few' })
  assert.equal(signalsOf(said).upkeep, 'no')
})

test('only the cosmetic layer is ever described as something that could come later', () => {
  each((name, answers) => {
    const brief = interpretation(score(answers)).brief
    if (!brief.mustWorkNote?.includes('could come later')) return
    for (const attribute of ATTRIBUTES) {
      if (attribute.changeability === 'usuallyAdaptable') continue
      assert.ok(
        !brief.mustWorkNote.toLowerCase().includes(phrase(attribute.label)),
        `${name} says "${attribute.label}" could come later, and it cannot`,
      )
    }
  })
})

function phrase(label: string): string {
  return label.toLowerCase()
}

test('an unanswered test produces no verdict at all', () => {
  const empty = interpretation(score({}))
  assert.equal(empty.read, null)
  assert.equal(empty.changes.length, 0)
  assert.equal(empty.brief.priorities.length, 0)
})

test('a partial test still reads without inventing the rest', () => {
  const partial = interpretation(score({ tuesday: 'quiet', dealbreaker: 'dark' }))
  assert.ok(partial.read)
  assert.equal(partial.brief.map, null)
})

test('every showing check is a question or an instruction, never a restatement', () => {
  each((name, answers) => {
    const checks = interpretation(score(answers)).checks
    assert.ok(checks.length >= 3, `${name} produced only ${checks.length} checks`)
    for (const check of checks) {
      assert.ok(
        /\?$/.test(check) || /^[A-Z][a-z]+ /.test(check),
        `${name} has a check that does not ask or instruct: ${check}`,
      )
    }
  })
})

test('no em or en dashes reach the reader', () => {
  each((name, answers) => {
    const result = interpretation(score(answers))
    const prose = [
      result.read?.headline ?? '',
      ...(result.read?.paragraphs ?? []),
      ...result.changes.map((change) => `${change.heading} ${change.body}`),
      result.openQuestion?.question ?? '',
      result.openQuestion?.why ?? '',
      ...result.checks,
      result.brief.mustWorkNote ?? '',
    ].join(' ')
    assert.ok(!/[—–]/.test(prose), `${name} contains a dash we removed sitewide`)
  })
})

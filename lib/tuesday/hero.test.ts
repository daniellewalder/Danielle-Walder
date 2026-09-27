import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ATTRIBUTES } from './model.ts'
import { byState, score, type Answers } from './score.ts'
import { mapSummary, projectSummary, synthesis } from './interpret.ts'
import { agentRead } from './read.ts'

/*
 * THE HERO IS NOT A CAPTION FOR THE CARDS.
 *
 * Directly underneath it the page prints what the buyer protected, how far
 * the map moves and what they would change. An earlier hero restated all
 * three, which meant the most prominent copy on the page was the one thing
 * the buyer could have written from memory of their own clicks.
 *
 * These tests hold the line: the hero is a decision, it is short, and it does
 * not repeat the modules below it.
 */

const PERSONAS: Record<string, Answers> = {
  spatialUnresolved: { tuesday: 'close', dealbreaker: 'outgrow', daily: ['public', 'separation'], inherit: 'both', whitehouse: 'personality', kitchen: 'depends', location: 'fixed' },
  decorator: { tuesday: 'quiet', dealbreaker: 'outside', daily: ['utility', 'parking'], inherit: 'renovation', whitehouse: 'mine', kitchen: 'never', location: 'strong' },
  renovator: { tuesday: 'room', dealbreaker: 'outgrow', daily: ['separation', 'stairs'], inherit: 'lot', whitehouse: 'personality', kitchen: 'fixable', location: 'property' },
  turnkey: { tuesday: 'errands', dealbreaker: 'layout', daily: ['public', 'separation'], inherit: 'renovation', whitehouse: 'finished', kitchen: 'done', location: 'fixed' },
  outdoor: { tuesday: 'quiet', dealbreaker: 'outside', daily: ['outdoor', 'upkeep'], inherit: 'renovation', whitehouse: 'bones', kitchen: 'depends', location: 'few' },
  characterAndLayers: { tuesday: 'close', dealbreaker: 'dark', daily: ['dark', 'public'], inherit: 'lot', whitehouse: 'personality', kitchen: 'done', location: 'few', clarify: 'cosmetic' },
  lowCertainty: { tuesday: 'errands', dealbreaker: 'none', daily: ['unsure'], inherit: 'both', whitehouse: 'bones', kitchen: 'depends', location: 'strong' },
  everythingMatters: { tuesday: 'quiet', dealbreaker: 'dark', daily: ['outdoor', 'public'], inherit: 'lot', whitehouse: 'personality', kitchen: 'never', location: 'fixed' },
}

const each = (run: (name: string, answers: Answers) => void) => {
  for (const [name, answers] of Object.entries(PERSONAS)) run(name, answers)
}

const hero = (answers: Answers) => synthesis(score(answers)).join(' ')

test('the hero is what the live page renders', () => {
  each((name, answers) => {
    const result = score(answers)
    assert.deepEqual(synthesis(result), agentRead(result), `${name} drifted from the agent read`)
  })
})

test('the hero never reprints the map card', () => {
  each((name, answers) => {
    const map = mapSummary(score(answers))
    if (!map) return
    assert.ok(!hero(answers).includes(map), `${name} restates the map module verbatim`)
  })
})

test('the hero never reprints the change card', () => {
  each((name, answers) => {
    const text = hero(answers)
    for (const row of projectSummary(score(answers))) {
      assert.ok(!text.includes(row.label), `${name} restates "${row.label}" above the card showing it`)
    }
    assert.ok(!/cosmetic changes|major renovation/i.test(text), `${name} restates the change card`)
  })
})

test('the hero does not list the protected attributes', () => {
  each((name, answers) => {
    const text = hero(answers).toLowerCase()
    const quoted = byState(score(answers))
      .protect.map((entry) => entry.attribute.label.toLowerCase())
      .filter((label) => text.includes(label))
    // Naming ONE of them inside a decision is the point: "the one I'd hold is
    // the lot". Naming several is the card underneath, read out loud.
    assert.ok(quoted.length <= 1, `${name} lists ${quoted.length} protected attributes: ${quoted.join(', ')}`)
  })
})

test('every hero sentence is a decision, not a description', () => {
  each((name, answers) => {
    const text = hero(answers)
    if (text === '') return
    assert.match(
      text,
      /\b(I'd|I would|I wouldn't|Don't|Ask |If the)\b/,
      `${name} describes a state instead of making a call: ${text}`,
    )
  })
})

test('the hero stays at two paragraphs and four sentences', () => {
  each((name, answers) => {
    const paragraphs = synthesis(score(answers))
    assert.ok(paragraphs.length <= 2, `${name} has ${paragraphs.length} paragraphs`)
    const count = paragraphs.join(' ').split(/(?<=\.)\s+/).filter(Boolean).length
    assert.ok(count <= 4, `${name} runs to ${count} sentences`)
    assert.ok(!/\n\s*[-*•]/.test(paragraphs.join('\n')), `${name} contains a list`)
  })
})

test('the two paragraphs are never about the same thing', () => {
  each((name, answers) => {
    const paragraphs = synthesis(score(answers))
    if (paragraphs.length < 2) return
    assert.notEqual(paragraphs[0], paragraphs[1])
    // A cheap proxy for "same subject": the same attribute label in both.
    for (const attribute of ATTRIBUTES) {
      const label = attribute.label.toLowerCase()
      const both =
        paragraphs[0].toLowerCase().includes(label) && paragraphs[1].toLowerCase().includes(label)
      assert.ok(!both, `${name} says "${attribute.label}" in both paragraphs`)
    }
  })
})

test('the hero contains no generic agent filler', () => {
  const FILLER = [
    /stay focused on what matters/i,
    /be open.?minded/i,
    /keep your priorities in mind/i,
    /the right home is out there/i,
    /trust the process/i,
    /every buyer is different/i,
    /at the end of the day/i,
  ]
  each((name, answers) => {
    const text = hero(answers)
    for (const pattern of FILLER) {
      assert.ok(!pattern.test(text), `${name} reached for filler: ${text}`)
    }
  })
})

test('condition is only called the lever when the buyer said they would do work', () => {
  each((name, answers) => {
    const result = score(answers)
    const text = hero(answers)
    if (!/condition is the lever/i.test(text)) return
    assert.ok(
      result.scales.renovationTolerance >= 0.62,
      `${name} calls condition the lever without the buyer having said so`,
    )
  })
})

test('an unanswered test produces no hero at all', () => {
  assert.deepEqual(synthesis(score({})), [])
})

test('the decorator gets the lever call, not a summary of their answers', () => {
  const text = hero(PERSONAS.decorator)
  assert.match(text, /use the map as the flexible part/i)
  assert.match(text, /kitchen torn apart/i)
  assert.match(text, /how the outdoor space actually lives/i)
  // The three facts the cards already carry stay in the cards.
  assert.ok(!/strong preference|hard boundary/i.test(text))
  assert.ok(!/cosmetic changes|major renovation/i.test(text))
})

test('no reader-facing dash survives in the hero', () => {
  each((name, answers) => {
    assert.ok(!/[—–]/.test(hero(answers)), `${name} contains a dash we removed sitewide`)
  })
})

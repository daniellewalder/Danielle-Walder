import type { Result } from './score.ts'

/**
 * What to actually look at in the next house.
 *
 * COPY STATUS: a draft in Danielle's register, awaiting her line edit.
 *
 * This is the part of the result that turns an abstract hierarchy into
 * something you can do on a Sunday. Every check is tied to a specific finding
 * — nothing generic, nothing that would be equally true for any buyer — and
 * they are emitted in evidence order, so the check for the thing someone was
 * most consistent about arrives first.
 *
 * Capped at five. A checklist you cannot hold in your head at a showing is a
 * document, not a tool.
 */

const CHECKS: Record<string, string> = {
  outdoor: "Is the outdoor space somewhere you'd actually sit, or just somewhere that exists?",
  privacy: 'Stand at the windows, not in the middle of the room. Does it still feel private?',
  light: 'Go back at a different hour. Light at 11 a.m. is not light at 5 p.m.',
  street: 'Stand outside on the sidewalk for five minutes and listen.',
  lot: "Walk the property line. What is actually next door, and how close is it?",
  view: "Check the view from where you'd actually sit, not from the middle of the terrace.",
  proximity: "Drive it at the hour you'd really be driving it.",
  convenience: 'Do one ordinary errand starting from the front door.',
  kitchen: "If you never redo this kitchen, can you live with it? Answer honestly.",
  condition: "Separate what's dated from what's broken. They are different problems.",
  layout: "Walk it the way you'd live in it, not the way it has been staged.",
  size: "Put your actual furniture in the room in your head, not the small staged pieces.",
  separation: "Find the door you'd close when you need to. Is there one?",
  publicRooms: 'Picture the way you actually host. Where does everyone end up standing?',
  circulation: 'Do the stairs twice, carrying something.',
  utility: 'Where does everyday life go — laundry, bags, pantry, coats, storage?',
  parking: 'Try the driveway and the street, not just the garage count.',
  upkeep: 'Ask what it takes to keep it looking like this, and who has been doing it.',
  expansion: "Ask what is actually permitted here, not what looks possible.",
  ceilings: 'Notice the ceiling height in the rooms you would use daily, not just the entry.',
  character: 'Decide which details you would keep. Those are the ones you are paying for.',
  finishes: 'Look past the staging at what is actually fixed in place.',
}

export const MAX_CHECKS = 5

export function showingChecks(result: Result): string[] {
  const checks: string[] = []

  // Evidence order, protected things first: the check for whatever someone was
  // most consistent about should be the one they read first.
  const ordered = [
    ...result.attributes.filter((entry) => entry.state === 'protect'),
    ...result.attributes.filter((entry) => entry.state === 'scrutinize'),
  ]

  for (const entry of ordered) {
    const check = CHECKS[entry.attribute.id]
    if (check && !checks.includes(check)) checks.push(check)
    if (checks.length === MAX_CHECKS) break
  }

  return checks
}

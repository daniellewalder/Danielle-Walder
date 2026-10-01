'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { tuesdayV2 } from '@/lib/content/tuesdayV2'
import { decode } from '@/lib/tuesday/v2/encode'
import { score } from '@/lib/tuesday/v2/score'
import { strategyFor } from '@/lib/tuesday/v2/strategy'
import { assembleBrief } from '@/lib/tuesday/v2/brief'
import { compose, type Line, type SectionId } from '@/lib/tuesday/v2/render'
import { isComplete, nextStep, stepKey } from '@/lib/tuesday/v2/flow'

/**
 * The buyer's result.
 *
 * THE RENDERER OWNS THE LANGUAGE. Every sentence on this page comes from the
 * frozen buyer renderer, including the snapshot at the top. This component
 * decides hierarchy, colour and order; it never writes an interpretation, and
 * there is no second hero paragraph restating the sections below it.
 *
 * NO MODEL EXPORT. No confidence figures, no weights, no source counts, no
 * state names, no stance ids, no list of things we did not establish. The
 * tests can read all of that. A buyer reading their own result cannot.
 *
 * NO IMAGE. The only photography in the repo belongs to LA, Actually and would
 * say nothing about this reader's answers. Typography, colour and space carry
 * the hierarchy, one family per block with cream between.
 *
 * DEDUPLICATION IS THE RENDERER'S. Sections appear only when the renderer
 * populated them, in its order, with nothing added. No recap card exists to
 * even out a grid: a shorter result is allowed to be shorter.
 */

/**
 * CONTAINERS ARE EARNED.
 *
 * One field, not a stack of them. A result can run to ten sections, and ten
 * full-width rounded blocks is a column of identical cards with no hierarchy
 * left in it. The criteria that eliminate inventory get the heaviest surface
 * the system has; everything else separates with whitespace and a hairline,
 * which is what the rest of the site does.
 */
const FIELD: Partial<Record<SectionId, string>> = {
  filter: 'bg-brown text-onbrown',
}

/** Headings the buyer sees. The renderer's own words where it has them. */
const HEADING: Record<SectionId, string> = {
  snapshot: '',
  facts: 'What I am looking for',
  filter: 'Has to have',
  flex: 'Where I can move',
  noLever: 'Where I cannot move',
  leverUnknown: 'Still working out',
  secondLook: 'Worth a second look',
  skip: 'Probably not worth the time',
  showing: 'Worth checking when we see something',
  noSubstitute: 'Not the same thing',
  tradeoff: 'The one to watch',
  unresolved: 'Still to settle',
  program: 'Practical list',
  clarify: 'Worth sorting out',
}

/** After the hero: the operational pieces first, then everything else. */
const ORDER: readonly SectionId[] = [
  'filter',
  'flex',
  'noLever',
  'leverUnknown',
  'secondLook',
  'skip',
  'showing',
  'noSubstitute',
  'tradeoff',
  'unresolved',
  'program',
  'clarify',
]

/** The lever, in whichever of its three forms applies. */
const LEAD_SECTIONS: readonly SectionId[] = ['flex', 'noLever', 'leverUnknown']

export function TuesdayResultV2() {
  const params = useSearchParams()
  const encoded = params.get('a')
  const answers = useMemo(() => decode(encoded).answers, [encoded])

  const composed = useMemo(() => {
    const result = score(answers)
    return compose(assembleBrief(result, strategyFor(result)))
  }, [answers])

  if (!encoded || score(answers).answered === 0) {
    return <Dead copy={tuesdayV2.result.empty} href="/tuesday-test" />
  }

  /*
   * An unfinished payload is not completed on the reader's behalf. It goes
   * back to the question it stops at, with everything they did answer intact.
   */
  if (!isComplete(answers)) {
    const due = nextStep(answers)
    return (
      <Dead
        copy={tuesdayV2.result.unfinished}
        href={`/tuesday-test?a=${encoded}${due ? `&q=${stepKey(due)}` : ''}`}
      />
    )
  }

  const sections = ORDER.map((id) => composed.sections.find((entry) => entry.id === id)).filter(
    (entry): entry is NonNullable<typeof entry> => entry !== undefined,
  )

  return (
    <>
      {/*
        THE HERO IS THE STRATEGIC READ, and only that. The snapshot is the
        renderer's, printed once, with nothing beside it repeating the blocks
        underneath.
      */}
      <section className="wrap pt-14 mobile:pt-10">
        <p className="text-[11.5px] font-bold uppercase tracking-label text-taupe">
          {tuesdayV2.result.eyebrow}
        </p>
        <h1 className="mt-6 max-w-[20ch] font-mark text-[36px] font-semibold leading-[1.05] tracking-display text-espresso tablet:text-[32px] mobile:text-[25px]">
          {composed.snapshot[0]?.buyer}
        </h1>
        {composed.snapshot.length > 1 ? (
          <div className="mt-7 max-w-measure border-t border-hairline pt-7">
            {composed.snapshot.slice(1).map((entry, index) => (
              <p
                key={index}
                className="mt-3 font-sans text-[19px] leading-[1.5] text-warmgray first:mt-0 mobile:text-[17px]"
              >
                {entry.buyer}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      <div className="wrap mt-14 flex flex-col gap-11 mobile:mt-10 mobile:gap-9">
        {sections.map((section) => {
          const field = FIELD[section.id]
          return field ? (
            <section
              key={section.id}
              aria-labelledby={`r-${section.id}`}
              className={`rounded-block px-12 py-12 ${field} mobile:rounded-[16px] mobile:px-6 mobile:py-8`}
            >
              <Body id={section.id} heading={HEADING[section.id]} lines={section.lines} onField />
            </section>
          ) : (
            <section
              key={section.id}
              aria-labelledby={`r-${section.id}`}
              className="border-t border-hairline pt-8"
            >
              <Body
                id={section.id}
                heading={HEADING[section.id]}
                lines={section.lines}
                // The lever is the second most useful thing on the page, so it
                // carries slightly more weight than the sections after it.
                lead={LEAD_SECTIONS.includes(section.id)}
              />
            </section>
          )
        })}
      </div>

      <section className="wrap mt-16 border-t border-hairline pt-11 mobile:mt-12">
        {/*
          The two agent-facing actions are the next phase. Saying so is better
          than a button that quietly sends the wrong thing, and better than a
          dead control with no explanation.
        */}
        <h2 className="font-display text-[23px] leading-[1.2] text-espresso">
          {tuesdayV2.result.pending.heading}
        </h2>
        <p className="mt-4 max-w-measure font-sans text-[17px] leading-[1.5] text-warmgray">
          {tuesdayV2.result.pending.body}
        </p>
        <Link
          href="/tuesday-test"
          className="mt-8 inline-flex rounded-button bg-brown px-6 py-[13px] font-sans text-[15px] font-semibold text-cream hover:bg-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine mobile:min-h-[44px] mobile:w-full mobile:items-center mobile:justify-center"
        >
          {tuesdayV2.result.retake}
        </Link>
      </section>
    </>
  )
}

function Body({
  id, heading, lines, onField, lead,
}: {
  id: SectionId
  heading: string
  lines: readonly Line[]
  onField?: boolean
  lead?: boolean
}) {
  const size = onField || lead ? 'text-[19px] mobile:text-[17.5px]' : 'text-[17px] mobile:text-[16.5px]'
  const single = lines.length === 1
  return (
    <>
      <h2
        id={`r-${id}`}
        className={`text-[11.5px] font-bold uppercase tracking-label ${
          onField ? 'opacity-70' : 'text-taupe'
        }`}
      >
        {heading}
      </h2>
      {single ? (
        <p className={`mt-5 max-w-measure font-sans leading-[1.5] ${size}`}>{lines[0].buyer}</p>
      ) : (
        <ul className="mt-5 flex max-w-[64ch] flex-col gap-3">
          {lines.map((line, index) => (
            <li key={index} className={`flex gap-3.5 font-sans leading-[1.5] ${size}`}>
              <span
                aria-hidden="true"
                className="mt-[12px] h-[2px] w-[13px] shrink-0 bg-current opacity-45"
              />
              <span>{line.buyer}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Dead({
  copy, href,
}: {
  copy: { heading: string; body: string; cta: string }
  href: string
}) {
  return (
    <section className="wrap pt-14 mobile:pt-10">
      <div className="border-b border-hairline pb-11">
        <h1 className="font-mark text-[36px] font-semibold leading-[1] tracking-display text-espresso mobile:text-[27px]">
          {copy.heading}
        </h1>
        <p className="mt-6 max-w-measure font-sans text-[19px] leading-[1.45] text-warmgray">
          {copy.body}
        </p>
        <Link
          href={href}
          className="mt-8 inline-flex rounded-button bg-brown px-6 py-[13px] font-sans text-[15px] font-semibold text-cream hover:bg-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine mobile:min-h-[44px] mobile:w-full mobile:items-center mobile:justify-center"
        >
          {copy.cta}
        </Link>
      </div>
    </section>
  )
}

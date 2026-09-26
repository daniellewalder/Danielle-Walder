'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { decodeAnswers } from '@/lib/tuesday/encode'
import {
  STATE_HEADINGS,
  STATE_NOTES,
  dayOneItems,
  interpret,
  personalLayers,
  resultHeadline,
  unknownsLine,
} from '@/lib/tuesday/interpret'
import type { AttributeState } from '@/lib/tuesday/model'
import { byState, score } from '@/lib/tuesday/score'

/** The order the result reads in. Unknowns are one line, never a list. */
const SHOWN: readonly AttributeState[] = ['protect', 'scrutinize', 'flexibilityToTest']

export function TuesdayResult() {
  const params = useSearchParams()
  const encoded = params.get('a')
  const answers = useMemo(() => decodeAnswers(encoded), [encoded])
  const result = useMemo(() => score(answers), [answers])

  if (result.answered === 0) {
    return (
      <section className="wrap pt-14 mobile:pt-10">
        <div className="border-b border-hairline pb-11">
          <h1 className="font-mark text-[36px] font-semibold leading-[1] tracking-display text-espresso mobile:text-[27px]">
            There is nothing to read yet.
          </h1>
          <p className="mt-6 max-w-measure font-sans text-[19px] leading-[1.45] text-warmgray">
            This link does not carry any answers. Take the test and it will.
          </p>
          <Link
            href="/tuesday-test"
            className="mt-8 inline-flex rounded-button bg-brown px-6 py-[13px] font-sans text-[15px] font-semibold text-cream hover:bg-wine"
          >
            Take the Tuesday Test
          </Link>
        </div>
      </section>
    )
  }

  const grouped = byState(result)
  const layers = personalLayers(result)
  const dayOne = dayOneItems(result)

  /**
   * The result as one reference panel of labelled rows, not a stack of chip
   * clouds. Same vocabulary as the area reference: a small label on the left,
   * the content on the right, hairlines between. A row reads as a line in a
   * brief somebody wrote for you; a chip reads as a filter you applied.
   */
  const rows: { id: string; heading: string; note?: string; items: string[]; accent?: boolean }[] = [
    ...SHOWN.filter((state) => grouped[state].length > 0).map((state) => ({
      id: state,
      heading: STATE_HEADINGS[state],
      note: STATE_NOTES[state],
      items: grouped[state].map((entry) => entry.attribute.label),
    })),
    ...(dayOne.length > 0
      ? [
          {
            id: 'dayOne',
            heading: 'Must work on arrival',
            note: "You protected things that would be a real project to change, so they need to be right when you buy.",
            items: dayOne.map((entry) => entry.attribute.label),
          },
        ]
      : []),
    ...(layers.length > 0
      ? [{ id: 'layers', heading: 'Make it yours', items: [...layers], accent: true }]
      : []),
  ]

  return (
    <>
      {/*
        The arrival, in the quiz family's own colour. A result that opens on
        the same cream as every other page does not feel like the end of
        anything — and the Tuesday Test is butter and brown everywhere else it
        appears. Full-bleed band rather than a rounded block, so it is not a
        second card stacked against the panel below it.
      */}
      <header className="bg-butter-field px-gutter py-16 text-butter-text tablet:px-gutter-tablet tablet:py-12 mobile:px-gutter-mobile mobile:py-10">
        <p className="text-[11.5px] font-bold uppercase tracking-attribution text-butter-bronze">
          your search hierarchy
        </p>
        <div className="mt-6 grid grid-cols-[0.82fr_1.18fr] items-center gap-x-16 tablet:grid-cols-1 tablet:items-start tablet:gap-y-6">
          <h1 className="max-w-[13ch] font-mark text-[34px] font-semibold leading-[1.02] tracking-display tablet:text-[30px] mobile:text-[26px]">
            {resultHeadline(result)}
          </h1>
          <div className="flex max-w-[56ch] flex-col gap-4">
            {interpret(result).map((line) => (
              <p key={line} className="font-sans text-[18px] leading-[1.55] mobile:text-[17px]">
                {line}
              </p>
            ))}
          </div>
        </div>
      </header>

      {/*
        Two columns, so a one-line entry sits in a column it can fill instead
        of stranded at the left edge of the full page width. Same pattern as
        the area reference: one panel, columns inside it, hairlines between.
      */}
      <section aria-label="Your hierarchy" className="wrap pt-12 mobile:pt-9">
        <div className="rounded-block bg-paper px-10 py-3 mobile:rounded-[16px] mobile:px-6 mobile:py-2">
          {/*
            Column FLOW rather than a grid. A grid aligns rows, so a group with
            one entry sitting beside a group with six leaves a hole the height
            of five — and with an odd number of groups the last cell is always
            empty. Flowing lets each block take the height it needs and pack.
          */}
          <div className="columns-2 gap-14 tablet:columns-1">
            {rows.map((row) => (
              <div
                key={row.id}
                className="min-w-0 break-inside-avoid border-t border-hairline py-7 mobile:py-6"
              >
                <h2
                  className={`text-[11.5px] font-bold uppercase tracking-kicker ${
                    row.accent ? 'text-butter-bronze' : 'text-espresso'
                  }`}
                >
                  {row.heading}
                </h2>
                {row.note ? (
                  <p className="mt-2 max-w-[38ch] font-sans text-[14px] leading-[1.5] text-taupe">
                    {row.note}
                  </p>
                ) : null}
                <ul className="mt-4 flex min-w-0 flex-col gap-[9px]">
                  {row.items.map((item) => (
                    <li
                      key={item}
                      className={`font-sans text-[17px] leading-[1.35] mobile:text-[16px] ${
                        row.accent ? 'text-butter-text' : 'text-espresso'
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="What this did not cover" className="wrap pt-9 mobile:pt-7">
        <p className="max-w-[62ch] font-sans text-[16px] leading-[1.6] text-taupe">
          {unknownsLine(result)}
        </p>
      </section>

      <section aria-label="Next" className="wrap pt-9 mobile:pt-7">
        <div className="flex flex-wrap items-center gap-8 border-t border-hairline pt-8">
          <Link
            href="/search"
            className="rounded-button bg-brown px-6 py-[13px] font-sans text-[15px] font-semibold text-cream hover:bg-wine"
          >
            Search homes
          </Link>
          <Link
            href="/tuesday-test"
            className="font-sans text-[15px] font-medium text-sage-olive underline underline-offset-4 hover:text-sage-deep"
          >
            Take it again
          </Link>
        </div>
      </section>
    </>
  )
}

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

  return (
    <>
      <header className="wrap pt-14 mobile:pt-10">
        <div className="border-b border-hairline pb-11 mobile:pb-8">
          <p className="eyebrow">your search hierarchy</p>
          <h1 className="mt-4 max-w-[18ch] font-mark text-[36px] font-semibold leading-[1] tracking-display text-espresso tablet:text-[32px] mobile:text-[27px]">
            {resultHeadline(result)}
          </h1>
          <div className="mt-7 flex max-w-measure flex-col gap-4">
            {interpret(result).map((line) => (
              <p key={line} className="font-sans text-[19px] leading-[1.5] text-warmgray mobile:text-[17px]">
                {line}
              </p>
            ))}
          </div>
        </div>
      </header>

      <section aria-label="Your hierarchy" className="wrap pt-12 mobile:pt-9">
        <div className="flex flex-col gap-10">
          {SHOWN.filter((state) => grouped[state].length > 0).map((state) => (
            <div key={state} className="border-t border-hairline pt-7">
              <h2 className="font-display text-sub leading-none text-espresso tablet:text-sub-tablet mobile:text-sub-mobile">
                {STATE_HEADINGS[state]}
              </h2>
              <p className="mt-3 max-w-measure font-sans text-[16px] leading-[1.5] text-taupe">
                {STATE_NOTES[state]}
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
                {grouped[state].map((entry) => (
                  <li
                    key={entry.attribute.id}
                    className="rounded-badge bg-paper px-[13px] py-[7px] font-sans text-[15px] font-medium text-espresso"
                  >
                    {entry.attribute.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {dayOne.length > 0 ? (
            <div className="border-t border-hairline pt-7">
              <h2 className="font-display text-sub leading-none text-espresso tablet:text-sub-tablet mobile:text-sub-mobile">
                Must work on arrival
              </h2>
              <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
                {dayOne.map((entry) => (
                  <li
                    key={entry.attribute.id}
                    className="rounded-badge bg-paper px-[13px] py-[7px] font-sans text-[15px] font-medium text-espresso"
                  >
                    {entry.attribute.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {layers.length > 0 ? (
            <div className="rounded-block bg-butter-field px-10 py-9 text-butter-text mobile:rounded-[16px] mobile:px-6 mobile:py-7">
              <h2 className="font-display text-sub leading-none tablet:text-sub-tablet mobile:text-sub-mobile">
                Make it yours
              </h2>
              <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
                {layers.map((layer) => (
                  <li
                    key={layer}
                    className="rounded-badge bg-butter-pale px-[13px] py-[7px] font-sans text-[15px] font-medium"
                  >
                    {layer}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-label="What this did not cover" className="wrap pt-10 mobile:pt-8">
        <p className="max-w-measure border-t border-hairline pt-7 font-sans text-[17px] leading-[1.55] text-warmgray">
          {unknownsLine(result)}
        </p>
      </section>

      <section aria-label="Start again" className="wrap pt-10 mobile:pt-8">
        <Link
          href="/tuesday-test"
          className="font-sans text-[15px] font-medium text-sage-olive underline underline-offset-4 hover:text-sage-deep"
        >
          Take it again
        </Link>
      </section>
    </>
  )
}

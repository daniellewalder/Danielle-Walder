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
  mapSummary,
  personalLayers,
  projectSummary,
  resultHeadline,
  unknownsLine,
} from '@/lib/tuesday/interpret'
import { byState, score } from '@/lib/tuesday/score'
import { showingChecks } from '@/lib/tuesday/showing'

/**
 * The result.
 *
 * Read in three seconds, then in three minutes. The headline and a trio of
 * summary blocks answer "what happened" before any prose; the reasoning, the
 * secondary findings and the showing checklist come after, for the reader who
 * wants them.
 *
 * COLOUR CARRIES THE HIERARCHY. Every finding sitting in the same white
 * rounded card made five conceptually different things read as five sections
 * of one memo. Each family now does a job: brown for the thing to protect,
 * because brown is the heaviest surface the system has; sage for the map,
 * which is the neighbourhood family; blue for project appetite, the family
 * the tools already use; butter for the layers you add yourself, which is the
 * quiz family and the lightest moment on the page.
 *
 * One family per block, never two, and cream between them.
 */
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
  const checks = showingChecks(result)
  const map = mapSummary(result)
  const protect = grouped.protect

  const secondary = [
    grouped.scrutinize.length > 0
      ? {
          id: 'scrutinize',
          heading: STATE_HEADINGS.scrutinize,
          note: STATE_NOTES.scrutinize,
          items: grouped.scrutinize.map((entry) => entry.attribute.label),
        }
      : null,
    grouped.flexibilityToTest.length > 0
      ? {
          id: 'flex',
          heading: STATE_HEADINGS.flexibilityToTest,
          note: STATE_NOTES.flexibilityToTest,
          items: grouped.flexibilityToTest.map((entry) => entry.attribute.label),
        }
      : null,
    dayOne.length > 0
      ? {
          id: 'dayOne',
          heading: 'Must work on arrival',
          note: 'You protected things that would be a real project to change, so they need to be right when you buy.',
          items: dayOne.map((entry) => entry.attribute.label),
        }
      : null,
  ].filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  return (
    <>
      <header className="bg-butter-field px-gutter pb-14 pt-16 text-butter-text tablet:px-gutter-tablet tablet:pb-11 tablet:pt-12 mobile:px-gutter-mobile mobile:pb-9 mobile:pt-10">
        <p className="text-[11.5px] font-bold uppercase tracking-attribution text-butter-bronze">
          your search hierarchy
        </p>
        <h1 className="mt-6 max-w-[16ch] font-mark text-[44px] font-semibold leading-[1] tracking-display tablet:text-[36px] mobile:text-[29px]">
          {resultHeadline(result)}
        </h1>
      </header>

      {/*
        The three-second answer. Asymmetric on purpose: what to protect is the
        finding, so it takes the large block, and the two that qualify it sit
        beside it.
      */}
      <section aria-label="The short version" className="wrap pt-10 mobile:pt-7">
        <div className="grid grid-cols-[1.3fr_0.85fr] grid-rows-[auto_auto] gap-5 tablet:grid-cols-1">
          <div className="row-span-2 flex min-w-0 flex-col rounded-block bg-brown px-10 py-9 text-onbrown mobile:rounded-[16px] mobile:px-6 mobile:py-7">
            <p className="text-[11.5px] font-bold uppercase tracking-label text-butter-field">
              Protect
            </p>
            {protect.length > 0 ? (
              <ul className="mt-6 flex flex-col gap-[14px]">
                {protect.map((entry) => (
                  <li
                    key={entry.attribute.id}
                    className="font-display text-[26px] leading-[1.15] mobile:text-[22px]"
                  >
                    {entry.attribute.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 max-w-[34ch] font-sans text-[17px] leading-[1.5] text-onbrown-body">
                Nothing came through strongly enough to call a must. That is worth knowing too — it
                usually means the houses themselves will decide it.
              </p>
            )}
          </div>

          {map ? (
            <div className="flex min-w-0 flex-col rounded-block bg-sage-field px-9 py-8 text-sage-deep mobile:rounded-[16px] mobile:px-6 mobile:py-6">
              <p className="text-[11.5px] font-bold uppercase tracking-label text-sage-olive">
                Your map
              </p>
              <p className="mt-4 max-w-[20ch] font-display text-[24px] leading-[1.2] mobile:text-[21px]">
                {map}
              </p>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-col rounded-block bg-blue-field px-9 py-8 text-blue-ink mobile:rounded-[16px] mobile:px-6 mobile:py-6">
            <p className="text-[11.5px] font-bold uppercase tracking-label text-blue-deep">
              Project appetite
            </p>
            <dl className="mt-4 flex flex-col gap-3">
              {projectSummary(result).map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-5">
                  <dt className="font-sans text-[15px] text-blue-deep">{row.label}</dt>
                  <dd className="font-display text-[22px] leading-none mobile:text-[20px]">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* The reasoning, for the reader who wants it. Cream, and given room. */}
      <section aria-label="What that means" className="wrap pt-14 mobile:pt-10">
        <div className="border-t border-hairline pt-8">
          <p className="text-[11.5px] font-bold uppercase tracking-kicker text-taupe">
            What that means
          </p>
          {/*
            Set as a standfirst rather than in a narrow column beside a label.
            A 58ch measure at 19px left most of the page empty to its right;
            larger type across a longer measure fills the width the way a lead
            paragraph in a feature does, and reads better besides.
          */}
          <div className="mt-6 flex max-w-[72ch] flex-col gap-5">
            {interpret(result).map((line) => (
              <p
                key={line}
                className="font-sans text-[21px] leading-[1.5] text-espresso tablet:text-[19px] mobile:text-[17.5px]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary findings. Rules and whitespace, no cards. */}
      {secondary.length > 0 ? (
        <section aria-label="The rest of it" className="wrap pt-12 mobile:pt-9">
          <div className="columns-3 gap-12 navstack:columns-2 tablet:columns-1">
            {secondary.map((row) => (
              <div
                key={row.id}
                className="min-w-0 break-inside-avoid border-t border-hairline py-7 mobile:py-6"
              >
                <h2 className="text-[11.5px] font-bold uppercase tracking-kicker text-espresso">
                  {row.heading}
                </h2>
                <p className="mt-2 max-w-[38ch] font-sans text-[14px] leading-[1.5] text-taupe">
                  {row.note}
                </p>
                <ul className="mt-4 flex flex-col gap-[9px]">
                  {row.items.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-[17px] leading-[1.35] text-espresso mobile:text-[16px]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {layers.length > 0 ? (
        <section aria-label="Make it yours" className="wrap pt-10 mobile:pt-8">
          <div className="rounded-block bg-butter-pale px-10 py-9 text-butter-text mobile:rounded-[16px] mobile:px-6 mobile:py-7">
            <p className="text-[11.5px] font-bold uppercase tracking-label text-butter-bronze">
              Make it yours
            </p>
            <ul className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              {layers.map((layer, index) => (
                <li key={layer} className="font-display text-[22px] leading-[1.25] mobile:text-[19px]">
                  {layer}
                  {index < layers.length - 1 ? (
                    <span aria-hidden="true" className="ml-4 text-butter-bronze">
                      ·
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/*
        The most useful part: the hierarchy turned into things to do at an
        actual house. Full-bleed blue, the family the tools already use.
      */}
      {checks.length > 0 ? (
        <section
          aria-labelledby="showing-checks"
          className="mt-14 bg-blue-mist px-gutter py-14 text-blue-ink tablet:mt-11 tablet:px-gutter-tablet tablet:py-11 mobile:mt-9 mobile:px-gutter-mobile mobile:py-9"
        >
          <h2
            id="showing-checks"
            className="font-mark text-[26px] font-semibold leading-[1.1] tracking-display mobile:text-[22px]"
          >
            At the showing, check this.
          </h2>
          <ol className="mt-8 grid grid-cols-2 gap-x-14 gap-y-6 tablet:grid-cols-1 tablet:gap-y-5">
            {checks.map((check, index) => (
              <li key={check} className="flex min-w-0 gap-5 border-t border-blue-steel pt-4">
                <span
                  aria-hidden="true"
                  className="font-sans text-[13px] tabular-nums text-blue-deep"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="max-w-[44ch] font-sans text-[17.5px] leading-[1.45] mobile:text-[16px]">
                  {check}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-label="Next" className="wrap pt-12 mobile:pt-9">
        <p className="max-w-[62ch] font-sans text-[16px] leading-[1.6] text-taupe">
          {unknownsLine(result)}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href="/search"
            className="rounded-button bg-brown px-7 py-[15px] font-sans text-[16px] font-semibold text-cream hover:bg-wine"
          >
            Search with this in mind &rarr;
          </Link>
          <Link
            href="/contact"
            className="rounded-button border-[1.5px] border-brown px-7 py-[13.5px] font-sans text-[16px] font-semibold text-brown hover:border-sage-olive hover:bg-sage-olive hover:text-cream"
          >
            Send Danielle my search brief
          </Link>
        </div>

        <Link
          href="/tuesday-test"
          className="mt-7 inline-flex font-sans text-[14px] text-taupe underline underline-offset-4 hover:text-wine"
        >
          Take it again
        </Link>
      </section>
    </>
  )
}

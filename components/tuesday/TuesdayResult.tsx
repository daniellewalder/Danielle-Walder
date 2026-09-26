'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { decodeAnswers } from '@/lib/tuesday/encode'
import {
  STATE_HEADINGS,
  STATE_NOTES,
  dayOneItems,
  mapSummary,
  personalLayers,
  projectSummary,
  resultHeadline,
  synthesis,
  unknownsLine,
} from '@/lib/tuesday/interpret'
import { byState, score } from '@/lib/tuesday/score'
import { showingChecks } from '@/lib/tuesday/showing'

/**
 * The result.
 *
 * NO IMAGE, deliberately. The only photography in the repo is the LA
 * editorial stock, which belongs to LA, Actually and would be decoration
 * here: it says nothing about this reader's answers. Typography and colour
 * carry the page instead.
 *
 * COLOUR CARRIES THE HIERARCHY, one existing family per block, cream between.
 * Brown for what to protect, because it is the heaviest surface the system
 * has. Sage for the map, the neighbourhood family. Blue for what you'll
 * change and for the showing checklist, the family the tools already use.
 * Butter for the layers you add yourself. The intro stays on cream so the
 * brown block is the first colour that lands, which is what makes it read as
 * the finding rather than as one panel among several.
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
            className="mt-8 inline-flex rounded-button bg-brown px-6 py-[13px] font-sans text-[15px] font-semibold text-cream hover:bg-wine mobile:w-full mobile:justify-center"
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

  const details = [
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
      <header className="wrap pb-11 pt-14 tablet:pb-9 mobile:pb-8 mobile:pt-10">
        <p className="eyebrow">your search hierarchy</p>
        <h1 className="mt-6 max-w-[16ch] font-mark text-[46px] font-semibold leading-[0.98] tracking-display text-espresso tablet:text-[38px] mobile:text-[30px]">
          {resultHeadline(result)}
        </h1>
        <div className="mt-7 flex max-w-[64ch] flex-col gap-3">
          {synthesis(result).map((line) => (
            <p
              key={line}
              className="font-sans text-[20px] leading-[1.5] text-warmgray tablet:text-[18px] mobile:text-[17px]"
            >
              {line}
            </p>
          ))}
        </div>
      </header>

      <section aria-label="The short version" className="wrap">
        <div className="grid grid-cols-[1.35fr_0.8fr] grid-rows-[auto_auto] gap-5 tablet:grid-cols-1 mobile:gap-4">
          <div className="row-span-2 flex min-w-0 flex-col rounded-block bg-brown px-9 py-8 text-onbrown mobile:rounded-[16px] mobile:px-6 mobile:py-7">
            <p className="text-[11.5px] font-bold uppercase tracking-label text-butter-field">
              Protect these
            </p>
            {protect.length > 0 ? (
              <ul className="mt-6 flex flex-col gap-3">
                {protect.map((entry) => (
                  <li
                    key={entry.attribute.id}
                    className="font-display text-[27px] leading-[1.14] tablet:text-[24px] mobile:text-[21px]"
                  >
                    {entry.attribute.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 max-w-[34ch] font-sans text-[17px] leading-[1.5] text-onbrown-body">
                Nothing came through strongly enough to call a must. That is worth knowing too. It
                usually means the houses themselves will settle it.
              </p>
            )}
          </div>

          {map ? (
            <div className="flex min-w-0 flex-col rounded-block bg-sage-field px-8 py-7 text-sage-deep mobile:rounded-[16px] mobile:px-6 mobile:py-6">
              <p className="text-[11.5px] font-bold uppercase tracking-label text-sage-olive">
                Your map
              </p>
              <p className="mt-4 max-w-[20ch] font-display text-[23px] leading-[1.2] mobile:text-[21px]">
                {map}
              </p>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-col rounded-block bg-blue-field px-8 py-7 text-blue-ink mobile:rounded-[16px] mobile:px-6 mobile:py-6">
            <p className="text-[11.5px] font-bold uppercase tracking-label text-blue-deep">
              What you&rsquo;ll change
            </p>
            <dl className="mt-4 flex flex-col gap-[10px]">
              {projectSummary(result).map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-5">
                  <dt className="font-sans text-[15px] text-blue-deep">{row.label}</dt>
                  <dd className="font-display text-[21px] leading-none">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/*
        The deeper hierarchy. Rules and whitespace rather than three identical
        cards, and the items are set well above the helper copy — the findings
        are what someone is here to read, not the explanation of the category.
      */}
      {details.length > 0 ? (
        <section aria-label="The rest of it" className="wrap pt-14 mobile:pt-11">
          <div className="grid grid-cols-3 gap-x-12 gap-y-10 tablet:grid-cols-2 mobile:grid-cols-1">
            {details.map((row) => (
              <div key={row.id} className="min-w-0 border-t border-espresso pt-5">
                <h2 className="text-[11.5px] font-bold uppercase tracking-kicker text-espresso">
                  {row.heading}
                </h2>
                <ul className="mt-5 flex flex-col gap-2">
                  {row.items.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-[19px] leading-[1.3] text-espresso mobile:text-[18px]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 max-w-[40ch] font-sans text-[14px] leading-[1.55] text-taupe">
                  {row.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {layers.length > 0 ? (
        <section aria-label="Make it yours" className="wrap pt-12 mobile:pt-10">
          <div className="rounded-block bg-butter-pale px-9 py-8 text-butter-text mobile:rounded-[16px] mobile:px-6 mobile:py-7">
            <div className="flex items-baseline gap-x-8 gap-y-3 tablet:flex-col">
              <p className="shrink-0 text-[11.5px] font-bold uppercase tracking-label text-butter-bronze">
                Make it yours
              </p>
              <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                {layers.map((layer, index) => (
                  <li key={layer} className="font-display text-[21px] leading-[1.3] mobile:text-[19px]">
                    {layer}
                    {index < layers.length - 1 ? (
                      <span aria-hidden="true" className="ml-5 text-butter-deep">
                        /
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {checks.length > 0 ? (
        <section
          aria-labelledby="showing-checks"
          className="mt-14 bg-blue-mist px-gutter py-14 text-blue-ink tablet:px-gutter-tablet tablet:py-12 mobile:mt-11 mobile:px-gutter-mobile mobile:py-10"
        >
          <h2
            id="showing-checks"
            className="font-mark text-[27px] font-semibold leading-[1.08] tracking-display mobile:text-[22px]"
          >
            At the showing, check this.
          </h2>
          <ol className="mt-9 grid grid-cols-2 gap-x-14 gap-y-7 tablet:grid-cols-1 tablet:gap-y-6">
            {checks.map((check, index) => (
              <li key={check} className="flex min-w-0 gap-5 border-t border-blue-steel pt-4">
                <span aria-hidden="true" className="font-sans text-[13px] tabular-nums text-blue-deep">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="max-w-[46ch] font-sans text-[18px] leading-[1.45] mobile:text-[16.5px]">
                  {check}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-10 font-sans text-[15px] italic text-blue-deep mobile:mt-8">
            {unknownsLine(result)}
          </p>
        </section>
      ) : null}

      <section aria-labelledby="next-step" className="wrap pt-14 mobile:pt-11">
        <div className="border-t border-hairline pt-9 mobile:pt-8">
          <p className="eyebrow">ready to see what actually fits?</p>
          <p
            id="next-step"
            className="mt-5 max-w-[16ch] font-mark text-[34px] font-semibold leading-[1.02] tracking-display text-espresso tablet:text-[30px] mobile:text-[25px]"
          >
            Search with this in mind.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 mobile:flex-col mobile:items-stretch">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-button bg-brown px-7 py-[15px] font-sans text-[16px] font-semibold text-cream hover:bg-wine"
            >
              Search homes
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-button border-[1.5px] border-brown px-7 py-[13.5px] font-sans text-[16px] font-semibold text-brown hover:border-sage-olive hover:bg-sage-olive hover:text-cream"
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
        </div>
      </section>
    </>
  )
}

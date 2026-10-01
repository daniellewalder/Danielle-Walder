'use client'

import { useCallback, useMemo, useState } from 'react'
import { tuesdayV2 } from '@/lib/content/tuesdayV2'
import { assembleBrief } from '@/lib/tuesday/v2/brief'
import { isEmptyHandoff, type Handoff } from '@/lib/tuesday/v2/handoff'
import { buildMailto, briefBlocks, asText, clipboardBrief } from '@/lib/tuesday/v2/handoffBrief'
import { compose } from '@/lib/tuesday/v2/render'
import type { Result } from '@/lib/tuesday/v2/score'
import { strategyFor } from '@/lib/tuesday/v2/strategy'
import { Chips, Group, Text } from './HandoffFields'

/**
 * The handoff.
 *
 * THE SEARCH DETAILS NEVER TOUCH THE URL. They live in component state and
 * nowhere else, so a buyer can send someone their Tuesday Test result without
 * also sending their budget, the school boundary they asked for, or where they
 * drive on a Tuesday. The address bar carries the frozen quiz payload and that
 * is all it ever carries.
 *
 * NOTHING IS SUBMITTED. There is no backend and inventing one is not an
 * option, so the action composes an email in the buyer's own mail client. The
 * wording says so: the button opens an email, and nothing claims to have been
 * sent, because nothing has been.
 *
 * ONE SOURCE. The preview, the clipboard and the email all read the same
 * blocks from `handoffBrief`, which reads the frozen renderer. They cannot
 * disagree about what this search is.
 */

const RESULT_URL = () => (typeof window === 'undefined' ? '' : window.location.href)

const digits = (value: string) => value.replace(/[^\d]/g, '')
const asMoney = (value: number | undefined) => (value === undefined ? '' : value.toLocaleString('en-US'))
const toNumber = (value: string): number | undefined => {
  const clean = digits(value)
  return clean === '' ? undefined : Number(clean)
}
const toLines = (value: string): string[] =>
  value.split('\n').map((line) => line.trim()).filter(Boolean)

/*
 * A chip's value is a string until it is checked against the frozen union.
 * Anything unrecognised becomes undefined rather than being forced through,
 * so the handoff can never carry a value the model does not know.
 */
const TIMING = ['casual', 'thisYear', 'active', 'specific'] as const
const REQUIREMENT = ['required', 'preferred', 'noPreference'] as const
const STAIRS = ['stepFreeNeeded', 'preferMinimal', 'noPreference'] as const
const POOL = ['required', 'no', 'noPreference'] as const

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined => (value !== undefined && (allowed as readonly string[]).includes(value) ? (value as T) : undefined)

/** Drops empty branches so `isEmptyHandoff` stays meaningful. */
const prune = (handoff: Handoff): Handoff => {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(handoff)) {
    if (value === undefined || value === '') continue
    if (Array.isArray(value)) {
      if (value.length > 0) out[key] = value
      continue
    }
    if (typeof value === 'object' && value !== null) {
      const inner = Object.fromEntries(
        Object.entries(value).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)),
      )
      if (Object.keys(inner).length > 0) out[key] = inner
      continue
    }
    out[key] = value
  }
  return out as Handoff
}

type Copied = 'idle' | 'brief' | 'link' | 'failed'

export function HandoffFlow({ result }: { result: Result }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<Copied>('idle')
  const [tooLong, setTooLong] = useState(false)

  // Raw strings, so a half-typed number is not thrown away on every keystroke.
  const [price, setPrice] = useState({ min: '', max: '', ceiling: '' })
  const [timing, setTiming] = useState<string | undefined>(undefined)
  const [timingNote, setTimingNote] = useState('')
  const [considering, setConsidering] = useState('')
  const [ruledOut, setRuledOut] = useState('')
  const [mapNote, setMapNote] = useState('')
  const [school, setSchool] = useState('')
  const [destinations, setDestinations] = useState('')
  const [types, setTypes] = useState('')
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [sqft, setSqft] = useState('')
  const [parking, setParking] = useState<string | undefined>(undefined)
  const [stairs, setStairs] = useState<string | undefined>(undefined)
  const [pool, setPool] = useState<string | undefined>(undefined)
  const [ev, setEv] = useState<string | undefined>(undefined)
  const [other, setOther] = useState('')
  const [note, setNote] = useState('')

  const handoff: Handoff = useMemo(
    () =>
      prune({
        price: {
          targetMin: toNumber(price.min),
          targetMax: toNumber(price.max),
          hardCeiling: toNumber(price.ceiling),
        },
        timing: {
          posture: oneOf(timing, TIMING),
          note: timingNote.trim() || undefined,
        },
        geography: {
          considering: toLines(considering),
          ruledOut: toLines(ruledOut),
          note: mapNote.trim() || undefined,
        },
        schoolBoundary: school.trim() || undefined,
        destinations: toLines(destinations),
        propertyBasics: {
          types: toLines(types),
          minBeds: toNumber(beds),
          minBaths: toNumber(baths),
          minSqft: toNumber(sqft),
        },
        hardFilters: {
          parking: oneOf(parking, REQUIREMENT),
          stairs: oneOf(stairs, STAIRS),
          pool: oneOf(pool, POOL),
          ev: oneOf(ev, REQUIREMENT),
          other: toLines(other),
        },
        buyerNote: note.trim() || undefined,
      }),
    [price, timing, timingNote, considering, ruledOut, mapNote, school, destinations,
      types, beds, baths, sqft, parking, stairs, pool, ev, other, note],
  )

  /*
   * THE HANDOFF NEVER RESCORES THE TEST. `result` is the frozen reading of the
   * quiz payload and is not recomputed here; the search facts reach the brief
   * as facts and change nothing about the evidence behind it.
   */
  const brief = useMemo(
    () => assembleBrief(result, strategyFor(result), isEmptyHandoff(handoff) ? undefined : handoff),
    [result, handoff],
  )

  const announce = useCallback((state: Copied) => {
    setCopied(state)
    window.setTimeout(() => setCopied('idle'), 4000)
  }, [])

  const copyText = useCallback(
    async (text: string, state: Copied) => {
      try {
        await navigator.clipboard.writeText(text)
        announce(state)
      } catch {
        announce('failed')
      }
    },
    [announce],
  )

  const copyBrief = useCallback(
    () => copyText(clipboardBrief(brief, RESULT_URL()), 'brief'),
    [brief, copyText],
  )

  const openEmail = useCallback(() => {
    const built = buildMailto(brief, RESULT_URL())
    if (built.kind === 'tooLong') {
      setTooLong(true)
      void copyText(built.body, 'brief')
      return
    }
    setTooLong(false)
    window.location.href = built.href
  }, [brief, copyText])

  const discrepancies = brief.discrepancies
  const h = tuesdayV2.result.handoff
  const cta = tuesdayV2.result.cta

  return (
    <section className="wrap mt-16 border-t border-hairline pt-11 mobile:mt-12">
      <h2 className="font-display text-[26px] leading-[1.2] text-espresso mobile:text-[22px]">
        {open ? h.heading : cta.heading}
      </h2>
      <p className="mt-4 max-w-measure font-sans text-[17px] leading-[1.5] text-warmgray">
        {open ? h.body : cta.body}
      </p>

      {/* A single live region, so a copy confirmation is heard as well as seen. */}
      <p role="status" aria-live="polite" className="sr-only">
        {copied === 'brief' ? cta.copied : copied === 'link' ? cta.linkCopied : copied === 'failed' ? cta.copyFailed : ''}
      </p>

      {open ? (
        <>
          <div className="mt-10 flex max-w-[760px] flex-col gap-9">
            <Group legend={h.price.legend} help={h.price.help}>
              <div className="grid grid-cols-3 gap-4 tablet:grid-cols-1">
                <Text id="price-min" label={h.price.min} prefix="$" inputMode="numeric"
                  value={asMoney(toNumber(price.min))}
                  onChange={(next) => setPrice((p) => ({ ...p, min: digits(next) }))} />
                <Text id="price-max" label={h.price.max} prefix="$" inputMode="numeric"
                  value={asMoney(toNumber(price.max))}
                  onChange={(next) => setPrice((p) => ({ ...p, max: digits(next) }))} />
                <Text id="price-ceiling" label={h.price.ceiling} prefix="$" inputMode="numeric"
                  value={asMoney(toNumber(price.ceiling))}
                  onChange={(next) => setPrice((p) => ({ ...p, ceiling: digits(next) }))} />
              </div>
            </Group>

            <Group legend={h.timing.legend}>
              <Chips name="timing" legend={h.timing.legend} options={h.timing.options}
                value={timing} onChange={setTiming} hideLegend />
              {timing === 'specific' ? (
                <div className="mt-5">
                  <Text id="timing-note" label={h.timing.note} value={timingNote} onChange={setTimingNote} />
                </div>
              ) : null}
            </Group>

            <Group legend={h.where.legend} help={h.where.help}>
              <div className="flex flex-col gap-5">
                <Text id="considering" label={h.where.considering} rows={3} value={considering} onChange={setConsidering} />
                <Text id="ruled-out" label={h.where.ruledOut} rows={2} value={ruledOut} onChange={setRuledOut} />
                <Text id="map-note" label={h.where.note} rows={2} value={mapNote} onChange={setMapNote} />
              </div>
            </Group>

            {/*
              The boundary only. Nothing here asks whether schools matter, what
              they are rated, or who they are for, and what is typed is carried
              through to the brief word for word.
            */}
            <Group legend={h.school.legend}>
              <Text id="school" label={h.school.field} help={h.school.help} value={school} onChange={setSchool} />
            </Group>

            {/* Recorded as written. The brief never asks or guesses why. */}
            <Group legend={h.destinations.legend}>
              <Text id="destinations" label={h.destinations.field} help={h.destinations.help}
                rows={3} value={destinations} onChange={setDestinations} />
            </Group>

            <Group legend={h.property.legend}>
              <div className="flex flex-col gap-5">
                <Text id="types" label={h.property.types} value={types} onChange={setTypes} />
                <div className="grid grid-cols-3 gap-4 tablet:grid-cols-1">
                  <Text id="beds" label={h.property.beds} inputMode="numeric" value={beds}
                    onChange={(next) => setBeds(digits(next))} />
                  <Text id="baths" label={h.property.baths} inputMode="numeric" value={baths}
                    onChange={(next) => setBaths(digits(next))} />
                  <Text id="sqft" label={h.property.sqft} inputMode="numeric"
                    value={asMoney(toNumber(sqft))} onChange={(next) => setSqft(digits(next))} />
                </div>
              </div>
            </Group>

            {/*
              Buyer-entered requirements, recorded as requirements. No field
              asks why, and nothing downstream infers a household, a health
              reason, an age or anything else from any of them.
            */}
            <Group legend={h.physical.legend}>
              <div className="flex flex-col gap-6">
                <Chips name="parking" legend={h.physical.parking} options={h.physical.requirement} value={parking} onChange={setParking} />
                <Chips name="stairs" legend={h.physical.stairs} options={h.physical.stairsOptions} value={stairs} onChange={setStairs} />
                <Chips name="pool" legend={h.physical.pool} options={h.physical.poolOptions} value={pool} onChange={setPool} />
                <Chips name="ev" legend={h.physical.ev} options={h.physical.requirement} value={ev} onChange={setEv} />
                <Text id="other" label={h.physical.other} rows={2} value={other} onChange={setOther} />
              </div>
            </Group>

            <Group legend={h.anythingElse.legend}>
              <Text id="note" label={h.anythingElse.field} rows={3} value={note} onChange={setNote} />
            </Group>
          </div>

          {discrepancies.length > 0 ? (
            <div className="mt-10 max-w-[760px] rounded-field bg-butter-pale px-7 py-6 text-butter-text mobile:px-5 mobile:py-5">
              <h3 className="text-[11.5px] font-bold uppercase tracking-label opacity-75">
                {h.clarify}
              </h3>
              {compose(brief)
                .sections.find((section) => section.id === 'clarify')
                ?.lines.map((line, index) => (
                  <p key={index} className="mt-3 font-sans text-[17px] leading-[1.5]">
                    {line.buyer}
                  </p>
                ))}
            </div>
          ) : null}

          {/* A short preview, not the whole brief again. */}
          <div className="mt-10 max-w-[760px] border-t border-hairline pt-7">
            <h3 className="text-[11.5px] font-bold uppercase tracking-label text-taupe">{h.preview}</h3>
            <pre className="mt-5 max-h-[320px] overflow-auto whitespace-pre-wrap break-words font-sans text-[15.5px] leading-[1.55] text-warmgray">
              {asText(briefBlocks(brief, { resultUrl: RESULT_URL() }))}
            </pre>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <button type="button" onClick={openEmail} className={PRIMARY}>
              {h.open}
            </button>
            <button type="button" onClick={copyBrief} className={LINKY}>
              {copied === 'brief' ? cta.copied : cta.copy}
            </button>
            <button type="button" onClick={() => setOpen(false)} className={LINKY}>
              {h.back}
            </button>
          </div>
          <p className="mt-4 max-w-measure font-sans text-[14.5px] leading-[1.5] text-taupe">
            {tooLong ? h.tooLong : h.openNote}
          </p>
          {copied === 'failed' ? (
            <p className="mt-3 max-w-measure font-sans text-[14.5px] leading-[1.5] text-wine">
              {cta.copyFailed}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <button type="button" onClick={() => setOpen(true)} className={PRIMARY}>
              {cta.send}
            </button>
            <button type="button" onClick={copyBrief} className={SECONDARY}>
              {copied === 'brief' ? cta.copied : cta.copy}
            </button>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => copyText(RESULT_URL(), 'link')}
              className={LINKY}
            >
              {copied === 'link' ? cta.linkCopied : cta.copyLink}
            </button>
            <a href="/tuesday-test" className={LINKY}>
              {tuesdayV2.result.retake}
            </a>
          </div>
          {copied === 'failed' ? (
            <p className="mt-4 max-w-measure font-sans text-[14.5px] leading-[1.5] text-wine">
              {cta.copyFailed}
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}

const PRIMARY =
  'inline-flex items-center justify-center rounded-button bg-brown px-7 py-[15px] font-sans text-[16px] font-semibold text-cream hover:bg-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine mobile:min-h-[48px] mobile:w-full'
const SECONDARY =
  'inline-flex items-center justify-center rounded-button border-[1.5px] border-brown px-7 py-[13.5px] font-sans text-[16px] font-semibold text-brown hover:border-wine hover:text-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine mobile:min-h-[48px] mobile:w-full'
const LINKY =
  'rounded-button px-1 py-2 font-sans text-[15px] font-medium text-warmgray underline underline-offset-4 hover:text-brown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine mobile:min-h-[44px]'

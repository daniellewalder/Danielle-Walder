'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { tuesdayV2 } from '@/lib/content/tuesdayV2'
import { attributeById } from '@/lib/tuesday/v2/model'
import { decode, encode } from '@/lib/tuesday/v2/encode'
import { MAP } from '@/lib/tuesday/v2/tradeoff'
import { picksFor, type V2Answers } from '@/lib/tuesday/v2/answers'
import {
  EXCLUSIVE, answerQuestion, nextStep, positionOf, previousStep, qualifierNeeds,
  questionById, setQualifier, setTradeoff, stepFromKey, stepKey, togglePick, tradeoffFor,
  type BundledQuestion, type Step,
} from '@/lib/tuesday/v2/flow'

/**
 * The V2 Tuesday Test.
 *
 * THE URL IS THE STATE, as in V1: every answer is pushed into the address bar,
 * so the browser back button steps back with the previous answer still
 * selected, a refresh loses nothing, and the finished test is a link.
 *
 * THE ENGINE IS THE CONTROLLER. This component never decides what comes next,
 * whether a follow-up applies or which two things the forced choice weighs. It
 * asks `lib/tuesday/v2/flow`, which asks the frozen model. Every write goes
 * through the adapter, so changing an earlier answer always runs the
 * downstream cleanup and no screen can leave a stale answer behind.
 *
 * NO DENOMINATOR. The path genuinely changes length: a bundled selection adds
 * a "which part" screen and the project answer can add a follow-up. "Question
 * 5 of 8" would be a promise the route cannot keep, and a denominator that
 * moves while you are reading it is worse than none.
 *
 * Options are real radios and checkboxes with the whole card as the label, so
 * the card is clickable, arrow keys move within a group, and the selected
 * state is carried by the input rather than by a class to keep in sync.
 */

const CARD =
  'flex w-full cursor-pointer items-start gap-4 rounded-button px-[26px] py-[19px] font-sans text-[16.5px] font-medium leading-[1.45] transition-colors mobile:min-h-[52px] mobile:px-5 mobile:py-4 mobile:text-[16px]'
const RESTING = 'bg-cream text-brown hover:bg-paper'
const CHOSEN = 'bg-butter-field text-brown'
// The site ring is wine, which is close to invisible on brown. Butter is the
// quiz family's own light tone and is the readable ring on this field.
const FOCUS =
  'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-butter-field'

/** The label for one side of the forced choice. */
const sideLabel = (concept: string): string => {
  if (concept === MAP) return tuesdayV2.mapSide
  const attribute = attributeById(concept)
  if (!attribute) return concept
  const phrase = attribute.phrase ?? attribute.label
  return phrase.charAt(0).toUpperCase() + phrase.slice(1)
}

export function TuesdayTestV2() {
  const router = useRouter()
  const params = useSearchParams()

  const answers = useMemo(() => decode(params.get('a')).answers, [params])

  /*
   * Which screen to show. A `q` in the URL wins so the back button lands on
   * the question it left, but only when that screen is still reachable: going
   * back and changing an answer can remove the screen you were on.
   */
  const step: Step = useMemo(() => {
    const requested = stepFromKey(params.get('q'))
    const due = nextStep(answers)
    if (!requested) return due ?? { kind: 'question', id: 'tuesday' }
    return requested
  }, [params, answers])

  const go = useCallback(
    (updated: V2Answers, destination: Step | null, mode: 'replace' | 'push') => {
      const query = `a=${encode(updated)}`
      const href = destination
        ? `/tuesday-test?${query}&q=${stepKey(destination)}`
        : `/tuesday-test/result?${query}`
      if (mode === 'push') router.push(href)
      else router.replace(href, { scroll: false })
    },
    [router],
  )

  /** Records an answer in place. No navigation, so a choice can be undone. */
  const record = useCallback(
    (updated: V2Answers) => go(updated, step, 'replace'),
    [go, step],
  )

  const advance = useCallback(() => {
    go(answers, nextStep(answers), 'push')
  }, [answers, go])

  /*
   * Back steps through the PATH with the current answers, not through history.
   * A history entry carries the payload as it was when that screen was last
   * touched, so `router.back()` would throw away everything answered since and
   * make going back to fix one word cost the rest of the test.
   */
  const previous = previousStep(answers, step)
  const goBack = previous ? () => go(answers, previous, 'push') : undefined

  const position = positionOf(answers, step)

  if (step.kind === 'qualifier') {
    return (
      <Shell
        kicker={tuesdayV2.qualifier.kicker}
        position={position}
        prompt={
          qualifierNeeds(answers, step.question).length > 1
            ? tuesdayV2.qualifier.many
            : tuesdayV2.qualifier.one
        }
      >
        <QualifierScreen
          answers={answers}
          question={step.question}
          onPick={(option, qualifier) =>
            record(setQualifier(answers, step.question, option, qualifier))
          }
          onContinue={advance}
          onBack={goBack}
        />
      </Shell>
    )
  }

  if (step.kind === 'tradeoff') {
    const pair = tradeoffFor(answers)
    const chosen = answers.tradeoff?.winner
    const asked = answers.tradeoff?.pair
    const sameQuestion = asked?.[0] === pair.pair[0] && asked?.[1] === pair.pair[1]
    return (
      <Shell
        kicker={tuesdayV2.tradeoff.kicker}
        position={position}
        prompt={tuesdayV2.tradeoff.prompt}
        help={tuesdayV2.tradeoff.note}
      >
        <Choices
          name="tradeoff"
          legend={tuesdayV2.tradeoff.prompt}
          options={[
            ...pair.pair.map((concept) => ({ id: concept, label: sideLabel(concept) })),
            { id: '', label: tuesdayV2.tradeoff.decline },
          ]}
          chosenIds={sameQuestion ? [chosen ?? ''] : []}
          onPick={(id) => record(setTradeoff(answers, pair.pair, id === '' ? null : id, pair.family))}
        />
        <Actions
          onContinue={advance}
          disabled={!sameQuestion || answers.tradeoff === undefined}
          onBack={goBack}
          last={nextStep(answers) === null}
        />
      </Shell>
    )
  }

  const question = questionById(step.id)
  if (!question) return null
  const bundled = step.id === 'dealbreaker' || step.id === 'daily'

  if (bundled) {
    const field = step.id as BundledQuestion
    const picks = picksFor(answers, field)
    const copy = tuesdayV2.ordered[field]
    return (
      <Shell
        kicker={question.kicker}
        position={position}
        prompt={question.prompt}
        help={copy.help}
      >
        <fieldset className="max-w-[720px]">
          <legend className="sr-only">{question.prompt}</legend>
          <div className="flex flex-col gap-3">
            {question.options.map((option) => {
              const rank = picks.findIndex((pick) => pick.option === option.id)
              const isChosen = rank !== -1
              const full = picks.length >= 2 && !isChosen && option.id !== EXCLUSIVE[field]
              return (
                <label key={option.id} className="block">
                  <input
                    type="checkbox"
                    name={field}
                    value={option.id}
                    checked={isChosen}
                    /*
                      Two already chosen, so the rest are genuinely not
                      available until one is let go. Disabling says so to the
                      pointer and to assistive tech; dimming alone would leave
                      a card that looks interactive and does nothing.
                    */
                    disabled={full}
                    aria-describedby={isChosen ? `${field}-${option.id}-rank` : undefined}
                    onChange={() => record(togglePick(answers, field, option.id, EXCLUSIVE[field]))}
                    className="peer sr-only"
                  />
                  <span
                    className={`${CARD} ${isChosen ? CHOSEN : RESTING} ${FOCUS} ${
                      full ? 'cursor-not-allowed opacity-75' : ''
                    }`}
                  >
                    {/*
                      The rank badge is the same shape and weight for both, so
                      nothing implies the second choice is the weaker one. On
                      the daily question it genuinely is weighted lower, and
                      the help text above says so in words rather than through
                      a smaller chip.
                    */}
                    <span
                      aria-hidden="true"
                      className={`mt-[1px] grid h-[21px] w-[21px] shrink-0 place-items-center rounded-badge border-[1.5px] font-sans text-[12px] font-bold tabular-nums ${
                        isChosen ? 'border-brown bg-brown text-cream' : 'border-taupe'
                      }`}
                    >
                      {isChosen ? rank + 1 : ''}
                    </span>
                    <span>{option.label}</span>
                  </span>
                  {isChosen ? (
                    <span id={`${field}-${option.id}-rank`} className="sr-only">
                      {copy.announce[rank] ?? copy.announce[1]}
                    </span>
                  ) : null}
                </label>
              )
            })}
          </div>
        </fieldset>
        <Actions
          onContinue={advance}
          disabled={picks.length === 0}
          onBack={goBack}
          last={false}
        />
      </Shell>
    )
  }

  const chosen = (answers as unknown as Record<string, string | undefined>)[step.id]
  // Whether answering this one finishes the test, asked of the engine rather
  // than counted off a list.
  const finishes = Boolean(chosen) && nextStep(answerQuestion(answers, step.id, chosen!)) === null
  return (
    <Shell kicker={question.kicker} position={position} prompt={question.prompt}>
      <Choices
        name={question.id}
        legend={question.prompt}
        options={question.options.map((option) => ({ id: option.id, label: option.label }))}
        chosenIds={chosen ? [chosen] : []}
        onPick={(id) => record(answerQuestion(answers, question.id, id))}
      />
      <Actions
        onContinue={advance}
        disabled={!chosen}
        onBack={goBack}
        last={finishes}
      />
    </Shell>
  )
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function Shell({
  kicker, position, prompt, help, children,
}: {
  kicker: string
  position: number
  prompt: string
  help?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby="question" className="wrap pt-12 mobile:pt-8">
      <div className="rounded-block bg-brown px-12 py-14 text-onbrown mobile:rounded-[16px] mobile:px-6 mobile:py-9">
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-x-16 tablet:grid-cols-1 tablet:gap-y-8">
          <div>
            <div className="flex items-baseline justify-between gap-6">
              <p className="text-[11.5px] font-bold uppercase tracking-label text-onbrown-label">
                {kicker}
              </p>
              {/*
                A position and no total. The route's length depends on the
                answers, so a denominator here would be a number we would have
                to go back and correct.
              */}
              <p className="font-sans text-[13px] tabular-nums text-onbrown-fine tablet:hidden">
                Question {String(position + 1).padStart(2, '0')}
              </p>
            </div>

            <h2
              id="question"
              className="mt-5 font-display text-[34px] leading-[1.18] tablet:max-w-[720px] mobile:text-[24px]"
            >
              {prompt}
            </h2>

            {help ? (
              <p className="mt-3 max-w-[460px] font-sans text-[15px] leading-[1.5] text-onbrown-body">
                {help}
              </p>
            ) : null}

            <p className="mt-5 hidden font-sans text-[13px] tabular-nums text-onbrown-fine tablet:block">
              Question {String(position + 1).padStart(2, '0')}
            </p>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </section>
  )
}

function Choices({
  name, legend, options, chosenIds, onPick,
}: {
  name: string
  legend: string
  options: readonly { id: string; label: string }[]
  chosenIds: readonly string[]
  onPick: (id: string) => void
}) {
  return (
    <fieldset className="max-w-[720px]">
      <legend className="sr-only">{legend}</legend>
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isChosen = chosenIds.includes(option.id)
          return (
            <label key={option.id || 'decline'} className="block">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={isChosen}
                onChange={() => onPick(option.id)}
                className="peer sr-only"
              />
              <span className={`${CARD} ${isChosen ? CHOSEN : RESTING} ${FOCUS}`}>
                <span
                  aria-hidden="true"
                  className={`mt-[3px] block h-[15px] w-[15px] shrink-0 rounded-full border-[1.5px] ${
                    isChosen ? 'border-brown bg-brown' : 'border-taupe'
                  }`}
                />
                <span>{option.label}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function QualifierScreen({
  answers, question, onPick, onContinue, onBack,
}: {
  answers: V2Answers
  question: BundledQuestion
  onPick: (option: string, qualifier: string) => void
  onContinue: () => void
  onBack?: () => void
}) {
  const needs = qualifierNeeds(answers, question)
  return (
    <>
      <div className="flex flex-col gap-10">
        {needs.map((need) => (
          <div key={need.option}>
            <p className="font-sans text-[15px] font-semibold leading-[1.4] text-onbrown">
              {need.label}
            </p>
            <fieldset className="mt-4 max-w-[720px]">
              <legend className="sr-only">{need.label}</legend>
              <div className="flex flex-col gap-2.5">
                {need.choices.map((choice) => {
                  const isChosen = need.chosen === choice.id
                  return (
                    <label key={choice.id} className="block">
                      <input
                        type="radio"
                        name={`${question}-${need.option}`}
                        value={choice.id}
                        checked={isChosen}
                        onChange={() => onPick(need.option, choice.id)}
                        className="peer sr-only"
                      />
                      {/*
                        Lighter than a question card on purpose. This is "which
                        part", not another scored round, and it should not read
                        as one.
                      */}
                      <span
                        className={`flex w-full cursor-pointer items-start gap-3 rounded-input px-5 py-[13px] font-sans text-[15.5px] leading-[1.45] transition-colors mobile:min-h-[48px] mobile:text-[16px] ${
                          isChosen ? 'bg-butter-field text-brown' : 'bg-cream text-brown hover:bg-paper'
                        } ${FOCUS}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-[3px] block h-[13px] w-[13px] shrink-0 rounded-full border-[1.5px] ${
                            isChosen ? 'border-brown bg-brown' : 'border-taupe'
                          }`}
                        />
                        <span>{choice.label}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </div>
        ))}
      </div>
      <Actions
        onContinue={onContinue}
        disabled={needs.some((need) => need.chosen === null)}
        onBack={onBack}
        last={false}
      />
    </>
  )
}

function Actions({
  onContinue, disabled, onBack, last,
}: {
  onContinue: () => void
  disabled: boolean
  onBack?: () => void
  last: boolean
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-7">
      <button
        type="button"
        onClick={onContinue}
        disabled={disabled}
        className={
          disabled
            ? 'cursor-not-allowed rounded-button border border-dashed border-onbrown-rule px-6 py-[13px] font-sans text-[15px] font-semibold text-onbrown-fine mobile:min-h-[44px]'
            : 'rounded-button bg-butter-field px-6 py-[13px] font-sans text-[15px] font-semibold text-brown hover:bg-butter-deep mobile:min-h-[44px]'
        }
      >
        {last ? 'See the result' : 'Continue'}
      </button>

      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-button px-1 py-2 font-sans text-[15px] font-medium text-onbrown-body underline underline-offset-4 hover:text-onbrown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-butter-field mobile:min-h-[44px]"
        >
          Back
        </button>
      ) : null}
    </div>
  )
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { decodeAnswers, encodeAnswers } from "@/lib/tuesday/encode";
import {
  BASE_QUESTIONS,
  QUESTIONS,
  questionById,
} from "@/lib/tuesday/questions";
import { nextQuestion, score, type Answers } from "@/lib/tuesday/score";

/**
 * The Tuesday Test interaction.
 *
 * THE URL IS THE STATE. Every answer is pushed into the address bar, so the
 * browser back button steps back through the questions with the previous
 * answer still selected, a refresh loses nothing, and the finished test is a
 * link that can be shared or sent to Danielle. No local state to fall out of
 * sync, and no result that exists only in one tab's memory.
 *
 * Options are real radio and checkbox inputs with the whole card as the label,
 * so the entire card is clickable, arrow keys move within a group, space and
 * enter select, and the selected state is carried by the input rather than by
 * a class someone has to remember to keep in sync.
 *
 * EVERY QUESTION HAS A CONTINUE, including the single-choice ones. Advancing
 * on selection reads well with a mouse and is broken with a keyboard: arrow
 * keys move within a radio group by CHANGING the selection, so the first
 * arrow press would commit the reader to the second option and navigate away
 * before they had read the rest. A Continue also means choosing can be undone
 * on the spot rather than only by going back.
 *
 * Selecting REPLACES the current history entry, and Continue PUSHES the next
 * one. That is what makes the browser back button land on the previous
 * question with its answer still selected, rather than on the version of that
 * question from before it was answered.
 */
export function TuesdayTest() {
  const router = useRouter();
  const params = useSearchParams();

  const answers = useMemo(() => decodeAnswers(params.get("a")), [params]);

  const current = useMemo(() => {
    const requested = params.get("q");
    if (requested && questionById(requested)) return requested;
    return nextQuestion(answers) ?? QUESTIONS[0].id;
  }, [params, answers]);

  const question = questionById(current) ?? QUESTIONS[0];
  const multiple = (question.choose ?? 1) > 1;

  /** The sequence this reader will actually see, for honest progress. */
  const sequence = useMemo(() => {
    const ids = BASE_QUESTIONS.map((entry) => entry.id);
    return score(answers).needsClarification ? [...ids, "clarify"] : ids;
  }, [answers]);

  const position = Math.max(0, sequence.indexOf(question.id));
  const chosen = useMemo(() => {
    const raw = answers[question.id];
    if (!raw) return [];
    return Array.isArray(raw) ? [...raw] : [raw];
  }, [answers, question.id]);

  /** Records the answer in place. No navigation — see the header. */
  const select = useCallback(
    (optionId: string) => {
      let updated: Answers;

      if (!multiple) {
        updated = { ...answers, [question.id]: optionId };
      } else {
        const already = chosen.includes(optionId);
        const picks = already
          ? chosen.filter((entry) => entry !== optionId)
          : [...chosen, optionId].slice(-(question.choose ?? 1));
        updated = { ...answers, [question.id]: picks };
      }

      router.replace(
        `/tuesday-test?a=${encodeAnswers(updated)}&q=${question.id}`,
        {
          scroll: false,
        },
      );
    },
    [answers, chosen, multiple, question.choose, question.id, router],
  );

  const advance = useCallback(() => {
    const encoded = encodeAnswers(answers);
    const destination = nextQuestion(answers);
    router.push(
      destination
        ? `/tuesday-test?a=${encoded}&q=${destination}`
        : `/tuesday-test/result?a=${encoded}`,
    );
  }, [answers, router]);

  const cardBase =
    "flex w-full cursor-pointer items-start gap-4 rounded-button px-[26px] py-[19px] font-sans text-[16.5px] font-medium leading-[1.45] transition-colors mobile:px-5 mobile:py-4 mobile:text-[16px]";
  const cardResting = "bg-cream text-brown hover:bg-paper";
  const cardChosen = "bg-butter-field text-brown";
  // The site ring is wine, which is close to invisible on brown. Butter is the
  // quiz family's own light tone and is the readable ring on this field.
  const cardFocus =
    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-butter-field";

  return (
    <section aria-labelledby="question" className="wrap pt-12 mobile:pt-8">
      <div className="rounded-block bg-brown px-12 py-14 text-onbrown mobile:rounded-[16px] mobile:px-6 mobile:py-9">
        {/*
          Split at desktop: the question holds the left column and the choices
          the right. Single-column left 400px of empty brown beside a 720px
          stack, which is dead space rather than breathing room.
        */}
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-x-16 tablet:grid-cols-1 tablet:gap-y-8">
          <div>
            <div className="flex items-baseline justify-between gap-6">
              <p className="text-[11.5px] font-bold uppercase tracking-label text-onbrown-label">
                {question.kicker}
              </p>
              <p className="font-sans text-[13px] tabular-nums text-onbrown-fine tablet:hidden">
                {String(position + 1).padStart(2, "0")} /{" "}
                {String(sequence.length).padStart(2, "0")}
              </p>
            </div>

            <h2
              id="question"
              className="mt-5 font-display text-[34px] leading-[1.18] tablet:max-w-[720px] mobile:text-[24px]"
            >
              {question.prompt}
            </h2>

            {multiple ? (
              <p className="mt-3 font-sans text-[15px] text-onbrown-body">
                Choose up to {question.choose}.
              </p>
            ) : null}

            <p className="mt-5 hidden font-sans text-[13px] tabular-nums text-onbrown-fine tablet:block">
              {String(position + 1).padStart(2, "0")} /{" "}
              {String(sequence.length).padStart(2, "0")}
            </p>
          </div>

          <div>
            <fieldset className="max-w-[720px]">
              <legend className="sr-only">{question.prompt}</legend>
              <div className="flex flex-col gap-3">
                {question.options.map((option) => {
                  const isChosen = chosen.includes(option.id);
                  return (
                    <label key={option.id} className="block">
                      <input
                        type={multiple ? "checkbox" : "radio"}
                        name={question.id}
                        value={option.id}
                        checked={isChosen}
                        onChange={() => select(option.id)}
                        className="peer sr-only"
                      />
                      <span
                        className={`${cardBase} ${isChosen ? cardChosen : cardResting} ${cardFocus}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-[3px] block h-[15px] w-[15px] shrink-0 ${
                            multiple ? "rounded-[3px]" : "rounded-full"
                          } border-[1.5px] ${
                            isChosen ? "border-brown bg-brown" : "border-taupe"
                          }`}
                        />
                        <span>{option.label}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8 flex flex-wrap items-center gap-7">
              <button
                type="button"
                onClick={advance}
                disabled={chosen.length === 0}
                className={
                  chosen.length === 0
                    ? "cursor-not-allowed rounded-button border border-dashed border-onbrown-rule px-6 py-[13px] font-sans text-[15px] font-semibold text-onbrown-fine"
                    : "rounded-button bg-butter-field px-6 py-[13px] font-sans text-[15px] font-semibold text-brown hover:bg-butter-deep"
                }
              >
                {position + 1 === sequence.length
                  ? "See the result"
                  : "Continue"}
              </button>

              {position > 0 ? (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="font-sans text-[15px] font-medium text-onbrown-body underline underline-offset-4 hover:text-onbrown"
                >
                  Back
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

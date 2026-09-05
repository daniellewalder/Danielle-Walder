'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { homepageQuiz } from '@/lib/content/home'

/**
 * The one full-bleed dark section in the page body. Brown field, butter badge,
 * blue answer A.
 *
 * This block is the entry point, not the whole quiz: picking an answer carries
 * it into the quiz flow at /quizzes/[slug], where the remaining questions and
 * the result screen with its email capture live. Quiz state is client-side
 * only; nothing needs to persist.
 */
export function QuizSection() {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const question = homepageQuiz.questions[0]

  function onAnswer(answerId: string) {
    setPending(answerId)
    router.push(`/quizzes/${homepageQuiz.slug}?${question.id}=${answerId}`)
  }

  return (
    <section
      aria-labelledby="quiz"
      className="mt-[88px] grid grid-cols-2 items-center gap-14 bg-brown px-gutter py-20 text-onbrown tablet:grid-cols-1 tablet:gap-8 tablet:px-gutter-tablet mobile:mt-16 mobile:gap-8 mobile:px-gutter-mobile mobile:py-14"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <span className="self-start rounded-badge bg-butter-field px-[13px] py-[7px] text-[11.5px] font-bold uppercase tracking-label text-brown">
          quiz &middot; {homepageQuiz.questions.length} questions
        </span>
        <h2
          id="quiz"
          className="font-mark text-[54px] font-semibold leading-[0.94] tracking-display tablet:text-[44px] mobile:text-[34px]"
        >
          {homepageQuiz.title}
        </h2>
        <p className="max-w-quiz-intro font-sans text-[17.5px] leading-[1.5] text-onbrown-body">
          {homepageQuiz.intro}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <span
          id={`${question.id}-label`}
          className="text-[11.5px] font-bold uppercase tracking-label text-onbrown-label"
        >
          {question.label}
        </span>
        <div role="group" aria-labelledby={`${question.id}-label`} className="flex flex-col gap-3">
          {question.answers.map((answer, index) => (
            <button
              key={answer.id}
              type="button"
              disabled={pending !== null}
              onClick={() => onAnswer(answer.id)}
              className={`rounded-button px-[26px] py-[19px] text-left font-sans text-[18px] font-medium hover:bg-butter-field hover:text-brown ${
                index === 0 ? 'bg-blue-field text-blue-ink' : 'bg-cream text-brown'
              }`}
            >
              {answer.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

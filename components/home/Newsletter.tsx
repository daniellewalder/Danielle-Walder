'use client'

import { useState, type FormEvent } from 'react'
import { newsletter } from '@/lib/content/home'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.checkValidity()) {
      setError(newsletter.invalid)
      return
    }

    setState('submitting')
    setError(null)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error(`Signup failed: ${response.status}`)

      setState('success')
    } catch {
      setState('error')
      setError(newsletter.failure)
    }
  }

  return (
    <section aria-labelledby="newsletter" className="wrap">
      <div className="grid grid-cols-[1.1fr_1fr] items-end gap-[46px] border-t border-hairline pt-11 tablet:grid-cols-1 tablet:gap-6">
        {/* The mixed-typeface headline is intentional. Keep it. */}
        <h2
          id="newsletter"
          className="font-mark text-[44px] font-semibold leading-[0.98] tracking-display text-espresso tablet:text-[36px] mobile:text-[28px]"
        >
          {newsletter.headlineMark}{' '}
          <span className="font-serif font-normal tracking-[-0.01em] text-wine">
            {newsletter.headlineSerif}
          </span>
        </h2>

        <div className="rounded-field border border-sand bg-paper py-2 pl-[22px] pr-2 mobile:p-[14px]">
          {state === 'success' ? (
            <p role="status" className="py-[14px] font-sans text-[16px] text-espresso">
              {newsletter.success}
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-wrap items-center gap-[10px]">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={newsletter.placeholder}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'newsletter-error' : undefined}
                className="w-full min-w-0 flex-1 bg-transparent font-sans text-[16px] text-espresso placeholder:text-taupe mobile:pb-[6px]"
              />
              <button
                type="submit"
                disabled={state === 'submitting'}
                className="whitespace-nowrap rounded-input bg-wine px-6 py-[14px] font-sans text-[15px] font-semibold text-cream hover:bg-wine-pressed mobile:w-full"
              >
                {state === 'submitting' ? 'subscribing' : newsletter.cta}
              </button>
            </form>
          )}
        </div>
      </div>

      {error ? (
        <p
          id="newsletter-error"
          role="alert"
          className="mt-2 font-sans text-[14px] text-wine tablet:mt-2"
        >
          {error}
        </p>
      ) : null}
    </section>
  )
}

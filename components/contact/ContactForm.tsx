'use client'

import { useState, type FormEvent } from 'react'
import { contactPage } from '@/lib/content/contact'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface ContactFormProps {
  /** True only when CONTACT_FORM_ENDPOINT is configured server-side. */
  deliveryEnabled: boolean
  /** Public contact address, or null when none has been supplied. */
  contactEmail: string | null
}

const fieldShell =
  'w-full rounded-input border border-sand bg-paper px-4 py-[13px] font-sans text-[16px] text-espresso placeholder:text-taupe'
const labelShell = 'font-sans text-[14px] font-semibold text-espresso'

/**
 * Real, accessible contact form.
 *
 * When no endpoint is configured the submit control is not rendered at all —
 * the form never appears to send and never shows a false success state. The
 * fields stay visible and usable so the page reads as finished rather than
 * broken, with an honest notice in place of the button.
 */
export function ContactForm({ deliveryEnabled, contactEmail }: ContactFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.checkValidity()) {
      setError(contactPage.invalid)
      form.reportValidity()
      return
    }

    setState('submitting')
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })

      if (!response.ok) throw new Error(`Contact submit failed: ${response.status}`)

      setState('success')
      form.reset()
    } catch {
      setState('error')
      setError(contactPage.failure)
    }
  }

  if (state === 'success') {
    return (
      <p
        role="status"
        className="rounded-field border border-sand bg-paper px-6 py-6 font-sans text-[17px] leading-[1.5] text-espresso"
      >
        {contactPage.success}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5 mobile:grid-cols-1">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className={labelShell}>
            {contactPage.fields.name.label}
          </label>
          <input id="contact-name" name="name" type="text" required autoComplete="name" className={fieldShell} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className={labelShell}>
            {contactPage.fields.email.label}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldShell}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-phone" className={labelShell}>
            {contactPage.fields.phone.label}{' '}
            <span className="font-normal text-taupe">({contactPage.fields.phone.hint})</span>
          </label>
          <input id="contact-phone" name="phone" type="tel" autoComplete="tel" className={fieldShell} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-topic" className={labelShell}>
            {contactPage.fields.topic.label}
          </label>
          <select id="contact-topic" name="topic" required defaultValue="" className={fieldShell}>
            <option value="" disabled>
              Choose one
            </option>
            {contactPage.topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className={labelShell}>
          {contactPage.fields.message.label}
        </label>
        <textarea id="contact-message" name="message" required rows={6} className={`${fieldShell} resize-y`} />
      </div>

      <p className="max-w-measure font-sans text-[14px] leading-[1.5] text-warmgray">
        {contactPage.notice}
      </p>

      {deliveryEnabled ? (
        <>
          <button
            type="submit"
            disabled={state === 'submitting'}
            className="self-start rounded-button bg-brown px-[26px] py-[14px] font-sans text-[15px] font-semibold text-cream hover:bg-wine"
          >
            {state === 'submitting' ? contactPage.submitting : contactPage.submitLabel}
          </button>
          {error ? (
            <p role="alert" className="font-sans text-[14px] text-wine">
              {error}
            </p>
          ) : null}
        </>
      ) : (
        <p className="max-w-measure rounded-field border border-sand bg-paper px-5 py-4 font-sans text-[15px] leading-[1.5] text-warmgray">
          {contactEmail ? contactPage.deliveryPending : contactPage.deliveryPendingNoEmail}
        </p>
      )}
    </form>
  )
}

'use client'

import { useState, type FormEvent } from 'react'
import { contactPage, showingInquiry } from '@/lib/content/contact'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface ShowingFormProps {
  /** True only when CONTACT_FORM_ENDPOINT is configured server-side. */
  deliveryEnabled: boolean
  /** Public contact address, or null when none has been supplied. */
  contactEmail: string | null
  /** Validated ?area= value, already sanitised server-side. */
  area: string | null
}

/*
 * Field styles match the dormant general form deliberately — same input shell,
 * same label weight — so the two never drift apart visually. They are repeated
 * rather than shared because that form is deferred, not active, and this slice
 * does not touch it.
 */
const fieldShell =
  'w-full rounded-input border border-sand bg-paper px-4 py-[13px] font-sans text-[16px] text-espresso placeholder:text-taupe'
const labelShell = 'font-sans text-[14px] font-semibold text-espresso'
const hintShell = 'font-sans text-[13.5px] leading-[1.45] text-warmgray'

/**
 * The property / showing inquiry form.
 *
 * The listing link sits alone at the top, in a paper panel, at a larger size
 * than the rest: it is the reason the page exists. Everything below it is the
 * minimum needed to reply — no budget, no timeline, no pre-approval status, no
 * dropdown of intentions.
 *
 * SUBMISSION follows exactly the same rule as the general contact form: with
 * no CONTACT_FORM_ENDPOINT configured, the submit control is not rendered at
 * all. The form never appears to send and never shows a false confirmation.
 * The fields stay usable so the page reads as finished, and the honest notice
 * points at the email address that does work.
 *
 * The pasted link is text. Nothing fetches it, scrapes it, or checks it.
 */
export function ShowingForm({ deliveryEnabled, contactEmail, area }: ShowingFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.checkValidity()) {
      setError(showingInquiry.invalid)
      form.reportValidity()
      return
    }

    setState('submitting')
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent: 'showing',
          ...Object.fromEntries(new FormData(form)),
        }),
      })

      if (!response.ok) throw new Error(`Showing submit failed: ${response.status}`)

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
        {showingInquiry.success}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {/* The listing link is the action. It gets its own panel and its own scale. */}
      <div className="flex flex-col gap-2 rounded-field border border-sand bg-paper px-6 py-6 mobile:px-4 mobile:py-5">
        <label htmlFor="showing-listing" className="font-sans text-[16px] font-semibold text-espresso">
          {showingInquiry.fields.listingUrl.label}
        </label>
        <p id="showing-listing-hint" className={hintShell}>
          {showingInquiry.fields.listingUrl.hint}
        </p>
        <input
          id="showing-listing"
          name="listingUrl"
          type="text"
          inputMode="url"
          autoComplete="off"
          aria-describedby="showing-listing-hint"
          className="mt-2 w-full rounded-input border border-sand bg-cream px-4 py-[15px] font-sans text-[17px] text-espresso placeholder:text-taupe mobile:text-[16px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mobile:grid-cols-1">
        <div className="flex flex-col gap-2">
          <label htmlFor="showing-name" className={labelShell}>
            {showingInquiry.fields.name.label}
          </label>
          <input
            id="showing-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldShell}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="showing-email" className={labelShell}>
            {showingInquiry.fields.email.label}
          </label>
          <input
            id="showing-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldShell}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="showing-phone" className={labelShell}>
            {showingInquiry.fields.phone.label}{' '}
            <span className="font-normal text-taupe">({showingInquiry.fields.phone.hint})</span>
          </label>
          <input
            id="showing-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldShell}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="showing-area" className={labelShell}>
            {showingInquiry.fields.area.label}{' '}
            <span className="font-normal text-taupe">({showingInquiry.fields.area.hint})</span>
          </label>
          {/*
            Prefilled from ?area= when the link carried one, and editable —
            the reader is never locked into a value a link chose for them.
          */}
          <input
            id="showing-area"
            name="area"
            type="text"
            defaultValue={area ?? ''}
            autoComplete="off"
            className={fieldShell}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="showing-message" className={labelShell}>
          {showingInquiry.fields.message.label}
        </label>
        <p id="showing-message-hint" className={hintShell}>
          {showingInquiry.fields.message.hint}
        </p>
        <textarea
          id="showing-message"
          name="message"
          rows={5}
          aria-describedby="showing-message-hint"
          className={`${fieldShell} resize-y`}
        />
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
            {state === 'submitting' ? showingInquiry.submitting : showingInquiry.submitLabel}
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

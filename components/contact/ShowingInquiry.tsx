'use client'

import { useState, type FormEvent } from 'react'
import { buildMailto, buildSms, fillTemplate } from '@/lib/contact/quickSend'
import { contactPage, showingInquiry } from '@/lib/content/contact'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface ShowingInquiryProps {
  /** True only when CONTACT_FORM_ENDPOINT is configured server-side. */
  deliveryEnabled: boolean
  /** Public contact address, or null when none has been supplied. */
  contactEmail: string | null
  /** Public contact phone, or null. Null hides "Text Danielle" entirely. */
  contactPhone: string | null
  /** Validated ?area= value, already sanitised server-side. */
  area: string | null
}

/*
 * Field styles match the dormant general form deliberately — same input shell,
 * same label weight — so the two never drift apart visually. They are repeated
 * rather than shared because that form is deferred, not active.
 */
const fieldShell =
  'w-full rounded-input border border-sand bg-paper px-4 py-[13px] font-sans text-[16px] text-espresso placeholder:text-taupe'
const labelShell = 'font-sans text-[14px] font-semibold text-espresso'
const hintShell = 'font-sans text-[13.5px] leading-[1.45] text-warmgray'

const actionShell =
  'inline-flex min-h-[48px] items-center justify-center rounded-button px-[26px] py-[14px] font-sans text-[15px] font-semibold mobile:w-full'

/**
 * One action, rendered as a real link when it can do something and as a
 * disabled button when it cannot.
 *
 * A dead anchor with aria-disabled is the usual shortcut here and it is worse:
 * a disabled button is understood by every assistive technology and cannot be
 * followed by accident. Neither variant opens a new tab — mailto: and sms:
 * hand off to the reader's own app, and a blank tab left behind is litter.
 */
function QuickSendAction({
  href,
  label,
  tone,
}: {
  href: string | null
  label: string
  tone: 'primary' | 'secondary'
}) {
  const skin =
    tone === 'primary'
      ? 'bg-brown text-cream hover:bg-wine'
      : 'border-[1.5px] border-brown py-[12.5px] text-brown hover:border-sage-olive hover:bg-sage-olive hover:text-cream'

  if (!href) {
    return (
      <button type="button" disabled className={`${actionShell} ${skin} opacity-45`}>
        {label}
      </button>
    )
  }

  return (
    <a href={href} className={`${actionShell} ${skin}`}>
      {label}
    </a>
  )
}

/**
 * The showing inquiry: paste the house once, then choose how to send it.
 *
 * The listing field is the whole interaction. Text and Email are built from
 * whatever is in it and open the reader's own composer with the message
 * already written — nothing is sent from here, and neither action depends on
 * CONTACT_FORM_ENDPOINT. With the field empty both actions are disabled rather
 * than producing a message with a hole in it.
 *
 * "Text Danielle" renders only when a phone number is configured. There is no
 * placeholder number and no dead button.
 *
 * The note form below is optional and shares the same listing value, so
 * nobody has to type the house twice — and nobody has to fill in a form at all
 * to send it.
 *
 * The pasted value is text. Nothing fetches it, resolves it, follows a
 * redirect, or checks whether it is a listing site.
 */
export function ShowingInquiry({
  deliveryEnabled,
  contactEmail,
  contactPhone,
  area,
}: ShowingInquiryProps) {
  const [listing, setListing] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)

  const trimmed = listing.trim()
  const ready = trimmed.length > 0

  const emailHref =
    ready && contactEmail
      ? buildMailto(
          contactEmail,
          showingInquiry.quickSend.emailSubject,
          fillTemplate(showingInquiry.quickSend.emailBody, trimmed),
        )
      : null

  const smsHref =
    ready && contactPhone
      ? buildSms(contactPhone, fillTemplate(showingInquiry.quickSend.smsBody, trimmed))
      : null

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
          listingUrl: trimmed,
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

  return (
    <div className="flex flex-col gap-12 mobile:gap-10">
      {/* ---------------------------------------------------- quick send --- */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 rounded-field border border-sand bg-paper px-6 py-6 mobile:px-4 mobile:py-5">
          <label
            htmlFor="showing-listing"
            className="font-sans text-[16px] font-semibold text-espresso"
          >
            {showingInquiry.quickSend.listingLabel}
          </label>
          <p id="showing-listing-hint" className={hintShell}>
            {showingInquiry.quickSend.listingHint}
          </p>
          <input
            id="showing-listing"
            name="listing"
            type="text"
            inputMode="url"
            autoComplete="off"
            value={listing}
            onChange={(event) => setListing(event.target.value)}
            aria-describedby="showing-listing-hint"
            className="mt-2 w-full rounded-input border border-sand bg-cream px-4 py-[15px] font-sans text-[17px] text-espresso placeholder:text-taupe mobile:text-[16px]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 mobile:flex-col mobile:items-stretch">
            {contactPhone ? (
              <QuickSendAction
                href={smsHref}
                label={showingInquiry.quickSend.textLabel}
                tone="primary"
              />
            ) : null}
            {contactEmail ? (
              <QuickSendAction
                href={emailHref}
                label={showingInquiry.quickSend.emailLabel}
                tone={contactPhone ? 'secondary' : 'primary'}
              />
            ) : null}
          </div>

          {!ready ? <p className={hintShell}>{showingInquiry.quickSend.emptyHint}</p> : null}
          {contactPhone ? <p className={hintShell}>{showingInquiry.quickSend.textNote}</p> : null}
        </div>
      </div>

      {/* --------------------------------------------------- the note form --- */}
      <div className="border-t border-hairline pt-10 mobile:pt-8">
        <h2 className="font-display text-sub leading-none text-espresso tablet:text-sub-tablet mobile:text-sub-mobile">
          {showingInquiry.noteHeading}
        </h2>

        {state === 'success' ? (
          <p
            role="status"
            className="mt-7 rounded-field border border-sand bg-paper px-6 py-6 font-sans text-[17px] leading-[1.5] text-espresso"
          >
            {showingInquiry.success}
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-6">
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
                  <span className="font-normal text-taupe">
                    ({showingInquiry.fields.phone.hint})
                  </span>
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
                  <span className="font-normal text-taupe">
                    ({showingInquiry.fields.area.hint})
                  </span>
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
        )}
      </div>
    </div>
  )
}

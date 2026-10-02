'use client'

import type { ReactNode } from 'react'

/**
 * The form furniture.
 *
 * REAL LABELS, never a placeholder standing in for one. Help text is tied to
 * its input with `aria-describedby`, radio groups are real fieldsets with a
 * legend, and selected state is carried by the input rather than by a class.
 *
 * Optional is said once, at the top of the form, rather than twelve times down
 * the side of it.
 */

export function Group({
  legend, help, children,
}: {
  legend: string
  help?: string
  children: ReactNode
}) {
  const id = `g-${legend.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <fieldset className="border-t border-hairline pt-7">
      <legend className="float-left w-full pb-5 text-[11.5px] font-bold uppercase tracking-label text-taupe">
        {legend}
      </legend>
      {help ? (
        <p id={id} className="clear-both mb-5 max-w-measure font-sans text-[15px] leading-[1.5] text-warmgray">
          {help}
        </p>
      ) : null}
      <div className="clear-both">{children}</div>
    </fieldset>
  )
}

const FIELD =
  'w-full rounded-input border border-sand bg-paper px-4 py-[13px] font-sans text-[16.5px] leading-[1.4] text-espresso placeholder:text-taupe focus:border-brown focus:outline focus:outline-2 focus:outline-offset-[1px] focus:outline-brown mobile:min-h-[48px] mobile:text-[16px]'

export function Text({
  id, label, value, onChange, help, rows, inputMode, prefix,
}: {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
  help?: string
  rows?: number
  inputMode?: 'numeric' | 'text'
  prefix?: string
}) {
  const helpId = help ? `${id}-help` : undefined
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block font-sans text-[15px] font-medium text-brown">
        {label}
      </label>
      {help ? (
        <p id={helpId} className="mt-1.5 font-sans text-[14px] leading-[1.45] text-warmgray">
          {help}
        </p>
      ) : null}
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          aria-describedby={helpId}
          onChange={(event) => onChange(event.target.value)}
          className={`${FIELD} mt-2.5 resize-y`}
        />
      ) : (
        <div className="relative mt-2.5">
          {prefix ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-sans text-[16.5px] text-taupe"
            >
              {prefix}
            </span>
          ) : null}
          <input
            id={id}
            type="text"
            inputMode={inputMode}
            value={value}
            aria-describedby={helpId}
            onChange={(event) => onChange(event.target.value)}
            className={`${FIELD} ${prefix ? 'pl-9' : ''}`}
          />
        </div>
      )}
    </div>
  )
}

/**
 * A small set of choices as chips.
 *
 * Real radios underneath, so one tap selects, the arrow keys move within the
 * group, and the selected state reaches assistive tech without an aria-
 * attribute to keep in sync. Choosing the same chip again clears it, because
 * every one of these is optional and there has to be a way back to unanswered.
 */
export function Chips({
  name, legend, options, value, onChange, hideLegend,
}: {
  name: string
  legend: string
  options: readonly { id: string; label: string }[]
  value: string | undefined
  onChange: (next: string | undefined) => void
  /** The group heading already says this. Kept for assistive tech only. */
  hideLegend?: boolean
}) {
  return (
    <fieldset className="min-w-0">
      <legend
        className={hideLegend ? 'sr-only' : 'font-sans text-[15px] font-medium text-brown'}
      >
        {legend}
      </legend>
      <div className={`flex flex-wrap gap-2 ${hideLegend ? '' : 'mt-2.5'}`}>
        {options.map((option) => {
          const chosen = value === option.id
          return (
            <label key={option.id} className="block">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={chosen}
                onChange={() => onChange(option.id)}
                onClick={() => onChange(chosen ? undefined : option.id)}
                className="peer sr-only"
              />
              <span
                className={`inline-flex cursor-pointer items-center rounded-badge border px-4 py-2.5 font-sans text-[15px] leading-[1.3] transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brown mobile:min-h-[44px] ${
                  chosen
                    ? 'border-brown bg-brown text-cream'
                    : 'border-sand bg-paper text-brown hover:border-taupe'
                }`}
              >
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

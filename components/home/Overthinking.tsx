import Link from 'next/link'
import { EssaySlider } from '@/components/home/EssaySlider'
import { overthinking } from '@/lib/content/home'
import { getEssays, type EssayEntry } from '@/lib/essays'

/**
 * Overthinking Real Estate, as the dark card: the masthead top-left, the
 * eyebrow top-right, a dotted rule, and a collage of the four latest essays
 * at fixed slots, repeated three times so the track can loop. Below 992px the
 * collage becomes a slider with two arrows.
 *
 * Every title and cover comes from the Substack feed. An essay without a
 * cover gets a typeset one — its own title on espresso — never a borrowed
 * picture. With no essays
 * at all the section is not rendered.
 */

const SLOTS = [
  { name: 'one', width: '32.125rem', ratio: '514 / 303' },
  { name: 'two', width: '20rem', ratio: '320 / 207' },
  { name: 'three', width: '16rem', ratio: '256 / 173' },
  { name: 'four', width: '16rem', ratio: '256 / 173' },
] as const

function EssayCard({
  entry,
  slot,
  hidden,
}: {
  entry: EssayEntry
  slot: (typeof SLOTS)[number]
  hidden: boolean
}) {
  const style = { '--pcard-w': slot.width, '--pcard-ratio': slot.ratio } as React.CSSProperties
  const inner = (
    <>
      <span className="pcard__frame">
        {entry.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary feed host; see ImageSlot
          <img className="pcard__image" src={entry.imageUrl} alt="" loading="lazy" />
        ) : (
          <span className="pcard__cover" aria-hidden="true">
            <span className="pcard__cover-mark">{overthinking.title}</span>
            <span className="pcard__cover-title">{entry.title}</span>
          </span>
        )}
      </span>
      <span className="pcard__badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
      </span>
      {/* A typeset cover already carries the title; don't print it twice. */}
      {entry.imageUrl ? <p className="pcard__label">{entry.title}</p> : <span className="sr-only">{entry.title}</span>}
    </>
  )

  const a11y = hidden ? { tabIndex: -1, 'aria-hidden': true as const } : {}

  if (entry.slug) {
    return (
      <Link className="pcard" href={`/read/${entry.slug}`} style={style} {...a11y}>
        {inner}
      </Link>
    )
  }

  if (entry.substackUrl) {
    return (
      <a
        className="pcard"
        href={entry.substackUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        {...a11y}
      >
        {inner}
        <span className="sr-only"> (opens on Substack)</span>
      </a>
    )
  }

  return (
    <span className="pcard" style={style} {...a11y}>
      {inner}
    </span>
  )
}

function Group({ entries, clone }: { entries: EssayEntry[]; clone: boolean }) {
  return (
    <div
      className={`properties__group ${clone ? 'properties__group--clone' : 'properties__group--lead'}`}
      aria-hidden={clone || undefined}
    >
      {entries.map((entry, index) => (
        <div key={entry.title} className={`properties__slot properties__slot--${SLOTS[index].name}`}>
          <EssayCard entry={entry} slot={SLOTS[index]} hidden={clone} />
        </div>
      ))}
    </div>
  )
}

export async function Overthinking() {
  const { lead, more } = await getEssays()
  if (!lead) return null

  const entries = [lead, ...more].slice(0, SLOTS.length)

  return (
    <section className="properties section--carded" id="read" aria-labelledby="read-heading">
      <div className="properties__card card">
        <div className="properties__head">
          <h2 id="read-heading" className="properties__heading t-heading-md" data-anim="lines">
            {overthinking.title}
          </h2>
          <p className="properties__dek t-body" data-anim="rise">
            {overthinking.dek}
          </p>
          <Link className="properties__more" href="/read" data-anim="rise">
            {overthinking.moreLabel}&nbsp;<span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <p className="properties__eyebrow section-label" data-anim="rise">
          {overthinking.eyebrow}
        </p>
        <div className="properties__rule rule-dotted rule-dotted--dark" role="presentation" data-anim="rule" />

        <div className="properties__collage">
          <div className="properties__track">
            <Group entries={entries} clone={false} />
            <Group entries={entries} clone />
            <Group entries={entries} clone />
          </div>
        </div>

        <div className="properties__nav">
          <button className="btn btn--nav properties__arrow" type="button" data-slider="prev" aria-label="Previous essays">
            <span className="btn__fill" aria-hidden="true" />
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path
                d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button className="btn btn--nav properties__arrow" type="button" data-slider="next" aria-label="Next essays">
            <span className="btn__fill" aria-hidden="true" />
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path
                d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <EssaySlider />
      </div>
    </section>
  )
}

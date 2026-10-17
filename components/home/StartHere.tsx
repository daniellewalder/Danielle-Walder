import Link from 'next/link'
import { startHere } from '@/lib/content/home'

/**
 * Start here: the practical ways in, as a numbered two-by-two grid under a
 * right-aligned heading and a dotted rule. Every title is a link to a real
 * page; every line under it is that page's own copy.
 */
export function StartHere() {
  return (
    <section className="approach" id="start-here" aria-labelledby="start-here-heading">
      <div className="approach__inner home-container">
        <div className="approach__head">
          <p className="approach__label section-label" data-anim="rise">
            {startHere.label}
          </p>
          <h2 id="start-here-heading" className="approach__heading t-heading" data-anim="lines">
            {startHere.heading}
          </h2>
        </div>

        <div className="rule-dotted" role="presentation" data-anim="rule" />

        <div className="approach__body">
          <ul className="approach__grid">
            {startHere.features.map((feature, index) => (
              <li key={feature.href} className="feature" data-anim="rise">
                <span className="feature__number t-title" aria-hidden="true">
                  _{String(index + 1).padStart(2, '0')}
                </span>
                <div className="feature__text">
                  <h3 className="feature__title t-title">
                    <Link href={feature.href}>{feature.label}</Link>
                  </h3>
                  <span className="feature__body t-body">{feature.body}</span>
                </div>
              </li>
            ))}
          </ul>

          {startHere.note ? (
            <p className="approach__note t-body" data-anim="rise">
              {startHere.note}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

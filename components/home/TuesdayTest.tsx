import Link from 'next/link'
import { tuesdayTest } from '@/lib/content/home'

/**
 * The Tuesday Test: the label on the left, then a wide column with the
 * heading, a butter preview panel and the invitation set right-aligned beside
 * it.
 *
 * The panel is a static editorial preview — the first question as text. It is
 * not a button, a link or a form, and it has no hover state, so it never
 * reads as interactive. The one link is the way into the real quiz.
 */
export function TuesdayTest() {
  return (
    <section className="testimonial" id="tuesday-test" aria-labelledby="tuesday-test-heading">
      <div className="testimonial__inner home-container">
        <p className="testimonial__label section-label" data-anim="rise">
          {tuesdayTest.badge}
        </p>
        <div className="testimonial__column">
          <h2 id="tuesday-test-heading" className="testimonial__heading t-heading" data-anim="lines">
            {tuesdayTest.heading}
          </h2>
          <div className="testimonial__figure">
            <div className="testimonial__frame" data-anim="pop">
              <p className="section-label">{tuesdayTest.preview.label}</p>
              <p className="testimonial__question">{tuesdayTest.preview.question}</p>
              <p className="testimonial__count">1 / {tuesdayTest.preview.options.length}</p>
            </div>
            <div className="testimonial__quote">
              <p className="testimonial__text t-quote" data-anim="lines">
                {tuesdayTest.intro}
              </p>
              <Link className="testimonial__author" href={tuesdayTest.cta.href} data-anim="rise">
                {tuesdayTest.cta.label}&nbsp;<span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

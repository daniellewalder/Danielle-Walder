import Link from 'next/link'
import { Photo } from '@/components/home/Photo'
import { contactSection } from '@/lib/content/home'

/**
 * The closing ask: a photo frame anchored top-right, then the label, a
 * three-line heading and one action. Below 992px the frame moves under the
 * text. Until the photograph is supplied the frame is left out and the block
 * closes up.
 */
export function Contact() {
  return (
    <section
      className={`contact${contactSection.photo.src ? '' : ' contact--no-photo'}`}
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div className="contact__inner home-container">
        {contactSection.photo.src ? (
          <span className="contact__frame" data-anim="pop" data-drift="">
            <Photo image={contactSection.photo} className="contact__image" />
          </span>
        ) : null}
        <p className="contact__label section-label" data-anim="rise">
          {contactSection.label}
        </p>
        <div className="contact__block">
          <h2 id="contact-heading" className="contact__heading t-heading" data-anim="lines">
            {contactSection.headingLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < contactSection.headingLines.length - 1 ? (
                  <>
                    {' '}
                    <br />
                  </>
                ) : null}
              </span>
            ))}
          </h2>
          <Link className="btn btn--accent" href={contactSection.cta.href} data-anim="rise">
            <span className="btn__fill" aria-hidden="true" />
            <span className="btn__label">{contactSection.cta.label}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

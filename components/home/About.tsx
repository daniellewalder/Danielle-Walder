import { Photo } from '@/components/home/Photo'
import { about, aboutSection } from '@/lib/content/home'

/**
 * About, laid out as a canvas: the label top-left, the copy as a justified
 * column from the centre line, the heading low on the left and the portrait
 * frame on the right half. Below 992px it becomes a plain column.
 *
 * Until the portrait is supplied the frame is left out and the canvas closes
 * up around the words, rather than showing an empty block.
 */
export function About() {
  return (
    <section
      className={`about${about.portrait.src ? '' : ' about--no-photo'}`}
      id="about"
      aria-labelledby="about-heading"
    >
      <div className="about__inner home-container">
        <p className="about__label section-label" data-anim="rise">
          {aboutSection.label}
        </p>
        <p className="about__intro t-body" data-anim="rise">
          {about.copy}
        </p>
        <h2 id="about-heading" className="about__heading t-heading" data-anim="lines">
          {about.headline}
        </h2>
        {about.portrait.src ? (
          <span className="about__frame" data-anim="pop" data-drift="">
            <Photo image={about.portrait} className="about__image" />
          </span>
        ) : null}
      </div>
    </section>
  )
}

import { Photo } from '@/components/home/Photo'
import { about, aboutSection } from '@/lib/content/home'

/**
 * About, laid out as a canvas: the label top-left, the copy as a justified
 * column from the centre line, the heading low on the left and the portrait
 * frame on the right half. Below 992px it becomes a plain column.
 *
 * The frame is butter, the about family, until the portrait is supplied.
 */
export function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-heading">
      <div className="about__inner home-container">
        <p className="about__label section-label" data-anim="rise">
          {aboutSection.label}
        </p>
        <p className="about__intro t-body" data-anim="rise">
          {about.copy}
        </p>
        <h2 id="about-heading" className="about__heading t-statement" data-anim="lines">
          {about.headline}
        </h2>
        <span className="about__frame" data-anim="pop" data-drift="">
          <Photo image={about.portrait} className="about__image" />
        </span>
      </div>
    </section>
  )
}

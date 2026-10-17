import { About } from '@/components/home/About'
import { ArmMotion } from '@/components/home/ArmMotion'
import { Contact } from '@/components/home/Contact'
import { Hero } from '@/components/home/Hero'
import { HomeFooter } from '@/components/home/HomeFooter'
import { HomeMotion } from '@/components/home/HomeMotion'
import { Overthinking } from '@/components/home/Overthinking'
import { TuesdayTest } from '@/components/home/TuesdayTest'
import '@/components/home/home.css'

/**
 * Explicit ISR window for the Substack feed.
 *
 * Next would otherwise infer this from the shortest fetch revalidate in the
 * tree, which is fragile: adding one unrelated fetch with a different window
 * silently changes how fresh this page is. Stating it here is what makes the
 * "new essay within about five minutes" promise a property of the page rather
 * than a side effect of lib/essays.
 */
export const revalidate = 300

/**
 * Homepage flow, after the landing-page reference Danielle chose:
 *   hero → about → Overthinking Real Estate (the dark card) →
 *   the Tuesday Test → contact → footer card
 *
 * The reference's listings, testimonial and stock photography are not carried
 * over: the dark card holds her real essays from the feed, the testimonial
 * slot holds the Tuesday Test, and every photo frame stays an honest tonal
 * block until she supplies the photograph. Subscribing to Overthinking Real
 * Estate lives in the footer card and happens on Substack.
 */
export default function HomePage() {
  return (
    <div className="home">
      <ArmMotion />
      <Hero />
      <About />
      <Overthinking />
      <TuesdayTest />
      <Contact />
      <HomeFooter />
      <HomeMotion />
    </div>
  )
}

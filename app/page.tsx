import { About } from '@/components/home/About'
import { Hero } from '@/components/home/Hero'
import { Overthinking } from '@/components/home/Overthinking'
import { StartHere } from '@/components/home/StartHere'
import { Subscribe } from '@/components/home/Subscribe'
import { TuesdayTest } from '@/components/home/TuesdayTest'

/**
 * Homepage flow, approved:
 *   hero → start here → Overthinking Real Estate → the Tuesday Test →
 *   about Danielle → subscribe to Overthinking Real Estate → footer
 *
 * The two Overthinking Real Estate sections are the same publication: the
 * first is the reading experience, the last is where you subscribe to it. It
 * is not a separate newsletter and must never be labelled as one.
 *
 * The order puts the two products next to each other, then the person who
 * makes them, then the ask. It also alternates the fields — cream, dark,
 * butter, cream — so the page has rhythm rather than a stack of blocks.
 *
 * Listing, sold, statistics and testimonial sections are deliberately absent.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <StartHere />
      <Overthinking />
      <TuesdayTest />
      <About />
      <Subscribe />
    </>
  )
}

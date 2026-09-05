import { About } from '@/components/home/About'
import { Hero } from '@/components/home/Hero'
import { Newsletter } from '@/components/home/Newsletter'
import { Overthinking } from '@/components/home/Overthinking'
import { StartHere } from '@/components/home/StartHere'
import { TuesdayTest } from '@/components/home/TuesdayTest'

/**
 * Listing, sold, and testimonial sections are deliberately absent. They return
 * when Danielle supplies verified property data and an approved testimonial —
 * not filled with placeholders in the meantime.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <StartHere />
      <Overthinking />
      <About />
      <TuesdayTest />
      <Newsletter />
    </>
  )
}

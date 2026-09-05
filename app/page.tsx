import { Suspense } from 'react'
import { About } from '@/components/home/About'
import { Hero } from '@/components/home/Hero'
import { Newsletter } from '@/components/home/Newsletter'
import { NowShowing } from '@/components/home/NowShowing'
import { Overthinking } from '@/components/home/Overthinking'
import { QuizSection } from '@/components/home/QuizSection'
import { Sold } from '@/components/home/Sold'
import { StartHere } from '@/components/home/StartHere'
import { Testimonial } from '@/components/home/Testimonial'
import { ListingCardSkeleton } from '@/components/listings/ListingCard'
import { SoldCardSkeleton } from '@/components/listings/SoldCard'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StartHere />

      <Suspense fallback={<NowShowingSkeleton />}>
        <NowShowing />
      </Suspense>

      <Suspense fallback={<SoldSkeleton />}>
        <Sold />
      </Suspense>

      <About />
      <Overthinking />
      <QuizSection />
      <Testimonial />
      <Newsletter />
    </>
  )
}

/* Skeletons match the card geometry exactly. No shimmer — a static tone is
   on-brand and deliberate. */

function NowShowingSkeleton() {
  return (
    <div className="wrap pt-14">
      <div className="mt-[26px] grid grid-cols-3 gap-6 tablet:grid-cols-2 mobile:grid-cols-1 mobile:gap-8">
        {[0, 1, 2].map((i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function SoldSkeleton() {
  return (
    <div className="wrap">
      <div className="mt-[76px] grid grid-cols-4 gap-5 tablet:grid-cols-2 mobile:grid-cols-1 mobile:gap-8">
        {[0, 1, 2, 3].map((i) => (
          <SoldCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

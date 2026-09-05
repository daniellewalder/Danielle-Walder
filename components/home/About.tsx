import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { about } from '@/lib/content/home'

/**
 * Butter owns this section: butter field, olive-brown type, butter hairlines.
 * The portrait takes 20px soft corners — Danielle, not property.
 */
export function About() {
  return (
    <section aria-labelledby="about" className="wrap pt-20">
      <div className="grid grid-cols-[0.85fr_1.15fr] items-center gap-12 rounded-block bg-butter-field px-12 py-14 tablet:grid-cols-1 tablet:gap-8 mobile:gap-7 mobile:rounded-[16px] mobile:px-6 mobile:py-8">
        <ImageSlot
          image={about.portrait}
          sizes="(max-width: 1024px) 100vw, 35vw"
          className="h-[420px] rounded-block mobile:h-[340px] mobile:rounded-[16px]"
        />

        <div className="flex min-w-0 flex-col gap-6 text-butter-text">
          <h2
            id="about"
            className="font-mark text-[50px] font-semibold leading-[0.96] tracking-display tablet:text-[42px] mobile:text-[32px]"
          >
            {about.headline}
          </h2>

          <p className="max-w-about font-sans text-[18px] leading-[1.55]">{about.copy}</p>

          <dl className="flex flex-wrap gap-10 border-y border-butter-rule py-5 mobile:grid mobile:grid-cols-2 mobile:gap-6">
            {about.stats.map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-col gap-1">
                <dt className="order-2 text-[11.5px] font-bold uppercase tracking-label text-butter-bronze">
                  {stat.label}
                </dt>
                <dd className="order-1 break-words font-display text-[32px] leading-[1.12]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-[10px]">
            <Link
              href={about.primaryCta.href}
              className="rounded-button bg-brown px-[26px] py-[14px] font-sans text-[15px] font-semibold text-butter-field hover:bg-wine"
            >
              {about.primaryCta.label}
            </Link>
            <Link
              href={about.secondaryCta.href}
              className="rounded-button border-[1.5px] border-brown px-[26px] py-[12.5px] font-sans text-[15px] font-semibold text-brown hover:border-sage-olive hover:bg-sage-olive hover:text-cream"
            >
              {about.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

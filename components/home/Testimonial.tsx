import { testimonial } from '@/lib/content/home'

export function Testimonial() {
  return (
    <section className="flex flex-col items-center gap-[18px] px-gutter py-[88px] text-center tablet:px-gutter-tablet mobile:px-gutter-mobile mobile:py-16">
      <blockquote className="max-w-quote font-serif text-[42px] font-light leading-[1.2] text-espresso tablet:text-[34px] mobile:text-[27px]">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <cite className="text-[12.5px] font-bold uppercase not-italic tracking-attribution text-taupe">
        {testimonial.client} &middot; {testimonial.neighborhood}
      </cite>
    </section>
  )
}

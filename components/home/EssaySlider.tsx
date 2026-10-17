'use client'

import { useEffect } from 'react'
import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'

/**
 * Below 992px the essay collage becomes a slider: one card per view, 1.5 from
 * 390px, 2.5 from 768px, 400ms a slide (instant under reduced motion), with
 * the two arrow buttons. At 992px and up it is torn down and the looping
 * collage takes over again.
 *
 * Keyboard focus landing on an off-screen card slides it into view.
 */
export function EssaySlider() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.home .properties')
    const track = section?.querySelector<HTMLElement>('.properties__track')
    const prev = section?.querySelector<HTMLButtonElement>('[data-slider="prev"]')
    const next = section?.querySelector<HTMLButtonElement>('[data-slider="next"]')
    if (!section || !track || !prev || !next) return

    const narrow = window.matchMedia('(max-width: 991px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let swiper: Swiper | null = null

    const create = () => {
      if (swiper) return
      section.classList.add('properties--slider')
      swiper = new Swiper(track, {
        modules: [Navigation],
        wrapperClass: 'properties__group--lead',
        slideClass: 'properties__slot',
        slidesPerView: 1,
        spaceBetween: 20,
        speed: reduced.matches ? 0 : 400,
        watchSlidesProgress: true,
        navigation: { prevEl: prev, nextEl: next },
        breakpoints: {
          390: { slidesPerView: 1.5, spaceBetween: 16 },
          768: { slidesPerView: 2.5, spaceBetween: 24 },
        },
      })
    }

    const destroy = () => {
      if (!swiper) return
      swiper.destroy(true, true)
      swiper = null
      section.classList.remove('properties--slider')
      track.classList.remove('swiper-backface-hidden')
      prev.disabled = false
      next.disabled = false
    }

    const sync = () => (narrow.matches ? create() : destroy())
    sync()
    narrow.addEventListener('change', sync)

    const onFocusIn = (event: FocusEvent) => {
      if (!swiper || !(event.target instanceof Element)) return
      const slot = event.target.closest('.properties__slot')
      if (slot instanceof HTMLElement && !swiper.visibleSlides?.includes(slot)) {
        swiper.slideTo(swiper.slides.indexOf(slot))
      }
    }
    track.addEventListener('focusin', onFocusIn)

    return () => {
      narrow.removeEventListener('change', sync)
      track.removeEventListener('focusin', onFocusIn)
      destroy()
    }
  }, [])

  return null
}

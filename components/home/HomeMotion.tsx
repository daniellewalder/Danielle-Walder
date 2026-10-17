'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * The homepage's motion, timed to the reference Danielle chose.
 *
 *   - the opening: her name rises letter by letter, a slot opens between the
 *     words, three panels flash through it, and the slot grows into the hero
 *     card; then the bar, the headline lines, and the lede and button
 *   - headings rise line by line from a mask; labels and paragraphs lift and
 *     fade; frames open from a quarter of their size; dotted rules draw
 *   - from 992px: the headline drifts as the hero leaves, pictures pan inside
 *     their frames, and the essay collage loops while it is on screen
 *   - the footer name rises with the scroll; Lenis smooths the wheel and
 *     routes in-page anchors
 *
 * Under prefers-reduced-motion none of it runs and the page renders finished.
 * If this module never loads, the head script's 2.5s failsafe reveals
 * everything anyway.
 *
 * This deliberately departs from the site-wide "motion is nearly absent"
 * rule, and only on the homepage — Danielle asked for it.
 */

const root = () => document.documentElement
const q = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) =>
  scope.querySelector<T>(selector)
const qa = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(selector))

const DESKTOP = '(min-width: 992px)'

function goLive() {
  root().dataset.motion = 'live'
  root().classList.remove('anim-armed')
}

function createLenis(): { lenis: Lenis; dispose: () => void } {
  const lenis = new Lenis({ autoRaf: false })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  const onClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    const target = event.target
    const href = (target instanceof Element ? target.closest('a[href^="#"]') : null)?.getAttribute('href')
    if (!href || href === '#') return
    const destination = document.querySelector(href)
    if (!(destination instanceof HTMLElement)) return
    event.preventDefault()
    history.pushState(null, '', href)
    destination.setAttribute('tabindex', '-1')
    destination.focus({ preventScroll: true })
    lenis.scrollTo(destination)
  }
  document.addEventListener('click', onClick)

  return {
    lenis,
    dispose: () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    },
  }
}

const NON_SPACE_WHITESPACE = /[^\S ]+/g

function splitLines(element: HTMLElement) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  nodes.forEach((node, index) => {
    let text = node.data.replace(NON_SPACE_WHITESPACE, ' ')
    if (index === 0) text = text.replace(/^ +/, '')
    if (index === nodes.length - 1) text = text.replace(/ +$/, '')
    node.data = text
  })
  return SplitText.create(element, {
    type: 'lines',
    mask: 'lines',
    reduceWhiteSpace: false,
    linesClass: 'split-line',
  })
}

type Reveal = {
  trigger?: Element | null
  start?: string
  duration?: number
  stagger?: number
  delay?: number
  y?: number
}

function lines(element: HTMLElement | null, options: Reveal = {}) {
  if (!element) return null
  const split = splitLines(element)
  if (split.lines.length === 0) return null
  gsap.set(element, { opacity: 1 })
  gsap.set(split.lines, { yPercent: 108 })
  return gsap.to(split.lines, {
    yPercent: 0,
    duration: options.duration ?? 1.05,
    ease: 'power4.out',
    stagger: options.stagger ?? 0.075,
    delay: options.delay ?? 0,
    onComplete: () => {
      split.revert()
    },
    scrollTrigger: options.trigger
      ? { trigger: options.trigger, start: options.start ?? 'top 85%', once: true }
      : undefined,
  })
}

function rise(elements: (Element | null)[], options: Reveal = {}) {
  const targets = elements.filter(Boolean) as Element[]
  if (targets.length === 0) return null
  gsap.set(targets, { opacity: 0, y: options.y ?? 24 })
  return gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: options.duration ?? 0.9,
    ease: 'power3.out',
    stagger: options.stagger ?? 0.08,
    delay: options.delay ?? 0,
    onComplete: () => {
      gsap.set(targets, { clearProps: 'transform,opacity' })
    },
    scrollTrigger: options.trigger
      ? { trigger: options.trigger, start: options.start ?? 'top 88%', once: true }
      : undefined,
  })
}

function riseBatch(elements: Element[], options: Reveal = {}) {
  if (elements.length === 0) return
  gsap.set(elements, { opacity: 0, y: options.y ?? 24 })
  ScrollTrigger.batch(elements, {
    start: options.start ?? 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: options.duration ?? 0.85,
        ease: 'power3.out',
        stagger: options.stagger ?? 0.08,
        onComplete: () => {
          gsap.set(batch, { clearProps: 'transform,opacity' })
        },
      }),
  })
}

function drawRule(element: Element | null) {
  if (!element) return
  gsap.set(element, { x: 0, y: 0, scaleX: 0, transformOrigin: '0% 50%' })
  gsap.to(element, {
    scaleX: 1,
    duration: 1.2,
    ease: 'power3.inOut',
    onComplete: () => {
      gsap.set(element, { clearProps: 'transform,transformOrigin' })
    },
    scrollTrigger: { trigger: element, start: 'top 92%', once: true },
  })
}

function pop(element: Element | null) {
  if (!element) return
  gsap.set(element, { x: 0, y: 0, scale: 0.25, opacity: 0, transformOrigin: '50% 50%' })
  gsap.to(element, {
    scale: 1,
    opacity: 1,
    duration: 1.1,
    ease: 'power3.out',
    onComplete: () => {
      gsap.set(element, { clearProps: 'transform,transformOrigin,opacity' })
    },
    scrollTrigger: { trigger: element, start: 'top 88%', once: true },
  })
}

function drift(frame: Element) {
  const image = frame.querySelector('img')
  if (!image) return
  gsap.fromTo(
    image,
    { yPercent: -3 },
    {
      yPercent: 3,
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    },
  )
}

function heroIntro(lenis: Lenis | null) {
  const hero = q('.home .hero')
  const photo = q('.home .hero__photo')
  const loader = q('.home .hero__loader')
  const glyphs = qa('.home .hero__glyph')
  const flashes = qa('.home .hero__flash')
  const nav = q('.home .nav')
  const inks = qa('.home .hero__ink')
  const heroLines = qa('.home .hero__line')
  const foot = qa('.home .hero__foot > *')
  if (!hero || !photo) return gsap.timeline()

  // Measure the finished card with the armed state lifted for a moment.
  const armed = root().classList.contains('anim-armed')
  if (armed) root().classList.remove('anim-armed')
  const rect = photo.getBoundingClientRect()
  const floor = q('.home .hero__back')?.getBoundingClientRect().width ?? rect.width
  if (armed) root().classList.add('anim-armed')

  const style = getComputedStyle(hero)
  const slotHeight = parseFloat(style.getPropertyValue('--loader-h')) || 144
  const slotOpen = parseFloat(style.getPropertyValue('--loader-open')) || 260
  const words = qa('.home .hero__word')
  const wordSize = words[0] ? parseFloat(getComputedStyle(words[0]).fontSize) : 200
  const gapOpen = slotOpen + wordSize * 0.1
  const gapFull = hero.clientWidth * 1.1

  gsap.set(loader, { display: 'flex' })
  const widths = words.map((word) => word.getBoundingClientRect().width)
  const offset = ((widths[0] ?? 0) - (widths[1] ?? 0)) / 2

  gsap.set(heroLines, { overflow: 'clip' })
  gsap.set(inks, { y: 0, yPercent: 106 })
  gsap.set(glyphs, { y: 0, yPercent: 105 })
  if (nav) gsap.set(nav, { opacity: 0, y: -14 })
  gsap.set(foot, { opacity: 0, y: 20 })
  gsap.set(flashes, { display: 'block', opacity: 1 })
  gsap.set(hero, { '--loader-word': '0px' })
  gsap.set(photo, {
    '--hero-pos': '50%',
    '--hero-floor': '0px',
    borderRadius: '0.5rem',
    position: 'absolute',
    left: '50%',
    top: '50%',
    right: 'auto',
    bottom: 'auto',
    width: 0,
    height: slotHeight,
    xPercent: -50,
    yPercent: -50,
    x: offset,
    y: 0.5,
  })

  goLive()
  lenis?.stop()

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
  tl.to(glyphs, { yPercent: 0, duration: 0.62, ease: 'power3.inOut', stagger: 0.03 }, 0.1)
  tl.to(photo, { width: slotOpen, duration: 0.55, ease: 'power1.inOut' }, 0.72)
  tl.to(hero, { '--loader-word': `${gapOpen}px`, duration: 0.55, ease: 'power1.inOut' }, 0.72)
  flashes.forEach((flash, index) => {
    tl.to(flash, { opacity: 0, duration: 0.15, ease: 'power1.out' }, 1.3 + index * 0.25)
  })
  tl.to(
    photo,
    {
      width: rect.width,
      height: rect.height,
      '--hero-floor': `${floor}px`,
      x: 0,
      borderRadius: getComputedStyle(hero).getPropertyValue('--radius-container').trim() || '20px',
      duration: 1.1,
      ease: 'power3.inOut',
    },
    2,
  )
  tl.to(hero, { '--loader-word': `${gapFull}px`, duration: 1.1, ease: 'power3.inOut' }, 2)
  tl.to(photo, { '--hero-pos': '0%', duration: 1.1, ease: 'power3.inOut' }, 2)
  tl.add(() => {
    gsap.set(photo, {
      clearProps: 'position,left,top,right,bottom,width,height,transform,borderRadius,--hero-pos,--hero-floor',
    })
    gsap.set([loader, ...flashes], { display: 'none' })
    lenis?.start()
  }, 3.1)
  if (nav) tl.to(nav, { opacity: 1, y: 0, duration: 0.9 }, 2.85)
  tl.to(inks, { yPercent: 0, duration: 1.25, stagger: 0.09 }, 2.9)
  tl.to(foot, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 3.2)
  tl.add(() => {
    gsap.set(heroLines, { clearProps: 'overflow' })
  })
  return tl
}

function loopCollage(section: HTMLElement) {
  const track = q('.properties__track', section)
  if (!track) return
  const loop = gsap.fromTo(
    track,
    { x: 0, xPercent: -33.3333 },
    { xPercent: -66.6667, duration: 32, ease: 'none', repeat: -1 },
  )
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
  })
}

function sections() {
  const about = q('.home .about')
  if (about) {
    rise([q('.about__label', about), q('.about__intro', about)], {
      trigger: q('.about__label', about) ?? about,
    })
    lines(q('.about__heading', about), { trigger: q('.about__heading', about) })
    pop(q('.about__frame', about))
  }

  const read = q('.home .properties')
  if (read) {
    rise([q('.properties__eyebrow', read), q('.properties__dek', read), q('.properties__more', read)], {
      trigger: q('.properties__eyebrow', read),
    })
    lines(q('.properties__heading', read), { trigger: q('.properties__heading', read) })
    drawRule(q('.properties__rule', read))
  }

  const start = q('.home .approach')
  if (start) {
    rise([q('.approach__label', start)], { trigger: q('.approach__label', start) })
    lines(q('.approach__heading', start), { trigger: q('.approach__heading', start) })
    drawRule(q('.rule-dotted', start))
    riseBatch(qa('.feature', start), { stagger: 0.09 })
    const note = q('.approach__note', start)
    if (note) rise([note], { trigger: note })
  }

  const tuesday = q('.home .testimonial')
  if (tuesday) {
    rise([q('.testimonial__label', tuesday)], { trigger: q('.testimonial__label', tuesday) })
    lines(q('.testimonial__heading', tuesday), { trigger: q('.testimonial__heading', tuesday) })
    pop(q('.testimonial__frame', tuesday))
    lines(q('.testimonial__text', tuesday), {
      trigger: q('.testimonial__text', tuesday),
      stagger: 0.055,
      duration: 0.9,
    })
    rise([q('.testimonial__author', tuesday)], { trigger: q('.testimonial__author', tuesday), delay: 0.15 })
  }

  const contact = q('.home .contact')
  if (contact) {
    rise([q('.contact__label', contact)], { trigger: q('.contact__label', contact) })
    pop(q('.contact__frame', contact))
    lines(q('.contact__heading', contact), { trigger: q('.contact__heading', contact) })
    const button = q('.btn', contact)
    if (button) {
      gsap.set(button, { opacity: 0, y: 18, scale: 0.96 })
      gsap.to(button, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.6)',
        delay: 0.25,
        onComplete: () => {
          gsap.set(button, { clearProps: 'transform,opacity' })
        },
        scrollTrigger: { trigger: button, start: 'top 92%', once: true },
      })
    }
  }

  const footer = q('.home .footer')
  if (footer) {
    rise([q('.footer__logo', footer), q('.footer__blurb', footer)], {
      trigger: q('.footer__brand', footer) ?? footer,
    })
    riseBatch(qa('.footer__cell', footer), { y: 16, stagger: 0.03, duration: 0.7 })
    const sign = q('.footer__sign', footer)
    const card = q('.footer__card', footer)
    if (sign && card) {
      gsap.fromTo(
        sign,
        { yPercent: 16 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
        },
      )
    }
  }

  const mm = gsap.matchMedia()
  mm.add(DESKTOP, () => {
    qa('.home [data-drift]').forEach(drift)
    const title = q('.home .hero__title')
    const hero = q('.home .hero')
    if (title && hero) {
      gsap.to(title, {
        yPercent: -9,
        opacity: 0.55,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 },
      })
    }
    const section = q('.home .properties')
    if (section) {
      loopCollage(section)
      rise([q('.properties__collage', section)], {
        trigger: q('.properties__collage', section),
        y: 32,
        duration: 1.1,
      })
    }
  })
  mm.add('(max-width: 991px)', () => {
    const collage = q('.home .properties__collage')
    if (collage) gsap.set(collage, { clearProps: 'opacity,transform' })
    const lead = q('.home .properties__group:not(.properties__group--clone)')
    if (lead) riseBatch(qa('.pcard', lead), { y: 28, stagger: 0.1 })
  })
}

/** Buttons fill with a circle grown from where the pointer came in. */
function bindButtonFills() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
  const disposers = qa('.home .btn').map((button) => {
    const fill = q('.btn__fill', button)
    if (!fill) return () => {}
    const place = (event: PointerEvent) => {
      if (!fine.matches) return
      const width = button.offsetWidth
      const height = button.offsetHeight
      const x = Math.min(Math.max(event.offsetX, 0), width)
      const y = Math.min(Math.max(event.offsetY, 0), height)
      button.style.setProperty('--btn-x', `${x}px`)
      button.style.setProperty('--btn-y', `${y}px`)
      button.style.setProperty(
        '--btn-r',
        `${Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 1}px`,
      )
    }
    const leave = (event: PointerEvent) => {
      if (Number.parseFloat(getComputedStyle(fill).getPropertyValue('--btn-fill')) > 0.99) place(event)
    }
    button.addEventListener('pointerenter', place)
    button.addEventListener('pointerleave', leave)
    return () => {
      button.removeEventListener('pointerenter', place)
      button.removeEventListener('pointerleave', leave)
    }
  })
  return () => disposers.forEach((dispose) => dispose())
}

export function HomeMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText)
    const unbindFills = bindButtonFills()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      goLive()
      return unbindFills
    }

    let disposed = false
    const ctx = gsap.context(() => {})
    const smooth = createLenis()

    const run = async () => {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 1200)),
      ])
      if (disposed) return
      ctx.add(() => heroIntro(smooth.lenis))
      await new Promise((resolve) => requestAnimationFrame(resolve))
      if (disposed) return
      ctx.add(() => sections())
      ScrollTrigger.refresh()
    }

    run().catch((error) => {
      goLive()
      throw error
    })

    return () => {
      disposed = true
      unbindFills()
      ctx.revert()
      smooth.dispose()
      // The armed class is left alone: it only ever styles .home, and the
      // head script's failsafe lifts it regardless.
      delete root().dataset.motion
    }
  }, [])

  return null
}

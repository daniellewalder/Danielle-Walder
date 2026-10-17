import Link from 'next/link'
import { HeroClock } from '@/components/home/HeroClock'
import { HeroVideo } from '@/components/home/HeroVideo'
import { Photo } from '@/components/home/Photo'
import { hero, homeNav } from '@/lib/content/home'
import { siteName } from '@/lib/content/site'

/**
 * The opening screen: one inset card the height of the viewport, with the
 * site's own bar inside it, the headline on two display lines, and the lede
 * and one action at its foot.
 *
 * On load (motion permitting) Danielle's name rises letter by letter, a slot
 * opens between the two words, three tonal panels flash through it, and the
 * slot grows into the card — see HomeMotion. Without the script, or under
 * reduced motion, the page renders finished.
 *
 * The card carries the aerial coast footage from LA, Actually under a flat
 * espresso wash. Without it, the card is the hero's deep blue field. An optional
 * cut-out of the same photograph is layered over the headline so the subject
 * stands in front of the letters. Nothing is drawn in place of either.
 *
 * The nav here is anchors to this page's own sections. Below 992px they are
 * hidden and nothing replaces them — the footer carries every route.
 */
export function Hero() {
  const hasPhoto = Boolean(hero.video || hero.portrait.src)
  const words = siteName.split(' ')

  return (
    <section className={`hero${hasPhoto ? ' hero--photo' : ''}`} id="top">
      <div className="hero__photo">
        <header className="nav" data-anim="rise">
          <Link className="nav__brand" href="/">
            <span className="t-logo">{siteName}</span>
          </Link>

          <nav className="nav__links" aria-label="On this page">
            {homeNav.map((link) => (
              <a key={link.href} className="nav__link t-ui" href={link.href}>
                {link.label}
                <span className="nav__link-rule rule-dotted" aria-hidden="true" />
              </a>
            ))}
          </nav>

          <HeroClock label={hero.clock.label} timeZone={hero.clock.timeZone} />
        </header>

        {hero.video ? (
          <>
            <HeroVideo asset={hero.video} />
            {/* One flat espresso wash so cream type holds over bright footage —
                the same treatment and value as the LA, Actually opening. */}
            <span className="hero__wash" aria-hidden="true" />
          </>
        ) : (
          <Photo image={hero.portrait} className="hero__back" priority />
        )}

        <h1 className="hero__title t-display">
          {hero.headlineLines.map((line, index) => (
            <span key={line} className="hero__line">
              <span className="hero__ink">
                {line}
                {/* Keeps the words apart for anything reading the text. */}
                {index < hero.headlineLines.length - 1 ? ' ' : null}
              </span>
            </span>
          ))}
        </h1>

        {hero.cutout.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- layered cut-out, sized with the back photo
          <img className="hero__front" src={hero.cutout.src} alt="" aria-hidden="true" fetchPriority="high" />
        ) : null}

        {/* Tonal panels that flash through the opening slot. Decoration only. */}
        <span className="hero__flash hero__flash--1" aria-hidden="true" />
        <span className="hero__flash hero__flash--2" aria-hidden="true" />
        <span className="hero__flash hero__flash--3" aria-hidden="true" />

        <div className="hero__foot">
          <p className="hero__lede t-lede" data-anim="rise">
            {hero.intro}
          </p>
          <Link className="btn btn--pill hero__cta" href={hero.primaryCta.href} data-anim="rise">
            <span className="btn__fill" aria-hidden="true" />
            <span className="btn__label">{hero.primaryCta.label}</span>
          </Link>
        </div>
      </div>

      <div className="hero__loader" aria-hidden="true">
        <span className="hero__word t-loader">
          {Array.from(words[0] ?? '').map((glyph, index) => (
            <span key={index} className="hero__glyph">
              {glyph}
            </span>
          ))}
        </span>
        <span className="hero__gap" />
        <span className="hero__word t-loader">
          {Array.from(words.slice(1).join(' ')).map((glyph, index) => (
            <span key={index} className="hero__glyph">
              {glyph}
            </span>
          ))}
        </span>
      </div>
    </section>
  )
}

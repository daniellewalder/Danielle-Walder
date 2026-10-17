import Link from 'next/link'
import { subscribe } from '@/lib/content/home'
import { substackSubscribeUrl } from '@/lib/config'
import { footerGroups, legal, publicationWordmark, siteName } from '@/lib/content/site'

/**
 * The homepage footer, as a dark card: a dashed brand block with the name,
 * the publication and its subscribe link; a grid of six link cells, each with
 * an arrow in its corner; Danielle's name at full width, rising into place
 * with the scroll; and the licence block.
 *
 * Subscribing to Overthinking Real Estate happens on Substack — a real
 * external link, never a form here.
 *
 * The licence lines and disclosure are rendered VERBATIM, as on every page.
 */
export function HomeFooter() {
  const links: { label: string; href: string }[] = footerGroups.flatMap((group) => [...group.links])

  return (
    <footer className="footer section--carded">
      <div className="footer__card card">
        <div className="footer__top">
          <div className="footer__brand">
            <Link className="footer__logo" href="/" data-anim="rise">
              <span className="t-logo">{siteName}</span>
            </Link>
            <div className="footer__blurb" data-anim="rise">
              <Link className="footer__publication" href={publicationWordmark.href}>
                {publicationWordmark.label}
              </Link>
              <p>{subscribe.body}</p>
              {substackSubscribeUrl ? (
                <a
                  className="footer__subscribe"
                  href={substackSubscribeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {subscribe.cta}&nbsp;<span aria-hidden="true">&rarr;</span>
                  <span className="sr-only"> (opens Substack)</span>
                </a>
              ) : null}
            </div>
          </div>

          <nav className="footer__links" aria-label="Footer">
            <ul className="footer__grid">
              {links.map((link) => (
                <li key={link.href} className="footer__cell" data-anim="rise">
                  <Link className="footer__link t-footer-link" href={link.href}>
                    <span className="footer__label">{link.label}</span>
                  </Link>
                  <svg className="footer__arrow" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
                    <path d="M2 10 10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer__sign t-wordmark" aria-hidden="true">
          <span className="footer__sign-text">{siteName}</span>
        </div>

        <div className="footer__legal">
          <div className="footer__legal-lines">
            <span>{legal.agentLine}</span>
            <span>{legal.brokerageLine}</span>
          </div>
          <p>{legal.disclosure}</p>
        </div>
      </div>
    </footer>
  )
}

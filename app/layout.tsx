import type { Metadata } from 'next'
import { Figtree, Kalnia, Rozha_One, Unbounded } from 'next/font/google'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteNav } from '@/components/SiteNav'
import { siteUrl } from '@/lib/config'
import './globals.css'

/* Four typefaces. No more. */

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-unbounded',
  display: 'swap',
})

const rozhaOne = Rozha_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-rozha',
  display: 'swap',
})

const kalnia = Kalnia({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-kalnia',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Danielle Walder — Overthinking Real Estate',
  description: 'Los Angeles real estate, housing decisions, and Overthinking Real Estate.',
  // No Open Graph or Twitter image is declared: no real source asset exists
  // yet, and fabricating one is not an option. Add it with the approved
  // artwork before public launch.
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${rozhaOne.variable} ${kalnia.variable} ${figtree.variable}`}
    >
      <body>
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}

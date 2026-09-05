import type { Metadata } from 'next'
import { Figtree, Kalnia, Rozha_One, Unbounded } from 'next/font/google'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteNav } from '@/components/SiteNav'
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
  title: 'danielle walder — Los Angeles real estate',
  description:
    'Los Angeles agent Danielle Walder — current listings, past sales, and the newsletter Overthinking Real Estate.',
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

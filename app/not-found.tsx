import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { notFoundPage } from '@/lib/content/pages'

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow={notFoundPage.eyebrow}
        heading={notFoundPage.heading}
        intro={notFoundPage.intro}
      />

      <section aria-label="Go to" className="wrap pt-10 mobile:pt-8">
        <ul className="flex flex-col border-t border-hairline">
          {notFoundPage.links.map((link) => (
            <li key={link.href} className="border-b border-hairline">
              <Link
                href={link.href}
                className="flex items-center justify-between gap-6 py-6 font-sans text-[19px] font-medium text-espresso hover:text-wine mobile:text-[17px]"
              >
                {link.label}
                <span aria-hidden="true" className="text-sage-olive">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

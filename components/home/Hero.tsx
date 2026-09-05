'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { hero } from '@/lib/content/home'

/**
 * Hero A — Danielle-led. Her portrait, not a house. That was a deliberate,
 * approved decision.
 */
export function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  /**
   * URL is the source of truth for search, so results are shareable and
   * back/forward work. The form also submits natively without JS.
   */
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchQuery.trim()
    router.push(query ? `/listings?q=${encodeURIComponent(query)}` : '/listings')
  }

  return (
    <header className="wrap pt-[22px]">
      <div className="grid grid-cols-[1.04fr_0.96fr] items-center gap-[50px] rounded-block bg-blue-field px-[46px] py-[54px] tablet:grid-cols-1 tablet:gap-9 mobile:gap-8 mobile:rounded-[16px] mobile:px-6 mobile:py-8">
        <div className="flex min-w-0 flex-col gap-[26px]">
          <h1 className="font-mark text-hero font-semibold tracking-display text-blue-ink tablet:text-hero-tablet mobile:text-hero-mobile">
            {hero.headline}
          </h1>

          <p className="max-w-intro font-sans text-[19px] leading-[1.45] text-blue-deep">
            {hero.intro}
          </p>

          <form
            action="/listings"
            method="get"
            onSubmit={onSubmit}
            className="flex max-w-search items-center gap-[10px] rounded-field bg-paper py-2 pl-[22px] pr-2 mobile:max-w-none mobile:flex-wrap mobile:rounded-[16px] mobile:p-[14px]"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search homes
            </label>
            <input
              id="hero-search"
              type="search"
              name="q"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={hero.searchPlaceholder}
              className="w-full min-w-0 bg-transparent font-sans text-[16.5px] text-espresso placeholder:text-taupe mobile:px-2 mobile:pb-[6px]"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-input bg-brown px-6 py-[14px] font-sans text-[15px] font-semibold text-onbrown hover:bg-wine mobile:w-full"
            >
              {hero.searchCta}
            </button>
          </form>
        </div>

        <ImageSlot
          image={hero.portrait}
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="h-[520px] rounded-[4px] tablet:h-[420px] mobile:h-[340px]"
        />
      </div>
    </header>
  )
}

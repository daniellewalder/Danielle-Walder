import { areaGuide } from '@/lib/content/areas'

/**
 * "Local details last verified September 5, 2026."
 *
 * Formatted in UTC so a stored yyyy-mm-dd never renders as the previous day in
 * a western timezone. Renders nothing without a date — an unverified guide
 * does not get to imply it was checked.
 */
export function VerificationLine({ date }: { date: string | null }) {
  if (!date) return null

  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return null

  return (
    <p className="font-sans text-[13.5px] text-taupe">
      {areaGuide.verifiedLabel}{' '}
      <time dateTime={date}>
        {parsed.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        })}
      </time>
      .
    </p>
  )
}

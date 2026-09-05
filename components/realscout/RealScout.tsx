import { realScoutAgentId, realScoutScriptSrc } from '@/lib/config'

/**
 * RealScout IDX web components.
 *
 * Every widget is themed with locked palette tokens only, and every one has
 * RealScout's drop shadow switched off — the design system has no shadows.
 *
 * Width is handled here rather than in RealScout's dashboard. Each component
 * is told to fill its container and the container is capped, so the widget is
 * the intended size on a laptop and fluid on a phone instead of overflowing.
 * A fixed pixel width from their config would break every narrow screen.
 *
 * React hoists and de-duplicates the script, so it loads once per page and
 * only on pages that actually use a widget.
 */
function Script() {
  return <script src={realScoutScriptSrc} type="module" async />
}

/** Reserves height so the page does not jump when the widget upgrades. */
const slot = 'w-full'

export function SimpleSearch({ className = '' }: { className?: string }) {
  return (
    <>
      <Script />
      <style>{`
        realscout-simple-search {
          --rs-ss-font-primary-color: #24425a;
          --rs-ss-searchbar-border-color: #a9ae7f;
          --rs-ss-box-shadow: none;
          --rs-ss-widget-width: 100% !important;
        }
      `}</style>
      <div className={`${slot} max-w-search min-h-[62px] ${className}`}>
        <realscout-simple-search agent-encoded-id={realScoutAgentId} />
      </div>
    </>
  )
}

export function AdvancedSearch({ className = '' }: { className?: string }) {
  return (
    <>
      <Script />
      <style>{`
        realscout-advanced-search {
          --rs-as-button-text-color: #f4f1e2;
          --rs-as-background-color: #d8ebf9;
          --rs-as-button-color: #513229;
          --rs-as-widget-width: 100% !important;
        }
      `}</style>
      <div className={`${slot} mx-auto max-w-[688px] min-h-[260px] ${className}`}>
        <realscout-advanced-search agent-encoded-id={realScoutAgentId} />
      </div>
    </>
  )
}

export function HomeValue({ className = '' }: { className?: string }) {
  return (
    <>
      <Script />
      <style>{`
        realscout-home-value {
          --rs-hvw-background-color: #d8ebf9;
          --rs-hvw-title-color: #24425a;
          --rs-hvw-subtitle-color: #3a5b75;
          --rs-hvw-input-text-color: #24425a;
          --rs-hvw-primary-button-text-color: #f4f1e2;
          --rs-hvw-primary-button-color: #513229;
          --rs-hvw-secondary-button-text-color: #513229;
          --rs-hvw-secondary-button-color: #fbf9f0;
          --rs-hvw-widget-width: 100% !important;
        }
      `}</style>
      <div className={`${slot} max-w-search min-h-[180px] ${className}`}>
        {/* Title and subtitle are off; the page sets those in Danielle's type. */}
        <realscout-home-value
          agent-encoded-id={realScoutAgentId}
          remove-title=""
          remove-subtitle=""
        />
      </div>
    </>
  )
}

/**
 * Danielle's own MLS listings, straight from RealScout.
 *
 * Every attribute below is preserved exactly as supplied: the agent id, the
 * sort order, the full listing-status set, and the property types. Do not
 * trim or reorder them — this is what she configured in RealScout.
 *
 * The divider colour, rgb(101, 141, 172) / #658DAC, is preserved exactly as it
 * came in that RealScout configuration. It sits outside the locked site
 * palette. That is not a stated brand decision — it is simply the value the
 * supplied snippet carried — so leave it alone unless we deliberately restyle
 * the RealScout widget later.
 *
 * This widget fills the content width rather than sitting in a capped
 * container — listing cards need the room, and RealScout lays them out.
 */
export function YourListings({ className = '' }: { className?: string }) {
  return (
    <>
      <Script />
      <style>{`
        realscout-your-listings {
          --rs-listing-divider-color: rgb(101, 141, 172);
          width: 100%;
        }
      `}</style>
      <div className={`${slot} min-h-[320px] ${className}`}>
        <realscout-your-listings
          agent-encoded-id={realScoutAgentId}
          sort-order="STATUS_AND_SIGNIFICANT_CHANGE"
          listing-status="For Sale,For Rent,In Contract,Sold,Rented"
          property-types="SFR,MF,TC,LAL,MOBILE,OTHER"
        />
      </div>
    </>
  )
}

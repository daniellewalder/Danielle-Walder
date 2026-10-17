/**
 * Runs inline as the page is parsed, before the hero paints: it arms the
 * entrance states so nothing flashes in its finished position first. Never
 * under reduced motion. If HomeMotion has not taken over within 2.5s the
 * failsafe disarms, so a page whose script failed still renders finished.
 */
const ARM = `(function(){var r=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;r.classList.add('anim-armed');window.setTimeout(function(){if(r.dataset.motion!=='live')r.classList.remove('anim-armed')},2500)})();`

export function ArmMotion() {
  return <script dangerouslySetInnerHTML={{ __html: ARM }} />
}

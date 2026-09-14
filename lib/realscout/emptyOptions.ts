/**
 * Suppresses the RealScout autocomplete's "No options" panel.
 *
 * Danielle does not want the hero search telling people there are no options —
 * it reads as broken, and it shows on an empty field before anyone has typed a
 * character.
 *
 * WHY IT MATCHES ON TEXT. The panel belongs to RealScout's widget, whose markup
 * we neither control nor can see: `em.realscout.com` is blocked by this
 * workspace's egress policy, so the custom element never upgrades in a build
 * environment. Class names, roles and structure are unknown, and guessing at
 * them is exactly what has broken this integration before. The one thing
 * actually observed is the rendered string, so that is what this matches.
 *
 * It is built so that it cannot break the search:
 *
 *   - it starts only from leaf elements whose ENTIRE text is the message
 *   - it climbs to a wrapper only while that wrapper contains nothing else,
 *     and never above the root it was given
 *   - it never hides anything containing an input, button, select or textarea
 *   - it RELEASES anything it hid as soon as that node stops being the
 *     message, so a container the widget reuses for real results comes back
 *   - a closed shadow root, or a change of wording, makes it a silent no-op
 *
 * The release pass is the important one. Hiding a node permanently would mean
 * that if RealScout reuses one popup container for both the empty state and
 * real results, the results would render into a hidden box — a worse failure
 * than the message this removes.
 */

/**
 * Observed in the widget. Kept narrow on purpose — it must match the widget's
 * own empty-state line and never a sentence that happens to contain the words.
 */
const EMPTY_STATE = [/^no options?\.?$/i, /^no results?\.?$/i, /^no matches?\.?$/i]

const STATE = 'dwEmptyOption'
const PREVIOUS_DISPLAY = 'dwEmptyOptionDisplay'
const STATE_ATTRIBUTE = 'data-dw-empty-option'

export function isEmptyStateText(text: string | null): boolean {
  const trimmed = text?.trim() ?? ''
  return trimmed.length > 0 && EMPTY_STATE.some((pattern) => pattern.test(trimmed))
}

/** A node holding a control is part of the search, never part of the message. */
function holdsControl(element: Element): boolean {
  return element.querySelector('input, textarea, select, button') !== null
}

/** Puts back anything previously hidden that is no longer the message. */
function release(root: ParentNode): void {
  for (const element of Array.from(
    root.querySelectorAll<HTMLElement>(`[${STATE_ATTRIBUTE}]`),
  )) {
    if (isEmptyStateText(element.textContent)) continue

    if (element.dataset[STATE] === 'hidden') {
      element.style.display = element.dataset[PREVIOUS_DISPLAY] ?? ''
    }
    delete element.dataset[STATE]
    delete element.dataset[PREVIOUS_DISPLAY]
  }
}

/**
 * Hides every empty-state panel inside `root`, and un-hides anything that has
 * stopped being one. Returns how many it hid this pass, so a caller or a test
 * can tell whether it found anything.
 */
export function hideEmptyOptions(root: ParentNode): number {
  release(root)

  // Everything this touches must stay inside the root it was given.
  const boundary = root as unknown as Node
  let hidden = 0

  for (const element of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    // Start only from the leaf that actually holds the text.
    if (element.children.length > 0) continue
    if (!isEmptyStateText(element.textContent)) continue
    if (element.dataset[STATE]) continue

    // Climb through wrappers that contain nothing else, so the panel collapses
    // rather than leaving an empty box where the message was — but NEVER above
    // the root we were handed. Without that bound this walks out of the widget
    // and keeps going for as long as each ancestor contains nothing but the
    // message, which on a sparse DOM means <body> and then <html>. It hid the
    // entire page in testing.
    let target = element
    while (
      target.parentElement &&
      target.parentElement !== boundary &&
      boundary.contains(target.parentElement) &&
      isEmptyStateText(target.parentElement.textContent) &&
      !holdsControl(target.parentElement)
    ) {
      target = target.parentElement
    }

    if (holdsControl(target)) continue

    // Mark the leaf as well as the wrapper that gets hidden. Without it this
    // re-finds the same message every pass — and since hiding mutates the DOM,
    // the MutationObserver that calls this would retrigger on its own change.
    element.dataset[STATE] = 'seen'
    target.dataset[PREVIOUS_DISPLAY] = target.style.display
    target.dataset[STATE] = 'hidden'
    target.style.display = 'none'
    hidden += 1
  }

  return hidden
}

/** Light DOM plus the shadow root, when the component exposes an open one. */
export function rootsFor(host: Element): ParentNode[] {
  return host.shadowRoot ? [host, host.shadowRoot] : [host]
}

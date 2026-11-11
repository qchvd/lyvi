// Moves keyboard and screen reader focus to the page title (main h1), so a page change is announced.
// Pages are lazy-loaded and wait for the language to sync, so the h1 may appear a little later:
// it is looked for on each animation frame, for up to 3 seconds.
// Returns a function that cancels the search (to call on cleanup).
export function focusPageHeading(): () => void {
  const startTime = performance.now()
  let frameId = 0

  const tryFocus = () => {
    const heading = document.querySelector<HTMLElement>("main h1")
    if (heading) {
      // tabindex -1: focusable from the code only, not added to the Tab order
      heading.setAttribute("tabindex", "-1")
      // The scroll position is handled elsewhere (Lenis)
      heading.focus({ preventScroll: true })
      return
    }
    if (performance.now() - startTime < 3000) {
      frameId = requestAnimationFrame(tryFocus)
    }
  }

  frameId = requestAnimationFrame(tryFocus)
  return () => cancelAnimationFrame(frameId)
}

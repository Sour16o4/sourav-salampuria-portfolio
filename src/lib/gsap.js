/**
 * GSAP + ScrollTrigger loader.
 *
 * Deliberately dynamic: GSAP is only ever needed after hydration, and on
 * phones the pin never runs at all. Importing it here keeps ~45KB out of the
 * initial route bundle and off the critical path.
 *
 * ScrollTrigger is registered inside this promise, which is only ever awaited
 * from a useEffect — never at module scope, which would break SSR.
 */
let loader = null;

/**
 * Wait for the main thread to go quiet before pulling GSAP in.
 *
 * Every Reveal, the timeline, the counters and the parallax all call this on
 * mount, which is exactly when React is hydrating. Importing and initialising
 * ~45KB of animation code in that window competes directly with hydration and
 * shows up as total-blocking-time — it cost ~270ms of TBT on the home page.
 * Nothing here is above the fold, so a few hundred milliseconds later is free.
 */
function whenIdle() {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => resolve(), { timeout: 1200 });
    } else {
      setTimeout(resolve, 200);
    }
  });
}

export function loadScrollTrigger() {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  if (!loader) {
    loader = whenIdle()
      .then(() => Promise.all([import('gsap'), import('gsap/ScrollTrigger')]))
      .then(([gsapModule, stModule]) => {
        const gsap = gsapModule.gsap ?? gsapModule.default;
        const ScrollTrigger = stModule.ScrollTrigger ?? stModule.default;
        gsap.registerPlugin(ScrollTrigger);

        // Every ScrollTrigger created after this line is positioned against
        // whatever the page's layout happens to be at that exact moment —
        // and since this whole module loads deliberately late (see
        // whenIdle above), that moment can land before web fonts, or other
        // content still settling further down the page, have finished
        // shifting the real page height. A trigger's start/end points get
        // calculated once, against a too-short page, and a heading whose
        // "start" was placed past the actual (now longer) page can end up
        // never crossing it — the reveal simply never fires, and that
        // content is stuck invisible even though it's really on screen.
        // Re-running the calculation once fonts are actually ready, and
        // again once the full page (images included) has loaded, re-measures
        // every trigger against final layout — a cheap recalculation, not
        // an animation, and safe to call more than once.
        const refresh = () => ScrollTrigger.refresh();
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(refresh);
        }
        if (document.readyState === 'complete') {
          refresh();
        } else {
          window.addEventListener('load', refresh, { once: true });
        }

        return { gsap, ScrollTrigger };
      })
      .catch((error) => {
        // A failed chunk must never take the page down — the site is fully
        // usable without any scroll-driven motion.
        loader = null;
        if (process.env.NODE_ENV !== 'production') {
          console.error('[gsap] failed to load', error);
        }
        return null;
      });
  }
  return loader;
}

'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Route transitions. Framer Motion's job — React state, never scroll position.
 *
 * Deliberately opacity-only. A `transform` on this wrapper would become a
 * containing block for every `position: fixed` descendant, which would break
 * the reading-progress bar on chapter pages.
 *
 * `initial={false}` means the first paint does not animate: the hero is
 * visible immediately and stays the LCP element.
 */
const EASE = [0.33, 1, 0.68, 1];

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // Reduced motion collapses the durations to zero — it must NOT change the
  // rendered tree. Returning `children` bare here instead of the wrapper is a
  // structural difference between server and client, and because headless
  // Chrome reports `prefers-reduced-motion: reduce` by default, that showed up
  // as a hydration failure (React #418) in every Lighthouse run.
  const inDuration = reduce ? 0 : 0.45;
  const outDuration = reduce ? 0 : 0.35;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: inDuration, ease: EASE } }}
        exit={{ opacity: 0, transition: { duration: outDuration, ease: EASE } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

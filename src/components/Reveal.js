'use client';

import { useEffect, useRef } from 'react';

import { MOTION, prefersReducedMotion, settle } from '@/lib/motion';
import { loadScrollTrigger } from '@/lib/gsap';

/**
 * The site's one entrance animation, straight out of the motion vocabulary:
 * y 24 → 0, opacity 0 → 1, 0.6s, power3.out, 0.08s sibling stagger.
 *
 * Scroll-linked, so GSAP owns it — never Framer Motion, never anime.js.
 * Every reveal is `once: true`; re-animating on scroll-up is the fastest way
 * to make a portfolio feel cheap.
 *
 * Elements are pre-hidden by CSS only under `.js-motion`, so with JS off or
 * reduced motion on, nothing is ever hidden and no content can be stranded.
 */
export default function Reveal({
  as: Tag = 'div',
  children,
  className,
  stagger = false,
  staggerAmount = MOTION.stagger,
  start = 'top 86%',
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const targets = stagger ? Array.from(root.children) : [root];
    if (targets.length === 0) return undefined;

    if (prefersReducedMotion()) {
      settle(targets);
      return undefined;
    }

    let cancelled = false;
    let context = null;
    let fallback = null;

    loadScrollTrigger().then((lib) => {
      if (cancelled || !lib) {
        settle(targets);
        return;
      }
      const { gsap } = lib;

      context = gsap.context(() => {
        gsap.fromTo(
          targets,
          { y: MOTION.enterY, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: MOTION.enterDuration,
            ease: MOTION.enterEase,
            stagger: stagger ? staggerAmount : 0,
            scrollTrigger: { trigger: root, start, once: true },
            onComplete: () => {
              for (const target of targets) target.style.willChange = 'auto';
            },
          }
        );
      }, root);

      // Safety net. ScrollTrigger's start position is calculated the
      // instant this runs, which — because this module loads deliberately
      // late (see loadScrollTrigger) — can land after fonts or other
      // content have shifted the page's real layout. A trigger calculated
      // against stale layout can miss its mark entirely, leaving content
      // that is genuinely on screen permanently stuck at opacity 0. That
      // failure mode is worse than the reveal simply not playing, so
      // anything still hidden a couple of seconds after its trigger was
      // set up, despite already being visible in the viewport, gets
      // forced into its finished state instead of staying invisible.
      fallback = window.setTimeout(() => {
        const stillHidden = targets.some((target) => parseFloat(getComputedStyle(target).opacity) < 1);
        if (!stillHidden) return;
        const onScreen = targets.some((target) => {
          const rect = target.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < window.innerHeight;
        });
        if (onScreen) {
          if (context) context.revert();
          settle(targets);
        }
      }, 2500);
    });

    return () => {
      cancelled = true;
      if (fallback) window.clearTimeout(fallback);
      if (context) context.revert();
      settle(targets);
    };
  }, [stagger, staggerAmount, start]);

  const attrs = stagger ? { 'data-reveal-stagger': '' } : { 'data-reveal': '' };

  return (
    <Tag ref={ref} className={className} {...attrs} {...rest}>
      {children}
    </Tag>
  );
}

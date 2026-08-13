'use client';

import { useEffect, useRef } from 'react';

import { prefersReducedMotion } from '@/lib/motion';
import { loadScrollTrigger } from '@/lib/gsap';

/**
 * A thin green bar scrubbed to article height. Scroll-linked, so GSAP.
 * Hidden entirely under reduced motion — an empty rail that never fills is
 * worse than no rail.
 */
export default function ReadingProgress({ targetId }) {
  const fillRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let cancelled = false;
    let context = null;

    loadScrollTrigger().then((lib) => {
      if (cancelled || !lib) return;
      const { gsap, ScrollTrigger } = lib;

      context = gsap.context(() => {
        const fill = fillRef.current;
        const target = document.getElementById(targetId);
        if (!fill || !target) return;

        const write = (progress) => {
          fill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
        };
        write(0);

        ScrollTrigger.create({
          trigger: target,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => write(self.progress),
          onRefresh: (self) => write(self.progress),
        });
      });
    });

    return () => {
      cancelled = true;
      if (context) context.revert();
    };
  }, [targetId]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-16 right-0 left-0 z-40 h-[2px] bg-transparent"
    >
      <span
        ref={fillRef}
        className="block h-full w-full origin-left bg-acc"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}

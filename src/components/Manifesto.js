'use client';

import { useEffect, useRef } from 'react';

import Reveal from '@/components/Reveal';
import { MOTION, parallaxScale, prefersReducedMotion } from '@/lib/motion';
import { Stops } from '@/lib/stops';
import { loadScrollTrigger } from '@/lib/gsap';

/**
 * Heading is scrubbed to scroll.
 *
 * Scroll-linked, so this is GSAP's job — never Framer Motion's. Travel is
 * capped at MOTION.parallaxMax (60px) and the body text gets none, because
 * parallax on a reading surface is just jitter.
 */
export default function Manifesto({ manifesto }) {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let cancelled = false;
    let matchMedia = null;

    loadScrollTrigger().then((lib) => {
      if (cancelled || !lib) return;
      const { gsap } = lib;
      matchMedia = gsap.matchMedia();

      // Parallax is off below 480 and half-range to 1023.
      matchMedia.add('(min-width: 480px) and (prefers-reduced-motion: no-preference)', () => {
        const section = sectionRef.current;
        if (!section) return undefined;

        const scale = parallaxScale();
        const trigger = {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: MOTION.scrub,
          invalidateOnRefresh: true,
        };

        const tweens = [
          gsap.fromTo(
            headingRef.current,
            { y: 0 },
            { y: -12 * scale, ease: 'none', scrollTrigger: trigger }
          ),
        ];

        return () => {
          for (const tween of tweens) {
            if (tween.scrollTrigger) tween.scrollTrigger.kill();
            tween.kill();
          }
          gsap.set(headingRef.current, { clearProps: 'transform' });
        };
      });
    });

    return () => {
      cancelled = true;
      if (matchMedia) matchMedia.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="hairline section-y" aria-labelledby="manifesto-heading">
      <div className="container-x">
        {/* Parallax owns this wrapper's transform; Reveal owns the transforms
            of the elements inside it. Never the same node twice. */}
        <div ref={headingRef} data-parallax="">
          <Reveal stagger>
            <p className="micro">002 / thesis</p>
            <h2 id="manifesto-heading" className="t-h2 mt-5">
              <Stops text={manifesto.heading} />
            </h2>
          </Reveal>
        </div>

        <Reveal stagger className="mt-8 space-y-5">
          {manifesto.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="t-body max-w-[62ch]">
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

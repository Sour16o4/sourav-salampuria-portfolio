'use client';

import { useEffect, useRef } from 'react';

import Reveal from '@/components/Reveal';
import { MOTION, parallaxScale, prefersReducedMotion } from '@/lib/motion';
import { Stops } from '@/lib/stops';
import { Todo, isTodo } from '@/lib/todo';
import { loadScrollTrigger } from '@/lib/gsap';

/**
 * Portrait left, heading right, both scrubbed to scroll.
 *
 * Scroll-linked, so this is GSAP's job — never Framer Motion's. Travel is
 * capped at MOTION.parallaxMax (60px) and the body text gets none, because
 * parallax on a reading surface is just jitter.
 */
export default function Manifesto({ manifesto }) {
  const sectionRef = useRef(null);
  const portraitRef = useRef(null);
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
            portraitRef.current,
            { y: 0 },
            { y: -40 * scale, ease: 'none', scrollTrigger: trigger }
          ),
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
          gsap.set([portraitRef.current, headingRef.current], { clearProps: 'transform' });
        };
      });
    });

    return () => {
      cancelled = true;
      if (matchMedia) matchMedia.revert();
    };
  }, []);

  const portrait = manifesto.portrait;

  return (
    <section ref={sectionRef} className="hairline section-y" aria-labelledby="manifesto-heading">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        <div ref={portraitRef} data-parallax="">
          {isTodo(portrait.src) ? (
            <div
              className="card flex items-center overflow-hidden p-5"
              style={{ aspectRatio: `${portrait.width} / ${portrait.height}` }}
            >
              <Todo value={portrait.src} />
            </div>
          ) : (
            /* Skeleton sits behind the image and is covered as it decodes.
               The box already reserves the exact aspect ratio, so this never
               moves anything — it only fills the gap before pixels arrive. */
            <div
              className="skeleton relative w-full overflow-hidden rounded-[7px] border border-faint"
              style={{ aspectRatio: `${portrait.width} / ${portrait.height}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portrait.src}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                decoding="async"
                onLoad={(event) => {
                  event.currentTarget.parentElement?.classList.remove('skeleton');
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
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
      </div>
    </section>
  );
}

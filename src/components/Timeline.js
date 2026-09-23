'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

import { MOTION, prefersReducedMotion, settle } from '@/lib/motion';
import { Stops } from '@/lib/stops';
import { loadScrollTrigger } from '@/lib/gsap';
import WorkCard from '@/components/WorkCard';

/**
 * The work — a single column, not alternating sides. The zigzag layout
 * this replaced looked fine when every card happened to be a similar
 * height, and produced an ugly dead gap the moment one wasn't — real
 * content is never that uniform. One column can't have that failure mode.
 *
 * No shared spine/dot rail either — replaced with a top accent that each
 * card draws in FOR ITSELF, left to right, as it enters. That keeps the
 * "something draws itself in" motion beat the spine used to carry,
 * without a continuous line threading the whole list or needing a left
 * gutter reserved for it.
 *
 * GSAP still owns the scroll entrance — `back.out`, not `power3.out`, for
 * a slight elastic overshoot rather than a flat glide — on top of Kokonut
 * UI's real "spotlight card" hover treatment (3D cursor tilt, a glow that
 * tracks the pointer, a one-shot shimmer) living in WorkCard.js. GSAP and
 * Framer Motion still never touch the same DOM node: this component's own
 * `data-card`/`data-accent` elements are GSAP's; WorkCard's own root is
 * Framer's.
 */
export default function Timeline({ label, heading, entries }) {
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const cards = Array.from(section.querySelectorAll('[data-card]'));
    const accents = Array.from(section.querySelectorAll('[data-accent]'));
    const targets = [...cards, ...accents];

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
        cards.forEach((card, index) => {
          const accent = accents[index];
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: card, start: 'top 86%', once: true },
          });

          // A flat glide reads as safe, not as a "pop" — back.out
          // overshoots slightly past scale 1 / y 0 before settling, the
          // elastic-feeling entrance the redesign asked for.
          timeline.fromTo(
            card,
            { y: MOTION.enterY, scale: 0.92, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, duration: MOTION.enterDuration + 0.15, ease: 'back.out(1.7)' }
          );

          if (accent) {
            timeline.fromTo(
              accent,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.55, ease: 'power2.out' },
              '<0.05'
            );
          }
        });
      }, section);

      // Safety net — same reasoning as Reveal.js: a trigger's start point
      // is calculated the instant it's created, which can land before the
      // page's real layout has settled since this whole module loads
      // deliberately late. A card that's genuinely on screen but whose
      // trigger missed its mark should never stay permanently invisible.
      fallback = window.setTimeout(() => {
        const stillHidden = cards.filter((card) => parseFloat(getComputedStyle(card).opacity) < 1);
        if (stillHidden.length === 0) return;
        const onScreen = stillHidden.some((card) => {
          const rect = card.getBoundingClientRect();
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
  }, [entries]);

  return (
    <section ref={sectionRef} id="work" className="section-y" aria-labelledby="work-heading">
      <div className="container-x">
        <p className="micro">{label}</p>
        <h2 id="work-heading" className="t-h2 mt-5">
          <Stops text={heading} />
        </h2>

        <ol className="relative m-0 mt-14 flex list-none flex-col gap-8 p-0">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              {/* GSAP owns this wrapper's transform/opacity for the scroll
                  entrance, plus the accent bar's own scaleX draw-in;
                  WorkCard's own root is a separate node that Framer Motion
                  owns for hover — never the same element. */}
              <div data-card="" className="relative max-w-[620px]">
                <span data-accent="" className="work-card-top-accent" aria-hidden="true" />
                <WorkCard
                  entry={entry}
                  reduce={reduce}
                  isActive={activeId === entry.id}
                  isDimmed={activeId !== null && activeId !== entry.id}
                  onHoverStart={() => setActiveId(entry.id)}
                  onHoverEnd={() => setActiveId((current) => (current === entry.id ? null : current))}
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

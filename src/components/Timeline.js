'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { MOTION, prefersReducedMotion, settle } from '@/lib/motion';
import { Stops } from '@/lib/stops';
import { Todo, isTodo } from '@/lib/todo';
import { loadScrollTrigger } from '@/lib/gsap';

/**
 * The work — alternating cards on a central spine.
 *
 * Scroll-linked, so GSAP owns all of it: the spine draws via stroke-dashoffset
 * scrubbed to scroll, cards slide in from their own side, and each node dot
 * fills green with a 5px ring as its card enters. All reveals are `once: true`
 * — re-animating on scroll-up is the fastest way to feel cheap.
 *
 * Semantically an ordered list, not a pile of divs.
 */
export default function Timeline({ label, heading, entries }) {
  const sectionRef = useRef(null);
  const spineRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const cards = Array.from(section.querySelectorAll('[data-card]'));
    const dots = Array.from(section.querySelectorAll('[data-dot]'));

    if (prefersReducedMotion()) {
      settle(cards);
      for (const dot of dots) dot.dataset.on = 'true';
      const spine = spineRef.current;
      if (spine) spine.style.strokeDashoffset = '0';
      return undefined;
    }

    let cancelled = false;
    let context = null;

    loadScrollTrigger().then((lib) => {
      if (cancelled || !lib) {
        settle(cards);
        for (const dot of dots) dot.dataset.on = 'true';
        return;
      }
      const { gsap } = lib;

      context = gsap.context(() => {
        const spine = spineRef.current;
        if (spine) {
          const length = spine.getTotalLength();
          gsap.set(spine, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(spine, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
              end: 'bottom 78%',
              scrub: MOTION.scrub,
              invalidateOnRefresh: true,
            },
          });
        }

        cards.forEach((card, index) => {
          const fromX = card.dataset.side === 'left' ? -28 : 28;
          gsap.fromTo(
            card,
            { x: fromX, y: MOTION.enterY, opacity: 0 },
            {
              x: 0,
              y: 0,
              opacity: 1,
              duration: MOTION.enterDuration,
              ease: MOTION.enterEase,
              scrollTrigger: {
                trigger: card,
                start: 'top 86%',
                once: true,
                onEnter: () => {
                  if (dots[index]) dots[index].dataset.on = 'true';
                },
              },
            }
          );
        });
      }, section);
    });

    return () => {
      cancelled = true;
      if (context) context.revert();
      settle(cards);
    };
  }, [entries]);

  return (
    <section ref={sectionRef} id="work" className="hairline section-y" aria-labelledby="work-heading">
      <div className="container-x">
        <p className="micro">{label}</p>
        <h2 id="work-heading" className="t-h2 mt-5">
          <Stops text={heading} />
        </h2>

        <ol className="relative m-0 mt-14 list-none p-0">
          {/* Spine. SVG so it can be drawn with stroke-dashoffset. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 left-[7px] h-full w-[2px] overflow-visible xs:left-[11px] lg:left-1/2 lg:-translate-x-1/2"
            preserveAspectRatio="none"
            viewBox="0 0 2 100"
          >
            <line x1="1" y1="0" x2="1" y2="100" stroke="var(--faint)" strokeWidth="2" />
            <line
              ref={spineRef}
              x1="1"
              y1="0"
              x2="1"
              y2="100"
              stroke="var(--acc)"
              strokeWidth="2"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset="100"
            />
          </svg>

          {entries.map((entry, index) => {
            const side = index % 2 === 0 ? 'left' : 'right';
            return (
              <li
                key={entry.id}
                className="relative pb-12 pl-8 last:pb-0 xs:pl-12 lg:grid lg:grid-cols-2 lg:gap-16 lg:pl-0"
              >
                <span
                  data-dot=""
                  className="node-dot absolute top-[7px] left-[2px] h-[11px] w-[11px] xs:left-[6px] lg:left-1/2 lg:-translate-x-1/2"
                  aria-hidden="true"
                />

                <div
                  data-card=""
                  data-side={side}
                  className={
                    side === 'left'
                      ? 'lg:col-start-1 lg:row-start-1 lg:flex lg:justify-end lg:pr-10'
                      : 'lg:col-start-2 lg:row-start-1 lg:pl-10'
                  }
                >
                  {/* GSAP owns the wrapper's transform for the entrance;
                      Framer Motion owns hover on this inner element. Two
                      libraries never touch the same node. */}
                  <motion.article
                    whileHover={reduce ? undefined : { y: -3, borderColor: 'rgba(91,228,155,.38)' }}
                    transition={{ duration: MOTION.hoverDuration, ease: [0.33, 1, 0.68, 1] }}
                    className="card w-full p-5 sm:p-6 lg:max-w-[440px]"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="mono text-[12px] text-acc">{entry.when}</span>
                      <span className="mono text-[12px] text-mute">{entry.org}</span>
                    </div>

                    <h3 className="t-h3 mt-3">{entry.title}</h3>

                    <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
                      {entry.chips.map((chip) => (
                        <li key={chip}>
                          <span className="chip">{chip}</span>
                        </li>
                      ))}
                    </ul>

                    {isTodo(entry.description) ? (
                      <div className="mt-4">
                        <Todo value={entry.description} />
                      </div>
                    ) : (
                      <p className="t-body mt-4 text-[14px]">{entry.description}</p>
                    )}

                    {entry.href ? (
                      <p className="mt-5">
                        <Link
                          href={entry.href}
                          className="mono inline-flex items-center gap-1.5 text-[12px] text-acc"
                        >
                          Detailed report
                          <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
                        </Link>
                      </p>
                    ) : null}
                  </motion.article>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

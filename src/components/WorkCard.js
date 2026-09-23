'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { MOTION } from '@/lib/motion';
import { Todo, isTodo } from '@/lib/todo';

/**
 * The hover-rich inner layer of a work-history card — 3D cursor tilt, an
 * ambient glow that tracks the pointer, a one-shot shimmer sweep on enter,
 * and dimming when a SIBLING card is active. This is the pattern named
 * "spotlight cards" in Kokonut UI's real component registry, not a look
 * invented here — confirmed independently before building it.
 *
 * Framer Motion owns every pixel of this component; GSAP never touches
 * this node. The wrapper div in Timeline.js (data-card) is what GSAP
 * animates for the scroll entrance — two separate DOM nodes on purpose,
 * so the two libraries are never fighting over the same element's style.
 */
export default function WorkCard({ entry, reduce, isActive, isDimmed, onHoverStart, onHoverEnd }) {
  const ref = useRef(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 300, damping: 26 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 300, damping: 26 });
  const glowX = useTransform(mx, [0, 1], [0, 100]);
  const glowY = useTransform(my, [0, 1], [0, 100]);
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(126,224,255,0.2), transparent 60%)`;

  function handleMove(event) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width);
    my.set((event.clientY - rect.top) / rect.height);
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      animate={{ scale: isDimmed ? 0.97 : 1, opacity: isDimmed ? 0.55 : 1 }}
      transition={{ duration: MOTION.hoverDuration, ease: [0.33, 1, 0.68, 1] }}
      className="card work-card relative w-full overflow-hidden p-5 sm:p-6"
    >
      {!reduce ? (
        <>
          <motion.div aria-hidden="true" className="work-card-glow" style={{ background: glowBackground }} />
          <motion.div
            aria-hidden="true"
            className="work-card-sheen"
            initial={{ x: '-130%' }}
            animate={{ x: isActive ? '130%' : '-130%' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            aria-hidden="true"
            className="work-card-edge"
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
        </>
      ) : null}

      <div className="relative">
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
            <Link href={entry.href} className="mono inline-flex items-center gap-1.5 text-[12px] text-acc">
              Detailed report
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}

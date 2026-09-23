'use client';

import { useEffect, useRef } from 'react';

import { prefersReducedMotion } from '@/lib/motion';
import { loadScrollTrigger } from '@/lib/gsap';

/**
 * Horizontal bar chart, one row per terminal skill group. Bar length is the
 * real tool count in that group's value string ("Go · SQL · Bash" → 3) —
 * counted from the same data the terminal already prints, not a separate
 * invented "proficiency" score.
 *
 * Scroll-linked width fill, so GSAP owns it (never Framer Motion). Same
 * once-only, reduced-motion-safe, stale-trigger-safe shape as Reveal and
 * Timeline's own GSAP code — this stays a dedicated component rather than a
 * Reveal variant because animating `width` on a chart fill is a different
 * kind of motion than Reveal's y/opacity entrance.
 */
export default function SkillsChart({ groups }) {
  const rootRef = useRef(null);

  const rows = groups.map((group) => ({
    key: group.key,
    count: group.value.split('·').length,
  }));
  const max = Math.max(...rows.map((row) => row.count));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const fills = Array.from(root.querySelectorAll('[data-fill]'));
    if (fills.length === 0) return undefined;

    const finish = () => {
      for (const fill of fills) fill.style.width = fill.dataset.target;
    };

    if (prefersReducedMotion()) {
      finish();
      return undefined;
    }

    let cancelled = false;
    let context = null;
    let fallback = null;

    loadScrollTrigger().then((lib) => {
      if (cancelled || !lib) {
        finish();
        return;
      }
      const { gsap } = lib;

      context = gsap.context(() => {
        gsap.fromTo(
          fills,
          { width: '0%' },
          {
            width: (index, el) => el.dataset.target,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: root, start: 'top 82%', once: true },
          }
        );
      }, root);

      fallback = window.setTimeout(() => {
        const stillEmpty = fills.some((fill) => parseFloat(getComputedStyle(fill).width) < 2);
        if (!stillEmpty) return;
        const rect = root.getBoundingClientRect();
        const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
        if (onScreen) {
          if (context) context.revert();
          finish();
        }
      }, 2500);
    });

    return () => {
      cancelled = true;
      if (fallback) window.clearTimeout(fallback);
      if (context) context.revert();
      finish();
    };
  }, []);

  return (
    <div ref={rootRef} className="card mt-12 p-6 sm:p-8">
      <p className="micro">/ stack, by weight</p>
      <div className="mt-5 flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-4">
            <span className="mono w-20 shrink-0 text-[13px] text-mute">{row.key}</span>
            <div
              className="h-[10px] flex-grow overflow-hidden rounded-full bg-bg-3"
              style={{ boxShadow: 'inset 0 2px 4px rgba(2,4,5,0.6)' }}
            >
              <div
                data-fill
                data-target={`${(row.count / max) * 100}%`}
                className="h-full rounded-full"
                style={{
                  width: 0,
                  background: 'linear-gradient(90deg, #2f9bc2 0%, var(--acc) 70%, #eafcff 100%)',
                  boxShadow: '0 0 14px rgba(126,224,255,0.5)',
                }}
              />
            </div>
            <span className="mono w-6 shrink-0 text-right text-[15px] font-semibold text-ink">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

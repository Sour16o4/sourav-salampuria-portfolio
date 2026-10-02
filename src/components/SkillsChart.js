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
    tools: group.value.split('·').map((tool) => tool.trim()),
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
    <div ref={rootRef} className="mt-12 py-2">
      <p className="text-[13px] font-semibold text-mute">Stack, by weight</p>
      <div className="mt-5 flex flex-col gap-5">
        {rows.map((row) => (
          <div key={row.key} className="grid gap-x-4 gap-y-2 sm:grid-cols-[5rem_minmax(0,1fr)_1.5rem] sm:items-center">
            <span className="text-[14px] font-medium text-mute">{row.key}</span>
            <div className="min-w-0">
              <ul className="m-0 mb-2 flex list-none flex-wrap gap-1.5 p-0">
                {row.tools.map((tool) => (
                  <li key={tool} className="stack-tool">
                    {tool}
                  </li>
                ))}
              </ul>
              <div
                className="h-[8px] w-full overflow-hidden rounded-full bg-bg-3"
                style={{ boxShadow: 'inset 0 2px 4px rgba(58,10,20,0.3)' }}
              >
                <div
                  data-fill
                  data-target={`${(row.count / max) * 100}%`}
                  className="h-full rounded-full"
                  style={{
                    width: 0,
                    background: 'linear-gradient(90deg, #b98a62 0%, #7a2233 70%, #3a0a14 100%)',
                    boxShadow: '0 0 14px rgba(217,180,143,0.5)',
                  }}
                />
              </div>
            </div>
            <span className="hidden text-right text-[15px] font-semibold text-ink sm:block">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

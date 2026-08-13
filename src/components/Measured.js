'use client';

import { useRef } from 'react';

import Reveal from '@/components/Reveal';
import { prefersReducedMotion, useIsomorphicLayoutEffect } from '@/lib/motion';
import { Stops } from '@/lib/stops';
import { loadScrollTrigger } from '@/lib/gsap';

const DURATION = 1.1;

function format(value, decimals) {
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

/**
 * Count-up stat cells. GSAP tweens a proxy object and writes to textContent —
 * scroll-triggered, so it is GSAP's job, not Framer Motion's.
 *
 * Decimal places are preserved while counting (0.23 never renders as 0.2), and
 * each cell reserves its final width in `ch` so nothing reflows mid-count.
 */
export default function Measured({ measured }) {
  const sectionRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const cells = Array.from(section.querySelectorAll('[data-stat]'));
    if (cells.length === 0) return undefined;

    const finals = cells.map((cell) => ({
      el: cell,
      value: Number(cell.dataset.stat),
      decimals: Number(cell.dataset.decimals),
    }));

    const showFinal = () => {
      for (const cell of finals) cell.el.textContent = format(cell.value, cell.decimals);
    };

    // Reduced motion: final values, immediately, no tween.
    if (prefersReducedMotion()) {
      showFinal();
      return undefined;
    }

    for (const cell of finals) cell.el.textContent = format(0, cell.decimals);

    let cancelled = false;
    let context = null;

    loadScrollTrigger().then((lib) => {
      if (cancelled || !lib) {
        showFinal();
        return;
      }
      const { gsap } = lib;

      context = gsap.context(() => {
        finals.forEach((cell, index) => {
          const proxy = { n: 0 };
          gsap.to(proxy, {
            n: cell.value,
            duration: DURATION,
            ease: 'power2.out',
            delay: index * 0.1,
            scrollTrigger: { trigger: section, start: 'top 78%', once: true },
            onUpdate: () => {
              cell.el.textContent = format(proxy.n, cell.decimals);
            },
            onComplete: () => {
              cell.el.textContent = format(cell.value, cell.decimals);
            },
          });
        });
      }, section);
    });

    return () => {
      cancelled = true;
      if (context) context.revert();
      showFinal();
    };
  }, [measured]);

  return (
    <section
      ref={sectionRef}
      id="measured"
      className="hairline section-y"
      aria-labelledby="measured-heading"
    >
      <div className="container-x">
        <Reveal stagger>
          <p className="micro">{measured.label}</p>
          <h2 id="measured-heading" className="t-h2 mt-5">
            <Stops text={measured.heading} />
          </h2>
        </Reveal>

        <dl className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[7px] border border-faint bg-faint sm:grid-cols-2 lg:grid-cols-4">
          {measured.stats.map((stat) => {
            const final = format(stat.value, stat.decimals);
            return (
              <div key={stat.id} className="flex flex-col bg-bg-2 p-6">
                <dd className="order-1 m-0 flex items-baseline gap-1.5">
                  <span
                    data-stat={stat.value}
                    data-decimals={stat.decimals}
                    className="mono text-[clamp(28px,3.4vw,38px)] leading-none font-medium tracking-[-0.03em] text-ink"
                    style={{ minWidth: `${final.length}ch`, display: 'inline-block' }}
                  >
                    {final}
                  </span>
                  <span className="mono text-[13px] text-acc">{stat.unit}</span>
                </dd>
                <dt className="order-2 mt-4 text-[13px] leading-relaxed text-mute">
                  {stat.caption}
                </dt>
              </div>
            );
          })}
        </dl>

        <Reveal>
          <p className="t-body mt-8 max-w-[76ch] text-[14px]">{measured.caveat}</p>
        </Reveal>
      </div>
    </section>
  );
}

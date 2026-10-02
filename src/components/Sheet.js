'use client';

import { useRef } from 'react';

import { useGhost } from '@/lib/useGhost';

/**
 * A Teal Grid sheet: framed panel, visible crosshair grid, and a giant ghost
 * word behind the content that sharpens under the cursor. Wraps any section.
 * `ghost` is a single short word (or a few); `tight` trims the padding for
 * page headers.
 */
const CROSSES = [
  ['2.7%', '0%'], ['34%', '0%'], ['66%', '0%'], ['97.3%', '0%'],
  ['2.7%', '100%'], ['34%', '100%'], ['66%', '100%'], ['97.3%', '100%'],
];

export default function Sheet({ ghost, id, label, tight = false, className = '', children }) {
  const ref = useRef(null);
  useGhost(ref);
  const lines = Array.isArray(ghost) ? ghost : [ghost];

  return (
    <section id={id} className="container-x tg-wrap" aria-label={label}>
      <div ref={ref} className={`tg-sheet tg-sec ${tight ? 'is-tight' : ''} ${className}`}
        style={{ '--len': Math.max(...lines.map((line) => line.length)) }}>
        <div className="tg-grid" aria-hidden="true">
          {['2.7%', '34%', '66%', '97.3%'].map((left) => (
            <b key={left} style={{ left }} />
          ))}
          {CROSSES.map(([left, top]) => (
            <s key={`${left}-${top}`} style={{ left, top }}>
              +
            </s>
          ))}
        </div>
        <div className="tg-ghost tg-ghost-sec tg-soft" aria-hidden="true">
          <div className="tg-gt">
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
        <div className="tg-ghost tg-ghost-sec tg-sharp" aria-hidden="true">
          <div className="tg-gt">
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
        <div className="tg-in">{children}</div>
      </div>
    </section>
  );
}

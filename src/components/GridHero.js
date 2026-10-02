'use client';

import Link from 'next/link';

/**
 * Teal Grid hero: a framed sheet with a visible crosshair grid and the name
 * set large and solid behind the intro. Projects live in the work section and
 * the contact form is its own section, so the hero carries no extra card.
 *
 * Content is all props from the existing JSON (hero, name) — nothing is
 * written here.
 */
const CROSSES = [
  ['2.7%', '12%'], ['34%', '12%'], ['66%', '12%'], ['97.3%', '12%'],
  ['2.7%', '88%'], ['34%', '88%'], ['66%', '88%'], ['97.3%', '88%'],
];

export default function GridHero({ hero, ghost }) {
  return (
    <section className="tg-hero container-x" aria-label="Introduction">
      <div className="tg-sheet">
        <div className="tg-grid" aria-hidden="true">
          {['2.7%', '34%', '66%', '97.3%'].map((left) => (
            <b key={left} style={{ left }} />
          ))}
          <u style={{ top: '12%' }} />
          <u style={{ top: '88%' }} />
          {CROSSES.map(([left, top]) => (
            <s key={`${left}-${top}`} style={{ left, top }}>
              +
            </s>
          ))}
        </div>

        <div className="tg-ghost tg-solid" aria-hidden="true">
          <div className="tg-gt">
            {ghost.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>

        <div className="tg-meta">
          <p className="tg-eyebrow">
            {hero.roleLine} <span aria-hidden="true">/</span> {hero.locationLabel}
          </p>
          <p className="tg-bio">{hero.bio}</p>
          <div className="tg-actions">
            {hero.actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`btn ${action.variant === 'primary' ? 'btn-primary' : 'btn-glass'}`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <h1 className="sr-only">{hero.name}</h1>

      </div>
    </section>
  );
}

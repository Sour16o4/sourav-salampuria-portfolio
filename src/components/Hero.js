import Link from 'next/link';

import Terminal from '@/components/Terminal';

/**
 * No entrance animation, by spec. Server-rendered and visible on first paint —
 * this is the LCP element, and animating it costs the score.
 */
export default function Hero({ hero, terminal }) {
  return (
    <section className="container-x pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="micro">{hero.locationLabel}</p>

          <h1 className="t-display mt-5">{hero.name}</h1>

          <p className="mono mt-4 text-[13px] tracking-[0.06em] text-acc">
            {hero.roleLine}
          </p>

          <p className="t-lead mt-6 max-w-[52ch]">{hero.bio}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            {hero.actions.map((action) => {
              const className = `btn ${action.variant === 'primary' ? 'btn-primary' : ''}`;
              return action.href.startsWith('/') ? (
                <Link key={action.label} href={action.href} className={className}>
                  {action.label}
                </Link>
              ) : (
                <a key={action.label} href={action.href} className={className}>
                  {action.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Below lg the terminal sits under the hero text, per the responsive table. */}
        <Terminal terminal={terminal} />
      </div>
    </section>
  );
}

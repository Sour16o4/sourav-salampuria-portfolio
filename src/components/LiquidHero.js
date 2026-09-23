import { Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import Terminal from '@/components/Terminal';

/**
 * EXPERIMENTAL — the redesign-in-progress hero. Swapped in on the home page
 * for local preview only; not yet the final direction for the rest of the
 * site.
 *
 * The name has no per-letter animation on it anymore — that read as
 * distracting rather than eye-pleasing. It's set in Space Grotesk instead
 * of Inter: a geometric sans with real character in a few letterforms (the
 * single-storey "a", the squared-off "G"), distinctive without the extra
 * weight/heaviness that made the earlier Bricolage Grotesque and Fraunces
 * attempts land wrong. No motion on hover either now — the cursor-tilt this
 * used to have bent the name and the terminal together as one block, which
 * read as a UI glitch rather than an effect. Server-rendered, no client JS
 * needed for this component at all anymore.
 */
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-space-grotesk' });

export default function LiquidHero({ hero, terminal }) {
  return (
    <section className={`lh-stage ${spaceGrotesk.variable}`}>
      <div className="lh-content lh-content-split">
        <div className="lh-text-col">
          <p className="lh-location">{hero.locationLabel}</p>
          <h1 className="lh-name">{hero.name}</h1>
          <p className="lh-role">{hero.bio}</p>
          <div className="lh-actions">
            {hero.actions.map((action) => {
              const className = `btn ${action.variant === 'primary' ? 'btn-primary' : 'btn-glass'}`;
              return action.href.startsWith('/') || action.href.startsWith('#') ? (
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

        {terminal ? (
          <div className="lh-terminal-col">
            <Terminal terminal={terminal} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

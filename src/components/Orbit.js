import icons from '@/lib/stack-icons.json';

/**
 * The stack, as a rotating orbit.
 *
 * Replaces the ticker: a strip that scrolled past said "here are some words",
 * where a ring around a statement says "these are the things it is made of".
 *
 * Server-rendered with no client JS — the rotation is two CSS animations, the
 * ring forward and each logo backward at the same duration, so the ring turns
 * while the logos stay upright. That also means it runs with JS disabled and
 * stops on its own under `prefers-reduced-motion`.
 *
 * Logos are single-path SVGs drawn in `currentColor`, never brand colours: the
 * palette is one accent and a grey ramp, and twelve brand palettes would be
 * twelve second accents. They are marked `aria-hidden` because the real list is
 * rendered for assistive tech instead — a screen reader should hear the stack,
 * not twelve unlabelled images arranged in a circle.
 */
export default function Orbit({ orbit }) {
  const count = icons.length;

  return (
    <section className="hairline border-b border-faint" aria-labelledby="stack-heading">
      <div className="container-x pt-7">
        <p id="stack-heading" className="micro">
          <span className="text-acc">/</span> stack
        </p>
      </div>

      <div className="container-x flex justify-center py-10 sm:py-12">
        <div className="orbit" style={{ '--n': count }}>
          <div className="orbit-ring" aria-hidden="true">
            {icons.map((icon, index) => (
              <span key={icon.label} className="orbit-item" style={{ '--i': index }}>
                <span className="orbit-icon" title={icon.label}>
                  <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                    <path d={icon.path} fill="currentColor" />
                  </svg>
                </span>
              </span>
            ))}
          </div>

          <p className="orbit-center">
            {orbit.lead}
            <span className="text-acc">.</span>
          </p>
        </div>
      </div>

      {/* The orbit is decoration; this is the content. Announced once, in
          order, with no mention of a circle. */}
      <ul className="sr-only">
        {icons.map((icon) => (
          <li key={icon.label}>{icon.label}</li>
        ))}
      </ul>
    </section>
  );
}

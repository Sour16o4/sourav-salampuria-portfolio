import icons from '@/lib/stack-icons.json';

/**
 * The stack, as a rotating orbit.
 *
 * Two columns on a laptop — the statement on the left, the ring on the right —
 * matching the manifesto and contact sections. A ring centred alone in a
 * 1400px column left a band of dead space either side of it and read as a gap
 * rather than a section; paired with copy it fills the measure like everything
 * else on the page. Below `lg` it stacks, copy first.
 *
 * Server-rendered with no client JS. The rotation is two CSS animations at one
 * duration, the ring forward and each mark backward, so the ring turns while
 * the logos stay upright. It therefore runs with JS disabled and stops on its
 * own under `prefers-reduced-motion`.
 *
 * Marks carry their real brand colour, which is the one place on the site with
 * a palette other than ink-and-accent. The chroma check in the verify suite
 * carves out `.orbit-icon` explicitly for that reason and covers everything
 * else unchanged.
 */
export default function Orbit({ orbit }) {
  const count = icons.length;

  return (
    <section className="hairline border-b border-faint section-y" aria-labelledby="stack-heading">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p id="stack-heading" className="micro">
            <span className="text-acc">/</span> stack
          </p>
          <h2 className="t-h3 mt-5 max-w-[16ch] text-[clamp(22px,2.6vw,30px)]">
            {orbit.heading}
            <span className="text-acc">.</span>
          </h2>
          <p className="t-body mt-6 max-w-[46ch]">{orbit.lead}</p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="orbit" style={{ '--n': count }}>
            <div className="orbit-ring" aria-hidden="true">
              {icons.map((icon, index) => (
                <span key={icon.label} className="orbit-item" style={{ '--i': index }}>
                  <span className="orbit-icon" title={icon.label} style={{ '--brand': icon.hex }}>
                    <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                      <path d={icon.path} fill="currentColor" />
                    </svg>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The ring is decoration; this is the content. Announced once, in order,
          with no mention of a circle. */}
      <ul className="sr-only">
        {icons.map((icon) => (
          <li key={icon.label}>{icon.label}</li>
        ))}
      </ul>
    </section>
  );
}

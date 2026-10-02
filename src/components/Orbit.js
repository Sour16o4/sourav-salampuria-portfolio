import icons from '@/lib/stack-icons.json';
import SkillsChart from '@/components/SkillsChart';

/**
 * The stack, auto-scrolling.
 *
 * No JS at all — server-rendered like the rest of the page. The icon list
 * is rendered twice, back to back in one flex row, and the row scrolls
 * itself via a single CSS `translateX(0) -> translateX(-50%)` animation:
 * since the second half is a pixel-identical repeat of the first, the loop
 * point is invisible and the scroll reads as continuous rather than as a
 * jump. `-50%` is relative to the row's own (doubled) width, so this holds
 * at any viewport without measuring anything.
 *
 * SkillsChart below it is the only client-side piece here — a bar chart of
 * real tool counts per terminal group, not a second decorative marquee.
 */
/* Brand colours that are too dark to read on the dark tiles (Helm's navy, the
   Postgres blue) are mixed toward the latte so every logo stays visible. */
function tileColor(icon) {
  if (icon.mono) return '#f1e3c8';
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(icon.hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.24 ? `color-mix(in srgb, ${icon.hex} 40%, #f1e3c8)` : icon.hex;
}

export default function Orbit({ orbit, stack }) {
  const doubled = [...icons, ...icons];

  return (
    <section className="section-y" aria-labelledby="stack-heading">
      <div className="container-x">
        <h2 id="stack-heading" className="t-h2 max-w-[16ch]">
          {orbit.heading}
          <span className="text-acc">.</span>
        </h2>
        <p className="t-body mt-6 max-w-[52ch]">{orbit.lead}</p>

        <div className="stack-marquee mt-12">
          <div className="stack-marquee-track">
            {doubled.map((icon, index) => (
              <span
                key={`${icon.label}-${index}`}
                aria-hidden={index >= icons.length}
                className="stack-marquee-item"
                title={icon.label}
                style={{ '--brand': tileColor(icon) }}
              >
                <span className="stack-marquee-icon">
                  <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                    <path d={icon.path} fill="currentColor" />
                  </svg>
                </span>
                <span className="stack-marquee-label">{icon.label}</span>
              </span>
            ))}
          </div>
        </div>

        {stack?.length ? <SkillsChart groups={stack} /> : null}
      </div>

      {/* The row is decoration; this is the content. Announced once, in
          order, with no mention of scrolling. */}
      <ul className="sr-only">
        {icons.map((icon) => (
          <li key={icon.label}>{icon.label}</li>
        ))}
      </ul>
    </section>
  );
}

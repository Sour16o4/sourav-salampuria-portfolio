/**
 * Stack ticker.
 *
 * Pure CSS: a duplicated track translated 0 → -50%, ~44s, paused on hover,
 * 30% faster below 480px. No JS, no library — see globals.css.
 *
 * Framed as a band (hairline top and bottom) with a numbered micro-label, so
 * it reads as a deliberate strip in the same language as every other section
 * rather than pills floating in a void. Text pills, never logo files.
 */
export default function Marquee({ items }) {
  const track = [...items, ...items];

  return (
    <section
      className="hairline border-b border-faint"
      aria-labelledby="stack-heading"
    >
      <div className="container-x pt-7">
        <p id="stack-heading" className="micro">
          <span className="text-acc">/</span> stack
        </p>
      </div>

      <div className="marquee-mask mt-5 overflow-hidden pb-8">
        <ul className="marquee-track m-0 list-none gap-2.5 p-0" aria-hidden="true">
          {track.map((item, index) => (
            <li key={`${item}-${index}`} className="shrink-0">
              <span className="chip-stack">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* The visual track is duplicated, so it is hidden from assistive tech;
          this is the real list, announced once. */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

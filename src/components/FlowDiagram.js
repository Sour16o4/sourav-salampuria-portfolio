/**
 * Vertical flow diagram, built from real text rather than an image or ASCII art.
 *
 * Three reasons it is not a picture:
 *   - text stays legible at every width, so one diagram serves 320px and 1440px
 *     without a viewBox shrinking the labels into nothing
 *   - it re-themes with the page, because the colours are the same tokens
 *     everything else uses
 *   - it is selectable, searchable, and read by assistive tech as an ordered
 *     list, which is what a sequence of hops actually is
 *
 * The connectors are the only decorative part, so they are the only part hidden
 * from assistive tech.
 */

function Card({ step, index }) {
  return (
    <div className="rounded-[7px] border border-faint bg-bg-2 px-4 py-3">
      <p className="mono flex items-baseline gap-2 text-[13px] leading-snug">
        <span aria-hidden="true" className="text-acc">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>{step.node}</span>
      </p>

      {step.meta?.length ? (
        <ul className="mt-2 space-y-1 pl-[26px]">
          {step.meta.map((line) => (
            <li key={line} className="mono text-[11px] leading-snug text-mute">
              {line}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Rule plus chevron. Decorative — the <ol> already carries the order. */
function Arrow({ label }) {
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-1 py-2">
      <span className="block h-4 w-px bg-faint" />
      <svg width="9" height="6" viewBox="0 0 9 6" className="block text-mute">
        <path d="M4.5 6 0 0h9z" fill="currentColor" />
      </svg>
      {label ? <span className="mono text-[10px] tracking-[0.08em] text-mute">{label}</span> : null}
    </div>
  );
}

function Lane({ steps, title }) {
  return (
    <div>
      {title ? <p className="micro mb-3">{title}</p> : null}
      {/* One list, one item per hop — not a list per step. The arrow rides
          inside the item it leads into, so the sequence stays flat. */}
      <ol className="m-0 list-none p-0">
        {steps.map((step, index) => (
          <li key={step.node}>
            {index > 0 ? <Arrow label={step.via} /> : null}
            <Card step={step} index={index} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function FlowDiagram({ flow }) {
  const lanes = flow.lanes ?? [{ steps: flow.steps }];
  const single = lanes.length === 1;
  const mergeIndex = Math.max(...lanes.map((lane) => lane.steps.length));

  return (
    <figure className="m-0">
      <figcaption className="micro">{flow.label}</figcaption>

      <div className="card mt-3 p-5 sm:p-6">
        {/* Lanes sit side by side once there is room and stack below it, so a
            phone reads one path at a time instead of two squeezed columns. */}
        <div className={single ? '' : 'grid gap-8 md:grid-cols-2 md:gap-6'}>
          {lanes.map((lane, index) => (
            <Lane key={lane.title ?? index} steps={lane.steps} title={lane.title} />
          ))}
        </div>

        {flow.merge ? (
          <div>
            <Arrow label={flow.merge.via} />
            <Card step={flow.merge} index={mergeIndex} />
          </div>
        ) : null}
      </div>
    </figure>
  );
}

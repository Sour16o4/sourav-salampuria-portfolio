/**
 * Nested containment diagram — what lives inside what.
 *
 * A flow diagram answers "in what order"; this answers "where does it actually
 * run", which is the question the ingress pin only makes sense as an answer to.
 * Nesting is real nesting: a box inside a box is a process inside a container
 * inside a machine.
 *
 * Built from nested elements rather than an image so it reflows on a phone
 * instead of scaling into illegibility, and so the labels stay selectable.
 * Depth alternates the surface tone, using the same tokens as the rest of the
 * page, so the layers separate without a second colour or a shadow.
 */

const SURFACE = ['bg-bg-2', 'bg-bg-3', 'bg-bg-2', 'bg-bg-3'];

function Region({ region, depth }) {
  const children = region.children ?? [];

  return (
    <li className={`rounded-[7px] border border-faint p-3 sm:p-4 ${SURFACE[depth % SURFACE.length]}`}>
      <p className="mono flex items-baseline gap-2 text-[13px] leading-snug">
        {region.hop ? (
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center rounded-[4px] bg-acc-dim px-1.5 text-[11px] text-acc"
          >
            {region.hop}
          </span>
        ) : null}
        <span>{region.name}</span>
      </p>

      {region.meta?.length ? (
        <ul className="mt-2 space-y-1">
          {region.meta.map((line) => (
            <li key={line} className="mono text-[11px] leading-snug text-mute">
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      {children.length ? (
        <ul className="mt-3 space-y-3">
          {children.map((child) => (
            <Region key={child.name} region={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function Topology({ topology }) {
  return (
    <figure className="m-0">
      <figcaption className="micro">{topology.label}</figcaption>

      <div className="card mt-3 p-4 sm:p-5">
        <ul className="m-0 list-none p-0">
          <Region region={topology.root} depth={0} />
        </ul>

        {topology.note ? (
          <p className="t-body mt-4 text-[13px] text-mute">{topology.note}</p>
        ) : null}
      </div>
    </figure>
  );
}

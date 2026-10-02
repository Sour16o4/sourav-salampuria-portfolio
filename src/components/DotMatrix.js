/**
 * One glowing cell per unit — an honest count instead of a percentage
 * against some invented total. `value` fills that many cells in a
 * `columns`-wide grid; the remainder of the last row stays empty so the
 * grid reads as "37 filled, a few empty to complete the row," never as
 * "37 out of 40."
 *
 * Presentational only; the caller wraps it in <Reveal stagger> for the
 * entrance, same as any other chapter content on this page.
 */
export default function DotMatrix({ value, columns = 10 }) {
  const remainder = value % columns === 0 ? 0 : columns - (value % columns);
  const cells = [
    ...Array.from({ length: value }, (_, i) => ({ id: `on-${i}`, on: true })),
    ...Array.from({ length: remainder }, (_, i) => ({ id: `off-${i}`, on: false })),
  ];

  return (
    <div
      className="mt-4 grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, maxWidth: columns * 26 }}
    >
      {cells.map((cell) =>
        cell.on ? (
          <div
            key={cell.id}
            className="aspect-square rounded-[5px]"
            style={{
              background: 'radial-gradient(circle at 32% 28%, #d9b48f 0%, var(--acc) 55%, #3a0a14 100%)',
              boxShadow: '0 0 8px rgba(90,20,36,0.35), inset 0 1px 1px rgba(255,255,255,0.4)',
            }}
          />
        ) : (
          <div
            key={cell.id}
            className="aspect-square rounded-[5px] border border-faint bg-bg-3"
            style={{ boxShadow: 'inset 0 1px 2px rgba(58,10,20,0.35)' }}
          />
        )
      )}
    </div>
  );
}

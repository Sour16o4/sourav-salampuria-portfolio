/**
 * Narrowing tier stack for tenantguard's three detection tiers. The
 * decreasing width isn't decorative — it's the real shape of the pipeline:
 * each tier is a strictly stronger, strictly narrower proof than the one
 * above it (see the case study's "Three tiers, three different proof
 * strengths" chapter). Presentational only; the caller wraps it in
 * <Reveal stagger> for the entrance animation, same as any other chapter
 * content on this page.
 */
export default function FunnelChart({ tiers }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-[2px]">
      {tiers.map((tier, index) => {
        const isFirst = index === 0;
        const isLast = index === tiers.length - 1;
        const opacity = 0.14 + index * 0.13;
        const borderOpacity = 0.28 + index * 0.17;

        return (
          <div
            key={tier.id}
            className="box-border w-full px-6 py-4 sm:px-7"
            style={{
              width: `${100 - index * 26}%`,
              background: `rgba(126, 224, 255, ${opacity})`,
              border: `1px solid rgba(126, 224, 255, ${borderOpacity})`,
              borderTop: isFirst ? undefined : 'none',
              borderBottom: isLast ? undefined : 'none',
              borderRadius: isFirst ? '10px 10px 0 0' : isLast ? '0 0 10px 10px' : 0,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 24px -14px rgba(2,4,5,0.7)',
            }}
          >
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="mono rounded-full bg-acc px-2 py-0.5 text-[11px] font-bold text-acc-fg">
                TIER {index}
              </span>
              <span className="text-[15px] font-semibold text-ink">{tier.name}</span>
            </div>
            <p className="t-body text-[13px] leading-snug">{tier.description}</p>
          </div>
        );
      })}
    </div>
  );
}

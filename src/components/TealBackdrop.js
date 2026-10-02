/**
 * The site-wide Teal Grid backdrop: near-black ground, two slow drifting
 * teal and blue glows, two rotating arcs. Pure CSS, fixed, no filters beyond blur,
 * so it is far cheaper than the caustics it replaces.
 */
export default function TealBackdrop() {
  return (
    <div className="tb-bg" aria-hidden="true">
      <i className="tb-glow tb-g1" />
      <i className="tb-glow tb-g2" />
      <i className="tb-arc tb-a1" />
      <i className="tb-arc tb-a2" />
    </div>
  );
}

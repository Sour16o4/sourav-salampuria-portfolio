/**
 * EXPERIMENTAL — the caustics backdrop, restored. This is the two-field
 * "Caustics, Actually Refined" palette specifically (a bright cyan/white
 * field plus a cooler secondary one), not the later three-layer version —
 * that one added an interactive cursor-parallax and click-ripple on top,
 * which is dropped here to keep this to what was actually asked for: an
 * ambient, site-wide backdrop, nothing more.
 *
 * Mounted once at the top of <body> in the root layout, `position: fixed`,
 * so it stays visible behind the whole scrolling site, every page — not
 * scoped to the hero. It has to live outside LiquidHero's own DOM subtree
 * to do that: LiquidHero's wrapper sets `perspective` for its cursor-tilt
 * effect, and CSS establishes a new containing block for `position: fixed`
 * descendants on any ancestor with `perspective` set. Nested inside it,
 * "fixed" would really have meant "fixed to that element," not to the
 * viewport.
 *
 * Two lessons carried over from the version this replaced, both earned the
 * hard way:
 *   1. Coverage is CSS `radial-gradient()` on plain divs, not SVG
 *      `<radialGradient>` positioning — CSS gradient percentages are always
 *      relative to the element's own real rendered box, at any size or
 *      aspect ratio, full stop. The SVG-viewBox version got the crop math
 *      wrong for some real screen twice in a row.
 *   2. Motion is a slow CSS rotation on an oversized layer, not an animated
 *      `feTurbulence` baseFrequency — animating baseFrequency back and
 *      forth reads as a video rewinding at the loop point; rotation is a
 *      mathematically perfect loop (0deg and 360deg render identically), so
 *      there's never a seam. The turbulence itself (feTurbulence +
 *      feDisplacementMap) still supplies the organic "liquid" wobble, via
 *      CSS `filter: url(#id)` on top of the plain gradient divs — it just
 *      isn't what's driving the motion.
 * Displacement scale is kept deliberately small relative to the gradient's
 * own falloff distance — too large relative to a tight falloff is what
 * turned a previous pass's soft shimmer into jagged, dark, coastline-like
 * patches instead.
 *
 * The grain layer isn't decoration — it's the fix for visible colour-band
 * "stripes" across the gradients. A smooth radial gradient stretched over a
 * full screen exceeds an 8-bit display's actual colour steps, so the eye
 * sees the individual steps as rings instead of a continuous blend; a
 * faint dither breaks that banding up. Real displays show this even though
 * a design tool's own preview usually doesn't reproduce it.
 */
export default function LiquidBackground() {
  return (
    <div className="lh-bg" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {/* Each filter does two things in sequence, not one:
              1. Warp the gradient's own edges (feDisplacementMap off a coarse
                 turbulence) — this is the original wobble, kept as-is.
              2. Cut real wisps through the whole glow, not just its edge: a
                 second, much finer turbulence field is turned into an alpha
                 mask (feColorMatrix collapses it to a single alpha channel,
                 feComponentTransfer's gamma curve pushes low values toward
                 fully transparent and high values toward fully opaque) and
                 multiplied over the warped gradient with feComposite "in".
              Skipping step 2 is what the smooth-blob version was missing —
              a displaced edge still reads as a soft circle, never as smoke.

              baseFrequency is ×3 and every feDisplacementMap `scale` is ÷3
              versus what these looked like at first, because the element
              they're painted on now renders at 1/3 its former size (see
              .lh-caustic-group's `scale(3)`) — a plain compositor stretch
              recovers the original on-screen look for a fraction of the
              filter cost. Getting the frequency direction backwards here
              would make the noise pattern 3x TOO COARSE after the
              stretch, not too fine, so it's worth restating: smaller
              source element needs a HIGHER baseFrequency, not lower, to
              land on the same apparent grain size once stretched back up.
              Overscan is also tightened (was 140–160%, now a uniform
              130%) — safe because the actual displacement, as a fraction
              of the element's own size, hasn't changed, only its absolute
              size has — and wisp octaves are trimmed 4→3, detail that
              stopped being visible once averaged into the gamma curve. */}
          <filter id="lhTurbA" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.036 0.054" numOctaves="3" seed="7" result="warpNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="warpNoise"
              scale="8.7"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warped"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.036 0.06"
              numOctaves="3"
              seed="17"
              stitchTiles="stitch"
              result="wisp"
            />
            <feColorMatrix
              in="wisp"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 0"
              result="wispAlpha"
            />
            <feComponentTransfer in="wispAlpha" result="wispMask">
              <feFuncA type="gamma" amplitude="1.3" exponent="1.5" offset="-0.05" />
            </feComponentTransfer>
            <feComposite in="warped" in2="wispMask" operator="in" />
          </filter>
          <filter id="lhTurbB" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06 0.09" numOctaves="2" seed="3" result="warpNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="warpNoise"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warped"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.042 0.066"
              numOctaves="3"
              seed="29"
              stitchTiles="stitch"
              result="wisp"
            />
            <feColorMatrix
              in="wisp"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 0"
              result="wispAlpha"
            />
            <feComponentTransfer in="wispAlpha" result="wispMask">
              <feFuncA type="gamma" amplitude="1.3" exponent="1.5" offset="-0.05" />
            </feComponentTransfer>
            <feComposite in="warped" in2="wispMask" operator="in" />
          </filter>
          <filter id="lhTurbC" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.048" numOctaves="3" seed="41" result="warpNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="warpNoise"
              scale="4.7"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warped"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.039 0.06"
              numOctaves="3"
              seed="53"
              stitchTiles="stitch"
              result="wisp"
            />
            <feColorMatrix
              in="wisp"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 0"
              result="wispAlpha"
            />
            <feComponentTransfer in="wispAlpha" result="wispMask">
              <feFuncA type="gamma" amplitude="1.4" exponent="1.5" offset="-0.05" />
            </feComponentTransfer>
            <feComposite in="warped" in2="wispMask" operator="in" />
          </filter>
        </defs>
      </svg>

      <div className="lh-caustic-group">
        {/* Each layer is now TWO nested divs, not one, and that split is
            the actual fix for animation lag, not a stylistic detail. The
            filter (feTurbulence + feDisplacementMap + feComposite) is
            expensive, and reference filters like this one are generally
            NOT run on the GPU compositor — they're computed on the
            raster/paint thread, producing a bitmap. A browser can reuse
            that bitmap indefinitely and animate a `transform` on top of
            it for free on the compositor thread, but ONLY if the element
            carrying the transform animation is not the same element the
            filter is invalidating paint on. With filter and animated
            transform on the SAME element (the previous structure), there
            is no static bitmap to reuse — every one of these divs risks
            re-running its whole turbulence chain on every single frame,
            60 times a second, regardless of how small the element is.
            Splitting them means the OUTER div (.lh-rot-*) owns the
            rotation and nothing else — it never invalidates paint, so
            the compositor can animate it for free — while the INNER div
            owns the filter and gradient and never changes after mount,
            so it paints once and is reused as a plain texture forever
            after. This is worth far more than any amount of shrinking
            the filtered area further would have been. */}
        <div className="lh-rot lh-rot-c">
          {/* C is the ambient layer, underneath A and B: its own gradient
              almost fills the full box (transparent only past ~58%), so
              unlike A/B it never hits zero alpha inside the actual
              viewport — faint smoke reaches every corner instead of
              stopping at a hard edge where a tighter gradient's reach
              runs out against flat, textureless ground. A and B still
              supply the two brighter, more contained pooled highlights
              on top of this. */}
          <div
            className="lh-caustic-layer"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, #3d93b8 0%, #1c4f66 27.1%, rgba(2,4,5,0) 57.8%)',
              filter: 'url(#lhTurbC)',
              opacity: 0.75,
            }}
          />
        </div>
        {/* Stop percentages are fractions of THIS div's own box, which is
            .lh-caustic-group — rendered at 60vmax and stretched to a
            180vmax-equivalent footprint by that rule's `scale(3)` (see its
            comment for why). Percentages are ratios, so they're identical
            either way; only the box's absolute size changed, not its
            shape or its off-center gradient math. It's deliberately much
            bigger than the viewport so it stays clear at every rotation
            angle. A gradient tuned to fade out at some real on-screen
            distance needs its percentages recomputed for this box's own
            "farthest corner" radius, or the fade either lands
            outside the viewport (solid wash, no ground, no text contrast)
            or crosses back inside it as a hard edge (exactly the diagonal
            line bug this box-shape fix was for). These are computed, not
            guessed: farthest-corner distance from each layer's own
            off-center point, in this exact 180vmax box. */}
        <div className="lh-rot lh-rot-a">
          <div
            className="lh-caustic-layer"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #eafcff 0%, #7ee0ff 5.3%, #1c6f8c 13.6%, rgba(2,4,5,0) 22.5%)',
              filter: 'url(#lhTurbA)',
            }}
          />
        </div>
        <div className="lh-rot lh-rot-b">
          <div
            className="lh-caustic-layer"
            style={{
              background: 'radial-gradient(circle at 65% 65%, #ffffff 0%, #59c9ff 7.2%, rgba(2,4,5,0) 16.3%)',
              filter: 'url(#lhTurbB)',
              opacity: 0.6,
            }}
          />
        </div>
      </div>

      <div className="lh-vignette" />
      <div className="lh-grain" />
    </div>
  );
}

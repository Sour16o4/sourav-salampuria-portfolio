# Portfolio — Sourav Salampuria

Next.js App Router · JavaScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Framer Motion ·
anime.js · lucide-react. No CMS, no database, no backend — content is local JSON. Every
route is statically prerendered.

**Read [NEEDS-CONTENT.md](NEEDS-CONTENT.md) first.** Several fields render as visible amber
`TODO` markers and must be replaced before this goes out.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build
npm start

npm run lint           # ESLint CLI, next/core-web-vitals
npm run verify         # 210 behavioural checks in real Chrome
npm run verify:motion  # only the motion suites
npm run check          # external links in site.json
```

`verify` starts its own production server on a free port and shuts it down; run
`npm run build` first. `--only=terminal,theme` runs named suites.

---

## The argument

Most infrastructure claims are never tested. The site is built to say the opposite of a
normal portfolio: not "built a Kubernetes platform" but "here is what happened when I broke
it on purpose, and here are the cases that test does not cover." The specificity is the
product — don't soften it into generic copy.

## Library split

Each library has exactly one job. These never blur.

| Library | Owns |
|---|---|
| **GSAP + ScrollTrigger** | Everything scroll-linked: manifesto parallax, timeline spine draw, entrance reveals, stat counters, reading-progress bar |
| **Framer Motion** | React component state only: route transitions, mobile menu, theme-icon swap, card hover. Never bound to scroll |
| **anime.js** | One job: the hero terminal typewriter |

**No property is animated by two libraries on the same element.** Where they meet, they are
split across nodes — the manifesto heading's parallax lives on a wrapper while the reveal
lives on the elements inside it, and the timeline's entrance is on the card wrapper while
hover is on the inner `<article>`.

## Motion vocabulary

Entrance `y 24 → 0`, opacity `0 → 1`, 0.6s `power3.out` · sibling stagger 0.08s · hover
0.18s `power2.out` · page transition 0.35s out / 0.45s in · parallax travel capped at 60px.
Every reveal is `once: true`.

The hero is **not** animated. It is server-rendered and visible on first paint, because it
is the LCP element.

## Themes

The whole palette is eight CSS variables, so the toggle only stamps `data-theme` on `<html>`
— no `dark:` variants anywhere, no re-render, no flash. Dark is the default; light applies
from `prefers-color-scheme` or the toggle, and the attribute always wins.

Light is **rose white**. Four surfaces from one family, each a distinct step and none
identical:

| | light | dark |
|---|---|---|
| cards `--bg-2` | `#fdfaf9` | `#111112` |
| ground `--bg` | `#f8f2f0` | `#0a0a0a` |
| terminal `--terminal` | `#f2e9e6` | `#0f0f11` |
| chips `--bg-3` | `#ede2df` | `#161618` |

Ink is `#1e1a19` — a red-biased near-black, not a neutral charcoal dropped onto pink. The
accent stays `#0b6b44`; the bright `#5be49b` measures about 1.4:1 on paper and cannot
survive there. Verified: ink **15.6:1**, mute **5.4:1**, accent **5.9:1** on the ground, and
ink **14.4:1** on the terminal surface.

**The terminal re-themes with the page.** It has its own token so it reads as a distinct
panel, but it is the same material as everything else — a black rectangle sitting on rose
paper looked like a foreign object, which is exactly what it was. Nothing on the site is a
fixed colour any more.

One deliberate exception to "all four differ": the marquee pills share the card tone, because
they sit on the page ground and need to lift off it rather than sink into it.

**The choice is not persisted.** The spec forbids browser storage, so it holds for the
session and across client-side navigation, and a hard reload falls back to the OS
preference. That is a deliberate constraint.

## Motion gating

An inline script adds `.js-motion` to `<html>` before paint, and only when JS is running
*and* reduced motion is off. Every "start hidden, then animate in" rule is scoped to it, so
with JS off or reduced motion on nothing is ever hidden and no content can be stranded.

## Skeletons

One only: `app/{platform,paykit,book-api}/loading.js`, shown during client-side route
transitions. Chapter JSON is bundled at build time and already in the server-rendered HTML,
so a skeleton over it would be a fake loading state that damages LCP. The portrait also gets
one behind the image until it decodes. Nothing else.

Dimensions match by construction: each block renders the real string with `text-transparent`
and the shimmer behind it, so the box is the same size at every width.

---

## Verified

`npm run verify` — real Chrome, production build. One trap: **headless Chrome reports
`prefers-reduced-motion: reduce` by default**, so every page the harness opens sets the
feature explicitly. Without that, `.js-motion` never applies and the suite passes while
testing nothing.

**210/210 checks pass**, covering:

- No horizontal scroll at 320 / 375 / 480 / 700 / 768 / 1024 / 1280 / 1440 on all six routes, after a full scroll pass, with a clean console at each
- Every `[data-reveal]` reaches opacity 1 on all five routes at three widths
- Timeline is an `<ol>`, all 6 entries, all 6 node dots activate, spine draws with scroll
- Counters sit at exactly zero off-screen and land on `0.23 / 8.2 / 93.3 / 9.44`
- Parallax off below 480, active above, travel within the 60px cap
- Terminal: typewriter completes with no character left hidden; `help`, `ls`, `whoami`, unknown-command and `clear` all work; **panel height is byte-identical before and after output** (zero CLS)
- Reading-progress bar fills on all three chapter routes
- Marquee animates at 44s, and 31s below 480px
- Reduced motion on every route: no `.js-motion`, nothing below opacity 1, parallax zeroed, marquee stopped, typewriter printed in full, counters at final values
- Full tab order walked on every route at 375 and 1280: every stop has a focus ring, and stops reached matches focusable controls
- One `<main>`, one `<h1>`, header/footer landmarks
- No font weight above 600, no box shadows except the specified node-dot ring, every heading full stop is the accent colour, and no second accent anywhere
- Theme: defaults dark, toggles to light and back, accent darkens, ground/card/terminal/chip are four distinct surfaces in **both** themes, the terminal re-themes with the page, `prefers-color-scheme: light` is honoured, and light-mode ink and accent both clear 4.5:1
- JS disabled: nothing invisible, content present on all five routes

### Lighthouse

| | perf | a11y | best-practices | seo |
|---|---|---|---|---|
| mobile `/` | 97 | 100 | 100 | 100 |
| mobile `/platform` | 98 | 100 | 100 | 100 |
| mobile `/paykit` | 98 | 100 | 100 | 100 |
| mobile `/book-api` | 98 | 100 | 100 | 100 |
| mobile `/about` | 97 | 100 | 100 | 100 |
| desktop (all five) | 100 | 100 | 100 | 100 |

CLS **0** on every route. First Load JS **152 kB gz** on `/`, under the 200 KB budget with
all three motion libraries.

**Mobile performance is CPU-noise-sensitive on this hardware; two things distort it.**

*Warm-up.* The first Lighthouse audit after Chrome launches pays for process spawn and JIT,
and that cost lands entirely on whichever URL happens to be measured first. It was costing
`/` about 15 points. `scripts` discards one warm-up run before recording — without it, the
first route in any batch reads artificially low.

*Contention.* Even warmed, a busy machine swings total-blocking-time 5× on an identical
build (506ms → 101ms across five runs of `/`). LCP stays 1.9–2.6s and CLS 0 throughout, so
the swing is entirely main-thread availability. The low score follows whichever run hits a
spike, not a particular route — in one batch it was `/` at 82, in the next `/book-api` at 83,
with every other route at 97–99 both times.

A single low reading means the machine was busy. Re-run before investigating.

### Three things that bought that score

Mobile `/` sat at 85–91 until these, each verified by measurement rather than assumed:

1. **The terminal no longer server-renders ~250 per-character spans.** They are created on
   the client only when the typewriter will actually run — which excludes everyone with
   reduced motion, and Lighthouse itself. TBT 400 → 280ms.
2. **`backdrop-saturate` came off the sticky nav.** It compounds an already expensive
   backdrop-filter on an element that repaints on every scroll. The blur stays.
3. **A modern `browserslist`** (Chrome 111+, Safari 16.4+), which drops legacy transpilation.
   Those targets are not arbitrary: the stylesheet already uses `color-mix()`, so the CSS
   demanded them regardless. Combined with 2, TBT 280 → 100ms.

---

## Layout

```
src/
  app/            routes; three loading.js skeletons, icon.svg, sitemap, robots
  components/     Server Components by default; "use client" only where motion or state needs it
  content/        all copy as JSON — every file carries a _meta block
  lib/            gsap.js (loader) · motion.js (vocabulary + gates) · stops.js (green full stops)
                  rich.js (backtick → mono) · todo.js (visible TODO markers)
scripts/
  verify.mjs        the 210-check browser matrix
  check-links.mjs   every external URL in site.json
```

`puppeteer-core` and `eslint` are the only devDependencies beyond Tailwind; puppeteer drives
your installed Chrome rather than downloading its own.

## Deploy

Vercel, zero config. Set `baseUrl` in `src/content/site.json` to the real domain first — it
feeds `metadataBase`, canonicals, `sitemap.xml` and `robots.txt`.

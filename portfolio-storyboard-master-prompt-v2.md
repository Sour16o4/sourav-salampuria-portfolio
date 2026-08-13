# Portfolio — storyboard & master prompt (v2)

Adds anime.js and a full responsive spec. Thesis unchanged: **the paved road** — pushing a commit is the last manual step.

---

# Part 0 — The three-library problem

You now have GSAP, Framer Motion, and anime.js. That's three engines that all tween the same CSS properties. Two risks:

**Bundle weight.** Roughly: GSAP core + ScrollTrigger ~45KB gzipped, Framer Motion ~35–50KB, anime.js v4 ~7KB. All three lands you near 100KB of animation code on a site whose pitch includes engineering judgment. That's the first thing a technical reviewer notices in the network tab.

**Fighting.** Two libraries animating the same element's `transform` will visibly stutter, and it's painful to debug.

### Recommended: drop Framer Motion, keep GSAP + anime.js

The split becomes clean and easy to reason about:

- **GSAP + ScrollTrigger** — scroll position only. Pinning and scrubbing. It's the mature choice for pinning and nothing else comes close.
- **anime.js** — everything not driven by scroll. Enter animations, staggers, the count-up, SVG stroke drawing, hover micro-interactions.

anime.js v4 covers everything you'd have used Framer Motion for, at a fraction of the weight, and its SVG drawing and stagger APIs are better suited to the pipeline than Framer's. Check the v4 docs for current API names before you build — v4 changed significantly from v3.

**If you keep all three**, the roles must be strict and non-overlapping:

| Library | Owns | Never touches |
|---|---|---|
| GSAP + ScrollTrigger | Pinning, scrubbing, scroll progress | Anything not scroll-driven |
| anime.js | SVG stroke draw, staggers, count-up | React mount/unmount |
| Framer Motion | Component enter/exit, hover | SVG paths, scroll |

One rule above all: **never let two libraries animate the same property on the same element.** The spec below assumes GSAP + anime.js; Framer Motion slots into "component enter/exit" if you keep it.

---

# Part 1 — Storyboard

Per scene: what's on screen → what moves → why → what builds it.

## HOME

### Scene 1 — Thesis
**On screen.** One line, large, left-aligned, above the fold:

> I build Go services and the delivery path that runs them without me.

Muted subline: `Backend & platform engineer · Gurgaon, India`. Text links: `GitHub` / `LinkedIn`. No photo, no button, no scroll cue.

**Motion.** Lines rise 12px and fade, staggered ~80ms apart, ~400ms total. On mount, once.
**Build.** anime.js — `animate()` with `stagger()` on the line elements.

---

### Scene 2 — Metric strip *(signature #1)*
**On screen.** Between two hairline rules:

```
6.45 MB          3            10001            5
image size    cluster nodes  runtime UID    endpoints
```

Mono values, sans labels beneath in muted 12px.

**Motion.** Count up from zero over 700ms on first entry into view. `font-variant-numeric: tabular-nums` so digits don't shift width.
**Build.** anime.js numeric tween, triggered by an IntersectionObserver (not ScrollTrigger — this isn't scrubbed, it fires once).

---

### Scene 3 — The paved road *(signature #2)*
**On screen.** Horizontal pipeline, seven stages:

`commit → validate → scan → publish → sync → cluster → dashboards`

Each a node on an SVG track with a lucide icon (`git-commit`, `check`, `shield`, `package`, `refresh-cw`, `box`, `activity`). A fill line travels the track as you scroll; nodes activate in sequence; the active stage shows a caption:

- commit — *you push. this is the last thing you do.*
- validate — *schema + lint checks*
- scan — *Trivy blocks HIGH/CRITICAL*
- publish — *image to GHCR*
- sync — *CI writes the tag back into `values.yaml`*
- cluster — *ArgoCD pulls, applies, self-heals*
- dashboards — *ServiceMonitor + Grafana ship with the chart*

**Motion.** GSAP ScrollTrigger with `pin: true`, `scrub: 1`, ~2.5 viewport heights. The track line draws via `stroke-dashoffset`, mapped directly to scroll progress. Reverses on scroll up.

**Division of labour here matters:** GSAP owns the pin and produces a single `progress` value from 0 to 1. That value drives `stroke-dashoffset` and node states directly — do **not** run an anime.js timeline inside the scrub. Two timeline engines synced to one scroll is where this breaks.

**Why.** The only place a scroll-scrubbed animation is honest rather than decorative: your subject genuinely is a sequential pipeline. It also delivers the whole GitOps project as a 10-second visual before anyone clicks.

---

### Scene 4 — Proof
**On screen.** Label `Does it actually self-heal?` Then a looping muted video ~40s: terminal running `kubectl scale` beside the ArgoCD UI detecting OutOfSync and reverting. Mono caption:

`manual scale → detected → reverted to Git state`

**Motion.** The video is the motion. One light parallax — the block moves at 0.94× scroll speed. That's the entire parallax budget for the site.
**Build.** `<video autoplay loop muted playsinline poster>`. GSAP ScrollTrigger for the offset.

**This is your highest-converting asset.** It turns your strongest resume claim into something the viewer watches happen.

---

### Scene 5 — Work
Two entries, deliberately unequal.

**Primary** — GitOps platform: title, one-line summary, condensed metric strip, mono stack tags, `Read the case study →`.
**Secondary** — Book Inventory API: title, one line, `5 endpoints · 4 layers`, link. Visibly smaller.

**Motion.** Fade + 16px rise on enter. Hover: the hairline rule extends left-to-right over 200ms. No scale, no lift, no shadow.
**Build.** anime.js, IntersectionObserver-triggered.

---

### Scene 6 — Now
Label, date line, two or three sentences on what you're building this month. No motion. Update monthly.

### Scene 7 — Contact
`Open to backend and platform engineering roles.` Email assembled in JS from parts, GitHub, LinkedIn, resume PDF. **No phone number** — it's on the PDF you send to specific people; on a public page it gets scraped.

---

## CASE STUDY — `/platform`

**Header.** Title, summary, full metric strip (no count-up — it already ran on home), source link.

**Six chapters**, one per resume bullet. Each: heading, 2–3 paragraphs, closing bordered block labelled **Tradeoff**.

1. Pinning ingress to the control plane — *tradeoff: predictable ingress address vs. a workload on the control plane*
2. 6.45 MB, non-root, read-only rootfs — *what you gave up*
3. Monitoring ships with the chart — *chart complexity vs. never deploying an unobserved service*
4. The write-back loop — *how you stopped CI triggering itself*
5. Trivy gating — *what you blocked, what you accepted, how you decided*
6. Verifying self-healing — the drift test, video repeats here

**Motion.** Chapters fade + rise on enter (anime.js). A 2px progress rail on the left fills with scroll depth (GSAP).

**Then: What I'd do differently.** Three or four honest bullets. Almost nobody writes this, and it's the first thing an experienced reviewer looks for.

---

# Part 2 — Responsive spec

Design mobile-first. Every scene must work at 360px before you style the desktop version.

## Breakpoints

| Name | Width | Device |
|---|---|---|
| base | 360–639 | phones |
| `sm` | 640–767 | large phones, small tablets portrait |
| `md` | 768–1023 | tablets |
| `lg` | 1024–1279 | laptops |
| `xl` | 1280+ | desktops |

Test at **320px** even though you design from 360 — folded and older devices land there.

## Fluid type (no breakpoint jumps)

```css
--fs-display: clamp(30px, 7vw, 48px);
--fs-h1:      clamp(24px, 5vw, 32px);
--fs-h2:      clamp(17px, 3vw, 20px);
--fs-body:    clamp(16px, 2vw, 17px);
--fs-small:   14px;
--fs-metric:  clamp(21px, 5.5vw, 28px);
```

Body never below 16px — iOS Safari zooms the page on focus of any input under 16px.

## Fluid spacing

```css
--pad-x:      clamp(20px, 5vw, 24px);
--section-y:  clamp(56px, 10vw, 96px);
--container:  680px;
```

## Per-scene behaviour

| Scene | 360–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Hero | Display type, full width, links stack | Same, larger | Same |
| Metric strip | 2×2 grid | 4 across | 4 across |
| **Pipeline** | **Vertical list, no pin, fade per stage** | Vertical, larger | **Pinned, horizontal, scrubbed** |
| Proof video | Full-bleed, **no parallax** | Contained, no parallax | Contained, parallax on |
| Work | Stacked, no hover effects | Stacked | Stacked, hover on |
| Case study | Single column, **no progress rail** | Rail appears | Rail |

**The pipeline is the critical one.** Pinned horizontal scroll on a phone is a genuine usability trap — people can't tell whether they're stuck or the page is broken. Below 1024px it becomes a plain vertical list where each stage fades in. That's not a degraded version; it's the correct version for that input method.

Kill the ScrollTrigger pin on resize below the breakpoint and rebuild it above — use `ScrollTrigger.matchMedia()` or `gsap.matchMedia()` so it tears down cleanly rather than leaving a stuck pin-spacer.

## Mobile specifics that actually bite

- **Use `dvh`, not `vh`.** Mobile browser chrome expands and collapses on scroll; `100vh` overflows and causes a jump. `100dvh` tracks the real viewport.
- **Touch targets ≥44×44px** including padding. Text links in the footer need vertical padding on mobile even though they look fine on desktop.
- **Hover only where hover exists:**
  ```css
  @media (hover: hover) and (pointer: fine) { /* hover styles */ }
  ```
  Without this, touch devices get sticky hover states that persist after tapping.
- **Landscape phones** (roughly 667×375) — check the hero doesn't push everything below the fold and the pipeline list isn't absurdly tall.
- **Safe areas** for notched devices: `padding-left: max(var(--pad-x), env(safe-area-inset-left))` on the container.
- **Video:** fixed `aspect-ratio` so no layout shift while loading, `playsinline` (without it iOS opens fullscreen), poster frame required. Consider skipping autoplay below 768px and showing a poster with a play control — a 40s video on mobile data is a real cost.
- **No horizontal overflow.** Check with `document.documentElement.scrollWidth > window.innerWidth` on every page at 360px. The full-bleed pipeline is the usual culprit.

## Reduced motion — full behaviour

```css
@media (prefers-reduced-motion: reduce) { /* ... */ }
```

When reduced: pipeline renders as a static complete list, count-up shows final values immediately, parallax off, all enter animations off, video does not autoplay. Everything renders in final state instantly — no exceptions, no "subtle" fallback animations.

## Device test checklist

- [ ] 320px — nothing overflows
- [ ] 375px (iPhone SE) portrait and landscape
- [ ] 390px (iPhone 14/15) — real device, not just DevTools
- [ ] 768px — pipeline is still vertical
- [ ] 1024px — pipeline switches to pinned; resize across the boundary repeatedly and confirm no stuck pin-spacer
- [ ] 1440px — content doesn't look lost in whitespace
- [ ] Tab through every page at every width — focus rings visible
- [ ] Reduced motion enabled — everything static and complete
- [ ] Real phone on cellular data — measure how long until the hero is readable

---

# Part 3 — Master prompt

Paste into Claude Code or Cursor. Fill the bracketed parts first. Build in the given order — don't accept all pages at once.

```
You are building a personal portfolio site. Follow this spec exactly. Ask before
deviating.

## Who it's for
Sourav Salampuria — backend/platform engineer, Gurgaon India. Go, Kubernetes,
GitOps. Audience: engineering hiring managers and recruiters. Goal: convert a
2-minute skim into an interview.

## Stack (fixed)
Next.js App Router, JavaScript (no TypeScript), Tailwind CSS, GSAP + ScrollTrigger,
anime.js v4, lucide-react. Vercel. No CMS, no database, no backend — content is
local JSON.

Library roles are strict and must never overlap:
  GSAP + ScrollTrigger — scroll-position-driven only: pinning, scrubbing, the
                         progress rail, parallax offset.
  anime.js            — everything else: enter animations, staggers, the metric
                         count-up, SVG stroke drawing, hover micro-interactions.
                         Trigger via IntersectionObserver, never ScrollTrigger.

NEVER animate the same property on the same element with both libraries.
Check the anime.js v4 docs for current API names — v4 changed a lot from v3.

## Design system

CSS variables in globals.css:
  --paper   #FBFBFA   background
  --ink     #16181C   primary text
  --muted   #6E7178   secondary text, labels
  --rule    #E4E4E1   hairlines
  --accent  #1B5E6B   links, active pipeline stage
  --active  #2E7D5B   completed pipeline stage only

One accent. No gradients, no shadows, no colored section backgrounds.

Typography:
  Sans — Instrument Sans (next/font/google). Body and headings.
  Mono — JetBrains Mono (next/font/google). ALL numbers, metrics, versions, file
         paths, commands, stack tags. Never headings, never body prose.
  This split is the site's identity: sans for prose, mono for facts. Enforce it.

  Fluid scale (CSS custom properties, no breakpoint jumps):
    --fs-display clamp(30px, 7vw, 48px)
    --fs-h1      clamp(24px, 5vw, 32px)
    --fs-h2      clamp(17px, 3vw, 20px)
    --fs-body    clamp(16px, 2vw, 17px)
    --fs-small   14px
    --fs-metric  clamp(21px, 5.5vw, 28px)
  Body never below 16px (iOS zooms inputs under 16px).
  Weights 400 and 500 only — never 600 or 700.
  Body line-height 1.7. Sentence case everywhere.

Layout:
  Single column, max-width 680px, centered.
  --pad-x clamp(20px, 5vw, 24px), plus env(safe-area-inset-*) via max().
  --section-y clamp(56px, 10vw, 96px)
  Everything left-aligned. Never center body text.
  No cards, no grids, no rounded boxes. Separate sections with hairline rules in
  --rule, not containers. Exception: pipeline runs full-bleed.

## Responsive — mobile-first, build 360px before desktop
Breakpoints: base 360-639 / sm 640 / md 768 / lg 1024 / xl 1280. Test at 320px.

  Metric strip — 2x2 grid under 768, 4 across above.
  Pipeline     — CRITICAL: under 1024px it is a VERTICAL LIST with no pinning,
                 each stage fading in on scroll. Pinned horizontal scrubbing ONLY
                 at 1024px and above. Use gsap.matchMedia() so the pin tears down
                 cleanly on resize — no stuck pin-spacer.
  Parallax     — desktop only (1024+). Off below.
  Hover        — wrap ALL hover styles in
                 @media (hover: hover) and (pointer: fine)
  Progress rail — 768px and above only.

Use dvh not vh. Touch targets >= 44x44px. No horizontal overflow at any width —
verify scrollWidth === innerWidth at 360px on every page.

## Content
All copy lives in /src/content/*.json. I supply it — never invent copy, never use
lorem ipsum, never fabricate metrics. If content is missing, leave the element
empty and tell me what's needed.

## Pages
  /              home (7 sections below)
  /platform      GitOps case study
  /book-api      short second project
  /about         bio + resume link
  not-found      custom 404
  sitemap.js, robots.js — built-in App Router versions, no extra packages

## Home, in order
1. Hero — thesis line, muted subline, GitHub + LinkedIn text links. No photo, no
   CTA button, no scroll indicator. anime.js: lines rise 12px + fade, stagger 80ms,
   ~400ms, on mount, once.

2. Metric strip — 4 metrics, mono value above 12px muted sans label, hairline rule
   above and below. anime.js count-up from 0 over 700ms on first view via
   IntersectionObserver. font-variant-numeric: tabular-nums. 2x2 under 768px.

3. Pipeline (signature) — 7 stages: commit, validate, scan, publish, sync, cluster,
   dashboards. SVG track, lucide icon per node, caption for the active stage.
   1024px+: GSAP ScrollTrigger, pin: true, scrub: 1, ~2.5 viewport heights. GSAP
   produces ONE progress value 0-1; that value drives stroke-dashoffset and node
   states directly. Do NOT run an anime.js timeline inside the scrub.
   Under 1024px: vertical list, no pin, each stage fades in (anime.js).

4. Proof — video autoplay/loop/muted/playsinline with poster and fixed
   aspect-ratio. Mono caption beneath. Parallax 0.94x scroll speed via GSAP,
   DESKTOP ONLY. Under 768px consider poster + play control instead of autoplay.

5. Work — two entries, visibly unequal. Primary gets condensed metric strip and
   mono stack tags; secondary smaller. Hover (desktop only): hairline rule extends
   left-to-right over 200ms. No scale, no lift, no shadow.

6. Now — label, date line, 2-3 sentences. No motion.

7. Contact — one line, email assembled in JS from parts (never a plain mailto in
   the HTML), GitHub, LinkedIn, resume PDF. NO phone number anywhere on the site.

## Case study page
Header (title, summary, metric strip — no count-up, it ran on home), then 6
chapters. Each: h2, 2-3 paragraphs, closing bordered block labeled "Tradeoff"
(1px --rule border, no fill, no rounded corners). Then "What I'd do differently".
Chapters fade + rise 16px on enter (anime.js). 2px left progress rail fills with
scroll depth (GSAP), 768px+ only.

## Loading
One skeleton only: app/platform/loading.js, matching the real header, metric strip,
and first paragraph dimensions exactly so nothing shifts on swap. Shimmer via a
Tailwind gradient animation. No skeletons elsewhere — the rest is static.

## Accessibility & performance floor (non-negotiable)
- prefers-reduced-motion: pipeline renders static and complete, count-up shows
  final values instantly, parallax off, enter animations off, video does not
  autoplay. No "subtle" fallback animations.
- Visible keyboard focus rings everywhere. Never outline: none.
- Register ScrollTrigger inside useEffect, never at module scope (breaks SSR).
- Kill every ScrollTrigger, gsap.matchMedia context, anime.js instance, and
  IntersectionObserver on unmount.
- next/image for images, next/font for both fonts.
- Server Components by default; "use client" only where motion or state needs it.
- Import anime.js and GSAP only in client components — keep them out of the
  server bundle.
- Target Lighthouse 95+ on all four categories. Report the animation libraries'
  combined gzipped size after step 5.

## Do not
- No blog, testimonials, skills-percentage bars, tech-logo cloud, years-of-
  experience counter, or hero photo.
- No localStorage or sessionStorage.
- No second accent color, gradient, or shadow.
- No animation not specified above.
- No extra packages without asking.

## Build order — deliver one step at a time, stop for review after each
1. Setup, fonts, CSS variables, layout shell, globals, responsive scaffolding
2. Content JSON + static home page, zero motion, verified at 360px
3. Case study page, static
4. Metric strip count-up (anime.js)
5. Pipeline — mobile vertical version FIRST, then the desktop pinned version
6. Video + parallax
7. Hover states, loading skeleton
8. Accessibility pass, reduced-motion pass, device matrix, Lighthouse

Start with step 1.
```

---

## Two notes

**Build the mobile pipeline before the desktop one.** Step 5 says this explicitly for a reason — if you build the pinned scrubbed version first, the mobile fallback ends up as an afterthought, and most of your traffic from a shared link will be on a phone.

**The video outranks the pipeline.** If time runs short, cut motion, not proof. A static site with the drift-correction recording beats an animated site without it.

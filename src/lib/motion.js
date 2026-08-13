import { useEffect, useLayoutEffect } from 'react';

/**
 * Shared motion gate. Nothing here imports GSAP, Framer Motion or anime.js —
 * it only decides *whether* motion may run.
 *
 * Library roles are strict and must not blur:
 *   GSAP + ScrollTrigger — everything scroll-linked
 *   Framer Motion        — React component state only, never scroll position
 *   anime.js             — the hero terminal typewriter, nothing else
 */
const REDUCED = '(prefers-reduced-motion: reduce)';

/** The motion vocabulary, in one place so components don't invent values. */
export const MOTION = {
  enterY: 24,
  enterDuration: 0.6,
  enterEase: 'power3.out',
  stagger: 0.08,
  hoverDuration: 0.18,
  hoverEase: 'power2.out',
  parallaxMax: 60,
  scrub: 0.6,
};

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(REDUCED).matches;
}

/** Parallax is off below 480, half range to 1023, full at 1024+. */
export function parallaxScale() {
  if (typeof window === 'undefined') return 0;
  const w = window.innerWidth;
  if (w < 480) return 0;
  if (w < 1024) return 0.5;
  return 1;
}

/** Put elements into their finished state — used on teardown and reduced motion. */
export function settle(elements) {
  const list = Array.isArray(elements) ? elements : [elements];
  for (const el of list) {
    if (!el || !el.style) continue;
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.willChange = 'auto';
  }
}

'use client';

import { useEffect } from 'react';

import { prefersReducedMotion } from '@/lib/motion';

/**
 * Teal Grid cursor reveal, one shared loop for every sheet on the page.
 *
 * Each sheet gets --mx / --my (px, relative to itself). While the pointer is
 * over a sheet the reveal follows it; otherwise it drifts on its own. The
 * pointer is tracked once, in viewport coordinates, and each frame the
 * visible sheets work out where it is relative to themselves. That is what
 * keeps it correct while scrolling under a stationary mouse, when no
 * pointermove event fires at all. The old per-sheet version only updated on
 * pointermove, so after a scroll the reveal circle was left stranded and the
 * ghost word stayed fully blurred until the mouse moved again.
 *
 * Off under reduced motion; touch never drives it; only visible sheets run.
 */
const visibleSheets = new Set();
const pointer = { x: 0, y: 0, has: false, ui: false };
let raf = 0;
let listening = false;

function frame(t) {
  raf = 0;
  if (visibleSheets.size === 0) return;
  visibleSheets.forEach((sheet) => {
    const rect = sheet.getBoundingClientRect();
    const inside =
      pointer.has &&
      pointer.x >= rect.left &&
      pointer.x <= rect.right &&
      pointer.y >= rect.top &&
      pointer.y <= rect.bottom;
    const phase = rect.top * 0.002;
    const x = inside ? pointer.x - rect.left : rect.width * (0.5 + 0.34 * Math.sin(t / 1900 + phase));
    const y = inside ? pointer.y - rect.top : rect.height * (0.55 + 0.25 * Math.sin(t / 1300 + 1 + phase));
    sheet.toggleAttribute('data-ui', inside && pointer.ui);
    sheet.style.setProperty('--mx', `${x.toFixed(1)}px`);
    sheet.style.setProperty('--my', `${y.toFixed(1)}px`);
  });
  raf = requestAnimationFrame(frame);
}

function start() {
  if (!raf) raf = requestAnimationFrame(frame);
}

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.has = true;
      pointer.ui = !!event.target.closest?.('a, button, input, textarea, select, label');
    },
    { passive: true }
  );
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.has = false;
  });
}

export function useGhost(ref) {
  useEffect(() => {
    const sheet = ref.current;
    if (!sheet || prefersReducedMotion()) return undefined;

    listen();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        visibleSheets.add(sheet);
        start();
      } else {
        visibleSheets.delete(sheet);
      }
    });
    observer.observe(sheet);

    return () => {
      observer.disconnect();
      visibleSheets.delete(sheet);
    };
  }, [ref]);
}

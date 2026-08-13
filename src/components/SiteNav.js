'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import ThemeToggle from '@/components/ThemeToggle';
import site from '@/content/site.json';

/**
 * Sticky nav. Blurred translucent ground, mono brand, hamburger below 700px.
 *
 * The menu is React component state, so it belongs to Framer Motion — never to
 * GSAP. It is not bound to scroll position.
 */
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // Any navigation closes the menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes it; body scroll locks while it is open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Blur only — `backdrop-saturate` compounds an already expensive
  // backdrop-filter on a sticky element for almost no visual gain.
  return (
    <header className="sticky top-0 z-50 border-b border-faint bg-bg/72 backdrop-blur-md">
      <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between">
        {/* Real hit areas: the text is 13px, so without padding the target is
            17px tall and fails target-size. */}
        <Link
          href="/"
          className="mono -ml-1 inline-flex min-h-[36px] items-center px-1 text-[13px] tracking-tight text-ink"
        >
          <span className="text-acc">{'{SS}'}</span>
          {site.brand}
        </Link>

        <div className="flex items-center gap-1 min-[700px]:gap-8">
          {/* Desktop links — 700px and up */}
          <ul className="m-0 hidden list-none items-center gap-8 p-0 min-[700px]:flex">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-quiet mono inline-flex min-h-[36px] items-center text-[12px] tracking-[0.08em]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-ink min-[700px]:hidden"
          >
            {open ? (
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Menu open/close is component state, so Framer Motion owns it. */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.33, 1, 0.68, 1] }}
            className="overflow-hidden border-t border-faint bg-bg min-[700px]:hidden"
          >
            <ul className="container-x m-0 list-none py-4 pl-0">
              {site.nav.map((item) => (
                <li key={item.href} className="border-b border-faint last:border-b-0">
                  <Link
                    href={item.href}
                    className="mono flex min-h-[52px] items-center text-[13px] tracking-[0.08em] text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

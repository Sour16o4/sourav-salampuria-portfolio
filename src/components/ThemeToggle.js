'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

/**
 * Light/dark toggle.
 *
 * The whole palette is eight CSS variables, so this only stamps `data-theme`
 * on <html> — no `dark:` variants, no re-render, no flash.
 *
 * The spec forbids browser storage, so the choice is not persisted: it holds
 * for the session and across client-side navigation, and a hard reload falls
 * back to the visitor's OS preference. That is a deliberate constraint, not an
 * oversight.
 *
 * Renders a fixed-size button on the server with no icon, so there is no
 * hydration mismatch when the client discovers the real preference.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const explicit = document.documentElement.getAttribute('data-theme');
    if (explicit === 'light' || explicit === 'dark') {
      setTheme(explicit);
      return;
    }
    const prefersLight =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  };

  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center text-mute transition-colors hover:text-ink"
    >
      {/* Fixed 20px box so the button never resizes as the icon swaps. */}
      <span className="relative block h-5 w-5">
        <AnimatePresence initial={false} mode="wait">
          {theme ? (
            <motion.span
              key={theme}
              initial={reduce ? { opacity: 1 } : { opacity: 0, rotate: -45, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, rotate: 45, scale: 0.7 }}
              transition={{ duration: reduce ? 0 : 0.18, ease: [0.33, 1, 0.68, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {theme === 'light' ? (
                <Moon size={20} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Sun size={20} strokeWidth={1.5} aria-hidden="true" />
              )}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </button>
  );
}

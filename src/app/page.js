import ContactForm from '@/components/ContactForm';
import LiquidHero from '@/components/LiquidHero';
import Manifesto from '@/components/Manifesto';
import Orbit from '@/components/Orbit';
import Timeline from '@/components/Timeline';
import home from '@/content/home.json';
import timeline from '@/content/timeline.json';

/**
 * Home, in order:
 *   nav (layout) · hero + terminal · manifesto · orbit · timeline ·
 *   contact · footer (layout)
 *
 * EXPERIMENTAL: LiquidHero replaces Hero for local preview of the redesign
 * direction. It still carries every original hero detail (location label,
 * the interactive terminal) — nothing gets dropped by default just because
 * the visual treatment changed. The original Hero is untouched in the
 * codebase — swap this import back to revert.
 */
export default function HomePage() {
  return (
    <main id="main">
      <LiquidHero hero={home.hero} terminal={home.terminal} />

      <Manifesto manifesto={home.manifesto} />

      <Orbit orbit={home.orbit} stack={home.terminal.groups} />

      <Timeline
        label={home.work.label}
        heading={home.work.heading}
        entries={timeline.entries}
      />

      <ContactForm contact={home.contact} />
    </main>
  );
}

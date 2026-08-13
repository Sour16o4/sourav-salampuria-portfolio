import ContactForm from '@/components/ContactForm';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import Marquee from '@/components/Marquee';
import Measured from '@/components/Measured';
import Timeline from '@/components/Timeline';
import home from '@/content/home.json';
import timeline from '@/content/timeline.json';

/**
 * Home, in order:
 *   nav (layout) · hero + terminal · manifesto · marquee · timeline ·
 *   measured · contact · footer (layout)
 */
export default function HomePage() {
  return (
    <main id="main">
      <Hero hero={home.hero} terminal={home.terminal} />

      <Manifesto manifesto={home.manifesto} />

      <Marquee items={home.marquee.items} />

      <Timeline
        label={home.work.label}
        heading={home.work.heading}
        entries={timeline.entries}
      />

      <Measured measured={home.measured} />

      <ContactForm contact={home.contact} />
    </main>
  );
}

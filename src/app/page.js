import ContactForm from '@/components/ContactForm';
import GridHero from '@/components/GridHero';
import Manifesto from '@/components/Manifesto';
import Orbit from '@/components/Orbit';
import Sheet from '@/components/Sheet';
import WorkIndex from '@/components/WorkIndex';
import home from '@/content/home.json';
import timeline from '@/content/timeline.json';

/**
 * Home, in order:
 *   nav (layout) · Teal Grid hero · manifesto · orbit ·
 *   work index · contact · footer (layout)
 *
 * All copy comes from the existing JSON. The previous LiquidHero and Timeline
 * components are untouched in the codebase — swap these imports back to revert.
 */
export default function HomePage() {
  const withPage = timeline.entries.filter((entry) => entry.href);
  const other = timeline.entries.filter((entry) => !entry.href);

  const projects = withPage.map((entry) => ({
    id: entry.id,
    href: entry.href,
    title: entry.title,
    tag: `${entry.when} · ${entry.org.split(' · ')[0]}`,
    stack: entry.chips.slice(0, 3).join(' · '),
    chips: entry.chips,
    description: entry.description,
  }));

  const ghost = home.hero.name.split(' ');

  return (
    <main id="main">
      <GridHero hero={home.hero} ghost={ghost} />

      <Sheet ghost="THESIS" label="Thesis">
        <Manifesto manifesto={home.manifesto} />
      </Sheet>

      <Sheet ghost="STACK" label="Stack">
        <Orbit orbit={home.orbit} stack={home.terminal.groups} />
      </Sheet>

      <Sheet ghost="WORK" label="Work">
        <WorkIndex heading={home.work.heading} projects={projects} other={other} />
      </Sheet>

      <Sheet ghost="CONTACT" label="Contact">
        <ContactForm contact={home.contact} />
      </Sheet>
    </main>
  );
}

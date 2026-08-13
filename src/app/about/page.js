import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import Reveal from '@/components/Reveal';
import about from '@/content/about.json';
import site from '@/content/site.json';
import { Stops } from '@/lib/stops';

export const metadata = {
  title: 'About',
  description: about.lead,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <main id="main">
      <article className="container-x pt-12 pb-24 sm:pt-16">
        <p>
          <Link className="link-quiet mono inline-flex items-center gap-1.5 text-[12px]" href="/">
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            Back
          </Link>
        </p>

        <Reveal stagger>
          <p className="micro mt-10">{about.label}</p>

          <h1 className="t-h2 mt-5">
            <Stops text={about.title} />
          </h1>

          <p className="t-lead mt-6 max-w-[62ch]">{about.lead}</p>
        </Reveal>

        <Reveal stagger className="mt-10 max-w-[66ch] space-y-5">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="t-body">
              {paragraph}
            </p>
          ))}
        </Reveal>

        <div className="hairline mt-14 pt-10">
          <p className="micro">Works with</p>
          <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
            {about.focus.map((item) => (
              <li key={item}>
                <span className="chip">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hairline mt-12 pt-10">
          <p className="micro">Elsewhere</p>
          <ul className="m-0 mt-5 flex list-none flex-col gap-x-8 gap-y-2 p-0 sm:flex-row sm:flex-wrap">
            <li>
              <a
                className="mono text-[13px] text-acc"
                href={site.links.github}
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                className="mono text-[13px] text-acc"
                href={site.links.linkedin}
                target="_blank"
                rel="noreferrer noopener"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                className="mono text-[13px] text-acc"
                href={site.links.resume}
                target="_blank"
                rel="noreferrer noopener"
              >
                {about.resumeLabel}
              </a>
            </li>
            <li>
              <Link className="mono text-[13px] text-acc" href="/#contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </article>
    </main>
  );
}

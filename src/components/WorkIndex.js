'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import Reveal from '@/components/Reveal';
import { Todo, isTodo } from '@/lib/todo';

/**
 * The work, as an index. Projects are large rows; entries without a
 * detail page (client work, education) are listed plainly underneath. All
 * text comes from timeline.json and home.json.
 */
export default function WorkIndex({ heading, projects, other }) {
  return (
    <section id="work" className="section-y" aria-labelledby="work-heading">
      <Reveal stagger>
        <h2 id="work-heading" className="t-h2">
          {heading}
        </h2>
      </Reveal>

      <div className="tg-index relative mt-12">
        <ul className="m-0 list-none p-0">
          {projects.map((project, index) => (
            <li key={project.id}>
              <Link
                href={project.href}
                className="tg-row"
              >
                <span className="tg-row-n mono">{String(index + 1).padStart(2, '0')}</span>
                <span className="tg-row-name">{project.title}</span>
                <span className="tg-row-stack mono">{project.stack}</span>
                <span className="tg-row-ar" aria-hidden="true">
                  <ArrowUpRight size={22} strokeWidth={1.5} />
                </span>
              </Link>
            </li>
          ))}
        </ul>

      </div>

      <ul className="m-0 mt-14 grid list-none gap-4 p-0 md:grid-cols-2">
        {other.map((entry) => (
          <li key={entry.id} className="card tg-tilt p-6">
            <p className="mono text-[12px] text-acc">
              {entry.when} <span className="text-mute">· {entry.org}</span>
            </p>
            <h3 className="t-h3 mt-3">{entry.title}</h3>
            <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
              {entry.chips.map((chip) => (
                <li key={chip}>
                  <span className="chip">{chip}</span>
                </li>
              ))}
            </ul>
            {isTodo(entry.description) ? (
              <div className="mt-4">
                <Todo value={entry.description} />
              </div>
            ) : (
              <p className="t-body mt-4 text-[14px]">{entry.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

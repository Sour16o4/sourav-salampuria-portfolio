import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import ReadingProgress from '@/components/ReadingProgress';
import Reveal from '@/components/Reveal';
import site from '@/content/site.json';
import { Rich } from '@/lib/rich';
import { Stops } from '@/lib/stops';
import { Todo, isTodo } from '@/lib/todo';

/**
 * Shared renderer for /platform and /book-api.
 *
 * Chapter content comes from a JSON data file, never from JSX. No parallax on
 * a reading surface — the only motion here is the progress bar.
 */
export default function ChapterArticle({ doc }) {
  const sourceHref = doc.sourceKey ? site.links[doc.sourceKey] : null;

  return (
    <>
      <ReadingProgress targetId="article" />

      <main id="main">
        <article id="article" className="pb-24">
          <header className="container-x pt-12 sm:pt-16">
            <p>
              <Link className="link-quiet mono inline-flex items-center gap-1.5 text-[12px]" href="/">
                <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
                Back
              </Link>
            </p>

            <p className="micro mt-10">{doc.kicker}</p>

            <h1 className="t-h2 mt-5 max-w-[20ch]">
              <Stops text={doc.title} />
            </h1>

            <p className="t-lead mt-6 max-w-[68ch]">{doc.summary}</p>

            {doc.metrics?.length ? (
              <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[7px] border border-faint bg-faint md:grid-cols-4">
                {doc.metrics.map((metric) => (
                  <div key={metric.id} className="flex flex-col bg-bg-2 p-5">
                    <dd className="order-1 m-0 flex items-baseline gap-1">
                      <span className="mono text-[22px] leading-none font-medium tracking-[-0.02em]">
                        {metric.value}
                      </span>
                      {metric.unit ? (
                        <span className="mono text-[12px] text-acc">{metric.unit}</span>
                      ) : null}
                    </dd>
                    <dt className="order-2 mt-3 text-[12px] leading-snug text-mute">
                      {metric.label}
                    </dt>
                  </div>
                ))}
              </dl>
            ) : null}

            {sourceHref ? (
              <p className="mt-8">
                <a
                  className="mono text-[13px] text-acc"
                  href={sourceHref}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {doc.sourceLabel}
                </a>
              </p>
            ) : null}
          </header>

          <div className="container-x">
            {doc.chapters.map((chapter, index) => (
              <Reveal
                as="section"
                stagger
                key={chapter.id}
                id={chapter.id}
                className="mt-20 max-w-[70ch]"
              >
                <p className="mono text-[12px] text-acc">
                  {String(index + 1).padStart(2, '0')}
                </p>

                <h2 className="t-h3 mt-3 text-[clamp(22px,2.6vw,30px)]">{chapter.title}</h2>

                <div className="mt-6 space-y-5">
                  {chapter.paragraphs.map((paragraph) =>
                    isTodo(paragraph) ? (
                      <Todo key={paragraph.slice(0, 32)} value={paragraph} />
                    ) : (
                      <p key={paragraph.slice(0, 32)} className="t-body">
                        <Rich text={paragraph} />
                      </p>
                    )
                  )}
                </div>

                {/* Box-drawing rather than an image: it re-themes with the page,
                    needs no asset, and stays legible with JS off. `role="img"`
                    plus a label means a screen reader hears one sentence instead
                    of several hundred line-drawing characters. The scroll lives
                    on the wrapper, so a wide diagram never widens the page. */}
                {chapter.diagrams?.length ? (
                  <div className="mt-8 space-y-6">
                    {chapter.diagrams.map((diagram) => (
                      <figure key={diagram.label} className="m-0">
                        <figcaption className="micro">{diagram.label}</figcaption>
                        <div className="card mt-3 overflow-x-auto p-5">
                          <pre
                            role="img"
                            aria-label={diagram.alt}
                            className="mono m-0 text-[12px] leading-[1.75] whitespace-pre"
                          >
                            {diagram.art}
                          </pre>
                        </div>
                      </figure>
                    ))}
                  </div>
                ) : null}

                {chapter.tradeoff ? (
                  <div className="card mt-8 p-5 sm:p-6">
                    <p className="micro">Tradeoff</p>
                    {isTodo(chapter.tradeoff) ? (
                      <div className="mt-3">
                        <Todo value={chapter.tradeoff} />
                      </div>
                    ) : (
                      <p className="t-body mt-3 text-[14px]">
                        <Rich text={chapter.tradeoff} />
                      </p>
                    )}
                  </div>
                ) : null}
              </Reveal>
            ))}

            {doc.differently ? (
              <section className="hairline mt-24 max-w-[70ch] pt-12">
                <h2 className="t-h3 text-[clamp(22px,2.6vw,30px)]">
                  <Stops text={doc.differently.title} />
                </h2>
                <ul className="m-0 mt-8 list-none space-y-5 p-0">
                  {doc.differently.items.map((item) =>
                    isTodo(item) ? (
                      <li key={item.slice(0, 32)}>
                        <Todo value={item} />
                      </li>
                    ) : (
                      <li key={item.slice(0, 32)} className="t-body flex gap-4">
                        <span aria-hidden="true" className="mono shrink-0 text-acc">
                          —
                        </span>
                        <span>
                          <Rich text={item} />
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </section>
            ) : null}
          </div>
        </article>
      </main>
    </>
  );
}

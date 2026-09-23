import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import DotMatrix from '@/components/DotMatrix';
import FlowDiagram from '@/components/FlowDiagram';
import FunnelChart from '@/components/FunnelChart';
import ReadingProgress from '@/components/ReadingProgress';
import Topology from '@/components/Topology';
import Reveal from '@/components/Reveal';
import site from '@/content/site.json';
import { Rich } from '@/lib/rich';
import { Stops } from '@/lib/stops';
import { Todo, isTodo } from '@/lib/todo';

/**
 * Shared renderer for the project case-study pages (/platform, /tenantguard,
 * /skillsight).
 *
 * Chapter content comes from a JSON data file, never from JSX. No parallax on
 * a reading surface — the only motion here is the progress bar.
 */
export default function ChapterArticle({ doc }) {
  const sourceHref = doc.sourceKey ? site.links[doc.sourceKey] : null;
  const liveHref = doc.liveKey ? site.links[doc.liveKey] : null;

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

            {/* auto-fit, not a fixed four: with two metrics a four-column grid
                left two empty tracks showing as a grey slab. auto-fit collapses
                the tracks nothing lands in, so the row is always full whether
                the page declares two figures or four. */}
            {doc.metrics?.length ? (
              <dl className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px overflow-hidden rounded-[7px] border border-faint bg-faint">
                {doc.metrics.map((metric) => (
                  <div key={metric.id} className="card-surface flex flex-col p-5">
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
                    {metric.visual === 'dots' ? (
                      <Reveal as="div" className="order-3">
                        <DotMatrix value={Number(metric.value)} />
                      </Reveal>
                    ) : null}
                  </div>
                ))}
              </dl>
            ) : null}

            {sourceHref || liveHref ? (
              <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {sourceHref ? (
                  <a
                    className="mono text-[13px] text-acc"
                    href={sourceHref}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {doc.sourceLabel}
                  </a>
                ) : null}
                {liveHref ? (
                  <a
                    className="mono text-[13px] text-acc"
                    href={liveHref}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {doc.liveLabel}
                  </a>
                ) : null}
              </p>
            ) : null}
          </header>

          {doc.gallery?.length ? (
            <Reveal
              as="div"
              stagger
              className="container-x mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {doc.gallery.map((shot) => {
                const isPhone = shot.size === 'phone';
                return (
                  <figure
                    key={shot.src}
                    className={`card overflow-hidden p-0 ${shot.span === 'full' ? 'sm:col-span-2' : ''}`}
                  >
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      className={isPhone ? 'mx-auto h-auto w-full max-w-[240px]' : 'h-auto w-full'}
                      sizes={isPhone ? '240px' : '(min-width: 640px) 50vw, 100vw'}
                    />
                    {shot.caption ? (
                      <figcaption className="mono border-t border-faint px-4 py-3 text-[12px] text-mute">
                        {shot.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              })}
            </Reveal>
          ) : null}

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

                {chapter.topology ? (
                  <div className="mt-8">
                    <Topology topology={chapter.topology} />
                  </div>
                ) : null}

                {chapter.flows?.length ? (
                  <div className="mt-8 space-y-8">
                    {chapter.flows.map((flow) => (
                      <FlowDiagram key={flow.label} flow={flow} />
                    ))}
                  </div>
                ) : null}

                {chapter.funnel?.length ? <FunnelChart tiers={chapter.funnel} /> : null}

                {/* An aside, not a container. A full card gave every chapter a
                    second boxed block competing with the diagrams above it; a
                    rule in the accent marks it as a turn in the argument and
                    lets the text sit on the page like the prose it is. */}
                {chapter.tradeoff ? (
                  <div className="mt-8 border-l-2 border-acc pl-5 sm:pl-6">
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
              <section className="mt-24 max-w-[70ch] pt-12">
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

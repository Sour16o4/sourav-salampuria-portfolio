/**
 * Route-transition skeleton for the chapter pages.
 *
 * This is the only legitimate skeleton on the site. Chapter JSON is bundled at
 * build time, so it is already in the server-rendered HTML — putting a skeleton
 * over that would be a fake loading state and would damage LCP. What genuinely
 * arrives late is the *route*, during client-side navigation, which is exactly
 * what Next renders `loading.js` for.
 *
 * Dimensions match the real header by construction rather than by guesswork:
 * every block renders the real string with `text-transparent` and the shimmer
 * painted behind it, so the box is the same size at every viewport and nothing
 * moves when the page lands.
 */
const SHIM = 'skeleton text-transparent select-none';

export default function ChapterSkeleton({ doc }) {
  return (
    <main id="main">
      <p className="sr-only" role="status">
        Loading {doc.title}
      </p>

      <div aria-hidden="true" className="container-x pt-12 pb-24 sm:pt-16">
        <p>
          <span className={`mono inline-block text-[12px] ${SHIM}`}>← Back</span>
        </p>

        <p className="mt-10">
          <span className={`micro inline-block ${SHIM}`}>{doc.kicker}</span>
        </p>

        <h1 className={`t-h2 mt-5 max-w-[20ch] ${SHIM}`}>{doc.title}</h1>

        <p className={`t-lead mt-6 max-w-[68ch] ${SHIM}`}>{doc.summary}</p>

        {doc.metrics?.length ? (
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[7px] border border-faint bg-faint md:grid-cols-4">
            {doc.metrics.map((metric) => (
              <div key={metric.id} className="flex flex-col bg-bg-2 p-5">
                <dd className="order-1 m-0 flex items-baseline gap-1">
                  <span className={`mono text-[22px] leading-none font-medium ${SHIM}`}>
                    {metric.value}
                  </span>
                  {metric.unit ? (
                    <span className={`mono text-[12px] ${SHIM}`}>{metric.unit}</span>
                  ) : null}
                </dd>
                <dt className="order-2 mt-3 text-[12px] leading-snug">
                  <span className={`inline-block ${SHIM}`}>{metric.label}</span>
                </dt>
              </div>
            ))}
          </dl>
        ) : null}

        <p className="mt-8">
          <span className={`mono inline-block text-[13px] ${SHIM}`}>{doc.sourceLabel}</span>
        </p>

        {/* First chapter, so the fold is not empty while the route resolves. */}
        <div className="mt-20 max-w-[70ch]">
          <span className={`mono inline-block text-[12px] ${SHIM}`}>01</span>
          <h2 className={`t-h3 mt-3 text-[clamp(22px,2.6vw,30px)] ${SHIM}`}>
            {doc.chapters[0].title}
          </h2>
          <div className="mt-6 space-y-5">
            {doc.chapters[0].paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className={`t-body ${SHIM}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';

import site from '@/content/site.json';

/** No animation here, by spec. */
export default function SiteFooter() {
  const year = 2026;

  return (
    <footer className="hairline">
      <div
        className="container-x flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between"
        style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}
      >
        <p className="mono text-[12px] text-mute">
          © {year} {site.name}
        </p>

        <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-2 p-0">
          <li>
            <Link className="link-quiet mono inline-flex min-h-[36px] items-center text-[12px]" href="/about">
              About
            </Link>
          </li>
          <li>
            <a
              className="link-quiet mono inline-flex min-h-[36px] items-center text-[12px]"
              href={site.links.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              className="link-quiet mono inline-flex min-h-[36px] items-center text-[12px]"
              href={site.links.linkedin}
              target="_blank"
              rel="noreferrer noopener"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              className="link-quiet mono inline-flex min-h-[36px] items-center text-[12px]"
              href={site.links.resume}
              target="_blank"
              rel="noreferrer noopener"
            >
              Résumé
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

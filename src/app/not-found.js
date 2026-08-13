import Link from 'next/link';

import { Stops } from '@/lib/stops';

export const metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main">
      <div className="container-x flex min-h-[62vh] flex-col justify-center py-24">
        <p className="mono text-[12px] text-acc">404</p>
        <h1 className="t-h2 mt-5 max-w-[20ch]">
          <Stops text="Nothing here." />
        </h1>
        <p className="t-body mt-5 max-w-[46ch]">
          The link is wrong, or it points at something that has moved.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Home
          </Link>
          <Link href="/platform" className="btn">
            Platform report
          </Link>
        </div>
      </div>
    </main>
  );
}

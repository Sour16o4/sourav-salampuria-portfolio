import { Inter } from 'next/font/google';

import PageTransition from '@/components/PageTransition';
import SiteFooter from '@/components/SiteFooter';
import SiteNav from '@/components/SiteNav';
import site from '@/content/site.json';
import './globals.css';

/* Weights 400/500/600 only — never 700+. */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  metadataBase: new URL(site.baseUrl),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.baseUrl,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Runs before anything below it paints. `.js-motion` gates every "start hidden,
 * then animate in" rule, so with JS off or reduced motion on, nothing is ever
 * hidden in the first place and no content can be stranded invisible.
 */
const MOTION_GATE = `try{if(window.matchMedia&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-motion')}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteNav />
        <PageTransition>{children}</PageTransition>
        <SiteFooter />
      </body>
    </html>
  );
}

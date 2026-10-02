import { Inter_Tight } from 'next/font/google';

/* Display face for the Teal Grid hero and work index only. Body copy stays on
   Inter 400/500/600; this single heavy weight is for the giant type. */
export const displayFont = Inter_Tight({
  subsets: ['latin'],
  weight: ['800'],
  display: 'swap',
  variable: '--font-display',
});

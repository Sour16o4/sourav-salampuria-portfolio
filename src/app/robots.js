import site from '@/content/site.json';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: new URL('/sitemap.xml', site.baseUrl).toString(),
    host: site.baseUrl,
  };
}

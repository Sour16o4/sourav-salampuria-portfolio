import site from '@/content/site.json';

const ROUTES = [
  { path: '/', priority: 1 },
  { path: '/platform', priority: 0.9 },
  { path: '/paykit', priority: 0.9 },
  { path: '/book-api', priority: 0.6 },
  { path: '/about', priority: 0.5 },
];

export default function sitemap() {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: new URL(route.path, site.baseUrl).toString(),
    lastModified,
    changeFrequency: 'monthly',
    priority: route.priority,
  }));
}

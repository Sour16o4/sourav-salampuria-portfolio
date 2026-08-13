/**
 * Every external URL on the site lives in site.json and every one of them was
 * guessed. This resolves each and reports what it actually got.
 *
 *   npm run check:links
 *
 * Zero dependencies. LinkedIn returns 999 or 429 to non-browser clients,
 * which is not a broken link — it is reported separately rather than
 * counted as a failure.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'src/content/site.json'), 'utf8'));

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

const targets = [
  ['links.github', site.links.github],
  ['links.linkedin', site.links.linkedin],
  ['links.platformSource', site.links.platformSource],
  ['links.bookApiSource', site.links.bookApiSource],
  ['baseUrl', site.baseUrl],
].filter(([, url]) => url && /^https?:\/\//.test(url));

const failures = [];
const warnings = [];

async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'user-agent': UA },
        signal: AbortSignal.timeout(12000),
      });
      if (res.status === 405 && method === 'HEAD') continue;
      return { status: res.status, url: res.url };
    } catch (error) {
      if (method === 'GET') return { error: error.name === 'TimeoutError' ? 'timeout' : error.message };
    }
  }
  return { error: 'unreachable' };
}

console.log('\nLinks in src/content/site.json\n-----------------------------');

for (const [path, url] of targets) {
  const result = await probe(url);
  const label = `  ${path.padEnd(22)} ${url}`;

  if (result.error) {
    console.log(`${label}\n      → ${result.error}`);
    failures.push(`${path}: ${url} — ${result.error}`);
  } else if (result.status === 999 || result.status === 429) {
    console.log(`${label}\n      → ${result.status} (LinkedIn blocks non-browser clients; open it manually)`);
    warnings.push(`${path}: could not be verified automatically — open ${url} in a browser.`);
  } else if (result.status >= 400) {
    console.log(`${label}\n      → ${result.status}`);
    failures.push(`${path}: ${url} → ${result.status}`);
  } else {
    const redirected = result.url && result.url.replace(/\/$/, '') !== url.replace(/\/$/, '');
    console.log(`${label}\n      → ${result.status}${redirected ? ` (redirects to ${result.url})` : ''}`);
    if (redirected) warnings.push(`${path} redirects to ${result.url} — use the final URL directly.`);
  }
}

/* The email is assembled at runtime, so just show what will be produced. */
console.log(`\n  email                  ${site.email.user}@${site.email.domain}`);
console.log(`  baseUrl feeds          metadataBase, canonicals, sitemap.xml, robots.txt`);

if (warnings.length) {
  console.log('\nCheck manually');
  for (const w of warnings) console.log(`  · ${w}`);
}
if (failures.length) {
  console.log('\nBroken');
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exitCode = 1;
} else {
  console.log('\nNo broken links.');
}
console.log('');

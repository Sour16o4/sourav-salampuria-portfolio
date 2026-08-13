/**
 * Behavioural verification against the production build, in real Chrome.
 *
 *   npm run verify              everything
 *   npm run verify:motion       only the motion suites
 *   node scripts/verify.mjs --only=terminal,reduced --base=http://localhost:3000
 *
 * Starts `next start` on a free port itself unless --base is given.
 *
 * IMPORTANT: headless Chrome reports `prefers-reduced-motion: reduce` by
 * DEFAULT. Every page opened here sets the feature explicitly — without that,
 * `.js-motion` is never applied, no entrance runs, and the whole suite passes
 * while testing nothing.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const MOTION_SUITES = ['reveal', 'timeline', 'parallax', 'terminal', 'rail', 'marquee', 'reduced'];
const WANTED = args.motion ? MOTION_SUITES : args.only ? String(args.only).split(',').map((s) => s.trim()) : null;
const wants = (s) => !WANTED || WANTED.includes(s);

const CHROME = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p));

if (!CHROME) {
  console.error('No Chrome found. Set CHROME_PATH=/path/to/chrome and retry.');
  process.exit(1);
}

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

async function waitForServer(base, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(base, { signal: AbortSignal.timeout(2500) });
      if (res.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

let child = null;
let BASE = args.base ? String(args.base) : null;

if (!BASE) {
  if (!existsSync(join(ROOT, '.next'))) {
    console.error('No .next build found. Run `npm run build` first.');
    process.exit(1);
  }
  const port = await freePort();
  BASE = `http://localhost:${port}`;
  console.log(`starting next start on ${port} ...`);
  child = spawn(
    process.execPath,
    [join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(port)],
    { cwd: ROOT, stdio: 'ignore' }
  );
  if (!(await waitForServer(BASE))) {
    child.kill();
    console.error('Server did not come up.');
    process.exit(1);
  }
}

const ROUTES = ['/', '/platform', '/book-api', '/about'];
const ALL = [...ROUTES, '/does-not-exist'];
const WIDTHS = [320, 375, 480, 700, 768, 1024, 1280, 1440];
const EXPECTED_MISSING = ['/favicon.ico'];

const results = [];
const problems = [];
function note(ok, label, detail = '') {
  results.push({ ok, label });
  if (!ok) problems.push(`${label}${detail ? ` — ${detail}` : ''}`);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
});

async function newPage({ width, height = 900, reduce = false, touch = false }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' },
  ]);
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon/i.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() < 400) return;
    const p = new URL(r.url()).pathname;
    if (EXPECTED_MISSING.includes(p) || p === '/does-not-exist') return;
    errors.push(`http ${r.status()} ${p}`);
  });
  page.__errors = errors;
  return page;
}

const settle = (page, ms) => page.evaluate((t) => new Promise((r) => setTimeout(r, t)), ms);
const scrollThrough = (page) =>
  page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.5);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });

const suite = (name) => {
  if (!wants(name)) return false;
  console.log(`\n=== ${name} ===`);
  return true;
};

/* ---------------------------------------------------- overflow + console -- */
if (suite('overflow')) {
  for (const width of WIDTHS) {
    for (const path of ALL) {
      const page = await newPage({ width, touch: width < 768 });
      await page.goto(BASE + path, { waitUntil: 'networkidle0' });
      await scrollThrough(page);
      const info = await page.evaluate(() => {
        const de = document.documentElement;
        const bad = [];
        if (de.scrollWidth > window.innerWidth) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (!r.width && !r.height) continue;
            if (r.right > window.innerWidth + 1 || r.left < -1) {
              bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
            }
          }
        }
        return { sw: de.scrollWidth, iw: window.innerWidth, bad: bad.slice(0, 4) };
      });
      note(info.sw <= info.iw, `no h-scroll ${width}px ${path}`, `${info.sw}>${info.iw} ${info.bad.join('|')}`);
      // The 404 route legitimately returns 404, and Chrome logs that to the
      // console for the document request itself. Not an error to fix.
      if (path !== '/does-not-exist') {
        note(page.__errors.length === 0, `clean console ${width}px ${path}`, page.__errors.slice(0, 2).join(' | '));
      }
      await page.close();
    }
  }
}

/* --------------------------------------------------------------- reveal -- */
if (suite('reveal')) {
  for (const width of [375, 768, 1440]) {
    for (const path of ROUTES) {
      const page = await newPage({ width, touch: width < 768 });
      await page.goto(BASE + path, { waitUntil: 'networkidle0' });
      await scrollThrough(page);
      const state = await page.evaluate(() => {
        const t = [
          ...document.querySelectorAll('[data-reveal]'),
          ...document.querySelectorAll('[data-reveal-stagger] > *'),
        ].filter((el) => el.offsetParent !== null);
        return {
          total: t.length,
          hidden: t
            .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99)
            .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`),
        };
      });
      note(state.total > 0, `${path} @${width}: has reveal targets`, `${state.total}`);
      note(state.hidden.length === 0, `${path} @${width}: all reveals reach opacity 1`, state.hidden.slice(0, 4).join(' | '));
      await page.close();
    }
  }
}

/* ------------------------------------------------------------- timeline -- */
if (suite('timeline')) {
  for (const width of [375, 1440]) {
    const page = await newPage({ width, touch: width < 768 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await scrollThrough(page);
    // The spine is scrubbed, so it unwinds when scrollThrough returns to the
    // top. Read it while the section is actually on screen.
    await page.evaluate(async () => {
      const work = document.getElementById('work');
      window.scrollTo(0, work.offsetTop + work.offsetHeight * 0.7);
      await new Promise((r) => setTimeout(r, 1400));
    });
    const t = await page.evaluate(() => {
      const items = [...document.querySelectorAll('#work ol > li')];
      const dots = [...document.querySelectorAll('#work [data-dot]')];
      const spine = document.querySelector('#work svg line:nth-of-type(2)');
      return {
        isList: document.querySelector('#work ol')?.tagName === 'OL',
        count: items.length,
        litDots: dots.filter((d) => d.dataset.on === 'true').length,
        totalDots: dots.length,
        dashoffset: spine ? parseFloat(getComputedStyle(spine).strokeDashoffset) : null,
      };
    });
    note(t.isList, `timeline is an ordered list @${width}`);
    note(t.count === 5, `timeline has 5 entries @${width}`, `${t.count}`);
    note(t.litDots === t.totalDots && t.totalDots === 5, `all node dots activated @${width}`, `${t.litDots}/${t.totalDots}`);
    note(t.dashoffset !== null && t.dashoffset < 100, `spine drew with scroll @${width}`, `${t.dashoffset}`);
    await page.close();
  }
}

/* ------------------------------------------------------------- parallax -- */
if (suite('parallax')) {
  for (const [width, expect] of [[375, 'off'], [768, 'half'], [1440, 'full']]) {
    const page = await newPage({ width, touch: width < 768 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await settle(page, 600);
    const moved = await page.evaluate(async () => {
      const el = document.querySelector('[data-parallax]');
      const read = () => {
        const t = getComputedStyle(el).transform;
        if (t === 'none') return 0;
        const m = t.match(/matrix\(([^)]+)\)/);
        return m ? parseFloat(m[1].split(',')[5]) : 0;
      };
      el.scrollIntoView({ block: 'center' });
      await new Promise((r) => setTimeout(r, 1000));
      const a = read();
      window.scrollBy(0, 600);
      await new Promise((r) => setTimeout(r, 1200));
      return Math.abs(read() - a);
    });
    if (expect === 'off') note(moved < 0.5, `parallax off @${width}px`, `${moved}`);
    else note(moved > 0.5, `parallax active @${width}px (${expect})`, `${moved}`);
    // Travel is capped at 60px total in the vocabulary.
    note(moved <= 61, `parallax travel within 60px cap @${width}px`, `${moved}`);
    await page.close();
  }
}

/* ------------------------------------------------------------- terminal -- */
if (suite('terminal')) {
  const page = await newPage({ width: 1440 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await settle(page, 6500); // let the typewriter finish

  const printed = await page.evaluate(() => {
    const body = document.querySelector('.terminal').lastElementChild;
    const chars = [...document.querySelectorAll('[data-char]')];
    return {
      text: body.innerText,
      hiddenChars: chars.filter((c) => parseFloat(getComputedStyle(c).opacity) < 0.99).length,
      height: document.querySelector('.terminal').getBoundingClientRect().height,
    };
  });
  note(printed.hiddenChars === 0, 'typewriter finishes — no character left hidden', `${printed.hiddenChars}`);
  note(printed.text.includes('cat skills.txt'), 'terminal prints the command');
  note(printed.text.includes('claims are tested here'), 'terminal prints the comment');
  note(!/Trivy|IaC/.test(printed.text), 'terminal no longer mentions Trivy or IaC');

  // The shell is real. Wait for hydration rather than assuming it — clicking
  // before the input is interactive fails only on slow builds, which is
  // exactly when you least want a confusing stack trace.
  await page.waitForSelector('#terminal-input', { visible: true, timeout: 15000 });
  await page.click('#terminal-input');
  for (const cmd of ['help', 'ls', 'whoami', 'bogus']) {
    await page.type('#terminal-input', cmd, { delay: 4 });
    await page.keyboard.press('Enter');
    await settle(page, 220);
  }
  const after = await page.evaluate(() => {
    const t = document.querySelector('.terminal');
    return { text: t.lastElementChild.innerText, height: t.getBoundingClientRect().height };
  });
  note(after.text.includes('available commands'), 'shell: help works');
  note(after.text.includes('platform/'), 'shell: ls works');
  note(after.text.includes('backend & platform engineer'), 'shell: whoami works');
  note(after.text.includes('command not found: bogus'), 'shell: unknown command handled');
  note(
    Math.abs(after.height - printed.height) < 0.5,
    'terminal panel height unchanged by output (no CLS)',
    `${printed.height} -> ${after.height}`
  );

  // clear empties it
  await page.type('#terminal-input', 'clear', { delay: 4 });
  await page.keyboard.press('Enter');
  await settle(page, 250);
  const cleared = await page.evaluate(
    () => document.querySelector('.terminal').lastElementChild.innerText
  );
  note(!cleared.includes('available commands'), 'shell: clear wipes output');
  await page.close();
}

/* --------------------------------------------------------------- rail ---- */
if (suite('rail')) {
  for (const path of ['/platform', '/book-api']) {
    const page = await newPage({ width: 1280 });
    await page.goto(BASE + path, { waitUntil: 'networkidle0' });
    await settle(page, 600);
    const f = await page.evaluate(async () => {
      const read = () => {
        const el = document.querySelector('[aria-hidden="true"] > span.bg-acc');
        if (!el) return null;
        const t = getComputedStyle(el).transform;
        if (t === 'none') return 1;
        const m = t.match(/matrix\(([^)]+)\)/);
        return m ? parseFloat(m[1].split(',')[0]) : null;
      };
      const start = read();
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 1500));
      return { start, end: read() };
    });
    note(f.end !== null && f.end > (f.start ?? 0) + 0.4, `reading progress fills on ${path}`, JSON.stringify(f));
    await page.close();
  }
}

/* ------------------------------------------------------------- marquee ---- */
if (suite('marquee')) {
  const page = await newPage({ width: 1440 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  const m = await page.evaluate(async () => {
    const track = document.querySelector('.marquee-track');
    const read = () => getComputedStyle(track).transform;
    const a = read();
    await new Promise((r) => setTimeout(r, 900));
    return { moved: a !== read(), duration: getComputedStyle(track).animationDuration };
  });
  note(m.moved, 'marquee is animating', JSON.stringify(m));
  note(m.duration === '44s', 'marquee runs at 44s', m.duration);
  await page.close();

  const narrow = await newPage({ width: 400, touch: true });
  await narrow.goto(BASE + '/', { waitUntil: 'networkidle0' });
  const d = await narrow.evaluate(
    () => getComputedStyle(document.querySelector('.marquee-track')).animationDuration
  );
  note(d === '31s', 'marquee 30% faster below 480px', d);
  await narrow.close();
}

/* ------------------------------------------------------------- reduced ---- */
if (suite('reduced')) {
  for (const path of ROUTES) {
    const page = await newPage({ width: 1280, reduce: true });
    await page.goto(BASE + path, { waitUntil: 'networkidle0' });
    await scrollThrough(page);
    const s = await page.evaluate(() => {
      const hidden = [
        ...document.querySelectorAll('[data-reveal]'),
        ...document.querySelectorAll('[data-reveal-stagger] > *'),
      ].filter((el) => el.offsetParent !== null && parseFloat(getComputedStyle(el).opacity) < 1).length;
      const parallax = [...document.querySelectorAll('[data-parallax]')].filter(
        (el) => getComputedStyle(el).transform !== 'none'
      ).length;
      const track = document.querySelector('.marquee-track');
      const chars = [...document.querySelectorAll('[data-char]')];
      return {
        motionClass: document.documentElement.classList.contains('js-motion'),
        hidden,
        parallax,
        marqueeStopped: track ? getComputedStyle(track).animationName === 'none' : true,
        hiddenChars: chars.filter((c) => parseFloat(getComputedStyle(c).opacity) < 0.99).length,
        // Under reduced motion the intro is never split into spans at all, so
        // assert the text itself rather than counting characters — otherwise
        // the check passes on an empty set and proves nothing.
        terminalText: document.querySelector('.terminal')?.innerText ?? '',
      };
    });
    note(!s.motionClass, `RM ${path}: js-motion absent`);
    note(s.hidden === 0, `RM ${path}: nothing below opacity 1`, `${s.hidden}`);
    note(s.parallax === 0, `RM ${path}: parallax at zero`, `${s.parallax}`);
    note(s.marqueeStopped, `RM ${path}: marquee stopped`);
    note(s.hiddenChars === 0, `RM ${path}: no character left hidden`, `${s.hiddenChars}`);
    if (path === '/') {
      note(
        s.terminalText.includes('cat skills.txt') &&
          s.terminalText.includes('claims are tested here'),
        'RM /: terminal text is complete without the typewriter',
        s.terminalText.slice(0, 60)
      );
    }
    await page.close();
  }
}

/* --------------------------------------------------------------- a11y ---- */
if (suite('a11y')) {
  for (const width of [375, 1280]) {
    for (const path of ROUTES) {
      const page = await newPage({ width, touch: width < 768 });
      await page.goto(BASE + path, { waitUntil: 'networkidle0' });

      const expected = await page.evaluate(
        () =>
          [...document.querySelectorAll('a[href], button, input, textarea, [tabindex]:not([tabindex="-1"])')]
            .filter((el) => el.offsetParent !== null || el.classList.contains('skip-link')).length
      );

      const seen = [];
      const noRing = [];
      let first = null;
      for (let i = 0; i < expected + 6; i += 1) {
        await page.keyboard.press('Tab');
        const stop = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body || el === document.documentElement) return null;
          const cs = getComputedStyle(el);
          return {
            key: `${el.tagName}:${el.id}:${(el.textContent || '').trim().slice(0, 20)}`,
            tag: el.tagName.toLowerCase(),
            ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none',
          };
        });
        if (!stop) continue;
        if (first === null) first = stop.key;
        else if (stop.key === first) break;
        seen.push(stop.key);
        if (!stop.ring) noRing.push(stop.tag);
      }
      note(seen.length > 0, `tab reaches controls ${path} @${width}`, `${seen.length}`);
      note(noRing.length === 0, `every tab stop has a focus ring ${path} @${width}`, noRing.slice(0, 5).join(' | '));
      note(seen.length >= expected - 1, `tab covers all controls ${path} @${width}`, `${seen.length}/${expected}`);
      await page.close();
    }
  }

  const page = await newPage({ width: 1280 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  const landmarks = await page.evaluate(() => ({
    main: document.querySelectorAll('main').length,
    header: document.querySelectorAll('header').length,
    footer: document.querySelectorAll('footer').length,
    nav: document.querySelectorAll('nav').length,
    h1: document.querySelectorAll('h1').length,
  }));
  note(landmarks.main === 1, 'exactly one <main>', JSON.stringify(landmarks));
  note(landmarks.header === 1 && landmarks.footer === 1, 'header and footer landmarks present');
  note(landmarks.h1 === 1, 'exactly one h1 on home', `${landmarks.h1}`);
  await page.close();
}

/* ------------------------------------------------------- design system ---- */
if (suite('design')) {
  const page = await newPage({ width: 1440 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await scrollThrough(page);

  const d = await page.evaluate(() => {
    const weights = new Set();
    const colours = new Set();
    let shadows = 0;
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (!cs.fontWeight) continue;
      const w = parseInt(cs.fontWeight, 10);
      if (w > 600) weights.add(`${el.tagName.toLowerCase()}=${w}`);
      // The 5px ring on an activated timeline node dot is a box-shadow the
      // spec explicitly asks for. Everything else must have none.
      if (cs.boxShadow && cs.boxShadow !== 'none' && !el.classList.contains('node-dot')) {
        shadows += 1;
      }
      const c = cs.color;
      if (c) colours.add(c);
    }
    // Green full stops: every section heading's trailing "." is accent-coloured.
    const stops = [...document.querySelectorAll('h2 span, h1 span')].filter(
      (s) => s.textContent === '.'
    );
    return {
      heavy: [...weights],
      shadows,
      greenStops: stops.length,
      allStopsGreen: stops.every((s) => getComputedStyle(s).color === 'rgb(91, 228, 155)'),
    };
  });
  note(d.heavy.length === 0, 'no font weight above 600', d.heavy.slice(0, 5).join(' | '));
  note(d.shadows === 0, 'no box shadows', `${d.shadows}`);
  note(d.greenStops > 0, 'section headings carry full stops', `${d.greenStops}`);
  note(d.allStopsGreen, 'every heading full stop is the accent colour');

  // One accent only — no stray chroma.
  const chroma = await page.evaluate(() => {
    const bad = new Set();
    const ok = /^rgba?\((\d+), (\d+), (\d+)/;
    for (const el of document.querySelectorAll('body *')) {
      for (const prop of ['color', 'backgroundColor', 'borderTopColor']) {
        const v = getComputedStyle(el)[prop];
        const m = v && v.match(ok);
        if (!m) continue;
        const [r, g, b] = [+m[1], +m[2], +m[3]];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max - min < 26) continue; // greys
        const isAccent = g > r && g > b; // the green family
        if (!isAccent) bad.add(`${el.tagName.toLowerCase()} ${prop}:${v}`);
      }
    }
    return [...bad];
  });
  note(chroma.length === 0, 'no second accent colour anywhere', chroma.slice(0, 5).join(' | '));
  await page.close();
}

/* --------------------------------------------------------------- theme ---- */
/** Palette ground truth. Change here when the theme tokens change. */
const THEME = {
  darkBg: '#0a0a0a',
  darkAcc: '#5be49b',
  lightBg: '#f8f2f0',
  lightAcc: '#0b6b44',
};

if (suite('theme')) {
  const page = await newPage({ width: 1280 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await settle(page, 400);

  const read = () =>
    page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const terminal = document.querySelector('.terminal');
      return {
        attr: document.documentElement.getAttribute('data-theme'),
        bg: cs.getPropertyValue('--color-bg').trim(),
        acc: cs.getPropertyValue('--color-acc').trim(),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        terminalBg: getComputedStyle(terminal).backgroundColor,
        cardBg: getComputedStyle(document.querySelector('.card')).backgroundColor,
        // The inset chip (--bg-3), not the marquee pill: that one deliberately
        // shares the card tone so it lifts off the page ground.
        chipBg: getComputedStyle(document.querySelector('.chip')).backgroundColor,
      };
    });

  const before = await read();
  note(before.bg === THEME.darkBg, 'defaults to dark', before.bg);

  await page.click('button[aria-label*="light theme"], button[aria-label*="dark theme"]');
  await settle(page, 350);
  const after = await read();

  note(after.attr === 'light', 'toggle switches to light', `${after.attr}`);
  note(after.bg === THEME.lightBg, 'rose-white ground applied', after.bg);
  note(after.acc === THEME.lightAcc, 'accent darkens for contrast on light', after.acc);

  // Four surfaces from one family, each a distinct step, none identical — and
  // the terminal re-themes with the page rather than staying a fixed black
  // rectangle dropped onto paper.
  for (const [name, snap] of [
    ['dark', before],
    ['light', after],
  ]) {
    const surfaces = [snap.bodyBg, snap.cardBg, snap.terminalBg, snap.chipBg];
    note(
      new Set(surfaces).size === 4,
      `${name}: ground, card, terminal and chip are four distinct surfaces`,
      surfaces.join(' | ')
    );
  }
  note(
    before.terminalBg !== after.terminalBg,
    'terminal re-themes with the page',
    `${before.terminalBg} -> ${after.terminalBg}`
  );

  // Contrast of body text on the light ground.
  const contrast = await page.evaluate(() => {
    const lum = (rgb) => {
      const [r, g, b] = rgb.match(/\d+/g).slice(0, 3).map(Number).map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bg = getComputedStyle(document.body).backgroundColor;
    const ink = getComputedStyle(document.querySelector('h1')).color;
    const acc = getComputedStyle(document.querySelector('.text-acc')).color;
    const ratio = (a, b) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    return { ink: ratio(ink, bg), acc: ratio(acc, bg) };
  });
  note(contrast.ink >= 4.5, 'light: body ink meets 4.5:1', contrast.ink.toFixed(2));
  note(contrast.acc >= 4.5, 'light: accent meets 4.5:1', contrast.acc.toFixed(2));

  await page.click('button[aria-label*="dark theme"]');
  await settle(page, 350);
  const back = await read();
  note(back.attr === 'dark' && back.bg === THEME.darkBg, 'toggle switches back to dark', back.bg);
  await page.close();

  // OS preference is honoured with no explicit choice.
  const light = await browser.newPage();
  await light.setViewport({ width: 1280, height: 900 });
  await light.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' },
    { name: 'prefers-reduced-motion', value: 'no-preference' },
  ]);
  await light.goto(BASE + '/', { waitUntil: 'networkidle0' });
  const osLight = await light.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
  );
  note(osLight === THEME.lightBg, 'honours prefers-color-scheme: light', osLight);
  await light.close();
}

/* -------------------------------------------------------------- routes ---- */
if (suite('routes')) {
  for (const path of ROUTES) {
    const res = await fetch(BASE + path);
    note(res.status === 200, `${path} serves 200`, `${res.status}`);
  }
  const nf = await fetch(BASE + '/definitely-not-a-page');
  note(nf.status === 404, 'unknown route returns 404', `${nf.status}`);
  note((await nf.text()).includes('Nothing here'), 'custom 404 content served');

  const sm = await fetch(BASE + '/sitemap.xml');
  const smText = await sm.text();
  note(sm.status === 200 && smText.includes('<urlset'), 'sitemap.xml served');
  for (const p of ['/platform', '/book-api', '/about']) {
    note(smText.includes(p), `sitemap lists ${p}`);
  }
  const rb = await fetch(BASE + '/robots.txt');
  note(rb.status === 200 && /Sitemap:/i.test(await rb.text()), 'robots.txt served with sitemap');

  const html = await (await fetch(BASE + '/')).text();
  note(!/mailto:/i.test(html), 'no plain mailto in delivered HTML');
  note(!/Trivy|IaC/.test(html), 'no Trivy or IaC in home HTML');
  note(!/TODO:/.test(html), 'no TODO marker in home HTML');
}

/* ---------------------------------------------------------------- no-JS -- */
if (suite('nojs')) {
  for (const path of ROUTES) {
    const page = await newPage({ width: 1280 });
    await page.setJavaScriptEnabled(false);
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    const s = await page.evaluate(() => ({
      hidden: [
        ...document.querySelectorAll('[data-reveal]'),
        ...document.querySelectorAll('[data-reveal-stagger] > *'),
      ].filter((el) => parseFloat(getComputedStyle(el).opacity) < 1).length,
      text: document.body.innerText.length,
    }));
    note(s.hidden === 0, `no-JS ${path}: nothing stuck invisible`, `${s.hidden}`);
    note(s.text > 400, `no-JS ${path}: content is present`, `${s.text} chars`);
    await page.close();
  }
}

/* --------------------------------------------------------------- report -- */
await browser.close();
if (child) child.kill();

const passed = results.filter((r) => r.ok).length;
console.log('\n================ SUMMARY ================');
console.log(`${passed}/${results.length} checks passed`);
if (problems.length) {
  console.log('\nFAILURES:');
  for (const p of problems) console.log('  x ' + p);
  process.exitCode = 1;
} else {
  console.log('All checks passed.');
}

setTimeout(() => process.exit(process.exitCode ?? 0), 300).unref();

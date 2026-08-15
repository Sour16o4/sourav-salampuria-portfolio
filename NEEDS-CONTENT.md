# What still needs you

The content sweep is done: every field that used to render as a visible amber `TODO`
marker has been filled in from real source material, and the drafting notes that used to
sit at the top of each content file are gone too. What's left is deployment.

```bash
npm run check     # every external URL in site.json
npm run verify    # 212 behavioural checks
```

---

## 1 — Deploy

Vercel, zero config. Push to GitHub and import the repo there.

**Name the repo `sourav-salampuria-portfolio`.** Vercel's assigned URL follows the repo
name, and `baseUrl` in `src/content/site.json` is already set to
`https://sourav-salampuria-portfolio.vercel.app` — it feeds `metadataBase`, canonicals,
`sitemap.xml` and `robots.txt`. If the repo ends up named anything else, correct
`baseUrl` to match the URL Vercel actually assigns before calling the site finished.

```bash
git remote add origin https://github.com/Sour16o4/sourav-salampuria-portfolio.git
git push -u origin main
```

## 2 — `check-links` fails on `baseUrl` until deployed

`npm run check` currently reports one failure:

```
baseUrl   https://sourav-salampuria-portfolio.vercel.app   → 404
```

That's expected — nothing is deployed at that URL yet. It self-clears on first deploy
(or needs the `baseUrl` correction above if the repo name ends up different).

## 3 — LinkedIn: confirmed by hand ✓

`https://www.linkedin.com/in/sourav-salampuria` was opened in a browser on 2026-08-13 and
resolves to the right profile. `check-links` will keep reporting it under "Check manually"
— LinkedIn returns 999 or 429 to every automated client by design, not because the link is
wrong. That warning is expected and needs no action.

## 4 — Rotate the Resend key if it has ever been pasted anywhere

`RESEND_API_KEY` lives in Vercel's environment variables and in a gitignored `.env.local`.
It has never been committed. If the value has been shared in a chat, a screenshot or a
ticket, treat it as public: revoke it at resend.com → API Keys, issue a new one, update
both places, and **redeploy** — a saved variable does not reach a deployment that already
exists.

## 5 — Deliberately not done

One thing stays open on purpose, not by oversight:

- **No portrait photograph.** Stock photography was ruled out, so nothing fills that
  slot until a real photo exists.

The other two on this list are now built:

- **Contact form** posts to `/api/contact` and sends through Resend, with a `mailto:`
  fallback if no endpoint is configured and a working no-JavaScript path.
- **Theme choice** persists in a cookie and is restored before first paint.

# What still needs you

The content sweep is done: every field that used to render as a visible amber `TODO`
marker has been filled in from real source material, and the drafting notes that used to
sit at the top of each content file are gone too. What's left is deployment, and two
things that cannot be checked by a script.

```bash
npm run check     # every external URL in site.json
npm run verify    # 211 behavioural checks
```

---

## 1 — Deploy

Vercel, zero config. Push to GitHub and import the repo there.

**Name the repo `sourav-salampuria`.** Vercel's assigned URL follows the repo name, and
`baseUrl` in `src/content/site.json` is already set to
`https://sourav-salampuria.vercel.app` — it feeds `metadataBase`, canonicals,
`sitemap.xml` and `robots.txt`. If the repo ends up named anything else, correct
`baseUrl` to match the URL Vercel actually assigns before calling the site finished.

```bash
git remote add origin <your repo>
git push -u origin master
```

## 2 — `check-links` fails on `baseUrl` until deployed

`npm run check` currently reports one failure:

```
baseUrl   https://sourav-salampuria.vercel.app   → 404
```

That's expected — nothing is deployed at that URL yet. It self-clears on first deploy
(or needs the `baseUrl` correction above if the repo name ends up different).

## 3 — Confirm the LinkedIn URL by hand

`https://www.linkedin.com/in/sourav-salampuria` cannot be verified by `check-links` —
LinkedIn returns 999 or 429 to every automated client by design, not because the link is
wrong. Open it in a browser once and confirm it resolves to the right profile.

## 4 — Deliberately not done

These three stay open on purpose, not by oversight:

- **No portrait photograph.** Stock photography was ruled out, so nothing fills that
  slot until a real photo exists.
- **No contact-form backend.** Submissions open the visitor's mail client instead of
  POSTing anywhere — that is the designed behaviour, not a placeholder. It works today,
  stores nothing, and has no service to maintain. Point `contact.endpoint` in
  `home.json` at a real POST URL only if that tradeoff changes.
- **Theme choice doesn't survive a hard reload.** The spec forbids browser storage, so
  the toggle holds for the session and across client-side navigation, then falls back to
  the visitor's OS preference on reload. Making it sticky needs a cookie, which would be
  a deliberate departure from the spec — a call for whoever owns that tradeoff, not
  something to add silently.

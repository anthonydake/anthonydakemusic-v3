# anthonydakemusic-v3

The website of Anthony Dake, Architect of Sound. Music production in Columbus, OH.

- Live: https://www.anthonydakemusic.com
- Hosting: Vercel (`main` deploys itself; every other branch gets a private preview)

**Read `CLAUDE.md` first.** It says how the site is put together, where every word lives, the rules that come with the work, and how to check a change.

## The short version

```bash
npm install
npm run dev          # the site at http://localhost:3000
npm run build        # what Vercel runs
npm run site:file    # the whole site as one file: out/anthony-dake-site-prototype.html
```

The site's own source is in `site/`: the words in `site/content.mjs`, the pages in `site/templates.mjs`, the styles in `site/css/`, the scripts in `site/js/`. Public pages are plain HTML documents sent by route handlers under `app/`; there is no React on them.

## Checks

```bash
npm install --no-save @electric-sql/pglite playwright
node scripts/store-selftest.mjs     # the store's route handlers, against a mock Square
node scripts/site-check.mjs         # a real browser through every page and flow
node scripts/local-site.mjs         # the whole site locally, with nothing real behind it
```

# CLAUDE.md — anthonydakemusic-v3

Read this before touching anything. It describes the site as it stands on `main`, which is what is live.

## What this is

The website of Anthony Dake, music producer in Columbus, OH. Brand line: **Architect of Sound**. The site is about production only and sells one offer, **A Full Build** (production, vocals, mix, and master). It also has a small store for digital downloads, paid through Square.

- **Live site**: https://www.anthonydakemusic.com (Vercel project `anthonydakemusic-v3`, auto-deploys `main`)
- **Repo**: https://github.com/anthonydake/anthonydakemusic-v3 (public: never put a secret or a private file's address in it)
- **State**: this site went live on 24 Nov 2026, at Anthony's word ("push it and go live"), replacing the earlier drummer-and-producer design. The branch `new-site` is the preview branch: every change is made there first (see How a change reaches the site). The tag `earlier-site` is the last commit of the old site.

## Rules that come with the work (Anthony's)

1. **Never push to `main` without his go-ahead.** `main` is the live site. Changes are made on `new-site`, whose Vercel preview is where he sees them, and he says when they go live. A fix he has already decided (his typo, his file, his words) counts as his go-ahead once the visual check passes.
2. **The site's words are his.** Do not write lines for him. A gap stays a marked blank until he fills it. Do not "improve" copy.
3. **A client text is the client's real words**, never reworded, never shown twice on the site.
4. **Titles and artists are spelled the way each release spells them** (`AR!YAH`, `BittyOTW`, `AURA`).
5. **Payments are Square only.** Not Stripe, not PayPal, and nothing that runs on their rails (Lemon Squeezy, Gumroad, Shopify Payments, Polar, Payhip, Ko-fi).
6. **Never copy cover art from Spotify or any store.** A cover comes from the artist or from Anthony.
7. **Every decision is logged in this file, in the same commit as the change**: a dated line under History, briefly, with his words where he gave them, and the section the change touches (the design, a page, a rule) brought up to date. This file is the source of truth. The Design System artifact ("Anthony Dake", on claude.ai) and the claude.ai project log are refreshed from it by Claude in Cowork; nothing needs doing to them from here.
8. He reacts to what he sees, not to descriptions. Show a picture or a working page early.
9. Build and push for him; do not hand him commands to run. Run the checks below before every commit.

## The one idea behind the code

**The prototype is the front end.** The site was designed as one self-contained HTML file, and that same source now builds two things:

- `node site/build.mjs` makes what the Next app serves: `public/site/app.css`, `public/site/app.js`, fonts and pictures, plus `lib/site/manifest.generated.ts` (a mark of their contents for cache-busting). `npm run dev` and `npm run build` run it first. All of it is git-ignored: made, never edited.
- `npm run site:file` makes the whole site as **one file** (`out/anthony-dake-site-prototype.html`): fonts, pictures, styles and script inside, addresses as `#names`, nothing sent anywhere, a TEST chip for the two grounds. This is what Anthony opens to judge a design before it goes to a preview.

**No React on a public page.** Every public address answers with one whole HTML document from a route handler (`app/**/route.ts`), built by `lib/site/render.ts` from the same templates the browser uses. The browser's script then moves between pages without a reload and keeps the address in step. So every page is whole with scripts off: its words are in the document, its links are real links, Buy and the booking form are plain forms. There is no React page left at all (the `/admin` pages went on 24 Nov 2026), so there is no `app/layout.tsx`, no Tailwind and no global stylesheet: do not add one for a public page.

## Where things are

```
site/                     THE SITE'S SOURCE (edit here)
  content.mjs             every word and every list: pages, releases, the offer, the form, About texts, press kit, store words
  templates.mjs           the pages as HTML strings; runs on the server AND is packed for the browser (window.ADSite)
  css/site.css            the phone's rules (the design was made phone-first)
  css/wide.css            what a wide screen changes (at least 700 px across and 560 px tall)
  css/test.css, test-panel.html   the TEST chip of the one-file prototype only
  js/engine.js            the drawing (WebGL 2), the flight between home and a page, the routing, the hand-made details on words
  js/pages.js             each page's own behaviour: the belt of covers, the booking form, About's photo and texts, Buy
  js/chalk.js             the chalk mark (window.ChalkMark)
  js/structure.js         works the drawing's pieces out of the drum part in data/
  data/drums.json, arr.json       Anthony's own drum part: what the drawing is made from
  fonts/, img/            the four font files; covers, the About photo, the mark
  build.mjs               the two builds described above
lib/site/render.ts        server: renderDocument(page, data), htmlResponse(), notFoundResponse(), storefront()
app/route.ts              /            (static)
app/production/           /production, /production/sent, /production/not-sent   (static)
app/about/, app/press-kit/                                                      (static)
app/products/             /products (per request), /products/thanks/[order] (per request: the order page)
app/[...missing]/         any other address: the site's own "Not found", as a 404
app/llms.txt/             /llms.txt, made from content.mjs
app/api/book              the booking form's endpoint
app/api/store/*, app/api/square/webhook   the store's endpoints
lib/store/*, data/store.data.ts            the store (see Store)
scripts/                  the checks (see Checks) and upload-media.mjs
next.config.ts            redirects from the old addresses; long caching for /site/*
archive/earlier-site/     the earlier site's pictures and downloads, kept for reference; not served, not built (see archive/README.md)
```

### How a document is put together

`renderDocument(page, data)` calls `documentHtml()` in `site/templates.mjs`. Every document carries: the header (first in the document, so the keyboard meets it first), the home screen's words (in every document, because Back flies home without a reload; hidden unless the page is home), `<main id="dest">` with the page's own section, and `window.__AD`, the document's note to the script: `{ mode: 'site', v, base, products, sandbox }`.

The engine reads `body[data-page]`. Header words carry `data-jump` (fly from home, turn straight from another page, do nothing on their own page), home's door and links `data-go`, Back `data-back`, and the mark in the header `data-home` (the home button from every page: it does what Back does, and on the home screen it moves nothing). A link marked `data-plain` is the browser's own (a download, a re-check). On a page that exists only as a server document (`order`, `missing`) every link is the browser's own, so the order page keeps its place in the history.

### Recipes

- **Change a word**: `site/content.mjs`. Nothing else. (Then `npm run site`, or just run dev.)
- **The press kit's bio**: `PRESS_KIT.bio` in `content.mjs`, one string per paragraph, word for word as he sent it (24 Nov 2026). A change comes from him; do not edit or tidy it. (Left empty, the page shows ruled blanks and "Bio to come".)
- **About carries no words of his own**: his bio stood there for an evening on 24 Nov 2026 and moved to the press kit at his word. Do not put lines there for him.
- **Add or reorder a release**: `RELEASES` in `content.mjs`, in his order (the first leads the belt), with `youtube` set to the id of the release's own video or audio on YouTube (the cover is a link to it). Put `<key>-240.jpg` and `<key>-480.jpg` in `site/img/covers/` (square, sRGB, from the artist's own file) and set `art: [240, 480]`. While there is no cover, `art: null` shows an empty frame. All seven have their covers (Sparkles, Forever and the larger Get Down are his files of 24 Nov 2026, with the thin dark edges of a screenshot taken off).
- **The About photo**: `site/img/about/studio-{480,800,1200,1600}.{jpg,webp}`, resized from his 1718 x 2576 original (Lanczos; jpg q 84 to 88, webp q 80). Where each text sits on it is in `ABOUT.texts`.
- **Add a product**: see Store.

## The design, in short

The decisions are logged in this file (History, briefly). The Design System artifact on claude.ai is the picture book of the design, refreshed from this file. What code must not break:

- One screen, one door (the only blue thing on a screen, in brackets), one drawing behind everything, two typefaces (Instrument Serif for the name only; Courier Prime for everything else, with its own two arrows font), one blue.
- Two grounds: black and soft white. The visitor's system picks (`prefers-color-scheme`); there is no switch.
- Words you press are 44 px tall; the door 46 (52 on wide). Typed text in a field is 16 px or more, or a phone zooms the page.
- **Wide** means at least 700 px across and 560 px tall (a tablet held upright is wide; a phone on its side is not). Those two numbers are in `css/wide.css`, `js/pages.js` and the pictures' `sizes` in `templates.mjs`: change them together. On wide the idea is the same page with air: what is wide goes edge to edge (drawing, frame, belt), what is read keeps to a narrow centre column, short pages stand mid-screen.
- **The belt**: seven covers travelling left to right, the first in his order in front. A cover is never on screen twice: the gap between covers opens until one run is a screen and a cover long. **Each cover is a link to its release on YouTube** (new tab), and over it the mouse stays the plain arrow, not the hand (his words: "It should just be a normal cursor"). A press that does not move opens the link; a pull along the belt moves the belt and opens nothing.
- **Production is one screen on a laptop** (at least 900 px across): the form's fields stand two by two, the gaps open with the window's height and the covers take the height that is left. The sum of every height on the page is written out at the foot of `css/wide.css`: change a height there and change the sum. The checks hold it at 1280 x 720, 1440 x 900 and 1920 x 1080.
- **About is one screen, no scroll**, at every size: the script gives the photograph the height that is left and pins each text. On a screen too short for four texts, the last two are left out (still read out to screen readers). On a wide screen the texts stand 165 px out from the photograph's sides, at least 24 px of each over it, and **lean against the mouse**, copied from the photographs on humanperson.com's home screen: the numbers and what was fitted to this page are in the comment over `PULL` in `js/pages.js`.
- **The mark in the header is the home button** from every page. Its ring lights up under a mouse and while pressed, as the old site's did (a tenth of white to a fifth).
- **Less motion**: with `prefers-reduced-motion` there is no flight and the belt is one still row.
- **No WebGL 2**: the engine stops at once and marks `body[data-ready="no-gl"]`; the stylesheet gives the home text a ruled bubble and the mark a picture. Every page still works.

## Booking

The form on `/production` has four fields: name and email (needed), a link to released music, a note. It posts to `POST /api/book`:

- With scripts on, the page sends JSON and gets `{ ok: true }`; the form gives way in place to "Sent." If it fails, the form stays and says so with the email address.
- With scripts off, the browser posts the plain form and is redirected to `/production/sent` or `/production/not-sent`. The browser's own checks stand in for the page's (the script sets `noValidate` itself).
- Same-origin only, compared with the host that served the request (so previews work). A hidden `website` field catches scripts that fill everything; they are told all went well.
- Stored in the `bookings` table (Neon Postgres through `@vercel/postgres`), made idempotently on each request: `name`, `email`, `event_type` ("Production: A Full Build"), `message` (the note), `music_link`. It is a second copy only: no page lists it (the list and its login were removed on 24 Nov 2026, at his word, once the email was reliable). To read it, open the table in the Neon console.
- Anthony is emailed through Resend **after** the answer is sent, with `after()` so the platform keeps the function alive until it has gone.

Env: `POSTGRES_URL` and friends (Neon integration), `RESEND_API_KEY` (Resend integration: never set by hand), `BOOKING_NOTIFY_EMAIL` (default `adakemusic@gmail.com`), `BOOKING_NOTIFY_FROM` (`noreply@anthonydakemusic.com` since 24 Nov 2026, when the domain was verified at Resend; before that `onboarding@resend.dev`, Resend's test sender, which only delivers to the account owner). The domain's three Resend records at Cloudflare must stay as they are: TXT `resend._domainkey` (the DKIM key) and the CNAMEs `send` and `rsend` (DNS only, never proxied). Without them Resend stops sending from the domain. The domain has no MX record, so mail to an @anthonydakemusic.com address goes nowhere: a booking notice's reply-to is the person who wrote and a receipt's is Anthony's address, so those replies reach a person; the sale notice to Anthony has no reply-to, and a reply to it would bounce.

## Store (Square)

One-off digital downloads, paid on Square's hosted checkout page. Card details never touch this site.

**Flow.** `/products` lists what is for sale. Buy is a plain HTML form (`POST /api/store/checkout`) → the route asks Square's Checkout API for a payment link (`quick_pay`: name + price) and saves a `pending` row in `store_orders` → `303` to Square → after paying, Square sends the buyer to `/products/thanks/<order id>` and posts `payment.updated` to `/api/square/webhook`. Either path can mark the order paid: the webhook (signature-checked), or the order page, which asks Square directly (`RetrieveOrder` → tender → `GetPayment`) because the redirect usually beats the webhook. Both go through one function, `settlePayment()` in `lib/store/fulfill.ts`, which is safe to run any number of times for the same payment. Once paid, the order page shows `Download →`, the buyer is emailed a receipt whose button goes back to that page, and `BOOKING_NOTIFY_EMAIL` gets a sale notice.

**The order page** (`app/products/thanks/[order]/route.ts`) has five states, decided by `orderPageState()` in `lib/store/orders.ts`: `ready`, `pending` (re-checks itself every 4 s with a meta refresh, `?n=` counts the tries), `stalled` (after 12 tries), `refunded`, `expired`. Its address is the buyer's key to the download, so it is never cached, never indexed, sends no referrer, and carries no analytics. If the database cannot be reached it shows the `stalled` words with a 503.

**When the store is open.** `storefront()` in `lib/site/render.ts`: open only when Square's keys are set **and** something is sellable. Closed means the header shows no Products link and `/products` is a 404. The static pages bake this in at build time (an env change needs a new deployment anyway).

**Files.**
- `data/store.data.ts`: the catalog (`STORE_PRODUCTS`): `id`, `title`, `blurb`, `priceCents`, optional `downloadName`, `placeholder`. Public info only. Array order = display order.
- `lib/store/config.ts`: env → Square config. `catalog.ts`: which products are sellable right now. `square.ts`: the three Square calls + the webhook signature check (plain `fetch`, no SDK). `orders.ts`: the `store_orders` table. `fulfill.ts`: paid transition + emails. `files.ts`: where a product's file comes from. `email.ts`: Resend. `receipt.ts`: builds the buyer's receipt email; its five images live in `public/email/` (**do not move or rename them: sent emails point at them**).
- The fixed words round a product (Buy, the order page's lines) are in `STORE` in `site/content.mjs`.

**Env vars** (Vercel; on 24 Nov 2026 only the two sandbox values are set, in Preview only):
- `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`: without both the store is closed.
- `SQUARE_WEBHOOK_SIGNATURE_KEY`: without it the webhook answers `503`.
- `SQUARE_ENVIRONMENT`: `production` means real money; anything else (or unset) is sandbox. Sandbox keys belong in Vercel's Preview environment, production keys in Production.
- `STORE_FILE_<PRODUCT_ID>`: the address of a real product's file.
- Optional: `SQUARE_WEBHOOK_URL`, `STORE_EMAIL_FROM` (defaults to `BOOKING_NOTIFY_FROM`).

**Adding a real product.** (1) Upload the file (Vercel Blob is fine: `npm run upload-media`). (2) Add an entry to `STORE_PRODUCTS`, with his words for the title and the line under it. (3) Set `STORE_FILE_<ID>` in Vercel to the file's address: product `groove-pack-1` reads `STORE_FILE_GROOVE_PACK_1`. **This repository is public: never write a file's address in code or in this document.** A product with no file configured is not listed and cannot be bought. Files are streamed through `/api/store/download`, so the address never reaches the buyer; above roughly 50 MB, move to a private Blob store with short-lived signed URLs.

**Rules that are easy to break.**
- Placeholder products (`placeholder: true`) are listed only in sandbox. `test-download` ($1) is the only product today, so **the live site shows no Products link and no Products page**. That is correct until there is a real product and live keys.
- Every `store_orders` row carries `environment` (`sandbox` / `production`): Preview and Production share one database, and an order is only ever confirmed with keys from its own environment.
- The webhook must keep ignoring payments it does not recognise: the same Square account also takes invoice and in-person payments.
- Download links: 30 days, 10 downloads (`DOWNLOAD_WINDOW_DAYS`, `DOWNLOAD_LIMIT` in `orders.ts`). A refund closes the download.
- Buyer emails go out from `noreply@anthonydakemusic.com`, a verified Resend domain since 24 Nov 2026 (a receipt to a buyer's own address is still unproven). The order page stays the delivery path of record: email failures are logged and never block an order.
- The receipt email is Anthony's own design (v3, 23 Nov 2026), copied tag for tag from his file. It still uses the earlier two faces (Gill Sans capitals, a serif for reading). Change the design in a new template first, then in `receipt.ts`. The chalk mark in it is a render of `ChalkMark`: never redraw it by hand.

**Testing in Square's sandbox.** The sandbox never shows a card form for a payment link. Buy lands on Square's "Checkout API Sandbox Testing Panel": `Next` → `Test Payment` simulates a buyer paying (once per link). The panel does not send the browser back by itself: follow its "Customer redirected to" link, or keep the order page open, which re-checks. The simulated payment has no buyer (no email, no card), so in sandbox only the receipt goes to the store inbox (`BOOKING_NOTIFY_EMAIL`). Preview deployments sit behind Vercel login, so Square's webhook cannot reach them; on a preview the order page's own check is what marks the order paid, and the receipt's images are read from GitHub at the deployed commit (`receiptAssetBase()`). An env var change only reaches a new deployment.

## Checks (run before every commit)

```bash
npm run build                                   # site build + Next build + TypeScript
npx eslint .                                    # lint (the site's browser scripts are not linted)
npm install --no-save @electric-sql/pglite playwright   # once; neither is a project dependency
node scripts/store-selftest.mjs                 # 63 checks on the store's route handlers
node scripts/site-check.mjs                     # a real browser through the whole site (about 650 checks, a few minutes)
```

- `scripts/local-site.mjs [port]` is **the whole site on this machine with nothing real behind it**: the real route handlers, a stand-in for Square's checkout page, an in-memory Postgres, emails printed. Use it to walk Buy → pay → order page → Download by hand.
- `scripts/site-check.mjs` drives Chromium through that: every page at six sizes and both grounds (nothing spills, the header clears the mark, the mark is a link home, the belt never shows a cover twice, every cover links to YouTube, Production fits one screen on a laptop, About on every screen, the press kit shows his bio word for word), the moves between pages and the browser's Back and Forward, a press and a pull on the belt, the lean on About, the booking form (and that the request is kept and emailed, and that nothing answers at the old list's addresses), the store from Buy to Download with all five order states, then again with scripts off, with reduced motion, and without WebGL. Groups: `layout moves form store plain calm nogl head`. With `SITE_URL=http://localhost:3000` it runs the groups that need no database against a running `npm run start` (build it with `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID` set to anything, or the static pages have no Products link and those checks fail).
- What only the real thing proves: Square's sandbox on a Vercel preview, email delivery, a real phone's toolbars, a real card.

After editing anything under `site/`, run `npm run site` (dev and build do it for you) and, if a picture for Anthony is wanted, `npm run site:file`.

## How a change reaches the site (agreed 24 Nov 2026)

Anthony's decision, 24 Nov 2026 ("i agree. do it."): **Claude Code on his Mac, in this folder, is the only thing that changes this repository.** Claude in Cowork no longer pushes here. It works on design options shown as pictures, the Design System, the Vercel, Cloudflare, Resend and Square dashboards, research and documents, and hands a site change over as a brief for Claude Code. Two builders on one repository collide, and the push guard below only sees Claude Code.

- `main` is live: Vercel production builds every push to it. `new-site` is the preview branch: Vercel builds every push to it at https://anthonydakemusic-v3-git-new-site-anthonydakes-projects.vercel.app (behind Vercel login). That link never changes.
- Start every change with `git fetch origin`, then on `new-site` bring in `origin/main` (`git merge origin/main`: normally nothing or a fast-forward). One change at a time on `new-site`.
- Make the change, run the checks (Checks), then follow Before every push: it commits, looks at the site at phone and laptop sizes and pushes `new-site`.
- Two speeds:
  - **A fix he has already decided** (a typo, a file or picture he sent, words he dictated) may go live as soon as the visual check passes.
  - **Anything that changes how the site looks or reads** waits: push `new-site`, give him the preview link and the phone and laptop screenshots, and go live only on his word. Screenshots catch broken layout, not taste.
- Going live: `git push origin new-site:main`, a fast-forward only. If it is refused, `main` has moved: fetch, merge `origin/main` into `new-site`, check again. Never force-push `main`. Then wait for Vercel to show the production deployment Ready and look at the live pages the change touched at phone and laptop sizes.
- Log it in this file, in the same commit as the change (rule 7).

## Before every push: visual check (required)

A push to `main` is a release; a push to `new-site` is a preview he may look at on his phone. Before either, a real browser has to see the site at phone and laptop sizes. A committed hook (`scripts/guard-push.mjs`, wired in `.claude/settings.json`) blocks `git push` for a site-affecting commit until `.visual-check/passed` holds this commit's hash. Docs, `.claude/`, this script and `.gitignore` go through unguarded.

1. `npm run build` (runs `site/build.mjs` first so `lib/site/manifest.generated.ts` and `/public/site/` are in place; a bare `npx next build` fails), then start `npx next start -p 3100` in the background.
2. `git commit` (its own command).
3. With the Playwright MCP, open every page the change touches (if unsure, all four: `/`, `/production`, `/about`, `/press-kit`) at **phone 375 x 812** and **laptop 1512 x 827**:
   - the page loads with no error overlay and no console errors;
   - no sideways scroll: `document.body.scrollWidth <= innerWidth` (the body is the scroll container);
   - screenshot each to `.visual-check/<route>-<size>.png` and look at it for broken layout, overlapping text, missing pictures;
   - home at laptop size: the door and the home words all sit inside the first screen (bottoms within `innerHeight`); if the hero changed, also check 1280 x 720 and 1440 x 900;
   - if `/production` changed, click the home door and confirm the form opens there with its four fields. **Never submit the form** (it writes to the live database and emails Anthony).
4. If anything fails, fix it, commit again, redo the check.
5. When everything passes: `git rev-parse HEAD > .visual-check/passed`, stop the server, then `git push` (its own command): to `new-site`, and to `main` only as How a change reaches the site says.
6. End the reply with a short pass/fail line per route and size.

Where the pieces live: the MCP server in `claude mcp list` (local scope), the allow list in `.claude/settings.local.json`, the hook in `.claude/settings.json`, the guard in `scripts/guard-push.mjs`, the marker in `.visual-check/` (git-ignored). The visual check does not replace `scripts/site-check.mjs`; it is an extra pair of eyes on the live look.

## Search and link previews

Each document carries its own title, description, canonical address and Open Graph card (`/og-image.jpg`, made from the home screen; `/favicon.ico`, `/favicon.png`, `/apple-touch-icon.png`, `/icon-512.png` are the chalk mark). The descriptions in `PAGES` are put together from his own phrases. Home and About carry a small JSON-LD block (Person + WebSite). `/sitemap.xml` lists home, production, about and the press kit; the store, the order page and the two form landings are `noindex`. `/llms.txt` is generated from `content.mjs`.

Old addresses are redirected in `next.config.ts`, **permanently** (308) since 24 Nov 2026, when Anthony decided the earlier pages are gone for good: `/store` → `/products`, `/epk` → `/press-kit`, `/placements`, `/projects`, `/demoreel` → `/production`, `/performance`, `/practice` → `/`. The two old downloads (`/Anthony_Dake_One-Sheet.pdf`, `/Anthony_Dake_Resume.pdf`) go to the press kit with a temporary (307) redirect, in case a new one-sheet ever takes the name.

Vercel Web Analytics is loaded as a plain script (`/_vercel/insights/script.js`) on a deployment, never locally and never on the order page.

## The earlier site

Anthony's decision (24 Nov 2026): the earlier pages are removed from the site so they do not exist, and their pictures and downloads are saved for reference.

- **`archive/earlier-site/`** holds everything the old pages served from `public/` (cover art, live photos, review screenshots, portraits, the two PDFs, the old serif mark), under the same names. Nothing there is served, built or linked. `archive/README.md` says what is what. **Do not delete it without asking.**
- **The old pages themselves** (code, words, data) are in the repository's history; the tag `earlier-site` marks the last commit that had them.
- `public/` now holds only what the new site uses: `email/` (the receipt's images: never move or rename), the favicons, `og-image.jpg`, and `site/` (made by the build).
- The bookings list and its password login (`/admin/bookings`, `/api/bookings/*`) are gone, from this branch and from `main`.

## Still open, now that it is live

1. To sell for real (the live site shows no Products link and no Products page until all of this is done): a real product and its file; production `SQUARE_ACCESS_TOKEN` + `SQUARE_LOCATION_ID` with `SQUARE_ENVIRONMENT=production` in Vercel's Production environment (his to enter); a webhook subscription to `payment.updated` and `refund.updated` at `https://www.anthonydakemusic.com/api/square/webhook` and its key in `SQUARE_WEBHOOK_SIGNATURE_KEY`; the Resend domain verified and `BOOKING_NOTIFY_FROM` switched (done 24 Nov 2026); a sales-tax decision (quick-pay links charge the listed price with no tax line); the site off Vercel's free plan (done 24 Nov 2026: the team is on Pro). Then buy the cheapest product with a real card and refund it.
2. Vercel housekeeping he listed: two-factor sign-in, rotating the Neon database secrets together, reconnecting the Vercel connector.
3. Not proven yet: a real phone (the form with the keyboard up, About with Safari's toolbars), Download on a preview order, a real card with the webhook and a refund, a receipt to a buyer's own address, link previews, the receipt email's typefaces.

## Local environment (Anthony's Mac)

- **Active clone**: `~/anthonydakemusic-v3`. Always work there.
- Until 24 Nov 2026 Claude in Cowork pushed from its own sandbox through a git bundle in `~/Downloads` and a script run on this Mac. That route is retired; do not revive it.
- **Do not use**: `~/Documents/GitHub/anthonydakemusic-v3` (stale GitHub Desktop clone with a divergent history) or `~/anthonydakemusic` (the old v1 project, linked to the wrong Vercel project).
- Node, npm and `claude` come from **fnm**; they are on PATH in a normal Terminal login shell. Non-login contexts (`osascript do shell script`, cron) need `export PATH=$PATH:/opt/homebrew/bin` and will not see fnm shims.
- A second Vercel project, `anthonydakemusic-v3-mxrl`, also builds every push to this repo. It is a leftover; ask before removing it.

## History, briefly

- Before Nov 2026: the drummer-and-producer site ("Calm" design, Gill Sans). It was `main` and live until 24 Nov 2026; the tag `earlier-site` keeps it.
- 23 Nov 2026: the Square store built and proven in sandbox on branch `square-store`.
- Nov 2026: the new design made as a one-file prototype over some fifty rounds with Anthony (the drawing from his drum part, the flight, the belt, the booking form, About).
- 24 Nov 2026: the prototype became the site (`new-site`): one source tree for the prototype and the real pages, desktop and tablet layouts, Products and the order page in the new design, the booking form wired to `/api/book`, the browser checks.
- 24 Nov 2026, later: the bookings list and its login removed from `main` (commit `5510c8f`, live) because the login check did not protect the list, and from `new-site`. On `new-site`, from Anthony's notes on the first preview: his bio on About, the texts further out and leaning against the mouse, Production on one laptop screen, covers as links to YouTube with a plain cursor, Sparkles and Forever added, the mark as the home button, the earlier pages' files moved to `archive/`, old addresses redirected for good.
- 24 Nov 2026, evening: **live.** Anthony: "looks great. push it and go live." `new-site` was merged into `main` as one merge commit whose files are exactly the branch's.
- 24 Nov 2026, late: his covers for Sparkles and Forever and a larger Get Down on the belt (no empty frames left); his bio moved from About to the press kit, so About is one screen again at every size.
- 24 Nov 2026, late: Anthony moved the Vercel team to Pro ($20 a month), so the site may now be used commercially.
- 24 Nov 2026, night: at Anthony's word, `anthonydakemusic.com` verified at Resend (three records added at Cloudflare, nothing else touched there), `BOOKING_NOTIFY_FROM` set to `noreply@anthonydakemusic.com` in every Vercel environment, production redeployed. One labelled test through the live form arrived in his inbox from `noreply@anthonydakemusic.com`.
- 24 Nov 2026, night: the push guard and the visual check came in from Claude Code on his Mac (commits `1d7f196`, `703d17f`, `bb201d6`). Then Anthony settled how changes are made ("i agree. do it."): Claude Code is the only builder, `new-site` is the preview and `main` is live, two speeds, and this file is the source of truth for every decision (How a change reaches the site; rules 1 and 7).

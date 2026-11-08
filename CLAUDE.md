# CLAUDE.md — anthonydakemusic-v3

## Project Overview

Personal website for Anthony Dake — drummer and producer based in Columbus, OH. The site sells exactly two offers: **Drummer** (live shows, tours, fly dates, session drums remote or in-room) and **Producer** (drum programming and production for records). Built with Next.js 16 (App Router, Turbopack) + Tailwind CSS v4, deployed on Vercel (auto-deploy on push to `main`).

**Production**: https://www.anthonydakemusic.com
**Repo**: https://github.com/anthonydake/anthonydakemusic-v3
**Hosting**: Vercel project `anthonydakemusic-v3` (auto-deploy on push to main)

## Architecture

Next.js App Router. Every public route uses the `page.tsx` (server, exports `metadata`) + `page.client.tsx` (`"use client"`) split. No server components render UI — all UI lives in the client files.

### Pages (routes under `app/`)

- `/` — Home. Three stacked sections (`hero → services → proof`) rendered by `HomeClient.tsx` as a normal scrolling page. The Proof section is a **Full productions** rows list of six songs Anthony produced start to finish (`<ProductionRows items={PRODUCTIONS} />`, data in `data/productions.data.ts`) — tap a row to expand a YouTube player inline. Inline header lives here, not `SiteHeader`. Hero is an **evidence hero**: the ComFest stage photo (`/photos/epk-comfest-2024.jpg`, `priority`, `aspect-[4/5] object-cover object-[center_20%]`, full-bleed on mobile / `md:rounded-2xl` left column on desktop), `Anthony Dake` in `.font-display grad` (Gill Sans Light / Cabin fallback), the uppercase moniker `Architect of Sound` (`#9A9A9A` 12/13 px `tracking-[0.32em]`, sentence case in source), the role label `Producer / Drummer` (22/26 px `font-semibold` `#F2F2F2` — the line Anthony's business partner needed to see at a glance), a solid-white description ("Drummer and producer for live shows, sessions, and records. Columbus, OH." in `#F2F2F2` 17/18 px `max-w-[34ch]`), an invitation line ("Let's build your next record or show." in `#9A9A9A` 15 px), then **two** labelled `.epk-cta` pills side by side: `Book production →` (presets `Production / drum programming`) + `Book drums →` (presets `Live show / tour date`), stacked on mobile and inline on `sm+`. Then `<HeroTexts />` — four client-text bubbles rendered **inside the right-hand text column** (horizontal snap-scroll on mobile, 2×2 grid on desktop so the whole hero fits in exactly one viewport). On desktop the hero `<section>` is `md:min-h-[calc(100svh-3.5rem)]` with `md:flex md:flex-col md:justify-center`, so its bottom edge aligns with the bottom of the first screen and the `(scroll)` hint is pinned to that edge in bright `#F2F2F2` 12 px — the one allowed exception to the Calm-pass no-motion rule. The numbers headline (`400+ shows. 50+ records.`) is no longer in the hero; the counts now live on the offer-card titles below. Listen was removed from the home page in an earlier pass; audio clips still live on `/epk`. `/portrait.jpg` is no longer referenced anywhere (kept on disk).
- `/about` — Bio/story: church drummer → DCI/WGI → conservatory → rebuild. The current headshot (`/portrait-about.jpg`, `rounded-2xl`, caption `Columbus, OH`) renders at the top; the childhood first-kit photo (`/anthony-dake-drums.jpg`, `rounded-2xl`, caption `First kit · Topeka, KS`) is lazy-loaded inline inside the story, immediately after the "I grew up in Topeka, Kansas" paragraph. Three live-performance photos (`/photos/about-blue-knights-2018.jpg`, `.../about-duality-2022.jpg`, `.../about-main-street-2022.jpg`) are lazy-loaded inline at later beats in the story (after the "Blue Knights in 2018", "day one", and "The receipts:" paragraphs respectively) using the same `my-8 … rounded-2xl` figure pattern. Testimonials component mounted below the article (renders nothing until `data/testimonials.data.ts` is populated).
- `/epk` — Press kit. `One-sheet (PDF) →` pill points at `/Anthony_Dake_One-Sheet.pdf` (`download` + `target="_blank"`). YouTube demo reel (no autoplay), then a three-up row of live performance photos (`EPK_PHOTOS` module-level const — ComFest, Whitehall Food Truck Festival, hybrid rig) rendered as a `grid grid-cols-3` of `aspect-[4/5] rounded-2xl` tiles with `#5C5C5C` captions, `Listen` heading + `<AudioShowcase />`, `Contact` heading + email + `Columbus, OH · fly dates nationwide` + `785.608.2604` as a `tel:` link. No social icons — those live in the site-wide footer line. `Anthony_Dake_Resume.pdf` is kept on disk but no longer linked from anywhere.
- `/placements` — Record credits index. Starts with a **Full productions** section (`<ProductionRows items={PRODUCTIONS} />` from `data/productions.data.ts`), then a `Drums & drum programming` heading over the existing year-grouped list from `data/projects.data.ts`. The four entries whose `youtubeUrl` matches a `PRODUCTIONS` `youtubeId` (Aura, Pray For Me, Back & Forth, Repercussions) are filtered out of the drum list so nothing is listed twice — `data/projects.data.ts` itself is untouched. `Selected · N of ~total` counts the union.
- `/performance` — Live performance credits index. Data from `data/performance.data.ts`.
- `/practice` — "Open Practice Room". Reverse-chronological practice log with per-day groups, search, and optional video clips. Data from `data/practice.data.ts`. **Not linked from the header any more** (removed from nav in Batch 2); the only entry point is the `Practice journal →` link at the bottom of `/about`. The page itself remains live at `/practice`.
- `/admin/bookings` — Password-gated admin page listing booking inquiries from the `bookings` table (newest first, with `mailto:` reply links). Replaces the old `/admin/archive` email list.
- `/admin/archive` — Redirect to `/admin/bookings` (kept so old bookmarks still work).
- `/not-found.tsx` — Custom 404 (uses `SiteHeader`).
- `/robots.txt`, `/sitemap.xml` — generated by `app/robots.ts` and `app/sitemap.ts`.

### API routes (`app/api/`)

- `POST /api/book` — Booking form submission. Writes to Neon Postgres `bookings` table only (the `archive_emails` write was dropped — see Booking System). Origin check, honeypot, ISO-date validation, fire-and-forget Resend notification.
- `POST /api/bookings/auth` — Password check for the admin page. Sets `archive_admin` httpOnly cookie (10 min). Env var `ARCHIVE_ADMIN_PASSWORD` (kept under its original name so nothing in Vercel has to change).
- `GET /api/bookings/list` — Returns booking rows (`id, name, email, event_type, event_date, message, created_at`) ordered newest first. Requires the auth cookie.

### Key Components (`app/components/`)

- `HomeClient.tsx` — The stacked sections of the home page (hero → services → reel → proof → closing ask): **hero** (ComFest stage photo + `<LogoArchitectOfSound />` which now carries `Anthony Dake` + the `Architect of Sound` moniker + a `Producer / Drummer` role label + a stronger `#F2F2F2` description + a `#9A9A9A` invitation + **two** labelled `.epk-cta` pills side by side — `Book production →` presets `Production / drum programming`, `Book drums →` presets `Live show / tour date` (both via `openBooking(preset)` from `lib/booking.ts`, no `onOpenBooking` prop any more) — + `<HeroTexts />` all stacked inside the right-hand text block; mobile = full-bleed photo with a `.hero-fade` gradient over its bottom 45 %, desktop = the section is a flex column pinned to the first viewport (`md:flex md:min-h-[calc(100svh-3.5rem)] md:flex-col md:justify-center md:pb-12`) wrapping a two-column `minmax(0,5fr)_minmax(0,7fr)` grid (`md:max-w-[1200px] md:gap-12 md:py-10 short:py-4`), with a bright `(scroll)` hint pinned at `bottom-4` of the section on desktop only), **services** (heading `What I do` + a `md:grid-cols-2` row of two offer cards from `OFFER_CARDS` — each card's title row is `flex items-baseline justify-between gap-4` with the title on the left and the count on the right in `#9A9A9A` 15 px `tabular-nums` (Drummer `{Math.floor(STATS.performances / 10) * 10}+ shows`, Producer `{Math.floor(STATS.placements / 10) * 10}+ records`). Drummer photo `/photos/epk-whitehall-2025.jpg` at `center 35%` → `openBooking("Live show / tour date")`; Producer photo `/photos/epk-hybrid-rig-2025.jpg` at `top` → `openBooking("Production / drum programming")`), **reel** (renders `<HomeReel />` — see below), **proof** (heading `Full productions` + `#5C5C5C` 12 px caption `Songs I produced start to finish. Tap to play.` + `<ProductionRows items={PRODUCTIONS} />` reading from `data/productions.data.ts`; three cross-links follow at `mt-10` — no stages/orgs line, no derived artist line), **closing ask** (`Got a date? Tell me about it.` headline + `#9A9A9A` descriptor + **two** labelled `.epk-cta` pills side by side — same `Book production →` / `Book drums →` pair as the hero, wired directly via `openBooking(preset)`). Normal scrolling, no fades.
- `ProductionRows.tsx` — `"use client"` list of full productions used on both the home Proof section and the top of `/placements`. Props: `items: Production[]`. Renders a `<ul>` of `border-t border-white/[0.08] last:border-b` rows; each row is a progressive-enhancement `<a href="https://www.youtube.com/watch?v=…" target="_blank" rel="noopener">` (works without JS) that `preventDefault()`s and toggles the row open with JS. Layout per row: `h-14 w-14 sm:h-16 sm:w-16` rounded cover (`next/image` 600×600, `sizes="64px"`, `loading="lazy"`), title (`#F2F2F2` 15/16 px) + `artist · year` (`#9A9A9A` 13 px), duration (`#5C5C5C` 12 px tabular-nums), and a 36 px circle (`border-white/[0.16]`, hover/focus `white/40`) with a white play triangle that flips to a × when open. Only **one** row open at a time — opening another closes the previous, which unmounts its iframe and stops audio. The open panel is an `aspect-video rounded-xl bg-black` box with a `youtube-nocookie.com/embed/<id>?autoplay=1&playsinline=1&rel=0&modestbranding=1` iframe. Also emits a single `ItemList` of `MusicRecording` JSON-LD (`producer: Anthony Dake`). No height animation (Calm rules).
- `HomeReel.tsx` — `"use client"` click-to-load YouTube facade on the home page. Server HTML is an anchor (`https://www.youtube.com/watch?v=gwNaFJyhTXo`) wrapping the `maxresdefault.jpg` thumbnail in an `aspect-video rounded-2xl` box with a centered 64 px white play button (hover `#E6E6E6`, no other motion). `onClick` → `preventDefault()` + swap in the autoplay iframe. Caption underneath: `Demo reel · live and studio`. Works without JS (falls back to opening YouTube in a new tab).
- `HeroTexts.tsx` — Static (server) component rendered as the last child of the hero text block (directly under the two labelled Book pills). Reads `HERO_TESTIMONIALS` from `data/testimonials.data.ts` and renders the four bubbles as an `<ul aria-label="What people say">`. Mobile: escapes the parent `px-6` padding with `-mx-6 px-6` so the strip is still full-bleed — `snap-x snap-mandatory overflow-x-auto` with bubbles at `w-[72vw] max-w-[300px]` and `[scroll-padding-left:1.5rem]`, so one bubble sits on the page margin and the next peeks in. Desktop (`md+`): a 2×2 grid sized to the text column — `md:w-full md:max-w-[500px] md:grid md:grid-cols-2 md:gap-x-5 md:gap-y-4`, with a `short:max-w-[440px] short:mt-5` tightening for 13"-class laptops (`min-width:48rem` and `max-height:860px`). Bubbles top-aligned (the live-show bubble is tallest; row 1 = the two short ones, row 2 = tall + one-liner). Each bubble is `next/image` at its native `width`/`height` with `loading="lazy"`, `sizes="(max-width: 768px) 72vw, 260px"`, and an 11 px `#5C5C5C` caption below.
- `AudioShowcase.tsx` — Credits-style vertical list on `/epk`. Each row is a 36 px circular play/pause icon + `title · artist` in sentence case + `0:MM` duration, separated by hairline `border-white/[0.08]` top/bottom rules. A 1 px `#F2F2F2` progress hairline sits on the row's bottom edge and grows from 0 → 100 % while that row plays; no ring, no gradient, no glow. One `<audio preload="none">` per clip; only one plays at a time; unmount pauses everything; respects `prefers-reduced-motion`. Renders `null` while `AUDIO_CLIPS` is empty.
- `BookingModal.tsx` — Booking inquiry dialog. Focus trap, Esc-to-close, honeypot, body-scroll lock, auto-close on success. Sentence-case labels, one primary pill (`Send inquiry →`), no glow.
- `FooterLine.tsx` — Site-wide single-row footer mounted on every page: `Columbus, OH · Email · YouTube · TikTok · Press kit`. `#5C5C5C` 12 px, hairline `border-t`, `py-10`. This is where the social links live now (they were removed from the hero and `/epk`).
- `SiteHeader.tsx` — Shared header for every subpage. Symmetric 3-column grid (Placements/Performance · HomeMark · About + Book CTA). Uppercase nav at `tracking-[0.18em]` — the one allowed uppercase surface outside of year headers. Mobile hamburger overlay. Owns its own `BookingModal` state and listens for the `open-booking` event.
- `HomeMark.tsx` — Inline SVG of the AD serif monogram (Source Serif 4 outlines, solid `#E5EEFF` fill; the standalone `public/mark.svg` adds a thin `#3B82F6` ring, dropped here because the header pill already draws a ring). Rendered at 25×14 inside the 44px pill. The source SVGs live in `public/mark.svg` (with ring), `public/letters.svg` (no ring, same one inlined here), `public/mark-white.svg` (monochrome fallback).
- `LogoArchitectOfSound.tsx` — Identity lockup for the home hero: the `Anthony Dake` h1 (Title case, `font-display` — Gill Sans Light where the visitor has it, Cabin 400 otherwise; carries the page's single `.grad` gradient — every other instance of the gradient on a page is a deliberate violation) + the `Architect of Sound` moniker directly below as a `#9A9A9A` 12/13 px line with `tracking-[0.32em]` and CSS `uppercase` (source stays sentence case). The h1 sizes are `text-[46px] sm:text-[60px] md:text-[64px] short:text-[54px]`. Everything after the moniker (roles, description, invitation, pills, `<HeroTexts />`) lives in `HomeClient.tsx`. The hero photo is rendered by `HomeClient.tsx` directly above this component (no `showPortrait` prop any more).
- `JsonLd.tsx` — `<script type="application/ld+json">` helper.
- `TransitionProvider.tsx` — Thin wrapper preserving the `useTransition()` API shape (`triggerTransition`, `isTransitioning`, `prefersReducedMotion`, `isMobileFallback`) so pre-existing callers compile. `triggerTransition` is now just `router.push`; the curtain overlay and the page fade were both removed. Pages render fully visible on first paint — nothing is gated on JS.
- `Testimonials.tsx` — Renders real client texts as cleaned iMessage bubble screenshots on About. Each entry is a transparent PNG from `/public/reviews/` rendered via `next/image` (its native width/height, capped at `max-w-[380px]`, centered, `select-none`) with a `#5C5C5C` sentence-case caption line below it. Reads the `testimonials` export from `data/testimonials.data.ts` (the three About entries); the home hero reads the separate `HERO_TESTIMONIALS` array via `<HeroTexts />` instead. The full quote text is in the image `alt`. Renders `null` while `testimonials` is empty.

There is **a site-wide footer line** again (`<FooterLine />`), reintroduced in the Calm pass. `TextScramble`, `CurtainOverlay`, `ColumbusTime`, `SiteFooter`, `FloatingCards`, `CustomCursor`, `LenisProvider`, `ArchiveModal`, `ScribbleLink`, `ScrambleText` are all gone.

### Data Files

- `data/credits.data.ts` — Two plain string arrays consumed by the Drummer offer card in `HomeClient.tsx`: `STAGE_ARTISTS` (13 names of artists Anthony has shared the stage with) and `ORGANIZATIONS` (10 corps / ensembles / venues / producers he's performed with). Array order is display order; edit here and the home card updates.
- `data/projects.data.ts` — Lightweight placements index (title/artist pairs) used by the `/placements` route. The home Proof section no longer reads it; the drum-list section of `/placements` filters out entries whose `youtubeUrl` matches a `PRODUCTIONS` `youtubeId` so nothing is listed twice.
- `data/productions.data.ts` — `Production` type + `PRODUCTIONS` array: six songs Anthony produced start to finish, each with `title`, `artist`, `year`, `youtubeId`, `cover` (square 600×600 JPEG in `public/covers/`), and `duration`. Order in the array = display order on home and on `/placements` (`Cycles → Aura → Pray For Me → Back & Forth → Repercussions → Missin U`). Consumed by `<ProductionRows />`.
- `data/performance.data.ts` — Live performance credits list.
- `data/practice.data.ts` — Practice log entries + exported `practiceEntries`, `totalSessions`, `firstSessionDate`. Current log goes through Session #7 (2026-05-18).
- `data/testimonials.data.ts` — Two exports: `HERO_TESTIMONIALS` (the four bubbles rendered in the home hero text column by `<HeroTexts />`, ordered for the desktop 2×2 — row 1: `review-3.png` track quote + `review-2.png` beat quote; row 2: `review-7.png` live-show quote + `review-8.png` "Broooooo. This is fireeeeeeeee") and `testimonials` (array shown on About by `<Testimonials />` — currently three entries that don't repeat the hero set: `review-4.png` production quote, `review-1.png` mix quote, `review-5.png` ideas quote). Each entry is a real client text screenshot in `/public/reviews/` with the full quote verbatim in `alt` and a short attribution in `caption`. The two exports are intentionally separate; no shared index; nothing repeats between the two surfaces.
- `data/stats.ts` — `STATS.performances` and `STATS.placements` — approximate career totals displayed in the hero proof strip and the `Selected · N of ~total` subheader on `/placements` and `/performance`. Edit here and both the hero and index pages update together.
- `lib/booking.ts` — `openBooking()` helper that dispatches a `window` `CustomEvent('open-booking')`. Both headers listen for it, so any component can trigger the booking modal without lifting state. See Gotcha #6.
- `lib/projects.ts` — Project type definitions + re-export of `projects` from the generated file.
- `lib/projects.generated.ts` — Generated at build time by `scripts/generate-projects.mjs` from `content/projects.json`. Do NOT edit by hand; the `predev` / `prebuild` npm scripts regenerate it.

## Home Page Anatomy

`app/page.client.tsx` is a thin wrapper that owns the inline header + `BookingModal` state. The stacked sections live in `HomeClient.tsx` (final order: hero → services → reel → proof → closing ask → `FooterLine`):

1. **hero** (`data-id="hero"`) — Evidence hero. On desktop the section itself is a flex column pinned to exactly the first viewport: `relative -mt-14 bg-black md:mt-0 md:flex md:min-h-[calc(100svh-3.5rem)] md:flex-col md:justify-center md:pb-12`. The `3.5rem` matches the fixed header height (`h-14`) and the `pt-14` on `#main-content`; the content is vertically centred by `md:justify-center`, and because the section is ≥ one screen tall, an absolutely-positioned child at `bottom-4` lands on the bottom edge of the viewport. It contains two children: (a) a grid wrapper `md:mx-auto md:grid md:w-full md:max-w-[1200px] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-12 md:px-8 md:py-10 short:py-4 tiny:py-2` with the photo column + the text block column; (b) a `(scroll)` hint absolutely positioned at `bottom-4`, desktop-only (`hidden md:flex`, `animate-scrollFlash`), rendered as `<span className="text-[12px] uppercase tracking-[0.28em] text-[#F2F2F2]">(scroll)</span>` so the flash reads as a deliberate white pulse (`0%,100% {opacity:.2} 50% {opacity:1}`, 2.4 s), with the `prefers-reduced-motion` fallback holding it at `opacity:.6`. On mobile the section is `-mt-14` so the ComFest stage photo (`/photos/epk-comfest-2024.jpg`, `next/image`, `priority`, `aspect-[4/5] w-full object-cover object-[center_20%]`) starts at y = 0 behind the translucent fixed header; the `.hero-fade` div is pinned to the bottom 45 % of the photo and fades it to black; the text block that follows uses `relative -mt-28 px-6 text-center` to sit over that fade. On desktop (`md+`) the inner wrapper is the two-column grid — photo left (`md:rounded-2xl`, no fade), text block centered in the right column. **Text block**, top to bottom: `<LogoArchitectOfSound />` (contains the `Anthony Dake` h1 — the single page `.grad`, `md:text-[64px] short:text-[54px] tiny:text-[48px]` — and the `Architect of Sound` moniker in `#9A9A9A` 12/13 px `tracking-[0.32em]` uppercase), then the role label `Producer / Drummer` (22/26 px `font-semibold leading-[1.2] text-[#F2F2F2]`, `mt-3`), then the description (`#F2F2F2`, 17/18 px `leading-[1.5]`, `mx-auto mt-3 max-w-[34ch] short:max-w-[40ch]`): *"Drummer and producer for live shows, sessions, and records. Columbus, OH."* (promoted from meta `#9A9A9A` to primary white so it registers at a glance), then the invitation line (`#9A9A9A`, 15 px, `mt-6 short:mt-4`): *"Let's build your next record or show."*, then the actions row (`mt-3 flex flex-col items-center gap-3 sm:flex-row sm:justify-center`) holding **two** `.epk-cta min-w-[220px]` pills in the same order as the role label: `Book production →` → `openBooking("Production / drum programming")` first, `Book drums →` → `openBooking("Live show / tour date")` second. Both pills are wired directly through `openBooking(preset)` from `lib/booking.ts`; `HomeClient` no longer takes an `onOpenBooking` prop. Listen used to sit next to the pill — it was removed; audio still lives on `/epk` via `<AudioShowcase />`. Then `<HeroTexts />` (mobile: full-bleed snap strip that escapes the `px-6` with `-mx-6`; desktop: 2×2 grid capped at `md:max-w-[500px]` inside the column, `short:max-w-[440px] short:mt-5 tiny:max-w-[420px] tiny:mt-4` on shorter viewports). **Fit rules (desktop) — change in one pass or the hint falls off the fold:** keep the `md:min-h-[calc(100svh-3.5rem)]` + `md:flex md:flex-col md:justify-center` on the section (it is what places `(scroll)` at the screen edge, not the hero edge); keep the grid wrapper on `md:py-10` + `short:py-4` + `tiny:py-2` (the text column got taller when the moniker, role label, invitation and second pill came in, so the `short:` tightening went from `py-6` → `py-4` and a new `tiny:` tightening drops it again on ~700 px-tall viewports); do not widen `md:max-w-[500px]` on `HeroTexts` for `md+`; and keep the `short`/`tiny` tightening on the description (`short:max-w-[40ch]`), the h1 (`short:text-[54px] tiny:text-[48px]`), the invitation line (`short:mt-4`), and `HeroTexts` (`short:mt-5 short:max-w-[440px] tiny:mt-4 tiny:max-w-[420px]`). The variants are defined in `app/globals.css` — `@custom-variant short (@media (min-width: 48rem) and (max-height: 860px))` catches 13"-class laptops, and `@custom-variant tiny (@media (min-width: 48rem) and (max-height: 760px))` catches ~700 px-tall viewports (1280×720, 1280×800, 1536×864 at 125 %); `tiny` is declared **after** `short` so its utilities sort later and win where both apply — if you ever add a third tier, keep it defined in increasing-specificity order. Mobile layout is independent of all of this (both variants gate on `min-width: 48rem`).
2. **services** (`data-id="services"`, `max-w-[960px]`, `py-16 sm:py-24`) — Heading `What I do` + a `grid gap-10 md:grid-cols-2 md:gap-8` of two offer cards from the `OFFER_CARDS` module-level array. Each card is a plain `<article>` (no border/background): `next/image` at `aspect-[4/3] w-full rounded-2xl object-cover`, `loading="lazy"`, `sizes="(max-width: 768px) 100vw, 460px"`, with a per-card `object-position` so faces are not cropped — Drummer uses `/photos/epk-whitehall-2025.jpg` at `center 35%`, Producer uses `/photos/epk-hybrid-rig-2025.jpg` at `top` (an earlier `center 30%` cropped his head off). Below the photo, a title row rendered as `mt-5 flex items-baseline justify-between gap-4`: the `h3` title on the left (20 px, `#F2F2F2`) and a `count` on the right in `#9A9A9A` 15 px `tabular-nums` — Drummer renders `${Math.floor(STATS.performances / 10) * 10}+ shows`, Producer renders `${Math.floor(STATS.placements / 10) * 10}+ records` (this is where the hero's old numbers headline moved to). Then one of two generically-rendered body shapes, then a text-link button in `#F2F2F2` (hover `#9A9A9A`) that calls `openBooking(preset)` from `lib/booking.ts` — `Book a date →` presets `Live show / tour date`; `Send a brief →` presets `Production / drum programming`. Card data shape is `OfferCard` (local to the file): shared fields `id, title, count, photo, alt, objectPosition, linkLabel, preset`, plus optional `lead, artists[], orgsLead, orgs[], close` (Drummer) and optional `copy, scrollLink, copyAfter` (Producer). The Drummer card reads as a résumé's best line: `lead` ("I've had the honor of opening for En Vogue, playing the main stages at Columbus Pride and ComFest, and sharing the stage with", `#9A9A9A` 15 px `leading-[1.6]`), `artists[]` from `data/credits.data.ts` → `STAGE_ARTISTS` (`#F2F2F2` 15 px `leading-[1.75]`, rendered by the local `NameList` helper with each name in a `whitespace-nowrap` `<span>` and separators `<span aria-hidden className="text-[#5C5C5C]"> · </span>`), `orgsLead` ("and performing with"), `orgs[]` from `ORGANIZATIONS` (same NameList style), then `close` ("Tours, fly dates, and sessions — remote or in your room."). The Producer card uses `copy` ("Whole songs start to finish, or just the drums. ") + a scroll link `scrollLink` ("Hear the released records below", styled `text-[#F2F2F2] underline-offset-4 hover:underline`) that calls the local `scrollToProof()` — `proofRef.current.scrollIntoView` with `behavior: "smooth"` unless `prefers-reduced-motion` — + `copyAfter` (" — I work remote and deliver release-ready stems."). There is no section-level `Send a brief →` link any more; the CTAs live on the cards. The two name arrays live in `data/credits.data.ts` so they're easy to edit later.
3. **reel** (no `data-id`) — Rendered by `<HomeReel />` (`app/components/HomeReel.tsx`, `"use client"`). Section `mx-auto max-w-[960px] px-6 pb-16 sm:pb-24`, heading `Watch`. Click-to-load YouTube facade: default state is a plain `<a href="https://www.youtube.com/watch?v=gwNaFJyhTXo" target="_blank" rel="noopener">` wrapping `<img src="https://i.ytimg.com/vi/gwNaFJyhTXo/maxresdefault.jpg" alt="Anthony Dake — demo reel" loading="lazy">` in an `aspect-video w-full overflow-hidden rounded-2xl bg-black` box, with a centered 64 px `#F2F2F2` circle + black play triangle (hover `bg-[#E6E6E6]`, no other motion). `onClick` → `preventDefault()` + swap in `<iframe src="https://www.youtube.com/embed/gwNaFJyhTXo?autoplay=1&playsinline=1&rel=0&modestbranding=1">` (title `Anthony Dake — demo reel`, standard `allow` list including `autoplay`, `allowFullScreen`). Caption underneath: `<p className="mt-3 text-[12px] text-[#5C5C5C]">Demo reel · live and studio</p>`. The server HTML still has the thumbnail + play button as an anchor, so visitors without JS get a working link to the YouTube watch page — nothing gated on JS.
4. **proof** (`id="proof"`, `data-id="proof"`, `max-w-[640px]`) — Heading `Full productions` (15 px `#F2F2F2`) + a `#5C5C5C` 12 px caption `Songs I produced start to finish. Tap to play.`, then `<ProductionRows items={PRODUCTIONS} />` (see Key Components) at `mt-5`. Three text links at `mt-10`: `Placements →   Performance →   Press kit →`. The stages/orgs line that used to sit above these links (`Columbus Pride · ComFest · Short North Stage · …`) was removed when the Drummer offer card absorbed that content — don't re-add it. The section also carries the plain `id="proof"` anchor so the Producer offer card's "Hear the released records below" link can `scrollIntoView` here. No testimonial is inlined (the four bubbles live in the hero strip). The old auto-built artist line derived from `data/projects.data.ts` is gone.
5. **closing ask** (no `data-id`) — `<section className="mx-auto max-w-[640px] border-t border-white/[0.08] px-6 py-20 text-center sm:py-28">` with headline `Got a date? Tell me about it.` (26/30 px `#F2F2F2`), a `#9A9A9A` descriptor (`Live shows, sessions, and records. Columbus, OH, and fly dates nationwide.`), and the same **two** labelled `.epk-cta min-w-[220px]` pills as the hero — `Book production →` (presets `Production / drum programming`) and `Book drums →` (presets `Live show / tour date`), stacked on mobile and inline on `sm+` inside an `mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center` wrapper. Repeats the offer so visitors who scroll past the hero still see what's being booked, with the same presets wired straight through `openBooking(preset)` — no `onOpenBooking` prop.

Then `<FooterLine />` (site-wide).

Routing: `HomeClient` accepts `initialSection?: "hero" | "services" | "proof"` and `scrollIntoView`s the matching ref on mount. The section-id union is a **closed type** (Gotcha #8) — adding a value means updating the union and the refs in one pass. The reel and closing-ask sections intentionally have no `data-id` and are not scroll targets.

No fades: every section renders fully visible in the server HTML on first paint. There is no `IntersectionObserver`, no `visible` state, no `opacity-0` default, and nothing is gated on hydration. Content must never depend on JS to appear — the reel degrades to a plain link to the YouTube watch page without JS.

## Booking System

- UI: `BookingModal.tsx` opened from the Book → button in `SiteHeader.tsx` (subpages, no preset), `app/page.client.tsx` (home-page inline header, no preset), the hero's two labelled pills in `HomeClient.tsx` (`Book production →` presets `Production / drum programming`; `Book drums →` presets `Live show / tour date`; both via `openBooking(preset)` from `lib/booking.ts`), the closing-ask's two labelled pills (same pair, same presets, same wiring), the two offer cards in `HomeClient.tsx` (also via `openBooking(preset)`), and anywhere else via the `open-booking` `window` event (`openBooking(eventType?)` from `lib/booking.ts`, dispatched with `detail: { eventType }`). `HomeClient` no longer accepts an `onOpenBooking` prop — every CTA inside the home page dispatches the event directly. Both headers listen for the event, read `detail?.eventType` into a `bookingPreset` state, and pass it to `<BookingModal initialEventType={bookingPreset} />`. The modal state is **duplicated** in both headers; see Gotcha 7.
- Fields: `name` (required), `email` (required, regex-validated), `eventDate` (optional, `type="date"`, `min={todayIso}`, ISO-validated on the server), `eventType` (required, select), `message` (optional). Hidden honeypot `website` field.
- Event type options (`EVENT_TYPES` in `BookingModal.tsx`): `Live show / tour date`, `Session drums (remote)`, `Session drums (in person)`, `Production / drum programming`, `Church / worship`, `Corporate event`, `Other`. The server does **not** whitelist values — it stores whatever non-empty string is sent, so the list can evolve without a schema change.
- Endpoint: `POST /api/book`.
  - Origin check: rejects POSTs whose `Origin` host does not match `NEXT_PUBLIC_SITE_URL`.
  - Honeypot: if `body.website` is non-empty, the route returns `{ ok: true }` without writing — bots think it worked, no retry.
  - Validation: trims strings, lowercases email, validates email regex, validates date as `YYYY-MM-DD`.
  - Storage: `bookings` table (Neon Postgres via `@vercel/postgres`). Idempotent `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE … ADD COLUMN IF NOT EXISTS` on every request (schema evolves without migrations). The `archive_emails` write was dropped in Batch 2 (the table still exists in the DB — do not drop it manually; no code writes to or reads from it any more).
  - Notification: fire-and-forget Resend POST (`notifyBooking`). Never blocks the response. Falls back to `console.warn` when `RESEND_API_KEY` is missing.
- DB provider: **Neon Postgres** provisioned through the Vercel Neon marketplace integration. Uses `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` etc. injected by Vercel.
- Env vars used:
  - `POSTGRES_URL` (+ friends) — Neon connection, auto-provisioned.
  - `NEXT_PUBLIC_SITE_URL` — origin-check target.
  - `BOOKING_NOTIFY_EMAIL` — recipient of notification (default `adakemusic@gmail.com`).
  - `BOOKING_NOTIFY_FROM` — notification From address (default `noreply@anthonydakemusic.com`).
  - `RESEND_API_KEY` — injected automatically by the **Resend native integration** from the Vercel Marketplace (resource `resend-email-apricot-harbor`, Free plan, Production + Preview, marked Sensitive). Never set it by hand; manage it from Vercel → Integrations → Resend.
  - `RESEND_EMAIL_DOMAIN` — also injected by the integration (`anthonydakemusic.com`). The domain is **not verified yet**: DNS for anthonydakemusic.com is on Cloudflare, and the DKIM TXT + `rsend`/`send` CNAMEs listed at resend.com/domains still need to be added there.
  - `BOOKING_NOTIFY_FROM` — currently `onboarding@resend.dev` (Resend's test sender, set 2026-11-03). It only delivers to the Resend account owner (adakemusic@gmail.com), which is fine for notifications. Switch to `noreply@anthonydakemusic.com` once the domain is verified.
  - `ARCHIVE_ADMIN_PASSWORD` — for `/admin/bookings` auth. Keeps the original name so nothing in Vercel has to change; feel free to rename later if the name bugs you.
- Verified 2026-11-03: a test POST to `/api/book` produced a "Delivered" email in the Resend log (subject `New booking inquiry — <type> (<name>)`). Resend's email log at resend.com/emails is the first place to look if notifications stop.

## Media assets (Vercel Blob)

The site streams media straight from Vercel Blob (public store). The existing practice clips live under `practice/2026-05-12/` on a blob store named `practice-videos`. The newer `hero/` and `audio/` paths are the convention for the home-page reel and `AudioShowcase` clips.

### Photos (local to the repo)

Live performance photos ship in `public/photos/` as web-sized JPEGs — do not upscale, do not add borders / shadows / filters / hover effects. EPK uses `epk-*.jpg` (1200×1500 portraits) in the three-up row; About uses `about-*.jpg` (mixed 1600×1067, 1439×809, 1200×1774) inline at specific story beats. Captions sit in `#5C5C5C` 12 px sentence case under each figure — same visual language as the two existing About figures (`portrait-about.jpg`, `anthony-dake-drums.jpg`).

### Hero reel — parked

The home hero is intentionally still after the Calm pass (a reel on top of busy text made the page feel busy). Only re-introduce behind a feature flag with clean, truly ambient footage at `opacity-20` or lower; otherwise it will fight the name block. Upload CLI still works:

```bash
npx vercel env pull .env.local           # once, to get BLOB_READ_WRITE_TOKEN
npm run upload-media -- ./media/reel.mp4 hero/reel.mp4
```

### To add a clip

```bash
npm run upload-media -- ./media/new-track.mp3 audio/new-track.mp3
```

The script prints the public URL; paste a new entry into `AUDIO_CLIPS` in `app/components/AudioShowcase.tsx`:

```ts
{ id: "new-track", title: "New track", artist: "Artist name", duration: "0:27", src: "https://…/audio/new-track.mp3" },
```

Omit `artist` when the clip is Anthony's own (unreleased beat, instrumental). Recommended specs: MP3 ~160 kbps, 17–30s, −14 LUFS / −1 dBTP, clean fade-in/fade-out (no tail noise).

### To add a testimonial

Drop a cleaned bubble PNG into `public/reviews/` (transparent background, 1× capture — never upscale past its pixel width), then add an entry to `data/testimonials.data.ts` with the image path, native `width`/`height`, the full quote text in `alt`, and a short attribution in `caption`. The About page shows the first three; the home Proof section inlines whichever entry is at index 0, so order matters there.

## Critical Gotchas

### 1. HOME PAGE HAS ITS OWN INLINE HEADER
`app/page.client.tsx` renders its own header (hamburger, nav, HomeMark pill, Book CTA) — it does NOT use `SiteHeader.tsx`. This is because the home page couples navigation/scroll behavior to the header. When changing header markup (nav items, Book CTA styling, skip-to-content, mobile overlay), update BOTH files:
- `app/components/SiteHeader.tsx` (all subpages + 404)
- `app/page.client.tsx` (home page)

### 2. GRADIENT TEXT IS OPT-IN (`.grad` only)
The Calm pass removed the global gradient-text machinery. `body { color: #F2F2F2; background: #000 }`; there is no `-webkit-text-fill-color: transparent` on anywhere but one utility class. The gradient is a single opt-in: `.grad` in `globals.css`. Apply it to the hero name on `/` and the page title on each subpage — **one instance per page, never more**. Every other text element paints its own color (default `#F2F2F2`, meta `#9A9A9A`, tertiary/caption `#5C5C5C`). Links: `#F2F2F2` with `#9A9A9A` on hover (or the reverse for meta text).

### 3. JSX `.map()` PATTERN
Don't use a ternary inside a parenthesized arrow return inside `.map()`. Use the if/return pattern:
```jsx
items.map((p) => {
  const Row = (<>…</>);
  if (p.url) return <a key={p.id}>{Row}</a>;
  return <div key={p.id}>{Row}</div>;
})
```

### 4. TYPESCRIPT TIMERS
`window.setInterval` returns `number`, but `ReturnType<typeof setInterval>` resolves to `NodeJS.Timeout`. Type timer IDs explicitly: `let intervalId: number | null = null`.

### 5. VIEWPORT + SAFE AREAS
`app/layout.tsx` ships `viewport-fit=cover` so `env(safe-area-inset-*)` is available on iOS. Safe-area padding is applied inline per-component (practice page modal, main-content wrappers) — there is no global rule for it.

### 6. BOOKING MODAL STATE IS DUPLICATED (shared via `open-booking` event, with optional `eventType` preset)
Both `SiteHeader.tsx` and `app/page.client.tsx` keep their own `bookingOpen` + `bookingPreset` state and render their own `<BookingModal initialEventType={bookingPreset} />`. Only one header is ever mounted at a time, so there is no conflict. Entry points:
- The Book → button inside the header itself (both desktop nav and the mobile pill) — clears the preset.
- A site-wide `window` `CustomEvent('open-booking', { detail: { eventType } })`. Both headers listen for it on mount, write `detail?.eventType` into `bookingPreset`, and open the modal; `BookingModal` preselects the `eventType` when it is one of `EVENT_TYPES`. Any component can call `openBooking(eventType?)` from `lib/booking.ts` — the home hero pills, the home closing-ask pills, and the home offer cards all use the preset form (`"Live show / tour date"` or `"Production / drum programming"`); the About closing row calls it with no argument.

`HomeClient` used to take an `onOpenBooking` callback for its untyped hero / closing-ask pills — that prop was removed when both surfaces got labelled two-pill pairs that dispatch the event directly. There is no prop-callback path into the booking modal any more; everything flows through `openBooking()`.

There is no shared React context — the event (with its `detail`) is the shared channel.

### 7. ASSET-GATED FEATURES — EMPTY IS CORRECT
Two features render **nothing** in production when their data is empty:
- `AUDIO_CLIPS` (`AudioShowcase.tsx`, now mounted on `/epk`) — empty → component returns `null`.
- `testimonials` (`data/testimonials.data.ts`) — empty → `<Testimonials />` returns `null`.

The home hero intentionally no longer carries a video reel (Calm pass parked it — if it comes back, gate it behind a feature flag, use clean footage, and run it at `opacity-20` or lower). `HERO_VIDEO_URL` is a dead constant; leave it `null`.

**Current state:** `AUDIO_CLIPS` holds five finished clips (−14 LUFS, −1 dBTP, MP3 160 kbps, faded) on Vercel Blob under `audio/`: `back-and-forth` (Madelyn Leona), `cycles` (BittyOTW), `mr-nice-guy` (unreleased demo), `the-thought-of-you`, and `untitled-beat`. The `/epk` Listen section carries a single caption under the heading — "Drums and production on every track." — so individual rows don't need per-track role labels. `HERO_TESTIMONIALS` holds four PNG bubbles rendered by `<HeroTexts />` in the home hero strip: `review-3.png` (512×172, "You're wonderful!!! … could not be more excited about this track!!"), `review-7.png` (502×364, full live-show quote starting "Oh yeah imma be there on Saturday…"), `review-2.png` (528×205, beat quote), and `review-8.png` (444×76, "Broooooo. This is fireeeeeeeee"). `testimonials` holds three different bubbles rendered on About by `<Testimonials />` — no overlap with the hero set: `review-4.png` (503×300, production quote), `review-1.png` (484×236, mix quote starting "I'm reaaaaallly loving this mix!!!"), and `review-5.png` (512×140, "This gave me a bunch of ideas…"). All seven bubbles are sent with permission. Do not invent new placeholder content, and do not "clean up" by emptying either export unless Anthony asks.

### 8. CLOSED SECTION-ID UNION
`HomeClient`'s `initialSection` uses the type `"hero" | "services" | "proof"`. Adding a new section means updating the type and the refs in one pass.

### 9. HOME HERO BLEEDS UNDER THE HEADER (`-mt-14` + `.hero-fade`)
The home hero section is `-mt-14` on mobile so the ComFest photo starts at y = 0 behind the translucent fixed header. That value is paired to the header height (`h-14`) and to the `#main-content pt-14` wrapper in `app/page.client.tsx` — if the header height changes, update all three. On mobile a `.hero-fade` div is pinned to the bottom 45 % of the photo (`globals.css`, `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 45%, #000 100%)`) and the text block that follows uses `relative -mt-28` to sit over that fade, so copy reads cleanly on top of the image. Both the negative margin and the fade are `md:hidden`/reset on desktop, where the hero is a two-column grid with no overlap. If a face-crop issue appears, nudge `object-[center_20%]` toward `center_28%`.

## Video Infrastructure

- Vercel Blob public store, connected to the `anthonydakemusic-v3` Vercel project.
- Token: `BLOB_READ_WRITE_TOKEN` (Vercel env; pull locally with `npx vercel env pull .env.local`).
- Path conventions:
  - `practice/<YYYY-MM-DD>/<name>` — practice clips (currently raw `.mov`, ~900 MB total across 9 clips).
  - `hero/<name>.mp4` — home-page background reel.
  - `audio/<name>.mp3` — `AudioShowcase` clips.
- Upload CLI: `npm run upload-media -- <local-file> <blob-path>` (see `scripts/upload-media.mjs`). Prints the public URL + the exact line to paste.
- Transcoding/compression is a future optimization; raw files are acceptable today.

## Mobile Design / Header

Header height: `h-14` (56px), `fixed inset-x-0 top-0 z-[9999]`, `bg-black/70 backdrop-blur`.

Layout: `grid grid-cols-[1fr_auto_1fr]`. On `md+`: left half has Placements / Performance, center has the HomeMark pill, right half has About + a `Book →` button (Practice was dropped from the nav in Batch 2). On `<md`: left cell holds a hamburger button; the right cell holds a compact `Book →` pill (same style, `text-[10px] px-3 py-1.5`, `min-h-11` for tap target) so booking is one tap away without opening the hamburger. The desktop nav is hidden. Hamburger opens a fullscreen overlay (`fixed inset-0 z-[9998] bg-black/90 backdrop-blur-sm md:hidden`) with three links (Placements, Performance, About) + Book button, each with `onClick={() => setMenuOpen(false)}`.

**Home page scroll (all devices):** normal document flow. No snap, no wheel-hijack, no `no-scroll`, no `overflow-y-hidden`. Calm pass removed the leftover `.no-scroll` CSS too.

Per-page top padding (verified from the code):
- `/` (home) — `pt-14` on the `#main-content` wrapper (header is translucent, hero bleeds behind).
- `/about` — `pt-24` (96 px).
- `/epk` — `pt-20 sm:pt-24`.
- `/placements`, `/performance` — read from their `page.client.tsx`.
- `/practice` — read from its `page.client.tsx`.

## SEO / AI discoverability

- `app/layout.tsx` sets `metadataBase`, default OG + Twitter cards, and a `JsonLd` block at the root with `@graph` containing Person (`jobTitle: "Drummer and producer"`), Organization, WebSite. Default title: `Anthony Dake — Drummer & Producer · Columbus, OH`. Default description: `Drummer and producer in Columbus, OH. Live shows, tours and fly dates, remote and in-room session drums, drum programming and production. Book direct.` Each subpage re-declares its own OG/Twitter metadata.
- `app/page.tsx` sets the home-specific title/description (same copy as the layout defaults but as an absolute title) and OG/Twitter images.
- `public/llms.txt` + `public/llms-full.txt` — LLM-focused site summary + full bio snapshot. Updated to the drummer + producer positioning and link to the one-sheet PDF.
- `public/og-image.jpg` — 1200×630 social card, now carries the portrait. OG/Twitter `alt`: `Anthony Dake — drummer and producer, Columbus, OH`.
- Favicons + touch icons: `/favicon.ico`, `/favicon-32.png`, `/favicon.png` (192), `/apple-touch-icon.png` (180), `/icon-512.png` — all generated from the AD monogram with heavier 500-weight glyphs on black for small-size legibility.
- `app/sitemap.ts` emits every static route; `app/robots.ts` emits `/robots.txt` with the sitemap URL.
- Placements and performance rows render inline `MusicRecording` / `MusicEvent` JSON-LD (`1cb39d6`).

## Practice Page Vision

The `/practice` page is an "open practice room" — a daily log of real sessions, not a lesson platform:
- No categories, no filter bar — pure chronological timeline with search.
- Every exercise works timing, alignment, coordination, and sound together; categories are artificial.
- Free layer today: the daily log. The streak IS the content.
- Paid layer later: video access + downloadable materials via NextAuth.js + Stripe.
- Self-hosted video via Vercel Blob (no YouTube embeds).
- Current log: through Session #7 on 2026-05-18.

## Design System ("Calm" — current)

One idea per screen. One primary CTA style. One gradient per page. Solid text, no decoration, no motion for its own sake.

**Color.** `#F2F2F2` primary, `#9A9A9A` meta, `#5C5C5C` tertiary / captions, `rgba(255,255,255,0.08)` hairlines. Black background. Links: `#F2F2F2` with `#9A9A9A` on hover (reverse for meta text). The blue→white gradient (`#3B82F6 → #8EC5FF → #FFFFFF`) is opt-in via `.grad` — exactly one instance per page (hero name on `/`, page title elsewhere).

**Type.** One family site-wide: Gill Sans with Cabin fallback. The CSS stack is `"Gill Sans Nova", "Gill Sans", "Gill Sans MT", var(--font-cabin), ui-sans-serif, system-ui, sans-serif` — macOS/iOS visitors get Gill Sans, Windows 10+ gets Gill Sans Nova, everyone else gets **Cabin** (loaded via `next/font/google` in `app/layout.tsx`, exposed as `--font-cabin`; same Johnston/Gill skeleton, OFL). The stack is wired into both `--font-sans` on `:root` and the Tailwind v4 `@theme` block in `app/globals.css`, so `body { font-family: var(--font-sans) }` and `font-sans` utilities resolve to the same list. Display sizes (hero name + page titles) use `.font-display` — `font-family: var(--font-sans); font-weight: 300; letter-spacing: -0.015em` — which picks up Gill Sans Light where the visitor has it and Cabin 400 otherwise. One `.font-display` per page, always paired with `.grad`. Body text stays at two sizes: 15–16 px `leading-[1.6]`/`[1.75]`, 12 px meta. Uppercase is reserved for three surfaces: the header nav, the year-group micro-labels on the index pages (`text-[11px] tracking-[0.18em] text-[#5C5C5C]`), and the home hero's **`Architect of Sound` moniker** (`text-[12px] sm:text-[13px] uppercase tracking-[0.32em] text-[#9A9A9A]`, source sentence case, CSS uppercase) — the moniker is a deliberate allowed uppercase surface because it names the brand directly under the h1. Sentence case everywhere else. Gill Sans Light is thinner than Fraunces 300 was, so page-title sizes were bumped ~10 % (`text-[44px] sm:text-[58px]` on subpage titles, `text-[36px] sm:text-[48px]` on About, `text-[46px] sm:text-[60px] md:text-[64px] short:text-[54px]` on the hero name) and tracking standardized at `-0.015em`.

**Buttons.** One primary: `.epk-cta` — white pill, black text, no shadow, no glow, no hover-lift, hover-only `background-color: #E6E6E6`. One secondary: a plain text link with ` →`. No bordered pills, no outlined buttons — except the header `Book →` pill, which keeps its thin border (the single exception). **Pairing rule:** two labelled `.epk-cta` pills side by side (`flex-col` on mobile, `sm:flex-row` with `gap-3`, each at `min-w-[220px]`) are allowed on exactly two surfaces — the home hero and the home closing ask — to make the two offers impossible to miss (`Book production →` / `Book drums →`, in that order to mirror the `Producer / Drummer` role label). Elsewhere, stay on one primary pill.

**Viewport height variants.** Two custom Tailwind variants in `app/globals.css` tighten the home hero so the first screen stays whole on short laptop displays — `short` for 13"-class laptops and `tiny` for ~700 px-tall viewports. Both gate on `min-width: 48rem` so mobile is untouched.
```css
@custom-variant short (@media (min-width: 48rem) and (max-height: 860px));
@custom-variant tiny (@media (min-width: 48rem) and (max-height: 760px));
```
Declaration order matters: `tiny` must come after `short` so its utilities sort later and win where both apply. Current `tiny:` classes (four total): `tiny:py-2` on the hero grid wrapper (`HomeClient.tsx`), `tiny:text-[48px]` on the `Anthony Dake` h1 (`LogoArchitectOfSound.tsx`), `tiny:mt-4 tiny:max-w-[420px]` on the `HeroTexts` `<ul>`. Adding a third tier? Keep the file in increasing-specificity order (loosest `max-height` first).

**Motion.** No scramble, no curtain, no `-translate-y` hover lifts, no shadow pulses. No page fade, no section fade-ins — every page is fully visible in the server HTML on first paint, because content must never be gated on JS (phones held pages invisible for seconds). Only motion left is link/color hover transitions **and the one explicit exception**: the pulsing `(scroll)` hint pinned to the bottom edge of the first viewport on the home hero, desktop only (`.animate-scrollFlash`, keyframes in `globals.css`; the label is `#F2F2F2` 12 px uppercase, flashes between `opacity:.2` and `opacity:1` on a 2.4 s loop). All animations respect `prefers-reduced-motion`.

**Decoration.** Removed: eyebrows (`(02) — services`, `(IDX·01)`, `(BIO·01)`, `(LOG·01)`, `(EPK·01)`), corner labels (`INDEX OF 9`, `RECENT HIGHLIGHTS`, `ELECTRONIC PRESS KIT`), sub-captions under CTAs (`PDF · credits, reel, contact`), and card borders around content. Sections get at most one short heading in sentence case (`What I do`, `Proof`, `Listen`, `Contact`). Separate groups with whitespace (`py-16 sm:py-24`) and a single hairline `border-t` where needed.

**Density.** Reading column `max-w-[640px]` centered. Index pages `max-w-[960px]`. One group per screen at 375 px.

## Commit History (most recent first)

- `16abc79` — Hero: tiny variant keeps the first screen whole on ~700px-tall laptops
- `07fe162` — Hero: Architect of Sound + Producer / Drummer, stronger description, labelled Book buttons; counts move to offer cards
- `099b3d4` — Calm 4/5: EPK, About, Practice, 404, modal, headers
- `5d2615f` — Calm 3/5: index pages — two columns, no labels, no stagger
- `115840f` — Calm 2/5: home — still hero, one button, services as a list, proof line, footer line
- `306444a` — Calm 1/5: solid text, opt-in gradient, no glow/scramble/curtain
- `1fa7fc5` — Brand: revised AD mark — text serif, solid fill
- `60e6c9d` — Brand: AD monogram replaces the drum emoji — header mark, favicons, apple-touch-icon, branded OG card
- `f00e069` — Fix: hero visible by default; fail-open section reveals
- `3deabdb` — Fix: section fade-in threshold + CTA label shadow
- `aea40b8` — EPK: one-sheet label + contact line; admin: bookings inbox replaces email list
- `b2bdd08` — Services: add Music Direction card
- `078dcfa` — Nav: drop Practice from main navigation; remove RSS; About keeps the only link
- `81198c0` — Hero: lead with the reel — portrait moved to About
- `2dd4b06` — Home: natural scrolling on all devices — remove wheel-snap and swipe navigation
- `ed60f94` — Docs: batch 1 design fixes — mobile scroll, hero shade, open-booking event, stats data
- `72b7ae4` — Copy: reconcile proof numbers with index pages; Book CTA in section 03; About closing row; practice label
- `77e5a90` — Fix: practice dates invisible (time tag), submit label box, headline balance
- `c89ae3c` — Hero: working shade layer + vignette; reel dimmed to 25–30%
- `ba4af88` — Mobile: home page scrolls natively on touch; Book pill in mobile header; scroll hint fixes
- `4fc6337` — Tooling: scripts/upload-media.mjs for Vercel Blob uploads
- `e3e3aa0` — About: Testimonials component (renders only when real quotes are added)
- `20a216a` — Hero: asset-gated background reel + AudioShowcase (inactive until media is uploaded)
- `b0edf04` — A11y+SEO: restore skip-to-content, fix hero alt text
- `f844701` — Booking: notify on submit, origin check, honeypot, date min
- `72ab81b` — SEO+UX: sr-only prose intros, cross-link footers, 404 nav
- `72ce827` — SEO+AI: llms.txt, MusicRecording/MusicEvent schema, RSS, real metadata
- `12821b8` — Revert "Home hero: staggered fly-in intro with kick shakes on landing"
- `7693b23` — Home hero: staggered fly-in intro with kick shakes on landing
- `c802467` — Home hero: lift content back up — pt-14 pushed it too low
- `5a38cd3` — Home hero: balance vertical rhythm, clear the header
- `8796a6c` — Placements: add Madelyn Leona "Back & Forth" + 'recent highlights' subheader
- `a22b296` — Performance: add 'recent highlights' subheader under page title
- `9828d66` — Home hero: tone down text sizes
- `166349d` — Home hero: scrambled proof strip
- `877b7a5` — Home hero: scale up on lg/xl to use desktop viewport
- `38053e7` — Performance: trim 4 off-brand entries
- `c64055f` — EPK: mobile polish
- `f8f8040` — Header overhaul: symmetric nav, drop Columbus time + skip-to-content
- `2d039d2` — Performance: pull list to viewport edges
- `662f006` — Placements: curate to top 8
- `2bbee9f` — Placements: pull list to viewport edges
- `08c3b27` — EPK polish + remove site-wide footer
- `1bb336a` — Add practice sessions #4-7
- `1cb39d6` — Tag-run schema + render on placements / performance rows
- `9e40549` — Add Fraunces serif on 3 signature headlines
- `8146e75` — Numbered editorial eyebrows on subpage tops
- `1b274b0` — Microcopy pass + link-hover polish
- `7d0eb79` — Image discipline: OG resized, portrait → next/image
- `5c0259c` — Fix: BookingModal text was invisible due to gradient text-fill cascade
- `c50c2a9` — .gitignore: exclude .env*.local
- `02f2a68` — Home: cut services to 2 cards, restore Work With Me, add placements strip
- `08e648d` — Home: replace EPK section with Services breakdown
- `b4a86fd` — Add booking inquiry form with /api/book integration + Book CTA in headers
- `79caea5` — Cleanup: remove dead components (CustomCursor, FloatingCards, LenisProvider, ArchiveModal, ScribbleLink, ScrambleText, re-export stubs)
- `a25e9fb` — Add CLAUDE.md with project context for Claude Code
- `245ab18` — Fix SiteHeader bullet character (literal → actual •)

## Future Work

- Finish the Cloudflare DNS for Resend (DKIM TXT + `rsend`/`send` CNAMEs) so `anthonydakemusic.com` becomes a verified sender; then flip `BOOKING_NOTIFY_FROM` from `onboarding@resend.dev` to `noreply@anthonydakemusic.com`.
- Brand assets (AD monogram + favicons + OG card) are shipped. Source files live in `public/` and in `~/Claude-Workspace/4-architect/brand/` for the generation scripts.
- Practice page: paid access layer (Square — see Working Preferences).
- Practice page: CMS/admin panel for adding entries without a code push.
- Practice page: transcode the raw `.mov` clips → H.264 MP4 + VP9 WebM.

## Local Environment (Anthony's Mac)

- **Active clone**: `~/anthonydakemusic-v3` — the one Claude Code runs in (has `.claude/settings.local.json` with pre-approved `git add/commit/push`, `npx next *`, `node *`, `npm install *`). Always work here.
- **Do NOT use**: `~/Documents/GitHub/anthonydakemusic-v3` (stale GitHub Desktop clone with a divergent history) or `~/anthonydakemusic` (old v1 project, linked to the wrong Vercel project). An empty `anthonydakemusic-v3/` folder also sits in `~/Claude-Workspace/4-architect/` — ignore it.
- Node/npm/`claude` come from **fnm**; they are on PATH in a normal Terminal login shell. Non-login contexts (`osascript do shell script`, cron) need `export PATH=$PATH:/opt/homebrew/bin` and will not see fnm shims.
- A copy of this file is kept in sync at `~/Claude-Workspace/4-architect/CLAUDE.md` for Cowork sessions. Edit the repo copy, then `cp` it over.

## Working Preferences

**Payments: do NOT use Stripe or PayPal** (Anthony's standing decision, 2026-11-03). That also rules out platforms that run on their rails (Lemon Squeezy, Gumroad, Shopify Payments, Polar, Payhip, Ko-fi). The planned processor for digital downloads and the practice-room membership is Square (Checkout API + Subscriptions API + webhooks → Neon → Resend delivery).

Anthony prefers automated, zero-manual-step workflows. Build and push directly — don't ask him to run commands. When making changes, always run `npx next build` to verify before committing. The site should look polished and professional on mobile (iPhone, 375 px viewport) and desktop.

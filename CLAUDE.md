# CLAUDE.md — anthonydakemusic-v3

## Project Overview

Personal website for Anthony Dake — drummer, music director, session musician based in Columbus, OH. Built with Next.js 16 + Tailwind CSS, deployed on Vercel (auto-deploys on push to main).

**Production**: https://www.anthonydakemusic.com
**Repo**: https://github.com/anthonydake/anthonydakemusic-v3
**Hosting**: Vercel project `anthonydakemusic-v3` (auto-deploy on push to main)

## Architecture

Next.js App Router. All pages are client components (`"use client"` at top). No server components in use. Pages live in `app/` with a `page.client.tsx` pattern.

### Pages
- `/` — Home (hero image, name, tagline, EPK button, social links, scroll-to-placements)
- `/placements` — Music placements index (TV, film, ads)
- `/performance` — Performance credits index
- `/practice` — "Open Practice Room" — daily practice journal with video
- `/about` — Bio/story page
- `/epk` — Electronic Press Kit (resume download, demo reel, social links, contact)
- `/not-found` — Custom 404

### Key Components
- `app/components/SiteHeader.tsx` — Shared header for ALL subpages. Hamburger menu on mobile, inline nav on desktop.
- `app/components/SiteFooter.tsx` — Shared footer
- `app/components/ColumbusTime.tsx` — Live clock showing Columbus, OH time
- `app/components/HomeMark.tsx` — Drum icon logo
- `app/components/TransitionProvider.tsx` — Page transition animations

### Data Files
- `data/projects.data.ts` — Placements index
- `data/performance.data.ts` — Performance credits index
- `data/practice.data.ts` — Practice sessions (entries with optional VideoClip arrays)

## Critical Gotchas

### 1. HOME PAGE HAS ITS OWN HEADER
The home page (`app/page.client.tsx`) renders its own header inline — it does NOT use `SiteHeader.tsx`. This is because the home page has custom scroll/transition behavior coupled to the header. **When changing the header (nav items, styling, skip links), you MUST update BOTH files:**
- `app/components/SiteHeader.tsx` (all subpages)
- `app/page.client.tsx` (home page)

### 2. GRADIENT TEXT SYSTEM — TEXT IN DIVS IS INVISIBLE
The site uses a CSS gradient text system. `body` has `color: transparent` and gradient is applied via `background-clip: text` on leaf elements (span, p, a). Text placed directly in a `<div>` is **completely invisible**. Always wrap visible text in `<span>`, `<p>`, or `<a>` tags. Never put bare text in a `<div>`.

### 3. JSX .map() PATTERN
Don't use ternary in parenthesized arrow returns inside `.map()`. Use the if/return pattern:
```jsx
items.map((p) => {
  const Row = (<>...</>);
  if (p.url) {
    return (<a key={p.id}>{Row}</a>);
  }
  return (<div key={p.id}>{Row}</div>);
})
```

### 4. SKIP-TO-CONTENT LINK
Uses a custom `.skip-to-content` CSS class (NOT Tailwind's `sr-only`). The class is defined in `app/globals.css` with `opacity: 0`, `clip-path: inset(50%)`, `pointer-events: none` — plus `:focus` styles that reveal it. Don't switch to sr-only; the gradient text system interferes with it.

### 5. TYPESCRIPT IN NEXT.JS
`window.setInterval` returns `number` but `ReturnType<typeof setInterval>` resolves to `NodeJS.Timeout`. Use explicit `number` type: `let intervalId: number | null = null;`

### 6. VIEWPORT + SAFE AREAS
`layout.tsx` has `viewport-fit=cover` to activate `env(safe-area-inset-*)` on iPhone. Safe area padding is handled inline on components that need it, not via a global CSS rule.

## Video Infrastructure

Practice page videos are hosted on Vercel Blob storage.
- **Blob store**: `practice-videos` (public, IAD1 region)
- **Connected to**: anthonydakemusic-v3 Vercel project
- **Token**: `BLOB_READ_WRITE_TOKEN` in Vercel env vars
- **Upload pattern**: bash script with `curl -X PUT` to Vercel Blob API
- **Current content**: 9 video clips (~900MB) at `practice/2026-05-12/` path
- Videos are raw .mov files — compression/transcoding is a future optimization

## Mobile Design

Mobile header uses a hamburger menu pattern:
- `md:hidden` hamburger button with SVG 3-line/X icon
- Fullscreen overlay (`fixed inset-0 z-[9998] bg-black/90 backdrop-blur-sm md:hidden`)
- Centered nav links with `onClick={() => setMenuOpen(false)}` for auto-close
- Desktop: inline nav with Placements, Performance, Practice, About

Header is `h-14` (56px). Page content top padding varies:
- Home: `pt-14` (flush with header)
- About: `pt-24` (96px)
- EPK: `pt-20 sm:pt-24` (80px mobile, 96px desktop)
- Performance/Placements: `pt-[120px] sm:pt-[200px]`

## Practice Page Vision

The `/practice` page is an "open practice room" — a daily log of real practice, not a lesson platform. Key decisions:
- **NO categories, NO filter bar** — pure chronological timeline with search
- Every exercise works on timing, alignment, coordination, and sound simultaneously; categories are artificial
- **Free layer**: daily text log (the streak IS the content)
- **Paid layer (future)**: video access + downloadable materials via NextAuth.js + Stripe
- Self-hosted video (Vercel Blob), no YouTube embeds

## Commit History (most recent first)

- `245ab18` — Fix SiteHeader bullet character (literal • → actual •)
- `9752225` — Remove leftover inline mobile nav links from home page
- `ad0eea2` — Hamburger menu for SiteHeader + home page, skip-to-content CSS fix, EPK mobile padding
- `0c5369f` — Full site audit: main-content IDs, sr-only h1s, OG metadata, practice page a11y + memory leak fix
- `f2383de` — Session #3 practice data
- `2ca337a` — Mobile v3: viewport-fit=cover, nested main fix, About in mobile nav
- `e91da9b` — Mobile v2: video modal restructure, safe areas, touch feedback
- `63558a8` — Real practice data + video player (TS fix)
- `ca4f666` — Real practice data + video player (had TS error)
- `c53c781` — Practice page mobile optimization
- `cd88daa` — Initial practice page
- `9c6e31a` — Custom 404, footer, analytics
- `ca6001b` — SEO fixes (JSON-LD, sitemap, OG)
- `2388f3a` — Skip-to-content, aria-labels, main-content IDs

## Future Work (Additive)

- Hero image → Next.js `<Image>` component (optimization)
- Branded OG image (1200x630 design)
- Audio embeds on home page
- Practice page: paid access layer (NextAuth.js + Stripe)
- Practice page: CMS or admin panel for adding entries without code pushes
- Practice page: video compression/transcoding (currently raw .mov files)

## Working Preferences

Anthony prefers automated, zero-manual-step workflows. Build and push directly — don't ask him to run commands. When making changes, always run `npx next build` to verify before committing. The site should look polished and professional on mobile (iPhone, 375px viewport) and desktop.

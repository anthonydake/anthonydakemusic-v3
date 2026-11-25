# Archive

Kept for reference. Nothing in this folder is served by the site, built into it, or linked from it.

## earlier-site/

The pictures and downloads of the site as it was before November 2026 (the drummer-and-producer design: Placements, Performance, Practice, EPK, the old About).
Anthony had those pages taken out of the site on 24 Nov 2026 ("Remove from the architecture of the current site so they dont exist but save artifacts and or
images and downloads for reference"). The files are here exactly as they were in `public/`, under the same names:

- `placements/`, `covers/` — cover art used on the old Placements page
- `performance/`, `photos/` — live photos (old Performance, About and EPK pages)
- `reviews/` — screenshots of client texts (old home and About pages)
- `portrait.jpg`, `portrait-about.jpg`, `hero-poster.jpg`, `anthony-dake-drums.jpg`, `easter-egg/` — the old home and About pictures
- `Anthony_Dake_One-Sheet.pdf`, `Anthony_Dake_Resume.pdf` — the two downloads the old EPK linked to
- `mark.svg`, `mark-white.svg`, `letters.svg` — the old serif AD mark
- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` — the framework's sample pictures, never used

The old pages themselves (their code, words and data) are in the repository's history: the tag `earlier-site` is the last commit that had them.
To look at one: `git show earlier-site:app/epk/page.tsx`. To bring the whole old site up on a machine: `git worktree add ../earlier-site earlier-site`.

Old addresses are sent on to the page that took their place (see `next.config.ts`).

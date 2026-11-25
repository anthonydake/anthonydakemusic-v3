import { BELT_LABEL, OFFER, PAGES, RELEASES, SITE } from "@/site/content.mjs";

// /llms.txt: the site in plain text, for language models and other readers
// that do not run a browser. It is put together from the same words the pages
// show (site/content.mjs), so it cannot drift from them.
export const dynamic = "force-static";

export function GET() {
  const pages = PAGES as Record<string, { path: string | null; label?: string; description?: string }>;
  const listed = ["production", "about", "press-kit"];
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.moniker}. ${SITE.place}.`,
    "",
    `## ${OFFER.name}`,
    "",
    OFFER.what,
    "",
    "## Pages",
    "",
    `- [Home](${SITE.origin}/)`,
    ...listed.map((name) => `- [${pages[name].label}](${SITE.origin}${pages[name].path})`),
    "",
    `## ${BELT_LABEL}`,
    "",
    ...(RELEASES as { title: string; artist: string; released: string }[]).map(
      (r) => `- ${r.title}, ${r.artist} (${r.released.slice(0, 4)})`
    ),
    "",
    "## Contact",
    "",
    `- Booking: ${SITE.origin}/production`,
    `- Email: ${SITE.email}`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

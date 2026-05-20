import { practiceEntries } from "@/data/practice.data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const sorted = [...practiceEntries].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0]?.date ?? "2026-05-11";
  const lastBuildDate = new Date(`${latest}T12:00:00Z`).toUTCString();

  const items = sorted
    .map((entry) => {
      const url = `${SITE_URL}/practice#${entry.id}`;
      const pubDate = new Date(`${entry.date}T12:00:00Z`).toUTCString();
      const title = `Session #${entry.sessionNumber} — ${entry.title}`;
      const body = `${entry.duration} min · ${entry.description}`;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${entry.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(body)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Anthony Dake — Practice Log</title>
    <link>${SITE_URL}/practice</link>
    <description>Daily practice journal — open practice room.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

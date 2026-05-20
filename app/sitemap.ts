import type { MetadataRoute } from "next";
import { practiceEntries } from "@/data/practice.data";
import { projectIndex } from "@/data/projects.data";
import { performanceIndex } from "@/data/performance.data";

// Hardcoded lastmod for routes whose content isn't tied to a data file.
// Bump these manually when the page's content meaningfully changes.
const ROUTE_LASTMOD: Record<string, string> = {
  "/": "2026-05-19",
  "/epk": "2026-05-19",
  "/about": "2026-05-02",
};

function mostRecentDate(dates: string[], fallback: string): Date {
  const sorted = [...dates].sort();
  return new Date(`${sorted[sorted.length - 1] ?? fallback}T12:00:00`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";

  const practiceLast = mostRecentDate(
    practiceEntries.map((e) => e.date),
    ROUTE_LASTMOD["/"]
  );
  // Placements/performance are curated lists; tie to the route's hardcoded date.
  const placementsLast = new Date(
    `${(projectIndex[0]?.year ?? 2026)}-12-31T12:00:00`
  );
  const performanceLast = new Date(
    `${(performanceIndex[0]?.year ?? 2026)}-12-31T12:00:00`
  );

  return [
    { url: `${siteUrl}/`, lastModified: new Date(`${ROUTE_LASTMOD["/"]}T12:00:00`), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/placements`, lastModified: placementsLast, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/epk`, lastModified: new Date(`${ROUTE_LASTMOD["/epk"]}T12:00:00`), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/performance`, lastModified: performanceLast, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/practice`, lastModified: practiceLast, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(`${ROUTE_LASTMOD["/about"]}T12:00:00`), changeFrequency: "monthly", priority: 0.7 },
  ];
}

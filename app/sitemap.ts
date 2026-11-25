import type { MetadataRoute } from "next";
import { PAGES, SITE } from "@/site/content.mjs";

// The pages a search engine should know: the ones with an address of their
// own, less the store (unlisted until there is something real to sell).
// Bump a date when that page's content meaningfully changes.
const LAST_CHANGED: Record<string, string> = {
  home: "2026-11-24",
  production: "2026-11-24",
  about: "2026-11-24",
  "press-kit": "2026-11-24",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = PAGES as Record<string, { path: string | null }>;
  return Object.keys(LAST_CHANGED).map((name) => ({
    url: `${SITE.origin}${pages[name].path === "/" ? "/" : pages[name].path}`,
    lastModified: new Date(`${LAST_CHANGED[name]}T12:00:00Z`),
    changeFrequency: "monthly",
    priority: name === "home" ? 1 : 0.8,
  }));
}

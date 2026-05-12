import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/placements`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/epk`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/performance`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  return staticRoutes;
}

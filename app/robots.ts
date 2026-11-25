import type { MetadataRoute } from "next";
import { SITE } from "@/site/content.mjs";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/products/thanks/"] },
    sitemap: `${SITE.origin}/sitemap.xml`,
  };
}

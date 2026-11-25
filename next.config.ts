import type { NextConfig } from "next";

const live = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The addresses of the site before November 2026 (the drummer-and-producer
  // design and the store's first home). Those pages are gone for good
  // (Anthony, 24 Nov 2026: "Remove from the architecture of the current site
  // so they dont exist"), so their addresses are sent on, permanently (308),
  // to the page that took their place: a link someone kept still lands
  // somewhere, and a search engine is told the move is final.
  // The two downloads the old press kit linked to are kept in
  // archive/earlier-site/ and no longer served; their addresses go to the
  // press kit, temporarily (307), in case a new one-sheet ever takes the name.
  async redirects() {
    const gone = (source: string, destination: string) => ({ source, destination, permanent: true });
    const moved = (source: string, destination: string) => ({ source, destination, permanent: false });
    return [
      gone("/store", "/products"),
      gone("/store/thanks/:order", "/products/thanks/:order"),
      gone("/epk", "/press-kit"),
      gone("/placements", "/production"),
      gone("/placements/:path*", "/production"),
      gone("/projects", "/production"),
      gone("/projects/:path*", "/production"),
      gone("/performance", "/"),
      gone("/practice", "/"),
      gone("/demoreel", "/production"),
      gone("/llms-full.txt", "/llms.txt"),
      moved("/Anthony_Dake_One-Sheet.pdf", "/press-kit"),
      moved("/Anthony_Dake_Resume.pdf", "/press-kit"),
    ];
  },
  // The site's own stylesheet, script, fonts and pictures (public/site, made
  // by site/build.mjs). Every address a page uses for them carries a mark of
  // the file's contents, so a browser may keep them for good.
  async headers() {
    if (!live) return [];
    return [
      {
        source: "/site/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;

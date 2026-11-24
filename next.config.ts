import type { NextConfig } from "next";

const live = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The addresses of the site before November 2026 (the drummer-and-producer
  // design and the store's first home). They are sent on rather than left to
  // 404. Temporary (307) on purpose: if one of those pages is ever brought
  // back, no browser or search engine has been told the move was for good.
  async redirects() {
    const on = (source: string, destination: string) => ({ source, destination, permanent: false });
    return [
      on("/store", "/products"),
      on("/store/thanks/:order", "/products/thanks/:order"),
      on("/epk", "/press-kit"),
      on("/placements", "/production"),
      on("/placements/:path*", "/production"),
      on("/projects", "/production"),
      on("/projects/:path*", "/production"),
      on("/performance", "/"),
      on("/practice", "/"),
      on("/demoreel", "/production"),
      on("/llms-full.txt", "/llms.txt"),
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

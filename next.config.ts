import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/missin-u",
        destination: "/placements/template",
        permanent: true,
      },
      {
        source: "/projects/:path*",
        destination: "/placements/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

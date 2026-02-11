import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/missin-u",
        destination: "/projects/template",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/performance",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/socials",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

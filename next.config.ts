import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/missin-u",
        destination: "/projects/template",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served at skills.iangerado.com/morph
  basePath: "/morph",
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [{ source: "/", destination: "/morph", basePath: false, permanent: false }];
  },
};

export default nextConfig;

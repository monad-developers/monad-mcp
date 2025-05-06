import type { NextConfig } from "next";

const nextConfig = {
  logging: {
    level: "debug",
    fetches: {
      fullUrl: true,
    },
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/index.html",
      },
    ];
  },
};
export default nextConfig;

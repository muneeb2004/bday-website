import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* other config options here */
  turbopack: {
    // Pin root to this project to silence inferred-root warnings when parent directories contain lockfiles
    root: __dirname,
  },
};

export default nextConfig;

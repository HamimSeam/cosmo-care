import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next.js rooted to this application when a parent directory also has
  // a lockfile. This avoids watching or tracing unrelated files in the home dir.
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

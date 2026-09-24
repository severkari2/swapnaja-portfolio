import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin the workspace root so Turbopack never infers a parent directory
  // (e.g. from a stray lockfile in C:\Projects) as the project root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

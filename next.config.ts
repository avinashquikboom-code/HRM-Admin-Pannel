import type { NextConfig } from "next";

// Project root — dev/build always run from the project directory, and this
// avoids __dirname / import.meta, which break depending on how the config is compiled.
const projectRoot = process.cwd();

// Resolved at runtime on the server (rewrites run server-side), so this can be a
// plain VPS env var — no rebuild needed to change the backend target.
// Precedence: BACKEND_API_URL (runtime, prod) > NEXT_PUBLIC_API_URL (local dev).
const backendUrl =
  process.env.BACKEND_API_URL?.trim().replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') ||
  'https://api.voxiqai.com';

const nextConfig: NextConfig = {
  // Emit a self-contained build (.next/standalone) for a small Docker image.
  output: 'standalone',
  // Pin the workspace root — stops Next.js picking up stray lockfiles
  // (e.g. ~/package-lock.json) as the project root.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;


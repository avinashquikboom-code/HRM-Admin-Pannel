import type { NextConfig } from "next";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') ||
  'http://192.168.1.102:3000';

const nextConfig: NextConfig = {
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


import type { NextConfig } from "next";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') ||
  'https://quickboom-hrm-backend-gjch.onrender.com';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;


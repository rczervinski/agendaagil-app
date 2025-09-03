import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: ['localhost']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  }
};

export default nextConfig;

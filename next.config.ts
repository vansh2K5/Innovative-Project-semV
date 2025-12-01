import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests for Replit environment (proxied requests)
  allowedDevOrigins: ['*'],
};

export default nextConfig;

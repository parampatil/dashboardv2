import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      {
        protocol: 'http', // If you are indeed getting HTTP URLs
        hostname: 'googleusercontent.com',
      }
    ],
  },
  output: 'standalone',
};

export default nextConfig;

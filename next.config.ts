import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Resume uploads (base64 in FormData) need headroom above the 1MB default
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;

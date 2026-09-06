import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Resume uploads (base64 in FormData) need headroom above the 1MB default
    serverActions: {
      bodySizeLimit: "8mb",
    },
    // Next 15 defaults dynamic client cache to 0s — every click refetches RSC.
    // Keep pages warm briefly so portal navigation feels instant.
    staleTimes: {
      dynamic: 60,
      static: 180,
    },
  },
};


export default nextConfig;

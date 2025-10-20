import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   experimental: {
    serverActions: {
      bodySizeLimit: '1gb', // ✅ increase from default 1MB to 1GB
    },
  },
};

export default nextConfig;

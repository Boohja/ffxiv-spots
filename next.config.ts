import type { NextConfig } from "next";

const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(r2PublicBaseUrl ? [new URL(`${r2PublicBaseUrl.replace(/\/+$/g, "")}/**`)] : []),
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
      },
    ],
  },
};

export default nextConfig;

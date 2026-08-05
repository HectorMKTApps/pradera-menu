import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Cloudinary always serves from res.cloudinary.com regardless of
        // cloud name, so this hostname does not need to change per-account.
        // The cloud name itself is only used in upload URLs, not fetch URLs.
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

/**
 * Next.js configuration for the Keanu Le Roux Financial Advisor website.
 * Configures image optimization and remote patterns for CMS-hosted assets.
 */
const nextConfig: NextConfig = {
  // Allow Sanity CDN images to be served via Next.js Image Optimization (Req 5.7, 14.1)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

// Optionally enable bundle analyzer when ANALYZE env var is set
let withBundleAnalyzer: (cfg: NextConfig) => NextConfig = (x) => x;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const _b = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
  });
  withBundleAnalyzer = _b;
} catch {
  // bundle-analyzer not installed — skip
}

const nextConfig: NextConfig = {
  // Tối ưu cho production VPS
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Experimental features for better performance
  experimental: {
    // Enable PPR (Partial Prerendering) when stable
    // ppr: true,
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    // Allow Appwrite storage host for thumbnails and files
    domains: ["sgp.cloud.appwrite.io"],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Headers for caching static assets
  async headers() {
    return [
      {
        source: "/avatars/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/3D/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, immutable",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);

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
    domains: ["sgp.cloud.appwrite.io", "images.unsplash.com"],
    // Allow external placeholder images used in dev/error screenshots
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      // Allow images hosted on ggayane.github.io (used by some sample covers)
      {
        protocol: "https",
        hostname: "ggayane.github.io",
        port: "",
        pathname: "/**",
      },
      // Allow Flaticon CDN for icon assets used in the phim page
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        port: "",
        pathname: "/**",
      },
    ],
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
      // Allow camera/microphone usage for the embedded external page
      {
        source: "/van-kiem-quy-tong/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value:
              'camera=(self "https://phuc-tien-nhan.vercel.app"), microphone=(self "https://phuc-tien-nhan.vercel.app")',
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

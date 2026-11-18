import type { NextConfig } from "next";
import { DEFAULT_TILE_URL } from "./src/lib/map-config";

/** Origin of the configured raster tile service, used by the image policy. */
function tileOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_MAP_TILE_URL?.trim();
  try {
    return new URL((configured || DEFAULT_TILE_URL).replace(/{[^}]*}/g, "1"))
      .origin;
  } catch {
    return new URL(DEFAULT_TILE_URL.replace(/{[^}]*}/g, "1")).origin;
  }
}
const config: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const goAPI = process.env.GO_API_URL;
    if (!goAPI) return [];
    const base = goAPI.replace(/\/$/, "");
    return {
      beforeFiles: [
        { source: "/api/v1/health", destination: `${base}/api/v1/health` },
        {
          source: "/api/v1/categories",
          destination: `${base}/api/v1/categories`,
        },
        {
          source: "/api/v1/places/search",
          destination: `${base}/api/v1/places/search`,
        },
        {
          source: "/api/v1/places/:id/directions",
          destination: `${base}/api/v1/places/:id/directions`,
        },
        {
          source: "/api/v1/places/:id",
          destination: `${base}/api/v1/places/:id`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "geolocation=(self)" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              `img-src 'self' blob: data: ${tileOrigin()} https://*.googleapis.com https://*.gstatic.com https://*.ggpht.com https://*.google.com`,
              `connect-src 'self' ${tileOrigin()} https://maps.googleapis.com https://*.google.com`,
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src https://www.google.com",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
export default config;

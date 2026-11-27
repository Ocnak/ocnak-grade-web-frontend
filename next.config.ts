import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  allowedDevOrigins: ["192.168.1.86"],

  // PostHog reverse proxy: the client sends events to /ingest on our own
  // domain (see app/providers/posthog-provider.tsx).
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // PostHog's API paths end in a trailing slash; don't redirect them.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;

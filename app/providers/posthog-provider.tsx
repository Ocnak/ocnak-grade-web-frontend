"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

// Must be NEXT_PUBLIC_*: Next.js only inlines those into browser code.
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (typeof window !== "undefined" && !token) {
  console.warn(
    "PostHog token missing: set NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN and rebuild.",
  );
}

if (typeof window !== "undefined" && token) {
  posthog.init(token, {
    // Sent through our own domain (see the rewrites in next.config.ts) so
    // ad blockers don't drop the events.
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "identified_only",
    // Pageviews are captured by <PostHogPageView /> on every client-side
    // route change.
    capture_pageview: false,
    capture_pageleave: true,
    // Logs every captured event in the browser console during `pnpm dev`.
    debug: process.env.NODE_ENV === "development",
  });
}

export function NextHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

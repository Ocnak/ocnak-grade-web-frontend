"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

const token = process.env.POSTHOG_PROJECT_TOKEN;

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
  });
}

export function NextHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

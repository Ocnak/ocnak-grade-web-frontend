"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { useSession } from "@/hooks/use-session";

// Ties PostHog events to the signed-in user, and starts a fresh anonymous
// identity after sign-out (every sign-out path invalidates the session query).
export default function PostHogIdentify() {
  const posthog = usePostHog();
  const { data: session, isLoading } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (!posthog || isLoading) return;

    if (user) {
      if (posthog.get_distinct_id() !== user.id) {
        posthog.identify(user.id, {
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(" "),
          firstName: user.firstName,
          lastName: user.lastName,
          userRole: user.userRole,
        });
      }
    } else if (posthog.get_property("$user_state") === "identified") {
      posthog.reset();
    }
  }, [posthog, isLoading, user]);

  return null;
}

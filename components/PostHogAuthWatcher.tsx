"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import posthog from "posthog-js";

export function PostHogAuthWatcher() {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.userProfiles.getMe);
  const wasAuthenticated = useRef(false);
  const hasIdentified = useRef(false);

  useEffect(() => {
    if (isAuthenticated && profile && !hasIdentified.current) {
      try {
        posthog.identify(profile._id, {
          email: profile.email,
          business_name: profile.business_name,
        });
        posthog.capture("login", { userId: profile._id });
      } catch {
        // PostHog not initialized — events will be queued when init completes
      }
      hasIdentified.current = true;
      wasAuthenticated.current = true;
    }
  }, [isAuthenticated, profile]);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      try {
        posthog.reset();
      } catch {
        // PostHog not initialized
      }
      wasAuthenticated.current = false;
      hasIdentified.current = false;
    }
  }, [isAuthenticated]);

  return null;
}

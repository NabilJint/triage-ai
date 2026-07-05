"use client";

import { useEffect, useRef } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import posthog from "posthog-js";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const profile = useQuery(api.userProfiles.getMe);
  const identified = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (!profile) return;

    if (!profile.business_name) {
      window.location.href = "/onboarding";
      return;
    }

    if (!identified.current) {
      identified.current = true;
      posthog.identify(profile.authUserId, { email: profile.email });
      posthog.capture("dashboard_viewed");
    }
  }, [authLoading, isAuthenticated, profile]);

  if (authLoading || profile === undefined || !isAuthenticated || !profile || !profile.business_name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <Loader2 className="size-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
      <div className="max-w-md text-center space-y-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <LayoutDashboard className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm">
          Welcome, {profile.business_name || profile.email}!
        </p>
        <Button variant="link" asChild>
          <Link href="/onboarding">
            Update settings
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

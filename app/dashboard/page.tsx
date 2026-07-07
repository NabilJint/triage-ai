"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { LayoutDashboard } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { pageVariants, sectionVariants } from "@/lib/variants";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthGuard();
  const identified = useRef(false);

  useEffect(() => {
    if (!profile) return;
    if (!profile.business_name) {
      router.push("/onboarding");
      return;
    }
    if (!identified.current) {
      identified.current = true;
      posthog.capture("dashboard_viewed");
    }
  }, [profile, router]);

  if (isLoading || !profile || !profile.business_name) {
    return <LoadingScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar mode="app" />
      <motion.div
        className="max-w-3xl mx-auto px-6 py-10"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-8" variants={sectionVariants}>
          <h1 className="text-3xl font-bold text-text-darkest tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your email triage performance at a glance.
          </p>
        </motion.div>

        <motion.div variants={sectionVariants}>
          <div className="bg-surface border border-border rounded-xl p-10 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="size-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Coming Soon
            </h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
              Analytics and activity charts will appear here once we have enough
              data. Start by connecting your inbox and processing some emails.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

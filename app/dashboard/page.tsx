"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { motion as m } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import posthog from "posthog-js";
import { Cpu, CheckCircle2 } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AmdBadge } from "@/components/dashboard/AmdBadge";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import {
  pageVariants,
  sectionVariants,
  staggerContainer,
} from "@/lib/variants";


export default function DashboardPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuthGuard();
  const identified = useRef(false);

  const stats = useQuery(api.dashboard.getDashboardStats);
  const recentActivity = useQuery(api.dashboard.getRecentActivity);
  const chartData = useQuery(api.dashboard.getChartData);

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
    <motion.div
      className="max-w-5xl mx-auto px-6 py-10 space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-start justify-between"
        variants={sectionVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-text-darkest tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your email triage performance at a glance.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5">
          <Cpu className="size-3.5 text-amd" />
          <span className="text-xs font-semibold text-amd">
            Powered by AMD ROCm
          </span>
          <div className="size-2 rounded-full bg-success animate-pulse" />
        </div>
      </motion.div>

      <motion.div
        className="bg-surface border border-border rounded-xl p-6 shadow-card border-l-4 border-l-success"
        variants={sectionVariants}
      >
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <CheckCircle2 className="size-4 text-success" />
          All caught up! TriageAI is monitoring your inbox.
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <StatsBar
          stats={
            stats ?? {
              emailsToday: 0,
              autoReplyRate: 0,
              escalationsPending: 0,
              timeSaved: 0,
              amdLastRun: null,
            }
          }
        />

        <AmdBadge lastRun={stats?.amdLastRun ?? "Never"} />

        <AnalyticsCharts
          dailyActivity={chartData?.dailyActivity ?? []}
          classification={chartData?.classification ?? []}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <RecentActivity decisions={recentActivity ?? []} />
          </div>
          <div className="lg:col-span-4 bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Similar Interactions
            </h3>
            <p className="text-xs text-text-muted italic">
              AMD ROCm embeddings enable semantic search across customer
              history. Connect more emails to see similar past interactions.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

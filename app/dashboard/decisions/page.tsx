"use client";

import { motion } from "motion/react";
import { TriageFeed } from "@/components/triage/TriageFeed";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import {
  pageVariants,
  sectionVariants,
} from "@/lib/variants";

export default function DecisionsPage() {
  const { isLoading } = useAuthGuard();

  if (isLoading) {
    return <LoadingScreen variant="skeleton" text="Loading triage feed..." />;
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-10"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-8" variants={sectionVariants}>
        <h1 className="text-3xl font-bold text-text-darkest tracking-tight">
          Triage Feed
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Every email is classified and actioned automatically
        </p>
      </motion.div>

      <TriageFeed />
    </motion.div>
  );
}

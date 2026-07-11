"use client";

import { motion } from "motion/react";
import { InboxConnection } from "@/components/settings/InboxConnection";
import { BusinessContext } from "@/components/settings/BusinessContext";
import { EscalationRules } from "@/components/settings/EscalationRules";
import { ReplyToneSelector } from "@/components/settings/ReplyToneSelector";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import {
  pageVariants,
  sectionVariants,
  staggerContainer,
  staggerItem,
} from "@/lib/variants";

export default function SettingsPage() {
  const { isLoading } = useAuthGuard();

  if (isLoading) {
    return <LoadingScreen variant="skeleton" text="Loading settings..." />;
  }

  return (
      <motion.div
        className="max-w-3xl mx-auto px-6 py-10"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-8" variants={sectionVariants}>
          <h1 className="text-3xl font-bold text-text-darkest tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Connect your inbox and configure how TriageAI handles your emails.
          </p>
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            <InboxConnection key="inbox" />,
            <BusinessContext key="business" />,
            <EscalationRules key="rules" />,
            <ReplyToneSelector key="tone" />,
          ].map((component, i) => (
            <motion.div key={i} variants={staggerItem}>
              {component}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
  );
}

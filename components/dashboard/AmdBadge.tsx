"use client";

import { motion } from "motion/react";
import { Cpu, CheckCircle2 } from "lucide-react";
import { staggerItem } from "@/lib/variants";

type AmdBadgeProps = {
  lastRun: string;
};

export function AmdBadge({ lastRun }: AmdBadgeProps) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-gradient-to-br from-surface to-primary/5 border border-primary/20 rounded-xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amd-light rounded-lg px-3 py-1.5">
            <Cpu className="size-4 text-amd" />
            <span className="text-xs font-semibold text-amd">AMD ROCm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-success" />
            <span className="text-sm text-text-secondary">
              Embedding engine active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <div className="size-2 rounded-full bg-success animate-pulse" />
          Last run: {lastRun}
        </div>
      </div>
    </motion.div>
  );
}

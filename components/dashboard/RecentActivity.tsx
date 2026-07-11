"use client";

import { motion } from "motion/react";
import { Send, ArrowUpFromLine, Inbox } from "lucide-react";
import type { RecentDecisionItem } from "@/types";
import { staggerItem } from "@/lib/variants";
import { cn } from "@/lib/utils";

type RecentActivityProps = {
  decisions: RecentDecisionItem[];
};

export function RecentActivity({ decisions }: RecentActivityProps) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface border border-border rounded-xl p-6 shadow-card"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Recent Decisions
      </h3>
      {decisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 rounded-full bg-surface-tertiary mb-4">
            <Inbox className="size-6 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">
            No decisions yet
          </p>
          <p className="text-xs text-text-muted max-w-[240px]">
            Connect your inbox to get started with automated triage.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {decisions.map((decision) => (
            <div key={decision.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2 rounded-full shrink-0",
                  decision.type === "auto_reply"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning",
                )}
              >
                {decision.type === "auto_reply" ? (
                  <Send className="size-3.5" />
                ) : (
                  <ArrowUpFromLine className="size-3.5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {decision.type === "auto_reply"
                    ? "Auto-replied to"
                    : "Escalated"}{" "}
                  {decision.sender}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {decision.timeAgo} &middot; {decision.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

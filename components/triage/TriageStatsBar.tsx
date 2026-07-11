import { motion } from "motion/react";
import { Mail, MessageCircleCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant?: "default" | "highlight" | "warning" | "error";
};

function StatCard({ icon, label, value, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-6 border transition-shadow",
        variant === "default" && "bg-surface border-border shadow-card",
        variant === "highlight" && "bg-primary-muted border-primary-light",
        variant === "warning" && "bg-warning-light border-warning",
        variant === "error" && "bg-error-light border-error",
      )}
    >
      <div className="flex items-center gap-2 text-text-muted mb-1">
        {icon}
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <span className="text-3xl font-bold text-text-primary tabular-nums">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

type TriageStatsBarProps = {
  emailsToday: number;
  autoReplied: number;
  escalationsPending: number;
};

export function TriageStatsBar({
  emailsToday,
  autoReplied,
  escalationsPending,
}: TriageStatsBarProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <StatCard
        icon={<Mail className="size-4" />}
        label="Emails Today"
        value={emailsToday}
      />
      <StatCard
        icon={<MessageCircleCheck className="size-4" />}
        label="Auto-replied"
        value={autoReplied}
        variant="highlight"
      />
      <StatCard
        icon={<AlertTriangle className="size-4" />}
        label="Escalations Pending"
        value={escalationsPending}
        variant={escalationsPending > 0 ? "warning" : "default"}
      />
    </motion.div>
  );
}

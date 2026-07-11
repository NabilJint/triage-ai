"use client";

import { type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Mail, Bolt, TriangleAlert, Clock } from "lucide-react";
import type { DashboardStats } from "@/types";
import { staggerItem } from "@/lib/variants";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  href: string;
  trend?: {
    label: string;
    direction: "up" | "down" | "neutral";
  };
  borderWarning?: boolean;
};

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  href,
  trend,
  borderWarning,
}: StatCardProps) {
  const router = useRouter();

  return (
    <CardContainer containerClassName="py-0 w-full" className="w-full">
      <CardBody className="w-full h-auto p-0 [transform-style:preserve-3d]">
        <CardItem
          as={motion.div}
          variants={staggerItem}
          translateZ={20}
          className={`w-full bg-surface border ${borderWarning ? "border-warning" : "border-border"} ${borderWarning ? "border-l-4 border-l-warning" : ""} rounded-xl p-6 shadow-card hover:shadow-md transition-shadow cursor-pointer`}
          onClick={() => router.push(href)}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === "Enter") router.push(href);
          }}
          tabIndex={0}
          role="button"
          aria-label={`View ${label}`}
        >
          <CardItem translateZ={30} className="w-full">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-text-secondary">{label}</span>
              <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
            </div>
          </CardItem>
          <CardItem translateZ={40} className="w-full">
            <div className="text-3xl font-bold text-text-primary tabular-nums">
              {value}
            </div>
          </CardItem>
          {trend && (
            <CardItem translateZ={25} className="w-full">
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-xs font-medium ${
                    trend.direction === "up"
                      ? "text-success-dark"
                      : trend.direction === "down"
                        ? "text-error"
                        : "text-text-muted"
                  }`}
                >
                  {trend.direction === "up" && "↑"}
                  {trend.direction === "down" && "↓"}
                  {trend.label}
                </span>
              </div>
            </CardItem>
          )}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

type StatsBarProps = {
  stats: DashboardStats;
};

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Emails Today"
        value={stats.emailsToday}
        icon={<Mail className="size-4" />}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        href="/dashboard/decisions?filter=today"
        trend={{ label: "+12% from yesterday", direction: "up" }}
      />
      <StatCard
        label="Auto-reply Rate"
        value={`${stats.autoReplyRate}%`}
        icon={<Bolt className="size-4" />}
        iconBg="bg-success/10"
        iconColor="text-success"
        href="/dashboard/decisions?filter=auto_reply"
        trend={{ label: "Target: 70%", direction: "neutral" }}
      />
      <StatCard
        label="Escalations Pending"
        value={stats.escalationsPending}
        icon={<TriangleAlert className="size-4" />}
        iconBg="bg-warning/10"
        iconColor="text-warning"
        href="/dashboard/decisions?filter=escalate"
        borderWarning={stats.escalationsPending > 0}
        trend={{ label: "Needs attention", direction: "neutral" }}
      />
      <StatCard
        label="Time Saved"
        value={`${stats.timeSaved}h`}
        icon={<Clock className="size-4" />}
        iconBg="bg-secondary/10"
        iconColor="text-secondary"
        href="/dashboard/decisions"
        trend={{ label: "2 min saved per reply", direction: "up" }}
      />
    </div>
  );
}

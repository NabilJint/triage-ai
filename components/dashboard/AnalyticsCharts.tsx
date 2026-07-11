"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { staggerItem } from "@/lib/variants";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

const DAY_LABELS: Record<string, string> = {
  Sun: "Sun",
  Mon: "Mon",
  Tue: "Tue",
  Wed: "Wed",
  Thu: "Thu",
  Fri: "Fri",
  Sat: "Sat",
};

const CLASS_COLORS: Record<string, string> = {
  routine: "var(--color-primary)",
  technical: "var(--color-secondary)",
  urgent: "var(--color-error)",
  sales: "var(--color-success)",
  other: "var(--color-text-muted)",
};

type ActivityItem = {
  date: string;
  count: number;
};

type ClassItem = {
  name: string;
  value: number;
};

type AnalyticsChartsProps = {
  dailyActivity: ActivityItem[];
  classification: ClassItem[];
};

function enrichActivity(items: ActivityItem[]) {
  return items.map((item) => {
    const d = new Date(item.date + "T00:00:00");
    const label = DAY_LABELS[d.toLocaleDateString("en-US", { weekday: "short" })] ?? item.date.slice(5);
    return { ...item, label };
  });
}

function enrichClassification(items: ClassItem[]) {
  const total = items.reduce((sum, i) => sum + i.value, 0);
  return items.map((item) => ({
    name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.value,
    percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
    color: CLASS_COLORS[item.name] ?? "var(--color-text-muted)",
  }));
}

export function AnalyticsCharts({
  dailyActivity,
  classification,
}: AnalyticsChartsProps) {
  const enrichedActivity = useMemo(() => enrichActivity(dailyActivity), [dailyActivity]);
  const enrichedClassification = useMemo(() => enrichClassification(classification), [classification]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <motion.div
        variants={staggerItem}
        className="lg:col-span-8 bg-surface border border-border rounded-xl p-6 shadow-card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Triage Activity (7 Days)
        </h3>
        {enrichedActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-3 rounded-full bg-surface-tertiary mb-4">
              <BarChart3 className="size-6 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">No data yet</p>
            <p className="text-xs text-text-muted max-w-[200px]">
              Activity data will appear once emails are triaged.
            </p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={enrichedActivity}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  labelStyle={{ color: "var(--color-text-primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ fill: "var(--color-primary)", strokeWidth: 0, r: 4 }}
                  activeDot={{
                    fill: "var(--color-primary)",
                    stroke: "var(--color-surface)",
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="lg:col-span-4 bg-surface border border-border rounded-xl p-6 shadow-card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Classification
        </h3>
        {enrichedClassification.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-3 rounded-full bg-surface-tertiary mb-4">
              <PieChartIcon className="size-6 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">No data yet</p>
            <p className="text-xs text-text-muted max-w-[200px]">
              Classification data will appear once emails are triaged.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrichedClassification}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {enrichedClassification.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2.5">
              {enrichedClassification.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-text-secondary">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="font-semibold text-text-primary tabular-nums">
                    {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

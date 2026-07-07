"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/components/ui/settings-card";
import { Plus, AlertTriangle, Star, ThumbsDown, RefreshCw } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

type Rule = {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  icon: typeof AlertTriangle;
};

const defaultRules: Rule[] = [
  {
    id: "confidence",
    label: "Confidence below 60%",
    desc: "Escalate when the AI is unsure about the classification",
    enabled: true,
    priority: "medium",
    icon: RefreshCw,
  },
  {
    id: "refund",
    label: "Contains 'refund'",
    desc: "Refund requests always need human review",
    enabled: true,
    priority: "high",
    icon: ThumbsDown,
  },
  {
    id: "urgent",
    label: "Contains 'urgent'",
    desc: "Escalate time-sensitive requests immediately",
    enabled: true,
    priority: "urgent",
    icon: AlertTriangle,
  },
  {
    id: "complaint",
    label: "Contains 'complaint'",
    desc: "Customer complaints need careful handling",
    enabled: false,
    priority: "medium",
    icon: Star,
  },
];

const priorityColors: Record<string, string> = {
  low: "border-border bg-surface-secondary",
  medium: "border-secondary/40 bg-secondary-muted",
  high: "border-warning bg-warning-light",
  urgent: "border-error bg-error-light",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function EscalationRules() {
  const [rules, setRules] = useState(defaultRules);
  const [customLabel, setCustomLabel] = useState("");

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  return (
    <SettingsCard
      title="Escalation Rules"
      description="Define when emails should be escalated to your team instead of auto-replied."
    >
      <div className="space-y-3 mb-6">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.id}
              className={`rounded-lg border-l-4 p-4 ${priorityColors[rule.priority]} ${!rule.enabled ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Icon className="size-4 shrink-0 mt-0.5 text-text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {rule.label}
                    </p>
                    <p className="text-xs text-text-muted">{rule.desc}</p>
                    <span className="text-[11px] font-medium text-text-muted mt-1 inline-block">
                      Priority: {priorityLabels[rule.priority]}
                    </span>
                  </div>
                </div>
                <Toggle
                  checked={rule.enabled}
                  onChange={() => toggleRule(rule.id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Custom Rule
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. Contains 'manager'"
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          <Button
            variant="outline"
            disabled={!customLabel.trim()}
            onClick={() => {
              if (!customLabel.trim()) return;
              const newRule: Rule = {
                id: `custom-${Date.now()}`,
                label: customLabel.trim(),
                desc: "Custom escalation rule",
                enabled: true,
                priority: "medium",
                icon: AlertTriangle,
              };
              setRules([...rules, newRule]);
              setCustomLabel("");
            }}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}

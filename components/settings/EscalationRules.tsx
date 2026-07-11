"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/components/ui/settings-card";
import { Plus, AlertTriangle, Star, ThumbsDown, RefreshCw, X } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import type { EscalationRule } from "@/types";

const defaultRules: EscalationRule[] = [
  {
    id: "confidence",
    condition: "confidence_below",
    value: 0.6,
    priority: "medium",
    action: "escalate",
    label: "Confidence below 60%",
    desc: "Escalate when the AI is unsure about the classification",
    enabled: true,
  },
  {
    id: "refund",
    condition: "contains",
    value: "refund",
    priority: "high",
    action: "escalate",
    label: "Contains 'refund'",
    desc: "Refund requests always need human review",
    enabled: true,
  },
  {
    id: "urgent",
    condition: "contains",
    value: "urgent",
    priority: "urgent",
    action: "escalate",
    label: "Contains 'urgent'",
    desc: "Escalate time-sensitive requests immediately",
    enabled: true,
  },
  {
    id: "complaint",
    condition: "contains",
    value: "complaint",
    priority: "medium",
    action: "escalate",
    label: "Contains 'complaint'",
    desc: "Customer complaints need careful handling",
    enabled: false,
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

const ruleIcons: Record<string, typeof AlertTriangle> = {
  confidence: RefreshCw,
  refund: ThumbsDown,
  urgent: AlertTriangle,
  complaint: Star,
};

function parseCustomRule(label: string): { condition: "contains" | "confidence_below", value: string | number } {
  const containsMatch = label.match(/^Contains\s+'(.+)'$/i);
  const confidenceMatch = label.match(/^Confidence below\s+(\d+)%/i);
  if (containsMatch) {
    return { condition: "contains", value: containsMatch[1] };
  }
  if (confidenceMatch) {
    return { condition: "confidence_below", value: parseInt(confidenceMatch[1]) / 100 };
  }
  return { condition: "contains", value: label };
}

export function EscalationRules() {
  const savedRules = useQuery(api.userProfiles.getEscalationRules);
  const saveRules = useMutation(api.userProfiles.saveEscalationRules);

  const [rules, setRules] = useState<EscalationRule[]>(defaultRules);
  const [customLabel, setCustomLabel] = useState("");
  const [customPriority, setCustomPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (savedRules !== undefined && !loaded) {
      setLoaded(true);
      if (Array.isArray(savedRules) && savedRules.length > 0) {
        setRules(savedRules as EscalationRule[]);
      }
    }
  }, [savedRules, loaded]);

  const persist = useCallback(async (updated: EscalationRule[]) => {
    setSaving(true);
    try {
      await saveRules({ rules: updated });
    } catch (err) {
      console.error("[EscalationRules] save failed", err);
    } finally {
      setSaving(false);
    }
  }, [saveRules]);

  const toggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setRules(updated);
    persist(updated);
    posthog.capture("rule_toggled", { ruleId: id, enabled: !rules.find((r) => r.id === id)?.enabled });
  };

  const addCustomRule = () => {
    if (!customLabel.trim()) return;
    const parsed = parseCustomRule(customLabel.trim());
    const newRule: EscalationRule = {
      id: `custom-${Date.now()}`,
      ...parsed,
      priority: customPriority,
      action: "escalate",
      label: customLabel.trim(),
      desc: "Custom escalation rule",
      enabled: true,
    };
    const updated = [...rules, newRule];
    setRules(updated);
    persist(updated);
    posthog.capture("rule_created", { ruleId: newRule.id, label: newRule.label, condition: newRule.condition });
    setCustomLabel("");
  };

  const removeRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    persist(updated);
    posthog.capture("rule_deleted", { ruleId: id });
  };

  const isDefault = (id: string) => defaultRules.some((r) => r.id === id);

  return (
    <SettingsCard
      title="Escalation Rules"
      description="Define when emails should be escalated to your team instead of auto-replied."
    >
      <div className="space-y-3 mb-6">
        {rules.map((rule) => {
          const Icon = ruleIcons[rule.id] || AlertTriangle;
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
                <div className="flex items-center gap-2">
                  {!isDefault(rule.id) && (
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="size-6 flex items-center justify-center rounded-md text-text-muted hover:text-error hover:bg-error-light transition-all"
                      title="Remove rule"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                  <Toggle
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Custom Rule
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. Contains 'manager' or Confidence below 70%"
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            onKeyDown={(e) => { if (e.key === "Enter") addCustomRule(); }}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={customPriority}
            onChange={(e) => setCustomPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="low">Priority: Low</option>
            <option value="medium">Priority: Medium</option>
            <option value="high">Priority: High</option>
            <option value="urgent">Priority: Urgent</option>
          </select>
          <Button
            variant="outline"
            disabled={!customLabel.trim() || saving}
            onClick={addCustomRule}
            className="gap-1.5 shrink-0"
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}

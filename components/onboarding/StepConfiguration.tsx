"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

type Rules = {
  autoRespond: boolean;
  priorityDetection: boolean;
  spamFilter: boolean;
  workingHours: boolean;
};

type Tone = "professional" | "friendly" | "casual";

type Props = {
  onNext: () => void;
  onBack: () => void;
  rules: Rules;
  replyTone: Tone;
  onUpdateRules: (rules: Rules) => void;
  onUpdateTone: (tone: Tone) => void;
};

const tones: { value: Tone; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Formal business language" },
  { value: "friendly", label: "Friendly", desc: "Warm and approachable" },
  { value: "casual", label: "Casual", desc: "Relaxed, conversational tone" },
];

const rulesConfig: { key: keyof Rules; label: string; desc: string }[] = [
  { key: "autoRespond", label: "Auto-respond to routine", desc: "Automatically reply to FAQs and common requests" },
  { key: "priorityDetection", label: "Priority detection", desc: "Flag urgent emails and escalate to your team" },
  { key: "spamFilter", label: "Spam filtering", desc: "Detect and filter spam before it reaches your inbox" },
  { key: "workingHours", label: "Working hours only", desc: "Only send auto-replies during business hours" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
        checked ? "bg-primary" : "bg-surface-tertiary"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function StepConfiguration({
  onNext,
  onBack,
  rules,
  replyTone,
  onUpdateRules,
  onUpdateTone,
}: Props) {
  const [loading, setLoading] = useState(false);

  const toggleRule = (key: keyof Rules) => {
    onUpdateRules({ ...rules, [key]: !rules[key] });
  };

  const handleComplete = () => {
    setLoading(true);
    setTimeout(() => {
      onNext();
    }, 600);
  };

  return (
    <Card className="bg-surface border-border shadow-card">
      <CardContent className="flex flex-col p-8">
        <h1 className="text-xl font-bold text-text-primary mb-1">
          Configure preferences
        </h1>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Set how TriageAI handles your incoming emails and what tone to use
          when responding to customers.
        </p>

        <div className="space-y-1 mb-8">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Rules
          </p>
          <div className="space-y-3">
            {rulesConfig.map((rule) => (
              <div key={rule.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{rule.label}</p>
                  <p className="text-xs text-text-muted">{rule.desc}</p>
                </div>
                <Toggle
                  checked={rules[rule.key]}
                  onChange={() => toggleRule(rule.key)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Reply Tone
          </p>
          <div className="grid grid-cols-3 gap-2">
            {tones.map((tone) => (
              <button
                key={tone.value}
                onClick={() => onUpdateTone(tone.value)}
                className={`p-3 rounded-md border text-center transition-all ${
                  replyTone === tone.value
                    ? "border-primary bg-primary-muted text-primary-dark"
                    : "border-border bg-surface hover:bg-surface-secondary text-text-secondary"
                }`}
              >
                <p className="text-sm font-semibold">{tone.label}</p>
                <p className="text-[11px] text-current opacity-70 mt-0.5">{tone.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1" disabled={loading}>
            <ArrowLeft className="size-[18px]" />
            Back
          </Button>
          <Button onClick={handleComplete} size="lg" className="flex-[2]" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-[18px] animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Complete Setup
                <ArrowRight className="size-[18px]" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

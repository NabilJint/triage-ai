"use client";

import { useState } from "react";
import { SettingsCard } from "@/components/ui/settings-card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Tone = "professional" | "friendly" | "casual" | "enthusiastic";

const tones: { value: Tone; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Formal, business-appropriate language" },
  { value: "friendly", label: "Friendly", desc: "Warm and approachable tone" },
  { value: "casual", label: "Casual", desc: "Relaxed, conversational style" },
  { value: "enthusiastic", label: "Enthusiastic", desc: "Energetic and positive" },
];

const previews: Record<Tone, { subject: string; body: string }> = {
  professional: {
    subject: "Re: Your question about order #1234",
    body: "Dear Customer,\n\nThank you for reaching out. Regarding your inquiry about order #1234, I can confirm that your package is currently in transit and expected to arrive within 2–3 business days.\n\nPlease don't hesitate to contact us if you have any further questions.\n\nBest regards,\nThe TriageAI Team",
  },
  friendly: {
    subject: "Re: Your question about order #1234",
    body: "Hi there!\n\nThanks so much for your message! I checked on order #1234 and great news — it's on its way and should be with you in 2–3 business days.\n\nLet us know if there's anything else we can help with. We're here for you!\n\nCheers,\nThe TriageAI Team",
  },
  casual: {
    subject: "Re: Your question about order #1234",
    body: "Hey!\n\nThanks for reaching out. Just took a look at order #1234 — looks like it's already on its way and should hit your doorstep in 2–3 days.\n\nAny other questions? Just let us know!\n\n— The TriageAI Team",
  },
  enthusiastic: {
    subject: "Re: Your question about order #1234",
    body: "Hi!\n\nThanks for reaching out! 🎉 We're so excited to help you with order #1234. Your package is already on its way and should arrive in just 2–3 business days!\n\nIf there's anything else we can do to make your day better, just say the word. We've got your back!\n\nWith gratitude,\nThe TriageAI Team",
  },
};

export function ReplyToneSelector() {
  const [selected, setSelected] = useState<Tone>("professional");
  const preview = previews[selected];

  return (
    <SettingsCard
      title="Auto-Draft Reply Tone"
      description="Choose the voice TriageAI uses when drafting replies to your customers."
    >
      <RadioGroup
        value={selected}
        onValueChange={(v) => setSelected(v as Tone)}
        className="grid grid-cols-2 gap-2 mb-6"
      >
        {tones.map((tone) => (
          <div key={tone.value}>
            <RadioGroupItem
              value={tone.value}
              id={`tone-${tone.value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`tone-${tone.value}`}
              className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary-muted peer-data-[state=checked]:text-primary-dark ${
                selected === tone.value
                  ? "border-primary bg-primary-muted"
                  : "border-border bg-surface hover:bg-surface-secondary text-text-secondary"
              }`}
            >
              <span className="text-sm font-semibold">{tone.label}</span>
              <span className="text-[11px] text-current opacity-70 mt-0.5">
                {tone.desc}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="bg-bg-primary rounded-lg border border-border p-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Live Preview
        </p>
        <p className="text-sm font-medium text-text-primary mb-2">
          {preview.subject}
        </p>
        <div className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
          {preview.body}
        </div>
      </div>
    </SettingsCard>
  );
}

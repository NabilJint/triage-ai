"use client";

import posthog from "posthog-js";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

type Props = {
  onNext: () => void;
};

export function StepWelcome({ onNext }: Props) {
  return (
    <Card className="bg-surface border-border shadow-card">
      <CardContent className="flex flex-col p-8">
        <div className="flex justify-center mb-6">
          <div className="size-20 rounded-full bg-primary-muted flex items-center justify-center">
            <Logo size={40} className="text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          Welcome to TriageAI
        </h1>
        <p className="text-sm text-text-secondary text-center mb-8 leading-relaxed">
          Let&apos;s get you set up in just a few steps. Connect your inbox,
          tell us about your business, and configure your preferences.
        </p>

        <div className="space-y-4 mb-8">
          {[
            { step: "1", title: "Connect your inbox", desc: "Link your Gmail account to start triaging emails" },
            { step: "2", title: "Business context", desc: "Tell us about your business so we can respond accurately" },
            { step: "3", title: "Configure rules", desc: "Set auto-reply rules, priority detection, and reply tone" },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-3"
            >
              <span className="size-6 rounded-full bg-primary-muted text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => {
            posthog.capture("onboarding_started");
            onNext();
          }}
          size="lg"
          className="w-full"
        >
          Get Started
          <ArrowRight className="size-[18px]" />
        </Button>

        <p className="mt-4 text-xs text-center text-text-muted">
          Takes about 2 minutes
        </p>
      </CardContent>
    </Card>
  );
}

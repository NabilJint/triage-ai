"use client";

import posthog from "posthog-js";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Button as MovingBorderBtn } from "@/components/ui/moving-border";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { FadeInUp } from "./FadeInUp";

const decisionCards = [
  {
    subject: "Password Reset Request",
    classification: "Auto-Resolved",
    confidence: 94,
    variant: "success" as const,
  },
  {
    subject: "Billing Dispute - Invoice #4421",
    classification: "Escalated",
    confidence: 72,
    variant: "error" as const,
  },
];

export function Hero() {
  return (
    <section className="relative bg-bg-primary py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <Spotlight className="opacity-60" fillOpacity={0.35} />
      </div>
      <div className="max-w-1280px mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="max-w-2xl">
            <TypewriterEffectSmooth
              words={[
                { text: "AI" },
                { text: "that" },
                { text: "handles" },
                { text: "your" },
                { text: "support" },
                { text: "inbox" },
                { text: "while" },
                { text: "you" },
                { text: "sleep.", className: "text-primary" },
              ]}
              className="text-left text-4xl md:text-5xl md:leading-[52px] font-extrabold"
              cursorClassName="bg-primary"
            />
            <FadeInUp delay={0.15} className="mt-6">
              <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">
                TriageAI reads every incoming email, auto-responds to routine
                questions, and escalates what matters directly to your human
                team.
              </p>
            </FadeInUp>
            <FadeInUp delay={0.25} className="mt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <MovingBorderBtn
                  borderRadius="var(--radius-md)"
                  containerClassName="w-full sm:w-auto"
                  className="px-6 py-3 text-base font-medium"
                  as="a"
                  href="/login"
                  onClick={() => posthog.capture("hero_cta_clicked", { label: "get_started_free" })}
                >
                  Get Started Free
                </MovingBorderBtn>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <a href="/login" onClick={() => posthog.capture("hero_cta_clicked", { label: "view_live_demo" })}>View Live Demo</a>
                </Button>
              </div>
            </FadeInUp>
          </div>
          <FadeInUp delay={0.2} className="relative max-w-lg">
            <div className="bg-surface border border-border rounded-lg p-4 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="size-2 bg-success rounded-full animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-text-secondary">
                  Live Triage Feed
                </span>
              </div>
              <div className="space-y-3">
                {decisionCards.map((card, index) => (
                  <div
                    key={index}
                    className={`p-4 border-b border-border last:border-b-0 bg-bg-primary/50 rounded-sm ${
                      index === 1 ? "border-b-0" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-text-darkest truncate pr-2">
                        {card.subject}
                      </span>
                      <Badge
                        variant={
                          card.variant === "success" ? "default" : "destructive"
                        }
                        className={`text-xs font-medium px-3 py-1 shrink-0 ${
                          card.variant === "success"
                            ? "bg-success-light text-success-dark"
                            : "bg-error-light text-error"
                        }`}
                      >
                        {card.classification}
                      </Badge>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          card.variant === "success"
                            ? "bg-primary"
                            : "bg-warning"
                        }`}
                        style={{ width: `${card.confidence}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-text-muted mt-1">
                      <span>Confidence</span>
                      <span>{card.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
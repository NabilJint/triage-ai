"use client";

import { useState, useEffect, useRef } from "react";
import posthog from "posthog-js";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, CheckCircle, Loader2 } from "lucide-react";
import { stepTransition, popIn, fadeIn } from "@/lib/variants";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { StepWelcome } from "@/components/onboarding/StepWelcome";
import { StepConnectInbox } from "@/components/onboarding/StepConnectInbox";
import { StepBusinessContext } from "@/components/onboarding/StepBusinessContext";
import { StepConfiguration } from "@/components/onboarding/StepConfiguration";
import { Confetti } from "@/components/onboarding/Confetti";

type Rules = {
  autoRespond: boolean;
  priorityDetection: boolean;
  spamFilter: boolean;
  workingHours: boolean;
};

type OnboardingData = {
  gmailConnected: boolean;
  businessUrl: string;
  businessDescription: string;
  rules: Rules;
  replyTone: "professional" | "friendly" | "casual";
};

const TOTAL_STEPS = 4;

const defaultData: OnboardingData = {
  gmailConnected: false,
  businessUrl: "",
  businessDescription: "",
  rules: {
    autoRespond: true,
    priorityDetection: true,
    spamFilter: true,
    workingHours: false,
  },
  replyTone: "professional",
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const profile = useQuery(api.userProfiles.getMe);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (profile && profile.business_name) {
      window.location.href = "/dashboard";
    }
  }, [profile]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || profile === undefined) return;
    if (profile?.business_name) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    posthog.capture("onboarding_started");
  }, [authLoading, isAuthenticated, profile]);

  if (authLoading || profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loader2 className="size-5 animate-spin text-text-secondary" />
      </div>
    );
  }

  if (!isAuthenticated || (profile && profile.business_name)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loader2 className="size-5 animate-spin text-text-secondary" />
      </div>
    );
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      posthog.capture("onboarding_step_completed", {
        step_index: step,
        total_steps: TOTAL_STEPS,
      });
      setStep((s) => s + 1);
    } else {
      posthog.capture("onboarding_step_completed", {
        step_index: step,
        total_steps: TOTAL_STEPS,
      });
      posthog.capture("onboarding_completed", {
        gmail_connected: data.gmailConnected,
        reply_tone: data.replyTone,
        auto_respond: data.rules.autoRespond,
        priority_detection: data.rules.priorityDetection,
      });
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  if (completed) {
    return <CompletedScreen data={data} />;
  }

  const steps = [
    <StepWelcome key="welcome" onNext={handleNext} />,
    <StepConnectInbox
      key="connect"
      onNext={handleNext}
      onBack={handleBack}
      gmailConnected={data.gmailConnected}
      onToggleGmail={() => updateData({ gmailConnected: !data.gmailConnected })}
    />,
    <StepBusinessContext
      key="context"
      onNext={handleNext}
      onBack={handleBack}
      businessUrl={data.businessUrl}
      businessDescription={data.businessDescription}
      onUpdateUrl={(url) => updateData({ businessUrl: url })}
      onUpdateDescription={(desc) => updateData({ businessDescription: desc })}
    />,
    <StepConfiguration
      key="config"
      onNext={handleNext}
      onBack={handleBack}
      rules={data.rules}
      replyTone={data.replyTone}
      onUpdateRules={(rules) => updateData({ rules })}
      onUpdateTone={(tone) => updateData({ replyTone: tone })}
    />,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at top right, var(--color-primary-muted), transparent 40%),
            radial-gradient(circle at bottom left, var(--color-primary-light), transparent 30%)
          `,
        }}
      />
      <div className="z-10 w-full max-w-lg px-4">
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="text-lg font-bold text-primary flex items-center gap-2"
          >
            <Logo />
            TriageAI
          </Link>
        </div>

        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 flex-1 rounded-full bg-border origin-left"
              animate={{
                backgroundColor:
                  i <= step ? "var(--color-primary)" : "var(--color-border)",
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CompletedScreen({ data }: { data: OnboardingData }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at top right, var(--color-primary-muted), transparent 40%),
            radial-gradient(circle at bottom left, var(--color-primary-light), transparent 30%)
          `,
        }}
      />
      <Confetti />
      <div className="z-10 w-full max-w-lg px-4 text-center">
        <motion.div
          variants={popIn}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <Card className="bg-surface border-border shadow-card rounded-lg">
            <CardContent className="flex flex-col items-center p-8">
              <motion.div variants={popIn} initial="hidden" animate="visible">
                <CheckCircle
                  className="size-16 text-success mb-4"
                  strokeWidth={1.5}
                />
              </motion.div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                You&apos;re all set!
              </h1>
              <p className="text-sm text-text-secondary mb-6 max-w-sm text-center">
                TriageAI is now configured and ready to sort your inbox.
                We&apos;ll auto-respond to routine questions and escalate what
                matters.
              </p>
              <div className="w-full bg-surface-secondary rounded-lg p-4 mb-6 text-left text-sm space-y-2">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Check
                    className="size-4 text-success shrink-0"
                    strokeWidth={2}
                  />
                  <span>
                    Inbox {data.gmailConnected ? "connected" : "configured"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Check
                    className="size-4 text-success shrink-0"
                    strokeWidth={2}
                  />
                  <span>Business context saved</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Check
                    className="size-4 text-success shrink-0"
                    strokeWidth={2}
                  />
                  <span>Rules configured ({data.replyTone} tone)</span>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-[18px]" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
          className="mt-6 text-xs font-semibold text-amd"
        >
          Powered by AMD ROCm &mdash; embeddings generated on AMD hardware
        </motion.p>
      </div>
    </div>
  );
}

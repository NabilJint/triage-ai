"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, CheckCircle } from "lucide-react";
import { stepTransition, popIn, fadeIn } from "@/lib/variants";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { AuthBackground } from "@/components/ui/auth-background";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
import { StepWelcome } from "@/components/onboarding/StepWelcome";
import { StepConnectInbox } from "@/components/onboarding/StepConnectInbox";
import { StepBusinessContext } from "@/components/onboarding/StepBusinessContext";
import { StepConfiguration } from "@/components/onboarding/StepConfiguration";
import { LogoFormation } from "@/components/success/LogoFormation";
import type { EscalationRule } from "@/types";

const defaultEscalationRules: EscalationRule[] = [
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

type Rules = {
  autoRespond: boolean;
  priorityDetection: boolean;
  spamFilter: boolean;
  workingHours: boolean;
};

type OnboardingData = {
  businessUrl: string;
  businessName: string;
  businessDescription: string;
  rules: Rules;
  replyTone: "professional" | "friendly" | "casual";
};

const TOTAL_STEPS = 4;

const defaultData: OnboardingData = {
  businessUrl: "",
  businessName: "",
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
  const router = useRouter();
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("ostep");
      if (s) return Math.min(parseInt(s, 10), TOTAL_STEPS - 1);
    }
    return 0;
  });
  const [completed, setCompleted] = useState(false);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const { profile, isLoading } = useAuthGuard();
  const updateBusinessContext = useMutation(api.userProfiles.updateBusinessContext);
  const saveReplyTone = useMutation(api.userProfiles.saveReplyTone);
  const saveEscalationRules = useMutation(api.userProfiles.saveEscalationRules);
  const saveReplyPreviews = useMutation(api.userProfiles.saveReplyPreviews);
  const connection = useQuery(api.inboxConnections.getConnection);
  const disconnect = useMutation(api._gmailHelpers.disconnectGmail);
  const connectImapMut = useMutation(api.inboxConnections.connectImap);
  const gmailConnected = connection?.is_active ?? false;
  const connectedEmail = connection?.email ?? null;
  const hasStartedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!profile || completedRef.current) return;
    if (profile.business_name) {
      router.push("/dashboard");
    }
  }, [profile, router]);

  useEffect(() => {
    if (isLoading) return;
    if (profile?.business_name) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    posthog.capture("onboarding_started");
  }, [isLoading, profile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("gmail")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("gmail");
      router.replace(url.pathname + url.search);
    }
  }, [router, gmailConnected]);

  if (isLoading || (profile && profile.business_name)) {
    return <LoadingScreen text="Loading onboarding..." />;
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
        gmail_connected: gmailConnected,
        reply_tone: data.replyTone,
        auto_respond: data.rules.autoRespond,
        priority_detection: data.rules.priorityDetection,
      });
      const businessContext = data.businessDescription;

      Promise.all([
        updateBusinessContext({
          business_name: data.businessName || "My Business",
          business_url: data.businessUrl,
          business_context: businessContext,
        }),
        saveReplyTone({ tone: data.replyTone }),
        saveEscalationRules({ rules: defaultEscalationRules }),
        (async () => {
          try {
            const res = await fetch("/api/preview-reply", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tone: data.replyTone, businessContext }),
            });
            if (!res.ok) return;
            const preview = await res.json();
            if (preview.subject && preview.body) {
              await saveReplyPreviews({
                previews: { [data.replyTone]: { subject: preview.subject, body: preview.body } },
                contextHash: businessContext,
              });
            }
          } catch {
            // preview generation is best-effort
          }
        })(),
      ]).catch(console.error);
      completedRef.current = true;
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
    return       <CompletedScreen data={data} gmailConnected={gmailConnected} />;
  }

  const steps = [
    <StepWelcome key="welcome" onNext={handleNext} />,
    <StepConnectInbox
      key="connect"
      onNext={handleNext}
      onBack={handleBack}
      gmailConnected={gmailConnected}
      connectedEmail={connectedEmail}
      onToggleGmail={() => {
        if (gmailConnected) {
          disconnect();
        } else {
          window.location.replace(`/api/gmail/auth?state=/onboarding?ostep=${step}`);
        }
      }}
      onConnectImap={async (args) => {
        await connectImapMut(args);
      }}
    />,
    <StepBusinessContext
      key="context"
      onNext={handleNext}
      onBack={handleBack}
      businessUrl={data.businessUrl}
      businessName={data.businessName}
      businessDescription={data.businessDescription}
      onUpdateUrl={(url) => updateData({ businessUrl: url })}
      onUpdateName={(name) => updateData({ businessName: name })}
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
      <AuthBackground />
      <BackgroundBeams />
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

function CompletedScreen({ data, gmailConnected }: { data: OnboardingData; gmailConnected: boolean }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden">
      <AuthBackground />
      <BackgroundBeams />
      <LogoFormation onComplete={() => router.push("/dashboard")} />
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
                    Inbox {gmailConnected ? "connected" : "configured"}
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

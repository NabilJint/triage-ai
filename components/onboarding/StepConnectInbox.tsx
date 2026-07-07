"use client";

import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Info } from "lucide-react";
import { InboxConnectButton } from "@/components/gmail/InboxConnectButton";

type Props = {
  onNext: () => void;
  onBack: () => void;
  gmailConnected: boolean;
  onToggleGmail: () => void;
};

export function StepConnectInbox({
  onNext,
  onBack,
  gmailConnected,
  onToggleGmail,
}: Props) {
  return (
    <Card className="bg-surface border-border shadow-card">
      <CardContent className="flex flex-col p-8">
        <h1 className="text-xl font-bold text-text-primary mb-1">
          Connect your inbox
        </h1>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          TriageAI needs access to your support inbox to read, classify, and optionally
          respond to incoming emails. Your data stays private and secure.
        </p>

        <div className="space-y-4 mb-8">
          <InboxConnectButton
            connected={gmailConnected}
            onToggle={() => {
              if (!gmailConnected) posthog.capture("inbox_connected", { provider: "gmail" });
              onToggleGmail();
            }}
          />

          {gmailConnected && (
            <div className="bg-success-light/10 border border-success/20 rounded-md p-3 flex items-start gap-2">
              <Info className="size-4 text-success shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary">
                In demo mode. In production, you&apos;ll be redirected to Google&apos;s OAuth flow
                to grant read and reply permissions.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="size-[18px]" />
            Back
          </Button>
          <Button onClick={onNext} size="lg" className="flex-[2]">
            {gmailConnected ? "Continue" : "Skip for now"}
            <ArrowRight className="size-[18px]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

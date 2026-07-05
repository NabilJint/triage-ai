"use client";

import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check, Info } from "lucide-react";

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
          <button
            onClick={() => {
              if (!gmailConnected) posthog.capture("inbox_connected", { provider: "gmail" });
              onToggleGmail();
            }}
            className={`w-full flex items-center gap-4 p-4 rounded-md border transition-all ${
              gmailConnected
                ? "border-success bg-success-light/20"
                : "border-border bg-surface hover:bg-surface-secondary"
            }`}
          >
            <svg className="size-8 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-text-primary">Google Workspace / Gmail</p>
              <p className="text-xs text-text-muted">
                {gmailConnected
                  ? "Connected — support@yourcompany.com"
                  : "Connect your support inbox"}
              </p>
            </div>
            {gmailConnected && (
              <Check className="size-5 text-success shrink-0" />
            )}
          </button>

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

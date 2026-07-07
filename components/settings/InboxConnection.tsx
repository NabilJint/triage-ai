"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsCard } from "@/components/ui/settings-card";
import { Toggle } from "@/components/ui/toggle";
import { InboxConnectButton } from "@/components/gmail/InboxConnectButton";
import { Mail, Send, Info } from "lucide-react";

export function InboxConnection() {
  const [connected, setConnected] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  const handleToggle = () => {
    if (!connected) {
      posthog.capture("inbox_connected", { provider: "gmail" });
      setConnected(true);
    } else {
      setConnected(false);
    }
  };

  return (
    <SettingsCard
      title="Inbox Connection"
      description="Connect your support inbox so TriageAI can read, classify, and reply to incoming emails."
      headerRight={
        <Badge
          variant={connected ? "default" : "outline"}
          className={connected
            ? "bg-success-light text-success-dark border-success/40"
            : "text-text-muted"}
        >
          {connected ? "Connected" : "Not Connected"}
        </Badge>
      }
    >
      <InboxConnectButton connected={connected} onToggle={handleToggle} />

      {connected && (
        <div className="mt-3 bg-success-light/10 border border-success/20 rounded-lg p-3 flex items-start gap-2">
          <Info className="size-4 text-success shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary">
            In demo mode. In production, you&apos;ll be redirected to Google&apos;s
            OAuth flow to grant read and reply permissions.
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-text-muted" />
            <span className="text-sm text-text-primary font-medium">
              Use Mock Inbox for testing
            </span>
          </div>
          <Toggle checked={mockMode} onChange={() => setMockMode(!mockMode)} />
        </div>
        <p className="text-xs text-text-muted mt-1.5">
          Simulate incoming emails for testing without a real Gmail connection.
        </p>
        {mockMode && connected && (
          <Button size="sm" className="mt-3 gap-1.5">
            <Send className="size-3.5" />
            Send Test Email
          </Button>
        )}
      </div>
    </SettingsCard>
  );
}

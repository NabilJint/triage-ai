"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Info, ChevronDown, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";

type Props = {
  onNext: () => void;
  onBack: () => void;
  gmailConnected: boolean;
  connectedEmail: string | null;
  gmailStatus: string | null;
  onToggleGmail: () => void;
  onConnectImap?: (args: {
    provider: string;
    email: string;
    appPassword: string;
    imapHost?: string;
    imapPort?: number;
  }) => Promise<void>;
};

export function StepConnectInbox({
  onNext,
  onBack,
  gmailConnected,
  connectedEmail,
  gmailStatus,
  onToggleGmail,
  onConnectImap,
}: Props) {
  const [showNonGmail, setShowNonGmail] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [imapEmail, setImapEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [customHost, setCustomHost] = useState("");
  const [customPort, setCustomPort] = useState("993");
  const [imapConnecting, setImapConnecting] = useState(false);
  const [imapStatus, setImapStatus] = useState<string | null>(null);

  const handleConnectImap = async () => {
    if (!selectedProvider || !imapEmail || !appPassword || !onConnectImap) return;
    setImapConnecting(true);
    setImapStatus(null);
    try {
      const args: Record<string, unknown> = {
        provider: selectedProvider,
        email: imapEmail,
        appPassword,
      };
      if (selectedProvider === "imap" && customHost) {
        args.imapHost = customHost;
        args.imapPort = customPort ? parseInt(customPort, 10) : undefined;
      }
      await onConnectImap(args as any);
      posthog.capture("inbox_connected", { provider: selectedProvider });
      setImapStatus("success");
    } catch (err) {
      console.error("[StepConnectInbox] imap connect failed", err);
      setImapStatus("error");
    } finally {
      setImapConnecting(false);
    }
  };

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
          {/* Gmail */}
          <button
            onClick={() => {
              if (!gmailConnected) posthog.capture("inbox_connected", { provider: "gmail" });
              onToggleGmail();
            }}
            className="w-full flex items-center gap-3 p-4 bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors text-left"
          >
            <div className="size-10 shrink-0 flex items-center justify-center">
              <svg className="size-8" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">
                Google / Gmail
              </div>
              {gmailConnected && connectedEmail && (
                <div className="text-xs text-text-muted">{connectedEmail}</div>
              )}
            </div>
            {gmailConnected && (
              <CheckCircle className="size-5 text-success shrink-0" />
            )}
          </button>

          {gmailStatus && (
            <div className={`border rounded-md p-3 flex items-start gap-2 ${
              gmailStatus.includes("success")
                ? "bg-success-light/10 border-success/20"
                : "bg-error-light/10 border-error/20"
            }`}>
              {gmailStatus.includes("success") ? (
                <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-4 text-error shrink-0 mt-0.5" />
              )}
              <p className={`text-xs ${
                gmailStatus.includes("success") ? "text-success-dark" : "text-error"
              }`}>
                {gmailStatus}
              </p>
            </div>
          )}

          {gmailConnected && (
            <div className="bg-success-light/10 border border-success/20 rounded-md p-3 flex items-start gap-2">
              <Info className="size-4 text-success shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary">
                In demo mode. In production, you&apos;ll be redirected to Google&apos;s OAuth flow
                to grant read and reply permissions.
              </p>
            </div>
          )}

          {/* Non-Gmail expandable */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowNonGmail(!showNonGmail)}
              className="w-full flex items-center gap-2 p-4 hover:bg-surface/80 transition-colors text-left"
            >
              {showNonGmail ? (
                <ChevronDown className="size-4 text-text-muted shrink-0" />
              ) : (
                <ChevronRight className="size-4 text-text-muted shrink-0" />
              )}
              <span className="text-sm text-text-primary font-medium">
                Yahoo, Outlook, or other IMAP
              </span>
            </button>

            {showNonGmail && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                {!selectedProvider ? (
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "yahoo", label: "Yahoo Mail" },
                      { id: "outlook", label: "Outlook / Hotmail" },
                      { id: "imap", label: "Other (Custom IMAP)" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProvider(p.id)}
                        className="flex items-center gap-3 p-3 bg-surface border border-border rounded-md hover:border-primary/50 transition-colors text-left"
                      >
                        <div className="size-8 rounded-md bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                          {p.label[0]}
                        </div>
                        <span className="text-sm text-text-primary">{p.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">
                        {selectedProvider === "yahoo" ? "Yahoo Mail" :
                         selectedProvider === "outlook" ? "Outlook / Hotmail" :
                         "Custom IMAP"}
                      </span>
                      <button
                        onClick={() => { setSelectedProvider(null); setImapStatus(null); }}
                        className="text-xs text-text-muted hover:text-text-primary"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={imapEmail}
                        onChange={(e) => setImapEmail(e.target.value)}
                        placeholder="you@yahoo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        App Password
                      </label>
                      <Input
                        type="password"
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx"
                      />
                      <p className="text-xs text-text-muted mt-1">
                        Generate from your provider&apos;s security settings.
                      </p>
                    </div>

                    {selectedProvider === "imap" && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">
                            IMAP Host
                          </label>
                          <Input
                            type="text"
                            value={customHost}
                            onChange={(e) => setCustomHost(e.target.value)}
                            placeholder="imap.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">
                            IMAP Port
                          </label>
                          <Input
                            type="number"
                            value={customPort}
                            onChange={(e) => setCustomPort(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {imapStatus === "success" && (
                      <div className="flex items-center gap-2 bg-success-light/10 border border-success/20 rounded-md p-2 text-xs text-success-dark">
                        <CheckCircle className="size-4 shrink-0" />
                        Connected!
                      </div>
                    )}

                    {imapStatus === "error" && (
                      <div className="flex items-center gap-2 bg-error-light/10 border border-error/20 rounded-md p-2 text-xs text-error">
                        <XCircle className="size-4 shrink-0" />
                        Connection failed. Check your app password.
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={handleConnectImap}
                      disabled={imapConnecting || !imapEmail || !appPassword}
                    >
                      {imapConnecting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="size-[18px]" />
            Back
          </Button>
          <Button onClick={onNext} size="lg" className="flex-[2]">
            {gmailConnected || imapStatus === "success" ? "Continue" : "Skip for now"}
            <ArrowRight className="size-[18px]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

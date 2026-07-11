"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsCard } from "@/components/ui/settings-card";
import { Toggle } from "@/components/ui/toggle";
import { InboxConnectButton } from "@/components/gmail/InboxConnectButton";
import { Input } from "@/components/ui/input";
import { Mail, Send, Info, Loader2, ChevronDown, ChevronRight, CheckCircle, XCircle } from "lucide-react";

type ImapProviderType = "yahoo" | "outlook" | "imap";

const IMAP_PROVIDERS: { id: ImapProviderType; label: string; host?: string; port?: number; icon: string }[] = [
  { id: "yahoo", label: "Yahoo Mail", host: "imap.mail.yahoo.com", port: 993, icon: "Y" },
  { id: "outlook", label: "Outlook / Hotmail", host: "outlook.office365.com", port: 993, icon: "O" },
  { id: "imap", label: "Other (Custom IMAP)", icon: "O" },
];

export function InboxConnection() {
  const router = useRouter();
  const connection = useQuery(api.inboxConnections.getConnection);
  const disconnect = useMutation(api._gmailHelpers.disconnectGmail);
  const connectImap = useMutation(api.inboxConnections.connectImap);
  const disconnectImap = useMutation(api.inboxConnections.disconnectImap);
  const sendMockEmail = useMutation(api.emails.triggerMockEmail);

  const [mockMode, setMockMode] = useState(false);
  const [showMockForm, setShowMockForm] = useState(false);
  const [mockFrom, setMockFrom] = useState("");
  const [mockSubject, setMockSubject] = useState("");
  const [mockBody, setMockBody] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [sendingPreset, setSendingPreset] = useState<string | null>(null);

  const [showNonGmail, setShowNonGmail] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ImapProviderType | null>(null);
  const [imapEmail, setImapEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [customHost, setCustomHost] = useState("");
  const [customPort, setCustomPort] = useState("993");
  const [imapConnecting, setImapConnecting] = useState(false);
  const [imapStatus, setImapStatus] = useState<string | null>(null);

  const connected = connection?.is_active ?? false;
  const connectedEmail = connection?.email ?? null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmail = params.get("gmail");
    if (gmail === "connected") {
      setStatusMsg("Gmail inbox connected successfully!");
      const url = new URL(window.location.href);
      url.searchParams.delete("gmail");
      router.replace(url.pathname + url.search);
    } else if (gmail === "error") {
      setStatusMsg("Failed to connect Gmail inbox. Please try again.");
      const url = new URL(window.location.href);
      url.searchParams.delete("gmail");
      router.replace(url.pathname + url.search);
    } else if (gmail === "no_client") {
      setStatusMsg("Gmail API not configured. Use Mock Inbox for testing.");
      const url = new URL(window.location.href);
      url.searchParams.delete("gmail");
      router.replace(url.pathname + url.search);
    }
  }, [router]);

  const handleConnect = () => {
    posthog.capture("inbox_connected", { provider: "gmail" });
    window.location.href = "/api/gmail/auth?state=/dashboard/settings";
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      posthog.capture("inbox_connected", { provider: "gmail", action: "disconnect" });
    } catch (err) {
      console.error("[InboxConnection] disconnect failed", err);
    }
  };

  const handleMockToggle = () => {
    const next = !mockMode;
    setMockMode(next);
    posthog.capture("mock_inbox_toggled", { enabled: next });
    if (!next) {
      setShowMockForm(false);
    }
  };

  const handleSendMock = async () => {
    if (!mockFrom || !mockSubject || !mockBody) return;
    setSending(true);
    try {
      await sendMockEmail({
        from: mockFrom,
        subject: mockSubject,
        body: mockBody,
      });
      setMockFrom("");
      setMockSubject("");
      setMockBody("");
      setShowMockForm(false);
      setStatusMsg("Test email sent! Check the Triage Feed.");
    } catch (err) {
      console.error("[InboxConnection] mock send failed", err);
      setStatusMsg("Failed to send test email.");
    } finally {
      setSending(false);
    }
  };

  const handleConnectImap = async () => {
    if (!selectedProvider || !imapEmail || !appPassword) return;
    setImapConnecting(true);
    setImapStatus(null);
    try {
      const args: Record<string, unknown> = {
        provider: selectedProvider,
        email: imapEmail,
        appPassword,
      };
      if (selectedProvider === "imap") {
        args.imapHost = customHost || undefined;
        args.imapPort = customPort ? parseInt(customPort, 10) : undefined;
      }
      await connectImap(args as any);
      posthog.capture("inbox_connected", { provider: selectedProvider });
      setImapStatus("success");
      setTimeout(() => {
        setShowNonGmail(false);
        setSelectedProvider(null);
        setImapEmail("");
        setAppPassword("");
        setCustomHost("");
        setCustomPort("993");
        setImapStatus(null);
      }, 1500);
    } catch (err) {
      console.error("[InboxConnection] imap connect failed", err);
      setImapStatus("error");
    } finally {
      setImapConnecting(false);
    }
  };

  const handleDisconnectImap = async (provider: string) => {
    try {
      await disconnectImap({ provider });
      posthog.capture("inbox_connected", { provider, action: "disconnect" });
    } catch (err) {
      console.error("[InboxConnection] imap disconnect failed", err);
    }
  };

  const DEMO_PRESETS = [
    {
      name: "Order Status",
      from: "sarah.jones@gmail.com",
      subject: "Where is my order?",
      body: "Hi, I placed an order (#ORD-12345) on Monday and haven't received any shipping updates yet. Can you tell me the status of my order? I paid for express shipping. Thanks!",
    },
    {
      name: "Angry Customer",
      from: "mike.chen@outlook.com",
      subject: "URGENT: Terrible service - need refund",
      body: "This is absolutely unacceptable. I've been waiting 3 weeks for my order and nobody has responded to my emails. I want a full refund immediately or I'm filing a chargeback. Your company is a scam.",
    },
    {
      name: "Refund Request",
      from: "emma.wilson@yahoo.com",
      subject: "Request for refund on damaged item",
      body: "Hello, I received my order today but the product was damaged during shipping. I'd like to request a refund or replacement. I have photos of the damage. Order #ORD-67890. Thank you.",
    },
    {
      name: "Technical Bug",
      from: "alex.dev@company.com",
      subject: "Bug report: App crashes on login",
      body: "Hi support team, I'm experiencing a critical bug. Every time I try to log in to the mobile app (iOS 17.5), the app crashes immediately after entering my credentials. I've tried reinstalling but the issue persists. This is blocking my work. Please help!",
    },
  ];

  const handleSendPreset = async (preset: typeof DEMO_PRESETS[0]) => {
    setSendingPreset(preset.name);
    try {
      await sendMockEmail({
        from: preset.from,
        subject: preset.subject,
        body: preset.body,
      });
      setStatusMsg(`Demo email "${preset.name}" sent! Check the Triage Feed.`);
    } catch (err) {
      console.error("[InboxConnection] preset send failed", err);
      setStatusMsg("Failed to send demo email.");
    } finally {
      setSendingPreset(null);
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
      {statusMsg && (
        <div className="mb-4 bg-success-light/10 border border-success/20 rounded-lg p-3 text-xs text-text-secondary">
          {statusMsg}
          <button
            onClick={() => setStatusMsg(null)}
            className="ml-2 text-text-muted hover:text-text-primary"
          >
            &times;
          </button>
        </div>
      )}

      {/* Gmail */}
      {connected ? (
        <div>
          <InboxConnectButton connected={true} email={connectedEmail} onToggle={handleDisconnect} />
          <div className="mt-3 bg-success-light/10 border border-success/20 rounded-lg p-3 flex items-start gap-2">
            <Info className="size-4 text-success shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary">
              Connected to Gmail. Emails will be read and processed automatically.
            </p>
          </div>
        </div>
      ) : (
        <InboxConnectButton connected={false} email={null} onToggle={handleConnect} />
      )}

      {/* Non-Gmail expandable section */}
      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={() => setShowNonGmail(!showNonGmail)}
          className="flex items-center gap-2 w-full text-left"
        >
          {showNonGmail ? (
            <ChevronDown className="size-4 text-text-muted" />
          ) : (
            <ChevronRight className="size-4 text-text-muted" />
          )}
          <span className="text-sm text-text-primary font-medium">
            Connect Yahoo, Outlook, or other IMAP inbox
          </span>
        </button>
        <p className="text-xs text-text-muted ml-6 mt-0.5">
          Requires an app password from your email provider.
        </p>

        {showNonGmail && (
          <div className="mt-4 ml-6 space-y-4">
            {!selectedProvider ? (
              <div className="grid grid-cols-1 gap-2">
                {IMAP_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProvider(p.id)}
                    className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors text-left"
                  >
                    <div className="size-8 rounded-md bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {p.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {p.label}
                      </div>
                      {p.host && (
                        <div className="text-xs text-text-muted">
                          {p.host}:{p.port}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {IMAP_PROVIDERS.find((p) => p.id === selectedProvider)?.label}
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
                    Generate from your provider&apos;s security/app password settings.
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
                    Connected successfully! Emails will be polled automatically.
                  </div>
                )}

                {imapStatus === "error" && (
                  <div className="flex items-center gap-2 bg-error-light/10 border border-error/20 rounded-md p-2 text-xs text-error">
                    <XCircle className="size-4 shrink-0" />
                    Failed to connect. Check your app password and try again.
                  </div>
                )}

                <div className="flex gap-2 pt-1">
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setShowNonGmail(false); setSelectedProvider(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mock Inbox */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-text-muted" />
            <span className="text-sm text-text-primary font-medium">
              Use Mock Inbox for testing
            </span>
          </div>
          <Toggle checked={mockMode} onChange={handleMockToggle} />
        </div>
        <p className="text-xs text-text-muted mt-1.5">
          Simulate incoming emails for testing without a real connection.
        </p>

        {mockMode && (
          <div className="mt-4 space-y-3">
            {!showMockForm ? (
              <Button size="sm" className="gap-1.5" onClick={() => setShowMockForm(true)}>
                <Send className="size-3.5" />
                Send Test Email
              </Button>
            ) : (
              <div className="bg-bg-primary border border-border rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    From
                  </label>
                  <input
                    type="text"
                    value={mockFrom}
                    onChange={(e) => setMockFrom(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={mockSubject}
                    onChange={(e) => setMockSubject(e.target.value)}
                    placeholder="Where is my order?"
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Body
                  </label>
                  <textarea
                    value={mockBody}
                    onChange={(e) => setMockBody(e.target.value)}
                    placeholder="I placed an order on Monday and haven't received any shipping updates..."
                    rows={3}
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={handleSendMock}
                    disabled={sending || !mockFrom || !mockSubject || !mockBody}
                    className="gap-1.5"
                  >
                    {sending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    {sending ? "Sending..." : "Send"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMockForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-text-muted mb-2">
                Quick Demo Presets
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendPreset(preset)}
                    disabled={sendingPreset !== null}
                    className="gap-1.5 text-xs justify-start"
                  >
                    {sendingPreset === preset.name ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Send className="size-3" />
                    )}
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}

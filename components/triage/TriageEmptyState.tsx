import { MailQuestion, MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type TriageEmptyStateProps = {
  hasConnection: boolean;
  connectionLabel?: string | null;
};

export function TriageEmptyState({
  hasConnection,
  connectionLabel,
}: TriageEmptyStateProps) {
  if (hasConnection) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Waiting for emails
        </h3>
        <p className="text-sm text-text-secondary mb-2 max-w-sm">
          Your inbox is connected{connectionLabel ? ` (${connectionLabel})` : ""}.
          New emails will appear here as they are processed.
        </p>
        <p className="text-xs text-text-muted">
          TriageAI is listening — send a test email below to verify.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MailQuestion className="size-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        No emails processed yet
      </h3>
      <p className="text-sm text-text-secondary mb-6 max-w-sm">
        Connect your inbox to get started. TriageAI will automatically classify
        and respond to incoming emails.
      </p>
      <Button asChild>
        <Link href="/dashboard/settings">Connect Inbox</Link>
      </Button>
    </div>
  );
}

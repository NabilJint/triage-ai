"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/triage/StatusBadge";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import posthog from "posthog-js";

type EscalationCardProps = {
  escalationId: Id<"escalations">;
  priority: string;
  status: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export function EscalationCard({
  escalationId,
  priority,
  status: initialStatus,
  resolvedAt: initialResolvedAt,
  resolutionNote: initialNote,
}: EscalationCardProps) {
  const [note, setNote] = useState(initialNote ?? "");
  const [status, setStatus] = useState(initialStatus);
  const [resolvedAt, setResolvedAt] = useState(initialResolvedAt);
  const [isResolving, setIsResolving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const resolveEscalation = useMutation(api.decisions.resolveEscalation);

  const isResolved = status === "resolved";

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const showFeedback = useCallback((type: "success" | "error", message: string) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ type, message });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3000);
  }, []);

  const handleResolve = useCallback(async () => {
    if (isResolving) return;

    setIsResolving(true);
    setFeedback(null);

    try {
      await resolveEscalation({ escalationId, resolutionNote: note });
      setStatus("resolved");
      setResolvedAt(new Date().toISOString());
      showFeedback("success", "Escalation resolved");
      posthog.capture("triage_resolved", { escalationId: String(escalationId) });
    } catch (err) {
      showFeedback("error", "Failed to resolve escalation");
    } finally {
      setIsResolving(false);
    }
  }, [escalationId, note, isResolving, resolveEscalation, showFeedback]);

  return (
    <CardContainer containerClassName="py-0 w-full" className="w-full">
      <CardBody className="w-full h-auto p-0 [transform-style:preserve-3d]">
        <CardItem
          translateZ={20}
          className="w-full bg-surface border border-border rounded-xl p-6 shadow-card"
        >
          <CardItem translateZ={30} className="w-full">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">
                Resolution Status
              </h3>
              <div className="flex items-center gap-2">
                <PriorityBadge value={priority} />
                <StatusBadge type="status" value={status} />
              </div>
            </div>
          </CardItem>

          {resolvedAt && (
            <div className="text-xs text-text-muted">
              Resolved{" "}
              {new Date(resolvedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          )}

          <div>
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">
              Internal Notes
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              disabled={isResolved}
              placeholder="Add resolution notes here..."
              className={cn(
                "w-full p-3 border border-border rounded-lg bg-surface-secondary text-sm text-text-primary resize-none placeholder:text-text-muted",
                isResolved
                  ? "cursor-default"
                  : "focus:border-secondary focus:ring-1 focus:ring-secondary",
              )}
            />
          </div>

          {feedback && (
            <div
              className={cn(
                "text-xs px-3 py-1.5 rounded-md",
                feedback.type === "success"
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error",
              )}
            >
              {feedback.message}
            </div>
          )}

          {!isResolved && (
            <button
              type="button"
              disabled={isResolving}
              onClick={handleResolve}
              className={cn(
                "w-full py-3 border border-success text-success rounded-lg text-xs font-medium transition-colors flex justify-center items-center gap-2",
                !isResolving
                  ? "hover:bg-success/10"
                  : "opacity-50 cursor-not-allowed",
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isResolving ? "hourglass_empty" : "check_circle"}
              </span>
              {isResolving ? "Resolving..." : "Mark as Resolved"}
            </button>
          )}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

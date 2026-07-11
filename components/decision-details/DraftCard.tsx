"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import posthog from "posthog-js";

type DraftCardProps = {
  decisionId: Id<"triageDecisions">;
  draftText: string;
  action: "auto_reply" | "escalate";
  emailStatus?: string | null;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export function DraftCard({ decisionId, draftText, action, emailStatus }: DraftCardProps) {
  const [draft, setDraft] = useState(draftText);
  const [isEditing, setIsEditing] = useState(!draftText);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(emailStatus === "replied");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const updateDraft = useMutation(api.decisions.updateDraft);
  const regenerateDraft = useAction(api.agent.regenerateDraft.regenerateDraft);
  const sendReply = useAction(api.gmailAccounts.sendReply);

  const isAutoReply = action === "auto_reply";
  const isEmpty = !draftText;
  const hasChanges = draft !== draftText;

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  useEffect(() => {
    setDraft(draftText);
    setIsEditing(!draftText);
  }, [draftText]);

  const showFeedback = useCallback((type: "success" | "error", message: string) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ type, message });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3000);
  }, []);

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      await updateDraft({ decisionId, draftText: draft });
      setIsEditing(false);
      showFeedback("success", "Draft saved");
      posthog.capture("draft_edited", { decisionId: String(decisionId) });
    } catch (err) {
      showFeedback("error", "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  }, [decisionId, draft, hasChanges, isSaving, updateDraft, showFeedback]);

  const handleRegenerate = useCallback(async () => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    setFeedback(null);

    try {
      const result = await regenerateDraft({ decisionId });
      if (result?.success) {
        showFeedback("success", "Draft regenerated");
      }
    } catch (err) {
      showFeedback("error", "Failed to regenerate draft");
    } finally {
      setIsRegenerating(false);
    }
  }, [decisionId, isRegenerating, regenerateDraft, showFeedback]);

  const handleSend = useCallback(async () => {
    if (!draft.trim() || isSending) return;

    setIsSending(true);
    setFeedback(null);

    try {
      // Save draft first if there are unsaved changes
      if (hasChanges) {
        await updateDraft({ decisionId, draftText: draft });
      }

      await sendReply({ decisionId, draftText: draft });
      setIsSent(true);
      showFeedback("success", "Reply sent!");
      posthog.capture("email_sent", { decisionId: String(decisionId) });
    } catch (err) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setIsSending(false);
    }
  }, [decisionId, draft, hasChanges, isSending, sendReply, updateDraft, showFeedback]);

  return (
    <CardContainer containerClassName="py-0 w-full" className="w-full">
      <CardBody className="w-full h-auto p-0 [transform-style:preserve-3d]">
        <CardItem
          translateZ={20}
          className={cn(
            "w-full bg-surface border border-border rounded-xl p-6 shadow-card border-l-4",
            isAutoReply ? "border-success" : "border-primary",
          )}
        >
          <CardItem translateZ={30} className="w-full">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "material-symbols-outlined text-[20px]",
                  isAutoReply ? "text-success" : "text-primary",
                )}
              >
                {isAutoReply ? "check_circle" : "auto_fix_high"}
              </span>
              <h2 className="text-lg font-semibold text-text-primary">
                {isAutoReply ? "AI Sent Reply" : "Draft Reply"}
              </h2>
            </div>
          </CardItem>

          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (!isEditing) setIsEditing(true);
            }}
            rows={6}
            readOnly={isAutoReply || isSent}
            placeholder={isEmpty ? "Write your reply here..." : undefined}
            className={cn(
              "w-full p-4 border border-border rounded-lg text-sm text-text-primary resize-none",
              isAutoReply || isSent
                ? "bg-surface-secondary cursor-default"
                : "bg-surface-secondary focus:border-secondary focus:ring-1 focus:ring-secondary",
              isEmpty && !isAutoReply && "placeholder:text-text-muted",
            )}
          />

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

          <div className="flex justify-end gap-3">
            {isAutoReply ? (
              <>
                <button
                  type="button"
                  disabled={isSaving || isRegenerating}
                  onClick={handleSave}
                  className={cn(
                    "px-4 py-2 border border-border text-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                    hasChanges && !isSaving
                      ? "hover:bg-surface-secondary"
                      : "opacity-50 cursor-not-allowed",
                  )}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isSaving ? "hourglass_empty" : "edit"}
                  </span>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                {isSent ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-success text-white rounded-lg text-xs font-medium opacity-50 cursor-not-allowed flex items-center gap-2"
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      send
                    </span>
                    Sent
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!draft.trim() || isSaving || isRegenerating || isSending}
                    onClick={handleSend}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                      draft.trim() && !isSaving && !isRegenerating && !isSending
                        ? "bg-primary text-white hover:bg-primary-dark"
                        : "bg-surface-secondary text-text-muted cursor-not-allowed",
                    )}
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isSending ? "hourglass_empty" : "send"}
                    </span>
                    {isSending ? "Sending..." : "Send Reply"}
                  </button>
                )}
              </>
            ) : (
              <>
                {isSent ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-success text-white rounded-lg text-xs font-medium opacity-50 cursor-not-allowed flex items-center gap-2"
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      send
                    </span>
                    Sent
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isRegenerating || isSaving}
                      onClick={handleRegenerate}
                      className={cn(
                        "px-4 py-2 border border-border text-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                        !isRegenerating && !isSaving
                          ? "hover:bg-surface-secondary"
                          : "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <span
                        className={cn(
                          "material-symbols-outlined text-[16px]",
                          isRegenerating && "animate-spin",
                        )}
                      >
                        refresh
                      </span>
                      {isRegenerating ? "Regenerating..." : "Regenerate"}
                    </button>
                    {hasChanges && (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSave}
                        className={cn(
                          "px-4 py-2 border border-secondary text-secondary rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                          !isSaving
                            ? "hover:bg-secondary/10"
                            : "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isSaving ? "hourglass_empty" : "save"}
                        </span>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!draft.trim() || isSaving || isRegenerating || isSending}
                      onClick={handleSend}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
                        draft.trim() && !isSaving && !isRegenerating && !isSending
                          ? "bg-primary text-white hover:bg-primary-dark"
                          : "bg-surface-secondary text-text-muted cursor-not-allowed",
                      )}
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isSending ? "hourglass_empty" : "send"}
                      </span>
                      {isSending ? "Sending..." : "Send Reply"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

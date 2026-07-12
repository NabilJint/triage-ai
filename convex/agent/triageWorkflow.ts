"use node";

import { v } from "convex/values";
import { StateGraph, START, END } from "@langchain/langgraph";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { classifyEmailNode } from "./classifyEmail";
import { draftReplyNode } from "./draftReply";
import { generateEmbedding } from "../../lib/amd-cloud";
import { getPostHogServerClient } from "../../lib/posthog-server";

export type TriageState = {
  email: Doc<"emails"> | null;
  businessName: string | null;
  businessContext: string | null;
  escalationRules: any[];
  replyTone: string;
  similarInteractions: {
    subject: string;
    body: string;
    status: string;
    score: number;
  }[];
  classification?: string;
  confidence?: number;
  reasoning?: string;
  modelUsed?: string;
  shouldEscalate?: boolean;
  action?: "auto_reply" | "escalate";
  draftText?: string;
  priority?: "low" | "medium" | "high" | "urgent";
};

const CONFIDENCE_THRESHOLD = 0.7;

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

async function escalateNode(state: TriageState): Promise<Partial<TriageState>> {
  let highestPriority: "low" | "medium" | "high" | "urgent" = "medium";

  const rules: any[] = state.escalationRules ?? [];
  const email = state.email;
  const body = (email?.body ?? "").toLowerCase();
  const subject = (email?.subject ?? "").toLowerCase();
  const confidence = state.confidence ?? 0;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    let matched = false;

    if (rule.condition === "contains") {
      const val = String(rule.value).toLowerCase();
      matched = body.includes(val) || subject.includes(val);
    } else if (rule.condition === "confidence_below") {
      matched = confidence < Number(rule.value);
    }

    if (matched) {
      const rank = PRIORITY_RANK[rule.priority] ?? 99;
      if (rank < (PRIORITY_RANK[highestPriority] ?? 99)) {
        highestPriority = rule.priority;
      }
    }
  }

  return { action: "escalate", priority: highestPriority };
}

function decideNext(state: TriageState): string {
  if (state.shouldEscalate || (state.confidence ?? 0) < CONFIDENCE_THRESHOLD) {
    return "escalate";
  }
  return "draft";
}

export const triageWorkflow = internalAction({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    try {
      const emailData = await ctx.runQuery(
        internal.agent._helpers.getEmailForProcessing,
        {
          emailId: args.emailId,
        },
      );
      if (!emailData) throw new Error(`Email ${args.emailId} not found`);

      // Skip if already processed (prevents duplicate triage from scheduler retries)
      if (emailData.email.status !== "pending") {
        return;
      }

      // Skip replies (Re: prefix means it's a response, not a new thread)
      // This prevents feedback loops when auto-replying to our own inbox
      const isReply = emailData.email.subject?.toLowerCase().startsWith("re:");
      if (isReply) {
        return;
      }

      // Skip self-sends (prevents infinite loop when connected inbox emails itself)
      if (emailData.userEmail && emailData.email.from_email === emailData.userEmail) {
        return;
      }

      // Explicit AMD ROCm embedding step — runs before workflow for context
      let similarInteractions: {
        subject: string;
        body: string;
        status: string;
        score: number;
      }[] = [];

      let currentEmbedding: number[] | null = null;
      try {
        // Check for existing embedding for this customer
        const existingEmbedding = await ctx.runQuery(
          internal.agent._helpers.getCustomerEmbedding,
          { emailAddress: emailData.email.from_email },
        );

        if (existingEmbedding) {
          currentEmbedding = existingEmbedding.embedding;
        } else {
          const embeddingText = `${emailData.email.subject} ${emailData.email.body}`;
          currentEmbedding = await generateEmbedding(embeddingText);

          await ctx.runMutation(internal.agent._helpers.upsertCustomerEmbedding, {
            emailId: args.emailId,
            emailAddress: emailData.email.from_email,
            embedding: currentEmbedding,
          });
        }

        // Find similar past emails
        const similar = await ctx.runQuery(
          internal.agent._helpers.getSimilarEmails,
          {
            userId: emailData.email.user_id,
            currentEmailId: args.emailId,
            embedding: currentEmbedding,
          },
        );
        similarInteractions = similar;

        if (!existingEmbedding) {
          const posthogEmbed = getPostHogServerClient();
          if (posthogEmbed) {
            try {
              posthogEmbed.capture({
                distinctId: emailData.email.user_id,
                event: "embedding_generated",
                properties: {
                  emailId: args.emailId,
                  hardware: "AMD Instinct GPU with ROCm",
                  model: "intfloat/e5-large-v2",
                  provider: process.env.LLM_PROVIDER ?? "gemma",
                  similarCount: similar.length,
                },
              });
            } finally {
              await posthogEmbed.shutdown();
            }
          }
        }
      } catch (embeddingError) {
        console.error(
          "[triageWorkflow] Embedding generation failed:",
          embeddingError,
        );
      }

      const workflow = new StateGraph({
        channels: {
          email: null,
          businessName: null,
          businessContext: null,
          escalationRules: null,
          replyTone: null,
          similarInteractions: null,
          classification: null,
          confidence: null,
          reasoning: null,
          modelUsed: null,
          shouldEscalate: null,
          action: null,
          draftText: null,
          priority: null,
        } as any,
      }) as any;

      workflow.addNode("classify", classifyEmailNode);
      workflow.addNode("draft", draftReplyNode);
      workflow.addNode("escalate", escalateNode);

      workflow.addEdge(START, "classify");
      workflow.addConditionalEdges("classify", decideNext);
      workflow.addEdge("draft", END);
      workflow.addEdge("escalate", END);

      const app = workflow.compile();
      const result = (await app.invoke({
        email: emailData.email,
        businessName: emailData.businessName,
        businessContext: emailData.businessContext,
        escalationRules: emailData.escalationRules,
        replyTone: emailData.replyTone,
        similarInteractions,
      })) as TriageState;

      const confidence = result.confidence ?? 0;
      const action =
        result.shouldEscalate || confidence < CONFIDENCE_THRESHOLD
          ? "escalate"
          : "auto_reply";

      const decisionId = await ctx.runMutation(
        internal.agent._helpers.saveTriageDecision,
        {
          emailId: args.emailId,
          classification: result.classification ?? "other",
          confidence,
          action,
          draftText: result.draftText,
          reasoning: result.reasoning ?? "",
          modelUsed: result.modelUsed ?? "unknown",
          priority: result.priority,
        },
      );

      if (action === "auto_reply" && result.draftText) {
        try {
          await ctx.runAction(api.gmailAccounts.sendReply, {
            decisionId,
            draftText: result.draftText,
          });
        } catch (sendErr) {
          console.error(
            `[triageWorkflow] Auto-send failed for email ${args.emailId}:`,
            sendErr,
          );
        }
      }

      const posthog = getPostHogServerClient();

      if (posthog) {
        posthog.capture({
          distinctId: emailData.email.user_id,
          event: "email_ingested",
          properties: {
            emailId: args.emailId,
            from: emailData.email.from_email,
            subject: emailData.email.subject,
          },
        });
        posthog.capture({
          distinctId: emailData.email.user_id,
          event: "email_classified",
          properties: {
            emailId: args.emailId,
            classification: result.classification ?? "other",
            confidence,
            action,
            modelUsed: result.modelUsed ?? "unknown",
          },
        });
        if (action === "auto_reply" && result.draftText) {
          posthog.capture({
            distinctId: emailData.email.user_id,
            event: "email_auto_replied",
            properties: {
              emailId: args.emailId,
              classification: result.classification ?? "other",
              confidence,
              modelUsed: result.modelUsed ?? "unknown",
            },
          });
        }
        if (action === "escalate") {
          posthog.capture({
            distinctId: emailData.email.user_id,
            event: "email_escalated",
            properties: {
              emailId: args.emailId,
              classification: result.classification ?? "other",
              priority: result.priority ?? "medium",
              modelUsed: result.modelUsed ?? "unknown",
            },
          });
        }
        await posthog.shutdown();
      }
    } catch (error) {
      console.error(
        `[triageWorkflow] Failed for email ${args.emailId}:`,
        error,
      );
      try {
        await ctx.runMutation(internal.agent._helpers.markEmailFailed, {
          emailId: args.emailId,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        });
      } catch (patchErr) {
        console.error(
          `[triageWorkflow] Failed to mark email ${args.emailId} as failed:`,
          patchErr,
        );
      }
    }
  },
});

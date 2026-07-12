import { v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";
import { cosineSimilarity } from "../../lib/similarity";

export const getEmailForProcessing = internalQuery({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    const email = await ctx.db
      .query("emails")
      .filter((q) => q.eq(q.field("_id"), args.emailId))
      .first();
    if (!email) return null;

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        // Convex withIndex types don't cross-reference between tables cleanly —
      // `email.user_id` is typed as `Id<"users">` which matches the `authUserId`
      // index on `userProfiles`, but the generic inference in Convex's `q.eq()`
      // can't verify this statically across table boundaries.
      q.eq("authUserId", email.user_id as any),
      )
      .first();

    // Get user's connected Gmail email to detect self-sends
    const gmailAccount = await ctx.db
      .query("gmailAccounts")
      .withIndex("by_user", (q) => q.eq("user_id", email.user_id))
      .first();

    return {
      email,
      businessName: userProfile?.business_name ?? null,
      businessContext: userProfile?.business_context ?? null,
      escalationRules: (userProfile?.escalation_rules as any[]) ?? [],
      replyTone: userProfile?.reply_tone ?? "professional",
      userEmail: gmailAccount?.gmail_email ?? null,
    };
  },
});

export const saveTriageDecision = internalMutation({
  args: {
    emailId: v.id("emails"),
    classification: v.string(),
    confidence: v.float64(),
    action: v.string(),
    draftText: v.optional(v.string()),
    reasoning: v.string(),
    modelUsed: v.string(),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = await ctx.db
      .query("emails")
      .filter((q) => q.eq(q.field("_id"), args.emailId))
      .first();
    if (!email) throw new Error("Email not found");

    // Deduplication: skip if this email already has a decision
    const existingDecision = await ctx.db
      .query("triageDecisions")
      .withIndex("by_email", (q) => q.eq("email_id", args.emailId))
      .first();
    if (existingDecision) {
      return existingDecision._id;
    }

    const now = new Date().toISOString();

    const decisionId = await ctx.db.insert("triageDecisions", {
      user_id: email.user_id,
      email_id: args.emailId,
      classification: args.classification,
      confidence: args.confidence,
      action: args.action,
      draft_text: args.draftText,
      reasoning: args.reasoning,
      model_used: args.modelUsed,
      created_at: now,
      processed_at: now,
    });

    if (args.action === "escalate") {
      await ctx.db.insert("escalations", {
        user_id: email.user_id,
        decision_id: decisionId,
        priority: args.priority ?? "medium",
        status: "pending",
        created_at: now,
      });
    }

    await ctx.db.patch(email._id, { status: "processed" });

    return decisionId;
  },
});

export const markEmailFailed = internalMutation({
  args: {
    emailId: v.id("emails"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.emailId);
    if (!email) return;
    const currentRetries = (email.retry_count ?? 0) + 1;
    await ctx.db.patch(args.emailId, {
      status: "error",
      retry_count: currentRetries,
    });
  },
});

export const resetEmailStatus = internalMutation({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.emailId, {
      status: "pending",
      retry_count: 0,
    });
  },
});

export const getFailedEmailsForRetry = internalQuery({
  args: {},
  handler: async (ctx) => {
    const failedEmails = await ctx.db
      .query("emails")
      .filter((q) => q.eq(q.field("status"), "error"))
      .collect();

    return failedEmails;
  },
});

export const getDecisionForSend = internalQuery({
  args: { decisionId: v.id("triageDecisions") },
  handler: async (ctx, args) => {
    const decision = await ctx.db.get(args.decisionId);
    if (!decision) return null;

    const email = await ctx.db.get(decision.email_id);
    if (!email) return null;

    return {
      userId: decision.user_id,
      decision,
      email,
    };
  },
});

export const markEmailReplied = internalMutation({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.emailId, { status: "replied" });
  },
});

export const getCustomerEmbedding = internalQuery({
  args: { emailAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerEmbeddings")
      .withIndex("by_email", (q) => q.eq("email_address", args.emailAddress))
      .first();
  },
});

export const upsertCustomerEmbedding = internalMutation({
  args: {
    emailId: v.id("emails"),
    emailAddress: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customerEmbeddings")
      .withIndex("by_email_id", (q) => q.eq("email_id", args.emailId))
      .first();

    const now = new Date().toISOString();

    if (existing) {
      await ctx.db.patch(existing._id, {
        embedding: args.embedding,
        updated_at: now,
        used_in_query: false,
      });
    } else {
      await ctx.db.insert("customerEmbeddings", {
        email_id: args.emailId,
        email_address: args.emailAddress,
        embedding: args.embedding,
        updated_at: now,
        used_in_query: false,
      });
    }
  },
});

export const getSimilarEmails = internalQuery({
  args: {
    userId: v.id("users"),
    currentEmailId: v.id("emails"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const embeddings = await ctx.db.query("customerEmbeddings").collect();

    const scored: {
      emailId: string;
      score: number;
      subject: string;
      body: string;
      status: string;
      fromEmail: string;
      updatedAt: string;
    }[] = [];

    for (const emb of embeddings) {
      if (!emb.email_id || emb.email_id === args.currentEmailId) continue;

      const email = await ctx.db.get(emb.email_id);
      const emailDoc = email as any;

      if (!emailDoc || emailDoc.user_id !== args.userId) continue;

      const score = cosineSimilarity(args.embedding, emb.embedding);
      if (score > 0.3) {
        scored.push({
          emailId: emb.email_id as string,
          score,
          subject: emailDoc.subject,
          body: emailDoc.body.slice(0, 200),
          status: emailDoc.status,
          fromEmail: emailDoc.from_email,
          updatedAt: emb.updated_at,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  },
});

export const ingestEmail = internalMutation({
  args: {
    from_email: v.string(),
    from_name: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
    userId: v.id("users"),
    inboxConnectionId: v.id("inboxConnections"),
    gmail_message_id: v.optional(v.string()),
    thread_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Deduplication: check if this gmail_message_id was already ingested
    if (args.gmail_message_id) {
      const existing = await ctx.db
        .query("emails")
        .withIndex("by_gmail_message_id", (q) =>
          q.eq("gmail_message_id", args.gmail_message_id!),
        )
        .first();
      if (existing) {
        return existing._id;
      }
    }

    const now = new Date().toISOString();
    const emailId = await ctx.db.insert("emails", {
      user_id: args.userId,
      inbox_connection_id: args.inboxConnectionId,
      from_email: args.from_email,
      from_name: args.from_name,
      subject: args.subject,
      body: args.body,
      received_at: now,
      status: "pending",
      gmail_message_id: args.gmail_message_id,
      thread_id: args.thread_id,
    });
    return emailId;
  },
});

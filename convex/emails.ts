import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const clearData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const escalations = await ctx.db
      .query("escalations")
      .withIndex("by_user_and_status", (q) => q.eq("user_id", userId))
      .collect();
    for (const esc of escalations) {
      await ctx.db.delete(esc._id);
    }

    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();
    for (const dec of decisions) {
      await ctx.db.delete(dec._id);
    }

    const emails = await ctx.db
      .query("emails")
      .withIndex("by_user_and_received", (q) =>
        q.eq("user_id", userId),
      )
      .collect();
    for (const email of emails) {
      await ctx.db.delete(email._id);
    }

    return { cleared: true };
  },
});

export const clearTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const mockConnections = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("provider"), "mock"))
      .collect();
    const mockConnectionIds = new Set(
      mockConnections.map((c) => c._id),
    );

    if (mockConnectionIds.size === 0) return { cleared: 0 };

    const emails = await ctx.db
      .query("emails")
      .withIndex("by_user_and_received", (q) =>
        q.eq("user_id", userId),
      )
      .collect();
    const testEmails = emails.filter((e) =>
      mockConnectionIds.has(e.inbox_connection_id),
    );

    const testEmailIds = new Set(testEmails.map((e) => e._id));

    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();
    const testDecisions = decisions.filter((d) =>
      testEmailIds.has(d.email_id),
    );
    const testDecisionIds = new Set(
      testDecisions.map((d) => d._id),
    );

    const escalations = await ctx.db
      .query("escalations")
      .withIndex("by_user_and_status", (q) => q.eq("user_id", userId))
      .collect();
    for (const esc of escalations) {
      if (testDecisionIds.has(esc.decision_id)) {
        await ctx.db.delete(esc._id);
      }
    }

    for (const dec of testDecisions) {
      await ctx.db.delete(dec._id);
    }
    for (const email of testEmails) {
      await ctx.db.delete(email._id);
    }

    return { cleared: testEmails.length };
  },
});

export const triggerMockEmail = mutation({
  args: {
    from: v.string(),
    from_name: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activeConnection = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();

    let inboxConnectionId = activeConnection?._id;

    if (!inboxConnectionId) {
      const mockConnection = await ctx.db
        .query("inboxConnections")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .filter((q) => q.eq(q.field("provider"), "mock"))
        .first();

      if (mockConnection) {
        inboxConnectionId = mockConnection._id;
        await ctx.db.patch(mockConnection._id, { is_active: true });
      } else {
        inboxConnectionId = await ctx.db.insert("inboxConnections", {
          user_id: userId,
          provider: "mock",
          is_active: true,
          connected_at: new Date().toISOString(),
        });
      }
    }

    const emailId = await ctx.db.insert("emails", {
      user_id: userId,
      inbox_connection_id: inboxConnectionId,
      from_email: args.from,
      from_name: args.from_name,
      subject: args.subject,
      body: args.body,
      received_at: new Date().toISOString(),
      status: "pending",
    });

    await ctx.scheduler.runAfter(
      0,
      internal.agent.triageWorkflow.triageWorkflow,
      { emailId } as any,
    );

    return emailId;
  },
});

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const updateDraft = mutation({
  args: {
    decisionId: v.id("triageDecisions"),
    draftText: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const decision = await ctx.db.get(args.decisionId);
    if (!decision || decision.user_id !== userId) {
      throw new Error("Decision not found or access denied");
    }

    await ctx.db.patch(args.decisionId, {
      draft_text: args.draftText,
    });

    return { success: true };
  },
});

export const resolveEscalation = mutation({
  args: {
    escalationId: v.id("escalations"),
    resolutionNote: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const escalation = await ctx.db.get(args.escalationId);
    if (!escalation || escalation.user_id !== userId) {
      throw new Error("Escalation not found or access denied");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(args.escalationId, {
      status: "resolved",
      resolution_note: args.resolutionNote,
      resolved_at: now,
      resolved_by: userId,
    });

    return { success: true };
  },
});

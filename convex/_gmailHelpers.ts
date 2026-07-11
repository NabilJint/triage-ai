import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGmailAccount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("gmailAccounts")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();
  },
});

export const getGmailAccountByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gmailAccounts")
      .withIndex("by_gmail_email", (q) => q.eq("gmail_email", args.email))
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();
  },
});

export const getActiveGmailAccounts = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gmailAccounts")
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();
  },
});

export const getGmailAccountByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gmailAccounts")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();
  },
});

export const disconnectGmail = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Deactivate gmailAccount if it exists (new-style)
    const account = await ctx.db
      .query("gmailAccounts")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();

    if (account) {
      await ctx.db.patch(account._id, {
        is_active: false,
        updated_at: new Date().toISOString(),
      });

      // Schedule watch stop
      await ctx.scheduler.runAfter(
        0,
        internal.gmailAccounts._stopWatchAction,
        { userId },
      );
    }

    // Deactivate inbox connection (both legacy and new-style)
    const conn = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("user_id", userId).eq("provider", "gmail"),
      )
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();

    if (conn) {
      await ctx.db.patch(conn._id, { is_active: false });
    }

    return { userId };
  },
});

export const patchGmailAccount = internalMutation({
  args: {
    gmailAccountId: v.id("gmailAccounts"),
    patch: v.object({
      gmail_email: v.optional(v.string()),
      refresh_token: v.optional(v.string()),
      history_id: v.optional(v.string()),
      watch_expiration: v.optional(v.number()),
      is_active: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gmailAccountId, {
      ...args.patch,
      updated_at: new Date().toISOString(),
    });
  },
});

export const insertGmailAccount = internalMutation({
  args: {
    user_id: v.id("users"),
    gmail_email: v.string(),
    refresh_token: v.string(),
    history_id: v.optional(v.string()),
    watch_expiration: v.optional(v.number()),
    created_at: v.string(),
    updated_at: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("gmailAccounts", {
      ...args,
      is_active: true,
    });
  },
});

export const patchInboxConnection = internalMutation({
  args: {
    id: v.id("inboxConnections"),
    patch: v.object({
      email: v.optional(v.string()),
      is_active: v.optional(v.boolean()),
      connected_at: v.optional(v.string()),
      last_error: v.optional(v.string()),
      error_at: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.patch);
  },
});

export const insertInboxConnection = internalMutation({
  args: {
    user_id: v.id("users"),
    email: v.string(),
    connected_at: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("inboxConnections", {
      user_id: args.user_id,
      provider: "gmail",
      email: args.email,
      is_active: true,
      connected_at: args.connected_at,
    });
  },
});

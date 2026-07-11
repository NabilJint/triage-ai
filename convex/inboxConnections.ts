import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getConnection = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const connection = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();

    if (!connection) return null;

    // For Gmail, merge email from gmailAccounts
    if (connection.provider === "gmail") {
      const gmail = await ctx.db
        .query("gmailAccounts")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .filter((q) => q.eq(q.field("is_active"), true))
        .first();

      if (gmail) {
        return { ...connection, email: gmail.gmail_email };
      }
    }

    return connection;
  },
});

/**
 * Minimal Gmail connection doc for emails FK reference.
 * Credentials are NOT stored here — they live in `gmailAccounts`.
 */
export const connectGmail = mutation({
  args: {
    credentials: v.object({
      access_token: v.string(),
      refresh_token: v.optional(v.string()),
      expires_in: v.optional(v.number()),
      scope: v.optional(v.string()),
      token_type: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("provider"), "gmail"))
      .first();

    const now = new Date().toISOString();
    const patch = {
      provider: "gmail" as const,
      is_active: true,
      connected_at: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("inboxConnections", {
        user_id: userId,
        ...patch,
      });
    }

    return { userId };
  },
});

export const getActiveConnectionId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();
    return connection?._id ?? null;
  },
});

export const getConnectionForProvider = internalQuery({
  args: {
    userId: v.id("users"),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("user_id", args.userId).eq("provider", args.provider),
      )
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();
    return connection ?? null;
  },
});

export const listActiveNonWebhook = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("inboxConnections")
      .filter((q) =>
        q.and(
          q.eq(q.field("is_active"), true),
          q.neq(q.field("provider"), "gmail"),
        ),
      )
      .collect();
  },
});

export const connectImap = mutation({
  args: {
    provider: v.string(),
    email: v.string(),
    appPassword: v.string(),
    imapHost: v.optional(v.string()),
    imapPort: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("provider"), args.provider))
      .first();

    const now = new Date().toISOString();
    const credentials: Record<string, unknown> = {
      appPassword: args.appPassword,
    };
    if (args.imapHost) credentials.imapHost = args.imapHost;
    if (args.imapPort) credentials.imapPort = args.imapPort;

    const patch = {
      provider: args.provider,
      email: args.email,
      credentials,
      is_active: true,
      connected_at: now,
      last_error: undefined as string | undefined,
      error_at: undefined as string | undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("inboxConnections", {
        user_id: userId,
        ...patch,
      });
    }

    return { userId, provider: args.provider, email: args.email };
  },
});

export const disconnectImap = mutation({
  args: {
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("user_id", userId).eq("provider", args.provider),
      )
      .filter((q) => q.eq(q.field("is_active"), true))
      .first();

    if (!existing) throw new Error("No active connection found");

    await ctx.db.patch(existing._id, {
      is_active: false,
    });
  },
});

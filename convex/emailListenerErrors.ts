import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Log an email listener error
 * Called when webhook fails or email ingestion encounters an error
 */
export const logError = mutation({
  args: {
    userId: v.id("users"),
    provider: v.string(),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Insert error record
    await ctx.db.insert("emailListenerErrors", {
      user_id: args.userId,
      provider: args.provider,
      error: args.error,
      error_at: now,
      resolved: false,
    });

    // Update connection status to show error
    const connection = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("provider"), args.provider))
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        last_error: args.error,
        error_at: now,
      });
    }
  },
});

/**
 * Resolve an error (mark as resolved)
 * Called when connection is re-established
 */
export const resolveError = mutation({
  args: {
    userId: v.id("users"),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    // Mark recent errors as resolved
    const errors = await ctx.db
      .query("emailListenerErrors")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("provider"), args.provider))
      .filter((q) => q.eq(q.field("resolved"), false))
      .collect();

    const now = new Date().toISOString();
    for (const error of errors) {
      await ctx.db.patch(error._id, {
        resolved: true,
        resolved_at: now,
      });
    }

    // Clear error from connection
    const connection = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("provider"), args.provider))
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        last_error: undefined,
        error_at: undefined,
      });
    }
  },
});

/**
 * Get unresolved errors for a user
 */
export const getUnresolvedErrors = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailListenerErrors")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("resolved"), false))
      .order("desc")
      .collect();
  },
});

/**
 * Get last error for a provider
 */
export const getLastError = query({
  args: {
    userId: v.id("users"),
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailListenerErrors")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .filter((q) => q.eq(q.field("provider"), args.provider))
      .order("desc")
      .first();
  },
});

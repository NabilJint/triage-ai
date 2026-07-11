import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

function getUserId(identity: { subject: string }): string {
  return identity.subject.split("|")[0];
}

export const getByAuthUser = query({
  args: { authUserId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", args.authUserId as any),
      )
      .first();
    if (!profile) return null;
    return {
      business_name: profile.business_name ?? null,
      business_context: profile.business_context ?? null,
      reply_tone: profile.reply_tone ?? "professional",
      escalation_rules: profile.escalation_rules ?? null,
    };
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return profile ?? null;
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", getUserId(identity) as any),
      )
      .first();
    if (!profile) return null;
    return {
      ...profile,
      image: identity.pictureUrl ?? "",
      name: identity.name ?? profile.email,
    };
  },
});

export const updateBusinessContext = mutation({
  args: {
    business_name: v.string(),
    business_url: v.optional(v.string()),
    business_context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", getUserId(identity) as any),
      )
      .first();
    if (!profile) throw new Error("Profile not found");
    const now = new Date().toISOString();
    await ctx.db.patch(profile._id, {
      ...args,
      updated_at: now,
    });
  },
});

export const createUser = mutation({
  args: {
    business_name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const now = new Date().toISOString();
    const userId = await ctx.db.insert("userProfiles", {
      authUserId: getUserId(identity) as any,
      ...args,
      plan: "free",
      created_at: now,
      updated_at: now,
    });
    return userId;
  },
});

export const getEscalationRules = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", getUserId(identity) as any),
      )
      .first();
    if (!profile) return null;
    return profile.escalation_rules ?? null;
  },
});

export const saveEscalationRules = mutation({
  args: {
    rules: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", getUserId(identity) as any),
      )
      .first();
    if (!profile) throw new Error("Profile not found");
    const now = new Date().toISOString();
    await ctx.db.patch(profile._id, {
      escalation_rules: args.rules,
      updated_at: now,
    });
  },
});

export const getReplySettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", getUserId(identity) as any),
      )
      .first();
    if (!profile) return null;
    return {
      reply_tone: profile.reply_tone ?? null,
      reply_previews: profile.reply_previews ?? null,
      reply_previews_context: profile.reply_previews_context ?? null,
    };
  },
});

export const saveReplyTone = mutation({
  args: {
    tone: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", getUserId(identity) as any),
      )
      .first();
    if (!profile) throw new Error("Profile not found");
    const now = new Date().toISOString();
    await ctx.db.patch(profile._id, {
      reply_tone: args.tone,
      updated_at: now,
    });
  },
});

export const saveReplyPreviews = mutation({
  args: {
    previews: v.any(),
    contextHash: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", getUserId(identity) as any),
      )
      .first();
    if (!profile) throw new Error("Profile not found");
    const now = new Date().toISOString();
    await ctx.db.patch(profile._id, {
      reply_previews: args.previews,
      reply_previews_context: args.contextHash,
      updated_at: now,
    });
  },
});

export const invalidateReplyPreviews = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) =>
        q.eq("authUserId", getUserId(identity) as any),
      )
      .first();
    if (!profile) throw new Error("Profile not found");
    const now = new Date().toISOString();
    await ctx.db.patch(profile._id, {
      reply_previews_context: "",
      updated_at: now,
    });
  },
});

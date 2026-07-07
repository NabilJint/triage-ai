import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function getUserId(identity: { subject: string }): string {
  return identity.subject.split("|")[0];
}

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", getUserId(identity) as any))
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
      .withIndex("by_auth_user", (q) => q.eq("authUserId", getUserId(identity) as any))
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

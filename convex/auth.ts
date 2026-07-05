import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    afterUserCreatedOrUpdated: async (ctx, args) => {
      const email = args.profile.email;
      if (!email) return;

      const existing = await ctx.db
        .query("userProfiles")
        .filter((q) => q.eq(q.field("email"), email))
        .first();

      if (!existing) {
        const now = new Date().toISOString();
        await ctx.db.insert("userProfiles", {
          authUserId: args.userId,
          email,
          business_name: "",
          plan: "free",
          created_at: now,
          updated_at: now,
        });
      }
    },
  },
});

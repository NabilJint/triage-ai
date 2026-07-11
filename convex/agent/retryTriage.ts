"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

export const retryTriage = action({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    const email = await ctx.runQuery(
      internal.agent._helpers.getEmailForProcessing,
      { emailId: args.emailId },
    );

    if (!email) throw new Error("Email not found");
    if (email.email.status !== "error") {
      throw new Error("Only failed emails can be retried");
    }

    await ctx.runMutation(internal.agent._helpers.resetEmailStatus, {
      emailId: args.emailId,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.agent.triageWorkflow.triageWorkflow,
      { emailId: args.emailId },
    );

    return { success: true };
  },
});

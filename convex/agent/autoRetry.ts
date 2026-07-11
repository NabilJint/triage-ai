"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

const MAX_RETRIES = 3;

export const autoRetryFailedEmails = internalAction({
  args: {},
  handler: async (ctx) => {
    const failedEmails = await ctx.runQuery(
      internal.agent._helpers.getFailedEmailsForRetry,
    );

    const retryable = failedEmails.filter(
      (email) => (email.retry_count ?? 0) < MAX_RETRIES,
    );

    console.log(
      `[autoRetry] Found ${failedEmails.length} failed emails (${retryable.length} retryable, ${failedEmails.length - retryable.length} exceeded max retries)`,
    );

    let retriedCount = 0;

    for (const email of retryable) {
      try {
        await ctx.runMutation(internal.agent._helpers.resetEmailStatus, {
          emailId: email._id,
        });

        await ctx.scheduler.runAfter(
          0,
          internal.agent.triageWorkflow.triageWorkflow,
          { emailId: email._id },
        );

        retriedCount++;
        console.log(
          `[autoRetry] Queued retry for email ${email._id} (${email.subject}, attempt ${(email.retry_count ?? 0) + 1}/${MAX_RETRIES})`,
        );
      } catch (error) {
        console.error(
          `[autoRetry] Failed to queue retry for email ${email._id}:`,
          error,
        );
      }
    }

    console.log(`[autoRetry] Queued ${retriedCount} retries`);
    return { retried: retriedCount };
  },
});

"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal, api } from "../_generated/api";
import { getProvider } from "../../lib/providers";
import type { ProviderCredentials } from "../../lib/providers/types";

const WEBHOOK_PROVIDERS = new Set(["gmail"]);

export const checkNonGmailInboxes = internalAction({
  args: {},
  handler: async (ctx) => {
    const connections = await ctx.runQuery(
      internal.inboxConnections.listActiveNonWebhook,
      {},
    );

    console.log(
      `[checkInboxes] Checking ${connections.length} non-webhook inbox(es)`,
    );

    let totalNew = 0;
    let totalFailed = 0;

    for (const connection of connections) {
      try {
        const providerImpl = getProvider(connection.provider);

        const credentials: ProviderCredentials = {
          provider: connection.provider,
          email: connection.email ?? "",
          appPassword: (connection.credentials as Record<string, unknown>)?.appPassword as string | undefined,
        };

        const emails = await providerImpl.listUnseenEmails(credentials);

        if (emails.length === 0) continue;

        console.log(
          `[checkInboxes] ${connection.provider}/${connection.email}: ${emails.length} new email(s)`,
        );

        for (const email of emails) {
          try {
            const emailId = await ctx.runMutation(
              internal.agent._helpers.ingestEmail,
              {
                from_email: email.from.address || "unknown@unknown.com",
                from_name: email.from.name || "",
                subject: email.subject,
                body: email.body,
                userId: connection.user_id,
                inboxConnectionId: connection._id,
                gmail_message_id: email.messageId,
                thread_id: email.threadId,
              },
            );

            await ctx.scheduler.runAfter(
              0,
              internal.agent.triageWorkflow.triageWorkflow as any,
              { emailId },
            );

            totalNew++;
          } catch (emailErr) {
            totalFailed++;
            console.error(
              `[checkInboxes] Failed to ingest email ${email.messageId} for ${connection.email}:`,
              emailErr,
            );
            await ctx.runMutation(api.emailListenerErrors.logError, {
              userId: connection.user_id,
              provider: connection.provider,
              error:
                emailErr instanceof Error
                  ? emailErr.message
                  : "Failed to ingest email",
            });
          }
        }

        await ctx.runMutation(api.emailListenerErrors.resolveError, {
          userId: connection.user_id,
          provider: connection.provider,
        });
      } catch (connErr) {
        console.error(
          `[checkInboxes] Failed to poll ${connection.provider}/${connection.email}:`,
          connErr,
        );
        await ctx.runMutation(api.emailListenerErrors.logError, {
          userId: connection.user_id,
          provider: connection.provider,
          error:
            connErr instanceof Error
              ? connErr.message
              : "Failed to poll inbox",
        });
      }
    }

    console.log(
      `[checkInboxes] Done — ${totalNew} new, ${totalFailed} failed across ${connections.length} inbox(es)`,
    );
  },
});
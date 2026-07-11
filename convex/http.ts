import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/ingest-email",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { from_email, from_name, subject, body: emailBody, userId } = body;

    if (!from_email || !subject || !emailBody || !userId) {
      return new Response("Missing required fields", { status: 400 });
    }

    const inboxConnectionId = await ctx.runQuery(
      internal.inboxConnections.getActiveConnectionId,
      { userId },
    );
    if (!inboxConnectionId) {
      return new Response("No active inbox connection", { status: 400 });
    }

    const emailId = await ctx.runMutation(internal.agent._helpers.ingestEmail, {
      from_email,
      from_name: from_name ?? "",
      subject,
      body: emailBody,
      userId,
      inboxConnectionId,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.agent.triageWorkflow.triageWorkflow as any,
      { emailId },
    );

    return new Response(JSON.stringify({ emailId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

/**
 * Gmail webhook endpoint — receives Pub/Sub push notifications.
 *
 * Google sends: { message: { data: "base64({ emailAddress, historyId })" } }
 *
 * This endpoint:
 * 1. Decodes the notification
 * 2. Looks up the gmail account by email
 * 3. Schedules a History API sync
 * 4. Returns 200 immediately
 *
 * If anything fails, Pub/Sub retries automatically.
 */
http.route({
  path: "/gmail",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      if (!body.message || !body.message.data) {
        return new Response(
          JSON.stringify({ error: "Invalid Pub/Sub payload" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const decodedData = atob(body.message.data);
      const notification = JSON.parse(decodedData) as {
        emailAddress?: string;
        historyId?: number;
      };

      const { emailAddress, historyId } = notification;

      if (!emailAddress || !historyId) {
        return new Response(
          JSON.stringify({ error: "Missing emailAddress or historyId" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Look up the gmail account by email
      const account = await ctx.runQuery(
        internal._gmailHelpers.getGmailAccountByEmail,
        { email: emailAddress },
      );

      if (!account) {
        console.warn(`[webhook] No gmail account found for ${emailAddress}`);
        return new Response(
          JSON.stringify({ error: "Account not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      // Schedule sync — this runs the History API + message download
      await ctx.scheduler.runAfter(
        0,
        internal.gmailAccounts.syncGmailHistory,
        { userId: account.user_id },
      );

      console.log(
        `[webhook] Scheduled sync for ${emailAddress} (historyId: ${historyId})`,
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[webhook] Error:", message);
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;

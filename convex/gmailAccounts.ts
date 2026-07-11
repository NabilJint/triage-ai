"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const GMAIL_TOPIC =
  process.env.GMAIL_NOTIFICATION_TOPIC ??
  "projects/triageai-prod/topics/gmail-notifications";

// ── Helpers ──────────────────────────────────────────────────────────

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ access_token: string; expires_in: number }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth not configured");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }

  return (await res.json()) as { access_token: string; expires_in: number };
}

async function doWatch(
  accessToken: string,
): Promise<{ historyId: string; expiration: number }> {
  const res = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/watch",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topicName: GMAIL_TOPIC, labelIds: ["INBOX"] }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail watch failed: ${res.status} ${err}`);
  }

  const text = await res.text();
  if (!text) throw new Error("Gmail watch returned empty response");
  const data = JSON.parse(text) as { historyId: string; expiration: string };
  return { historyId: data.historyId, expiration: Number(data.expiration) };
}

async function doStopWatch(accessToken: string): Promise<void> {
  const res = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/stop",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok) {
    const err = await res.text();
    console.error(`[gmail] Stop watch failed: ${res.status} ${err}`);
  }
}

async function fetchHistory(
  accessToken: string,
  historyId: string,
): Promise<{ history: any[]; historyId?: string }> {
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/history?startHistoryId=${historyId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (res.status === 404) {
    return { history: [] };
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`History API error: ${res.status} ${err}`);
  }

  return res.json() as Promise<{ history: any[]; historyId?: string }>;
}

async function fetchGmailProfile(
  accessToken: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { emailAddress?: string };
    return data.emailAddress ?? null;
  } catch {
    return null;
  }
}

function parseGmailMessage(message: any): {
  from_email: string;
  from_name: string;
  subject: string;
  body: string;
  threadId?: string;
} {
  const headers = message.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name === name)?.value ?? "";

  const from = getHeader("From");
  const match = from.match(/<?([^<>]+@[^<>]+)>?/);
  const fromEmail = match?.[1]?.trim() ?? "";
  const fromName = from.replace(/[<>]/g, "").replace(fromEmail, "").trim();

  function extractText(payload: any): string {
    if (payload.mimeType === "text/plain" && payload.body?.data) {
      return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        const text = extractText(part);
        if (text) return text;
      }
    }
    return "";
  }

  return {
    from_email: fromEmail,
    from_name: fromName,
    subject: getHeader("Subject"),
    body: extractText(message.payload),
    threadId: message.threadId,
  };
}

// ── Actions ───────────────────────────────────────────────────────────

/**
 * Exchange OAuth code → store gmail account → start watch → done.
 * Called by the Next.js callback route after Google redirects back.
 */
export const exchangeAndSetup = action({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresIn: v.number(),
  },
  handler: async (ctx, args) => {
    const gmailEmail = await fetchGmailProfile(args.accessToken);
    if (!gmailEmail) throw new Error("Could not determine Gmail email address");

    const now = new Date().toISOString();

    const existing = await ctx.runQuery(
      internal._gmailHelpers.getGmailAccountByUserId,
      { userId: args.userId },
    );

    // Refresh token is only returned on first auth;
    // fall back to existing gmailAccount or legacy inboxConnections
    let refreshToken = args.refreshToken
      || existing?.refresh_token;

    if (!refreshToken) {
      // Check legacy inboxConnections for stored refresh_token
      const legacyConn = await ctx.runQuery(
        internal.inboxConnections.getConnectionForProvider,
        { userId: args.userId, provider: "gmail" },
      );
      const legacyCreds = legacyConn?.credentials as Record<string, unknown> | undefined;
      refreshToken = (legacyCreds?.refresh_token ?? legacyCreds?.refreshToken) as string | undefined;
    }

    if (!refreshToken) {
      throw new Error("No refresh token available — re-authorization required");
    }

    const watch = await doWatch(args.accessToken);

    if (existing) {
      await ctx.runMutation(internal._gmailHelpers.patchGmailAccount, {
        gmailAccountId: existing._id,
        patch: {
          gmail_email: gmailEmail,
          refresh_token: refreshToken,
          history_id: watch.historyId,
          watch_expiration: watch.expiration,
          is_active: true,
        },
      });
    } else {
      await ctx.runMutation(internal._gmailHelpers.insertGmailAccount, {
        user_id: args.userId,
        gmail_email: gmailEmail,
        refresh_token: refreshToken,
        history_id: watch.historyId,
        watch_expiration: watch.expiration,
        created_at: now,
        updated_at: now,
      });
    }

    // Create/update inboxConnections doc (for emails FK reference)
    const conn = await ctx.runQuery(
      internal.inboxConnections.getConnectionForProvider,
      { userId: args.userId, provider: "gmail" },
    );

    if (conn) {
      await ctx.runMutation(internal._gmailHelpers.patchInboxConnection, {
        id: conn._id,
        patch: {
          email: gmailEmail,
          is_active: true,
          connected_at: now,
        },
      });
    } else {
      await ctx.runMutation(internal._gmailHelpers.insertInboxConnection, {
        user_id: args.userId,
        email: gmailEmail,
        connected_at: now,
      });
    }

    console.log(
      `[gmail] Setup complete for ${gmailEmail}, historyId ${watch.historyId}`,
    );

    return { success: true, gmailEmail, historyId: watch.historyId };
  },
});

/**
 * Sync Gmail inbox using History API.
 * Called by webhook or on demand.
 * Always refreshes token, never trusts cached credentials.
 */
export const syncGmailHistory = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(
      internal._gmailHelpers.getGmailAccountByUserId,
      { userId: args.userId },
    );

    if (!account || !account.is_active) {
      console.warn(`[gmail] No active account for user ${args.userId}`);
      return;
    }

    if (!account.history_id) {
      console.warn(`[gmail] No historyId for user ${args.userId}, skipping`);
      return;
    }

    let freshToken: string;
    try {
      const token = await refreshAccessToken(account.refresh_token);
      freshToken = token.access_token;
    } catch (err) {
      console.error(`[gmail] Token refresh failed for user ${args.userId}:`, err);
      await ctx.runMutation(internal._gmailHelpers.patchGmailAccount, {
        gmailAccountId: account._id,
        patch: { is_active: false },
      });
      return;
    }

    let historyData: { history: any[]; historyId?: string };
    try {
      historyData = await fetchHistory(freshToken, account.history_id);
    } catch (err) {
      console.error(`[gmail] History API failed for user ${args.userId}:`, err);
      return;
    }

    if (!historyData.history || historyData.history.length === 0) {
      return;
    }

    const messageIds = new Set<string>();
    for (const record of historyData.history) {
      for (const msg of record.messages || []) {
        messageIds.add(msg.id);
      }
    }

    const ids = Array.from(messageIds);
    console.log(`[gmail] Found ${ids.length} new messages for user ${args.userId}`);

    const conn = await ctx.runQuery(
      internal.inboxConnections.getConnectionForProvider,
      { userId: args.userId, provider: "gmail" },
    );

    if (!conn) {
      console.error(`[gmail] No inboxConnection for user ${args.userId}`);
      return;
    }

    let ingested = 0;
    for (const messageId of ids) {
      try {
        const raw = await fetchMessage(freshToken, messageId);
        const parsed = parseGmailMessage(raw);

        const emailId = await ctx.runMutation(
          internal.agent._helpers.ingestEmail,
          {
            from_email: parsed.from_email || "unknown@unknown.com",
            from_name: parsed.from_name,
            subject: parsed.subject,
            body: parsed.body,
            userId: args.userId,
            inboxConnectionId: conn._id,
            gmail_message_id: messageId,
            thread_id: parsed.threadId,
          },
        );

        await ctx.scheduler.runAfter(
          0,
          internal.agent.triageWorkflow.triageWorkflow as any,
          { emailId },
        );

        ingested++;
      } catch (err) {
        console.error(`[gmail] Failed to ingest message ${messageId}:`, err);
      }
    }

    const latestHistoryId = historyData.historyId;
    if (latestHistoryId) {
      await ctx.runMutation(internal._gmailHelpers.patchGmailAccount, {
        gmailAccountId: account._id,
        patch: { history_id: String(latestHistoryId) },
      });
    }

    console.log(`[gmail] Synced ${ingested}/${ids.length} messages for user ${args.userId}`);
  },
});

async function fetchMessage(
  accessToken: string,
  messageId: string,
): Promise<any> {
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail fetch failed: ${res.status} ${err}`);
  }

  return res.json();
}

/**
 * Renew expiring watches.
 * Called by cron every hour.
 */
export const renewExpiringWatches = internalAction({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.runQuery(
      internal._gmailHelpers.getActiveGmailAccounts,
      {},
    );

    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    let renewed = 0;

    for (const account of accounts) {
      if (!account.watch_expiration) continue;
      if (account.watch_expiration - now > TWENTY_FOUR_HOURS) continue;

      try {
        const token = await refreshAccessToken(account.refresh_token);
        const watch = await doWatch(token.access_token);

        await ctx.runMutation(internal._gmailHelpers.patchGmailAccount, {
          gmailAccountId: account._id,
          patch: {
            history_id: watch.historyId,
            watch_expiration: watch.expiration,
          },
        });

        await ctx.runMutation(api.emailListenerErrors.resolveError, {
          userId: account.user_id,
          provider: "gmail",
        });

        renewed++;
        console.log(
          `[gmail] Renewed watch for ${account.gmail_email}`,
        );
      } catch (err) {
        console.error(`[gmail] Failed to renew watch for ${account.gmail_email}:`, err);
        await ctx.runMutation(api.emailListenerErrors.logError, {
          userId: account.user_id,
          provider: "gmail",
          error: err instanceof Error ? err.message : "Watch renewal failed",
        });
      }
    }

    console.log(`[gmail] Renewed ${renewed}/${accounts.length} watches`);
  },
});

/**
 * Stop watch for a user (called during disconnect).
 */
export const _stopWatchAction = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      const account = await ctx.runQuery(
        internal._gmailHelpers.getGmailAccountByUserId,
        { userId: args.userId },
      );

      if (!account) return;

      const token = await refreshAccessToken(account.refresh_token);
      await doStopWatch(token.access_token);

      console.log(`[gmail] Watch stopped for user ${args.userId}`);
    } catch (err) {
      console.warn(`[gmail] Stop watch failed for user ${args.userId}:`, err);
    }
  },
});

/**
 * Send a reply via Gmail API.
 * Used by the triage auto-reply workflow.
 */
export const sendReply = action({
  args: {
    decisionId: v.id("triageDecisions"),
    draftText: v.string(),
  },
  handler: async (ctx, args) => {
    const decision = await ctx.runQuery(
      internal.agent._helpers.getDecisionForSend,
      { decisionId: args.decisionId },
    );

    if (!decision) throw new Error("Decision not found");

    const { email, userId } = decision;
    const threadId = email.thread_id ?? email.gmail_message_id;

    if (!threadId) {
      await ctx.runMutation(internal.agent._helpers.markEmailReplied, {
        emailId: email._id,
      });
      return { success: true, simulated: true };
    }

    const account = await ctx.runQuery(
      internal._gmailHelpers.getGmailAccountByUserId,
      { userId },
    );

    if (!account?.is_active) {
      throw new Error("Gmail not connected — cannot send reply");
    }

    const token = await refreshAccessToken(account.refresh_token);

    const mimeMessage = [
      `To: ${email.from_email}`,
      `Subject: Re: ${email.subject}`,
      "Content-Type: text/plain; charset=UTF-8",
      `In-Reply-To: ${threadId}`,
      `References: ${threadId}`,
      "",
      args.draftText,
    ].join("\n");

    const raw = Buffer.from(mimeMessage).toString("base64url");

    const res = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw, threadId }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gmail send failed: ${res.status} ${err}`);
    }

    await ctx.runMutation(internal.agent._helpers.markEmailReplied, {
      emailId: email._id,
    });

    return { success: true, simulated: false };
  },
});

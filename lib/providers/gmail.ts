/**
 * Gmail provider implementation
 * Handles Gmail API calls for notification registration, fetching, and validation
 */

import type { EmailProvider, ParsedEmail, ProviderCredentials } from "./types";

const GMAIL_API_BASE = "https://www.googleapis.com";

function getGmailTopic(): string {
  return (
    process.env.GMAIL_NOTIFICATION_TOPIC ??
    "projects/triageai-prod/topics/gmail-notifications"
  );
}

export class GmailProvider implements EmailProvider {
  readonly name = "gmail";

  /**
   * Register for Gmail push notifications
   * Tells Gmail to send push notifications when new emails arrive
   */
  async register(
    userId: string,
    credentials: ProviderCredentials,
  ): Promise<void> {
    const accessToken = await this.ensureValidToken(credentials);

    const response = await fetch(`${GMAIL_API_BASE}/gmail/v1/users/me/watch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topicName: getGmailTopic(),
        labelIds: ["INBOX"],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail watch failed: ${response.status} ${error}`);
    }

    const text = await response.text();
    if (text) {
      try {
        const data = JSON.parse(text) as { historyId?: string; expiration?: number };
        console.log(
          `[Gmail] Registered notifications for ${userId}`,
          data.historyId,
        );
      } catch {
        console.log(`[Gmail] Watch response (no JSON): ${text.substring(0, 200)}`);
      }
    } else {
      console.log(`[Gmail] Registered notifications for ${userId} (empty response)`);
    }
  }

  /**
   * Unregister from Gmail push notifications
   * Stops receiving notifications
   */
  async unregister(
    userId: string,
    credentials: ProviderCredentials,
  ): Promise<void> {
    const accessToken = await this.ensureValidToken(credentials);

    const response = await fetch(`${GMAIL_API_BASE}/gmail/v1/users/me/stop`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail unwatch failed: ${response.status} ${error}`);
    }

    console.log(`[Gmail] Unregistered notifications for ${userId}`);
  }

  /**
   * Fetch full email from Gmail by message ID
   * Called when webhook notification arrives
   */
  async fetchEmail(
    messageId: string,
    credentials: ProviderCredentials,
  ): Promise<ParsedEmail> {
    const accessToken = await this.ensureValidToken(credentials);

    const response = await fetch(
      `${GMAIL_API_BASE}/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail fetch failed: ${response.status} ${error}`);
    }

    // Gmail API response shape is dynamic (varies by message format/structure),
    // so we parse it via the typed parseGmailMessage helper rather than declaring
    // a full inline type for the raw API response.
    const message = (await response.json()) as any;
    return this.parseGmailMessage(message);
  }

  /**
   * Check if credentials are valid and refresh if needed
   */
  async validateCredentials(
    credentials: ProviderCredentials,
  ): Promise<boolean> {
    try {
      // Try to refresh the token — if it works, credentials are valid
      await this.refreshCredentials(credentials);
      return true;
    } catch (err) {
      console.error("[Gmail] Credential validation failed:", err);
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshCredentials(
    credentials: ProviderCredentials,
  ): Promise<ProviderCredentials> {
    const refreshToken = (credentials.refreshToken || credentials.refresh_token) as string | undefined;
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${error}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    return {
      ...credentials,
      accessToken: data.access_token,
      access_token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      expires_in: Date.now() + data.expires_in * 1000,
    };
  }

  /**
   * Gmail uses webhooks (not polling). This is a no-op.
   */
  async listUnseenEmails(): Promise<ParsedEmail[]> {
    return [];
  }

  /**
   * Send email reply via Gmail API
   */
  async sendReply(
    originalMessageId: string,
    replyText: string,
    credentials: ProviderCredentials,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const accessToken = await this.ensureValidToken(credentials);

      // Get original message to reply to
      const originalResponse = await fetch(
        `${GMAIL_API_BASE}/gmail/v1/users/me/messages/${originalMessageId}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!originalResponse.ok) {
        return {
          success: false,
          error: `Could not fetch original message: ${originalResponse.status}`,
        };
      }

      // Gmail API response shape is dynamic — same rationale as fetchEmail above.
      // The parseGmailMessage helper provides typed access to the raw response.
      const original = (await originalResponse.json()) as any;
      const headers = original.payload.headers || [];
      const fromHeader = headers.find((h: any) => h.name === "From");
      const subjectHeader = headers.find((h: any) => h.name === "Subject");
      const messageIdHeader = headers.find((h: any) => h.name === "Message-ID");

      const to = fromHeader?.value || "";
      const subject = `Re: ${subjectHeader?.value || ""}`;
      const inReplyTo = messageIdHeader?.value || "";

      // Create reply message
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `In-Reply-To: ${inReplyTo}`,
        `References: ${inReplyTo}`,
        "",
        replyText,
      ].join("\r\n");

      const encodedMessage = Buffer.from(message).toString("base64");

      const sendResponse = await fetch(
        `${GMAIL_API_BASE}/gmail/v1/users/me/messages/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            raw: encodedMessage,
            threadId: original.threadId,
          }),
        },
      );

      if (!sendResponse.ok) {
        const error = await sendResponse.text();
        return {
          success: false,
          error: `Send failed: ${sendResponse.status} ${error}`,
        };
      }

      const sent = (await sendResponse.json()) as { id: string };
      return {
        success: true,
        messageId: sent.id,
      };
    } catch (err) {
      return {
        success: false,
        error: String(err),
      };
    }
  }

  /**
   * Parse Gmail message format into ParsedEmail
   */
  private parseGmailMessage(message: any): ParsedEmail {
    const headers = message.payload.headers || [];
    const getHeader = (name: string) => {
      const header = headers.find((h: any) => h.name === name);
      return header?.value || "";
    };

    const from = getHeader("From");
    const [address, name] = this.parseEmailAddress(from);

    // Get body
    let body = "";
    let html = "";

    if (message.payload.parts) {
      // Multipart message
      for (const part of message.payload.parts) {
        if (part.mimeType === "text/plain") {
          body = part.body.data
            ? Buffer.from(part.body.data, "base64").toString("utf-8")
            : "";
        } else if (part.mimeType === "text/html") {
          html = part.body.data
            ? Buffer.from(part.body.data, "base64").toString("utf-8")
            : "";
        }
      }
    } else if (message.payload.body?.data) {
      // Single part message
      body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
    }

    const dateStr = getHeader("Date");
    const date = new Date(dateStr);

    return {
      from: { address, name },
      subject: getHeader("Subject"),
      body: body || html,
      html,
      date,
      messageId: message.id,
      threadId: message.threadId,
    };
  }

  /**
   * Parse email address from "Name <email@example.com>" format
   */
  private parseEmailAddress(
    addressStr: string,
  ): [address: string, name: string] {
    const match = addressStr.match(/<?([^<>]+@[^<>]+)>?/);
    if (!match) return ["", ""];

    const address = match[1].trim();
    const name = addressStr.replace(/[<>]/g, "").replace(address, "").trim();

    return [address, name];
  }

  /**
   * Ensure access token is valid, refresh if needed
   */
  private async ensureValidToken(
    credentials: ProviderCredentials,
  ): Promise<string> {
    const accessToken = (credentials.accessToken || credentials.access_token) as string | undefined;
    if (!accessToken) {
      throw new Error("No access token available");
    }

    const expiresIn = credentials.expires_in as number | undefined;
    const expiresAt = credentials.expiresAt as number | undefined;
    if (expiresAt && typeof expiresAt === "number" && expiresAt > 1000000000000) {
      // Absolute timestamp in ms — check if near expiry
      if (expiresAt < Date.now() + 300000) {
        const refreshed = await this.refreshCredentials(credentials);
        return (refreshed.accessToken || refreshed.access_token) as string;
      }
    } else if (expiresIn && typeof expiresIn === "number" && expiresIn < 86400) {
      // Relative seconds — approximate: if more than half the lifetime has passed, refresh
      // Token was likely issued within the last hour, so check if expires_in < 300 (5 min)
      if (expiresIn < 300) {
        const refreshed = await this.refreshCredentials(credentials);
        return (refreshed.accessToken || refreshed.access_token) as string;
      }
    }

    return accessToken;
  }
}

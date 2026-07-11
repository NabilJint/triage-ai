/**
 * Provider interface — all email notification providers implement this
 * Allows easy addition of new providers (Outlook, IMAP, etc.) without refactoring core
 */

export type ParsedEmail = {
  from: { address?: string; name?: string };
  subject: string;
  body: string;
  html?: string;
  date: Date;
  messageId: string;
  threadId?: string;
};

export interface EmailProvider {
  /** Provider identifier: "gmail" | "outlook" | "imap" */
  readonly name: string;

  /**
   * Register user's account for webhook notifications
   * Called during OAuth callback / inbox connection setup
   * Should tell the provider to send notifications to our webhook endpoint
   */
  register(userId: string, credentials: ProviderCredentials): Promise<void>;

  /**
   * Unregister user's account from webhook notifications
   * Called when user disconnects in settings
   */
  unregister(userId: string, credentials: ProviderCredentials): Promise<void>;

  /**
   * Fetch full email from provider when webhook notification arrives
   * messageId comes from webhook payload
   */
  fetchEmail(
    messageId: string,
    credentials: ProviderCredentials,
  ): Promise<ParsedEmail>;

  /**
   * Validate credentials are still valid (refresh tokens, check expiry, etc.)
   * Called on startup and before each fetch
   */
  validateCredentials(credentials: ProviderCredentials): Promise<boolean>;

  /**
   * Refresh access token if expired
   * Returns updated credentials with fresh access token
   */
  refreshCredentials(
    credentials: ProviderCredentials,
  ): Promise<ProviderCredentials>;

  /**
   * Send reply via provider's API
   * Used for auto-replies
   */
  sendReply(
    originalMessageId: string,
    replyText: string,
    credentials: ProviderCredentials,
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;

  /**
   * List all unseen/unread emails from the inbox
   * Used by the cron polling action for non-webhook providers
   * Returns full parsed emails ready for ingestion
   */
  listUnseenEmails(
    credentials: ProviderCredentials,
  ): Promise<ParsedEmail[]>;
}

export type ProviderCredentials = {
  provider: string; // "gmail" | "outlook" | "imap"
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // Unix timestamp
} & Record<string, unknown>;

export type WebhookPayload = {
  provider: string;
  userId: string;
  messageId: string;
} & Record<string, unknown>;

export type ImapConfig = {
  user: string;
  xoauth2: string;
  host: string;
  port: number;
  tls: boolean;
};

export function buildImapConfig(
  email: string,
  accessToken: string,
): ImapConfig {
  const authString = `user=${email}\x01auth=Bearer ${accessToken}\x01\x01`;
  return {
    user: email,
    xoauth2: Buffer.from(authString).toString("base64"),
    host: "imap.gmail.com",
    port: 993,
    tls: true,
  };
}

type GmailCredentials = {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
};

export class GmailClient {
  private accessToken: string;

  constructor(credentials: GmailCredentials) {
    this.accessToken = credentials.access_token;
  }

  async request(method: string, path: string, body?: Record<string, unknown>) {
    const response = await fetch(`https://gmail.googleapis.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async watchInbox() {
    return this.request("POST", "/gmail/v1/users/me/watch", {
      labelIds: ["INBOX"],
    });
  }

  async fetchEmail(messageId: string) {
    const response = await this.request(
      "GET",
      `/gmail/v1/users/me/messages/${messageId}?format=full`,
    );
    return this.parseEmail(response);
  }

  async sendReply(threadId: string, to: string, subject: string, body: string) {
    const mimeMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=UTF-8",
      `In-Reply-To: ${threadId}`,
      `References: ${threadId}`,
      "",
      body,
    ].join("\n");

    const raw = Buffer.from(mimeMessage).toString("base64url");

    return this.request("POST", "/gmail/v1/users/me/messages/send", { raw });
  }

  private parseEmail(message: Record<string, any>) {
    const headers = message.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name === name)?.value ?? "";

    return {
      id: message.id,
      threadId: message.threadId,
      from: getHeader("From"),
      to: getHeader("To"),
      subject: getHeader("Subject"),
      date: getHeader("Date"),
      body: this.getPlainText(message.payload),
    };
  }

  private getPlainText(payload: Record<string, any>): string {
    if (payload.mimeType === "text/plain" && payload.body?.data) {
      return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        const text = this.getPlainText(part);
        if (text) return text;
      }
    }
    return "";
  }
}

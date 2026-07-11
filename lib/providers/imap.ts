import Imap from "imap";
import { simpleParser } from "mailparser";
import type { EmailProvider, ParsedEmail, ProviderCredentials } from "./types";

const IMAP_CONFIGS: Record<string, { host: string; port: number }> = {
  yahoo: { host: "imap.mail.yahoo.com", port: 993 },
  outlook: { host: "outlook.office365.com", port: 993 },
  imap: { host: "imap.gmail.com", port: 993 },
};

function getImapConfig(
  provider: string,
  credentials: ProviderCredentials,
): { host: string; port: number } {
  const customHost = credentials.imapHost as string | undefined;
  const customPort = credentials.imapPort as number | undefined;
  if (customHost) {
    return { host: customHost, port: customPort ?? 993 };
  }
  return IMAP_CONFIGS[provider] ?? IMAP_CONFIGS.imap;
}

function createConnection(
  provider: string,
  credentials: ProviderCredentials,
): Imap {
  const { host, port } = getImapConfig(provider, credentials);
  const config: Record<string, unknown> = {
    user: credentials.email as string,
    host,
    port,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    keepalive: { interval: 10000, idleInterval: 300000, forceNoop: true },
  };

  if (credentials.appPassword) {
    config.password = credentials.appPassword;
  } else if (credentials.password) {
    config.password = credentials.password;
  } else if (credentials.accessToken) {
    config.xoauth2 = credentials.accessToken;
  }

  return new Imap(config as any);
}

function connect(imap: Imap): Promise<void> {
  return new Promise((resolve, reject) => {
    imap.once("ready", () => resolve());
    imap.once("error", (err) => reject(err));
    imap.connect();
  });
}

function openInbox(imap: Imap): Promise<void> {
  return new Promise((resolve, reject) => {
    imap.openBox("INBOX", false, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function searchUnseen(imap: Imap): Promise<number[]> {
  return new Promise((resolve, reject) => {
    imap.search(["UNSEEN"], (err, results) => {
      if (err) reject(err);
      else resolve(results ?? []);
    });
  });
}

function fetchEmailData(imap: Imap, seq: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const fetch = imap.seq.fetch(seq, { bodies: "" });
    let buffer = "";
    fetch.on("message", (msg) => {
      msg.on("body", (stream: any) => {
        stream.on("data", (chunk: Buffer) => {
          buffer += chunk.toString("utf8");
        });
      });
      msg.once("end", () => resolve(buffer));
    });
    fetch.once("error", (err) => reject(err));
  });
}

async function fetchAndParse(
  imap: Imap,
  seq: number,
): Promise<ParsedEmail | null> {
  try {
    const raw = await fetchEmailData(imap, seq);
    const parsed = await simpleParser(raw);
    return {
      from: {
        address: parsed.from?.value?.[0]?.address,
        name: parsed.from?.value?.[0]?.name,
      },
      subject: parsed.subject ?? "",
      body: parsed.text ?? "",
      html: (parsed.html as string) ?? undefined,
      date: parsed.date ?? new Date(),
      messageId: parsed.messageId ?? `${seq}`,
      threadId: parsed.references?.[0] ?? parsed.inReplyTo ?? undefined,
    };
  } catch {
    return null;
  }
}

export class ImapProvider implements EmailProvider {
  readonly name: string;

  constructor(providerName: string = "imap") {
    this.name = providerName;
  }

  async register(): Promise<void> {
    // No webhook registration needed for IMAP-based providers
    // Polling via cron handles email detection
  }

  async unregister(): Promise<void> {
    // No webhook unregistration needed
  }

  async fetchEmail(
    messageId: string,
    credentials: ProviderCredentials,
  ): Promise<ParsedEmail> {
    const imap = createConnection(this.name, credentials);
    try {
      await connect(imap);
      await openInbox(imap);
      const uids = await searchUnseen(imap);
      const seq = parseInt(messageId, 10);
      if (uids.includes(seq)) {
        const email = await fetchAndParse(imap, seq);
        if (email) return email;
      }
      throw new Error(`Message ${messageId} not found`);
    } finally {
      imap.end();
    }
  }

  async validateCredentials(
    credentials: ProviderCredentials,
  ): Promise<boolean> {
    const imap = createConnection(this.name, credentials);
    try {
      await connect(imap);
      return true;
    } catch {
      return false;
    } finally {
      imap.end();
    }
  }

  async refreshCredentials(
    credentials: ProviderCredentials,
  ): Promise<ProviderCredentials> {
    // App passwords don't expire, so just return as-is
    return credentials;
  }

  async sendReply(
    originalMessageId: string,
    replyText: string,
    credentials: ProviderCredentials,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Sending via SMTP requires nodemailer — defer for now
    return {
      success: false,
      error: `Sending replies via ${this.name} is not yet implemented. Coming soon!`,
    };
  }

  async listUnseenEmails(
    credentials: ProviderCredentials,
  ): Promise<ParsedEmail[]> {
    const imap = createConnection(this.name, credentials);
    try {
      await connect(imap);
      await openInbox(imap);
      const results = await searchUnseen(imap);
      if (results.length === 0) return [];

      const emails: ParsedEmail[] = [];
      for (const seq of results) {
        const email = await fetchAndParse(imap, seq);
        if (email) emails.push(email);
      }
      return emails;
    } finally {
      imap.end();
    }
  }
}
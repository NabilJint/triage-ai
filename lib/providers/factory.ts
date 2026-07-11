import type { EmailProvider } from "./types";
import { GmailProvider } from "./gmail";
import { ImapProvider } from "./imap";

const IMAP_PROVIDERS = new Set([
  "yahoo",
  "aol",
  "outlook",
  "microsoft",
  "microsoft_365",
  "imap",
  "custom",
]);

export function getProvider(providerType: string): EmailProvider {
  const normalized = providerType.toLowerCase();

  if (normalized === "gmail" || normalized === "google" || normalized === "google_workspace") {
    return new GmailProvider();
  }

  if (IMAP_PROVIDERS.has(normalized)) {
    return new ImapProvider(normalized);
  }

  throw new Error(
    `Unknown email provider: ${providerType}. Supported: gmail, yahoo, aol, outlook, microsoft, imap`,
  );
}

export function getSupportedProviders(): string[] {
  return ["gmail", ...Array.from(IMAP_PROVIDERS)];
}

export function isSupportedProvider(providerType: string): boolean {
  try {
    getProvider(providerType);
    return true;
  } catch {
    return false;
  }
}
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";

const GENERIC_TITLES = new Set([
  "home", "homepage", "home page", "welcome", "index",
  "untitled", "untitled document", "new tab",
]);

const DISCOVERY_PATHS = [
  "/about", "/faq", "/shipping", "/returns",
  "/terms", "/pricing", "/contact", "/support",
];

async function fetchDirect(url: string, timeout = 4000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchViaJina(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("https://r.jina.ai/" + url, {
      signal: controller.signal,
      headers: { Accept: "text/markdown" },
    });
    clearTimeout(id);
    if (!res.ok) return null;
    const text = await res.text();
    return text.replace(/^\!\[.*?\]\(.*?\)\n\n/, "").trim() || null;
  } catch {
    return null;
  }
}

function discoverLinks(html: string, baseUrl: string): string[] {
  const hrefs: string[] = [];
  const regex = /<a[^>]*href="([^"]*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    try {
      const url = new URL(href, baseUrl);
      if (url.origin === new URL(baseUrl).origin) {
        hrefs.push(url.pathname);
      }
    } catch {
      // skip invalid URLs
    }
  }
  return [...new Set(hrefs)];
}

function extractReadableContent(html: string): string {
  const { document } = parseHTML(html);
  const reader = new Readability(document);
  const article = reader.parse();
  return article?.textContent?.trim() ?? "";
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim() ?? "";
}

function extractBusinessNameFromMarkdown(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)/m);
  return match?.[1]?.trim() ?? null;
}

function deriveBusinessName(url: string, html: string | null): string {
  const domainName = new URL(url).hostname
    .replace(/^www\./, "")
    .split(".")[0];
  if (!html) {
    return domainName.charAt(0).toUpperCase() + domainName.slice(1);
  }
  const rawTitle = extractTitle(html);
  const cleanedTitle = rawTitle.replace(/\s*[—–|-]\s*.*$/, "").trim();
  return cleanedTitle && !GENERIC_TITLES.has(cleanedTitle.toLowerCase())
    ? cleanedTitle
    : domainName.charAt(0).toUpperCase() + domainName.slice(1);
}

export async function scrapeWebsite(url: string): Promise<{
  content: string;
  businessName: string;
}> {
  const mainHtml = await fetchDirect(url, 8000);

  if (mainHtml) {
    const mainText = extractReadableContent(mainHtml);
    if (mainText.length > 100) {
      const discoveredPaths = discoverLinks(mainHtml, url);
      const relevantPaths = [...new Set([...DISCOVERY_PATHS, ...discoveredPaths])].slice(0, 10);
      const baseUrl = url.replace(/\/+$/, "");
      const results = await Promise.allSettled(
        relevantPaths.map((path) => fetchDirect(`${baseUrl}${path}`))
      );
      const allHtml = [mainHtml, ...results
        .filter((r) => r.status === "fulfilled" && r.value)
        .map((r) => (r as PromiseFulfilledResult<string>).value)];
      const extracts = allHtml
        .map((h) => extractReadableContent(h))
        .filter((c) => c.length > 0);
      return {
        content: extracts.join("\n\n---\n\n"),
        businessName: deriveBusinessName(url, mainHtml),
      };
    }
  }

  const jinaContent = await fetchViaJina(url);
  if (jinaContent) {
    const titleFromMd = extractBusinessNameFromMarkdown(jinaContent);
    const domainName = new URL(url).hostname
      .replace(/^www\./, "")
      .split(".")[0];
    const businessName = titleFromMd ?? (
      domainName.charAt(0).toUpperCase() + domainName.slice(1)
    );
    return { content: jinaContent, businessName };
  }

  return {
    content: "",
    businessName: deriveBusinessName(url, mainHtml),
  };
}

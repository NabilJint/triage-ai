# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to TriageAI.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## Convex

**Check first:** Check AGENTS.md for an installed Convex skill. If a Convex MCP server is configured — use it. The skill/MCP will have the latest API patterns.

### Client Setup

```typescript
// lib/convex-client.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Browser client — used in client components
export const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
);

// Server client — used in server components, API routes
import { fetchMutation, fetchQuery } from "convex/nextjs";
```

**Rules:**
- Never use `ConvexHttpClient` in server components
- Always use `fetchQuery`/`fetchMutation` for server-side Convex calls
- Client components use `useQuery` and `useMutation` hooks

### React Hooks

```typescript
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Query — automatically reactive
const decisions = useQuery(api.triage.getTriageFeed, { userId });
// decisions updates in realtime when data changes

// Mutation
const resolve = useMutation(api.triage.resolveEscalation);
const handleResolve = async () => {
  await resolve({ decisionId, note: "Resolved" });
};
```

### Queries

```typescript
// convex/triage.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTriageFeed = query({
  args: {
    userId: v.id("users"),
    filter: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Always scope to user
    let query = ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    // Apply filters
    if (args.filter === "auto_reply") {
      query = query.filter((q) => q.eq(q.field("action"), "auto_reply"));
    }

    // Apply sorting
    if (args.sortBy === "newest") {
      query = query.order("desc");
    }

    return await query.collect();
  },
});
```

### Mutations

```typescript
// convex/triage.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const resolveEscalation = mutation({
  args: {
    decisionId: v.id("triageDecisions"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate
    const decision = await ctx.db.get(args.decisionId);
    if (!decision) throw new Error("Decision not found");

    // Update
    await ctx.db.patch(args.decisionId, {
      status: "resolved",
      resolvedAt: new Date().toISOString(),
      resolutionNote: args.note,
    });

    // Return updated data
    return { success: true };
  },
});
```

### Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    business_name: v.string(),
    email: v.string(),
    plan: v.string(),
    reply_tone: v.optional(v.string()),
    escalation_rules: v.optional(v.array(v.object({
      condition: v.string(),
      value: v.string(),
      priority: v.string(),
    }))),
  }).index("by_email", ["email"]),

  triageDecisions: defineTable({
    userId: v.id("users"),
    emailId: v.id("emails"),
    classification: v.string(),
    confidence: v.float64(),
    action: v.string(),
    draft_text: v.optional(v.string()),
    reasoning: v.string(),
    created_at: v.string(),
  }).index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),
});
```

**Rules:**
- Every table must have appropriate indexes for all query patterns
- Use `v.id()` for references to other tables
- Use `v.float64()` for confidence scores and embeddings
- Use `v.optional()` for optional fields
- Always scope queries to `userId` — never query without user filter

### Realtime Updates

Convex provides reactive queries out of the box. No manual WebSocket setup needed.

```typescript
// Components using useQuery automatically update
const decisions = useQuery(api.triage.getTriageFeed, { userId });
// When new email is ingested, decisions updates automatically
```

---

## Fireworks AI

**Check first:** Check AGENTS.md for an installed Fireworks AI skill. The skill will have the latest API patterns and model capabilities.

### LangChain Integration

```typescript
// lib/fireworks.ts
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

export const fireworks = new ChatFireworks({
  modelName: "accounts/fireworks/models/llama-v3-70b-instruct",
  temperature: 0.3,
  apiKey: process.env.FIREWORKS_API_KEY,
});

// Fallback model
export const fireworksFallback = new ChatFireworks({
  modelName: "accounts/fireworks/models/llama-v3-8b-instruct",
  temperature: 0.3,
  apiKey: process.env.FIREWORKS_API_KEY,
});
```

### Classification

```typescript
// convex/agent/classifyEmail.ts
import { fireworks } from "@/lib/fireworks";

export async function classifyEmail(email: Email) {
  const prompt = `Classify this customer support email as one of: routine, technical, urgent, sales, or other.

Email:
Subject: ${email.subject}
Body: ${email.body}

Return a JSON object with:
- classification: string (one of the five categories)
- confidence: number (0-1)
- reasoning: string (2-3 sentences explaining why)

Example:
{"classification": "routine", "confidence": 0.92, "reasoning": "Customer is asking about shipping status, which is a common routine question."}`;

  const response = await fireworks.invoke(prompt);
  return JSON.parse(response.content);
}
```

### Draft Generation

```typescript
// convex/agent/draftReply.ts
import { fireworks } from "@/lib/fireworks";

export async function draftReply(email: Email, tone: string) {
  const prompt = `Draft a reply to this customer support email in a ${tone} tone.

Email:
Subject: ${email.subject}
Body: ${email.body}

The reply should:
- Be professional and helpful
- Directly answer the customer's question
- Be concise (2-4 sentences)
- Match the ${tone} tone

Return only the reply text, no JSON formatting.`;

  const response = await fireworks.invoke(prompt);
  return response.content;
}
```

**Temperature settings:**

- `0.3` — classification, extraction — deterministic results
- `0.7` — drafting replies — natural variation

**Available models:**

- Primary: `accounts/fireworks/models/llama-v3-70b-instruct`
- Fallback: `accounts/fireworks/models/llama-v3-8b-instruct`
- Alternative: `accounts/fireworks/models/mixtral-8x7b-instruct`

**Rules:**
- Always use full model path: `accounts/fireworks/models/...`
- Always wrap in try/catch
- Always parse JSON for structured outputs
- Never hardcode model names — use constants
- Fallback to smaller model if primary fails

---

## AMD Developer Cloud (ROCm)

**Check first:** Check AGENTS.md for an installed AMD Cloud skill. This is the **explicit AMD ROCm step** required for hackathon submission.

### Embedding Generation

```typescript
// lib/amd-cloud.ts
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(process.env.AMD_CLOUD_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.AMD_CLOUD_API_KEY!,
      },
      body: JSON.stringify({
        model: "intfloat/e5-large-v2", // Runs on ROCm on AMD Instinct GPU
        input: text,
        instruction: "Represent the customer support email for retrieval: ",
      }),
    });

    if (!response.ok) {
      throw new Error(`AMD Cloud error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding; // float32 array
  } catch (error) {
    console.error("[amd-cloud]", error);
    throw error;
  }
}
```

### Usage in Agent

```typescript
// convex/agent/triageWorkflow.ts
export async function triageEmail(emailId: string, userId: string) {
  // ... classification logic ...

  // Explicit AMD ROCm step
  try {
    const embedding = await generateEmbedding(email.subject + " " + email.body);
    await ctx.db.insert("customerEmbeddings", {
      email_address: email.from_email,
      embedding: embedding,
      updated_at: new Date().toISOString(),
    });

    // Log AMD usage for dashboard
    await posthog.capture({
      distinctId: userId,
      event: "embedding_generated",
      properties: {
        hardware: "AMD Instinct GPU with ROCm",
        model: "intfloat/e5-large-v2",
        emailId,
      },
    });
  } catch (error) {
    console.error("[amd] Fallback to simple similarity", error);
    // Fallback: skip embedding, proceed without context
  }

  // ... continue workflow ...
}
```

### Embedding Search

```typescript
// lib/amd-cloud.ts
export async function searchSimilarCustomers(
  email: string,
  embedding: number[],
  limit: number = 5,
): Promise<CustomerHistory[]> {
  // Convex query for similar embeddings (cosine similarity)
  const similar = await fetchQuery(api.customerEmbeddings.search, {
    email,
    embedding,
    limit,
  });
  return similar;
}
```

**Rules:**
- This is the **named AMD step** — must be clearly identifiable
- Always wrap in try/catch — never let AMD failure crash the workflow
- Fallback gracefully to simple text similarity
- Log AMD usage for dashboard and audit
- Never hardcode the endpoint — always use env var
- Model is always `intfloat/e5-large-v2` (runs on AMD Instinct)
- Embedding dimension is 768 (e5-large-v2 output)

---

## PostHog

**Check first:** Check AGENTS.md for an installed PostHog skill. If a PostHog MCP server is configured — use it. The skill/MCP will have the latest client and server patterns.

### Client Setup (Browser)

```typescript
// lib/posthog-client.ts
import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false, // manual pageview tracking
    });
  }
}

// Capture event client-side
posthog.capture("email_classified", {
  userId,
  classification: "routine",
  confidence: 0.92,
});
```

### Server Setup

```typescript
// lib/posthog-server.ts
import { PostHog } from "posthog-node";

export const createPostHogServer = () =>
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1, // send immediately
    flushInterval: 0, // no batching — Next.js functions are short-lived
  });

// Always use and shutdown in the same function
const posthog = createPostHogServer();
posthog.capture({
  distinctId: userId,
  event: "email_ingested",
  properties: { userId, from: email.from, subject: email.subject },
});
await posthog.shutdown(); // required — ensures event is sent
```

**Rules:**

- Always call `await posthog.shutdown()` in server-side functions — events are lost without it
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the list in `code-standards.md`
- Always include `userId` as a property on every server-side event
- Call `posthog.identify(userId)` after login on client side
- Call `posthog.reset()` on logout on client side

---

## @react-pdf/renderer

**Check first:** Check AGENTS.md for an installed react-pdf skill. PDF generation APIs can differ from general training knowledge.

### Weekly Report PDF Generation

```typescript
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0D9488' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  value: { fontSize: 12 },
  label: { fontSize: 12, color: '#475569' },
})

const WeeklyReportPDF = ({ stats, decisions }: ReportData) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>TriageAI Weekly Report</Text>
        <Text style={styles.label}>Week of {stats.weekStart} - {stats.weekEnd}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Emails Processed</Text>
          <Text style={styles.value}>{stats.totalEmails}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Auto-reply Rate</Text>
          <Text style={styles.value}>{stats.autoReplyRate}%</Text>
        </View>
      </View>
    </Page>
  </Document>
)

// Generate buffer
const buffer = await renderToBuffer(<WeeklyReportPDF stats={stats} decisions={decisions} />)
```

**Supported CSS properties:**
Only use these — others are silently ignored:
`padding, margin, fontSize, color, fontFamily, flexDirection, alignItems, justifyContent, borderRadius, width, height, fontWeight, textAlign, lineHeight`

**Rules:**

- Server-side only — never import in client components
- Always use `renderToBuffer` — not `renderToStream` or `PDFDownloadLink`
- PDF generation only in `app/api/report/` routes
- Generated buffer served as download or stored

---

## Gmail API

**Check first:** Check AGENTS.md for an installed Gmail API skill.

### OAuth Flow

```typescript
// lib/gmail.ts
export class GmailClient {
  constructor(private accessToken: string) {}

  // Watch inbox for new emails
  async watchInbox() {
    const response = await this.request("POST", "/gmail/v1/users/me/watch", {
      labelIds: ["INBOX"],
      topicName: "projects/your-project/topics/gmail", // GCP Pub/Sub
    });
    return response;
  }

  // Fetch email by message ID
  async fetchEmail(messageId: string) {
    const response = await this.request(
      "GET",
      `/gmail/v1/users/me/messages/${messageId}`,
    );
    return this.parseEmail(response);
  }

  // Send reply
  async sendReply(threadId: string, body: string) {
    const raw = Buffer.from(
      `Thread-ID: ${threadId}\n\n${body}`,
    ).toString("base64");
    const response = await this.request("POST", "/gmail/v1/users/me/messages/send", {
      raw,
    });
    return response;
  }

  private parseEmail(message: any): Email {
    // Parse Gmail message format
    const headers = message.payload.headers;
    const subject = headers.find((h: any) => h.name === "Subject")?.value;
    const from = headers.find((h: any) => h.name === "From")?.value;
    const body = this.getBody(message.payload);

    return { subject, from, body, messageId: message.id };
  }
}
```

### Mock Inbox (Development)

```typescript
// convex/mockInbox.ts
export const triggerMockEmail = mutation({
  args: {
    from: v.string(),
    subject: v.string(),
    body: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get mock inbox connection
    const connection = await ctx.db
      .query("inboxConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("provider"), "mock"))
      .first();

    if (!connection) {
      throw new Error("Mock inbox not configured");
    }

    // Insert email
    const emailId = await ctx.db.insert("emails", {
      inbox_connection_id: connection._id,
      from_email: args.from,
      subject: args.subject,
      body: args.body,
      received_at: new Date().toISOString(),
      status: "pending",
    });

    // Trigger triage workflow
    await ctx.scheduler.runAfter(0, api.agent.triageWorkflow, { emailId });

    return { success: true, emailId };
  },
});
```

**Rules:**

- Never store OAuth tokens in plain text — Convex handles encryption
- Always use `watchInbox()` for Gmail push notifications
- For hackathon, mock inbox is the default — Gmail API is optional extension
- Mock emails bypass Gmail API entirely — use `triggerMockEmail` mutation

---

## LangChain

**Check first:** Check AGENTS.md for an installed LangChain skill.

### StateGraph Workflow

```typescript
// convex/agent/triageWorkflow.ts
import { StateGraph } from "@langchain/langgraph";

type TriageState = {
  emailId: string;
  userId: string;
  email?: Email;
  classification?: ClassificationResult;
  draft?: string;
  decision?: TriageDecision;
};

const workflow = new StateGraph<TriageState>({
  channels: {
    emailId: null,
    userId: null,
    email: null,
    classification: null,
    draft: null,
    decision: null,
  },
});

// Add nodes
workflow.addNode("fetchEmail", fetchEmailNode);
workflow.addNode("classify", classifyEmailNode);
workflow.addNode("applyRules", applyRulesNode);
workflow.addNode("draft", draftReplyNode);
workflow.addNode("escalate", escalateNode);
workflow.addNode("saveDecision", saveDecisionNode);

// Add edges
workflow.addEdge("fetchEmail", "classify");
workflow.addEdge("classify", "applyRules");
workflow.addConditionalEdges("applyRules", (state) => {
  if (state.shouldEscalate) return "escalate";
  return "draft";
});
workflow.addEdge("draft", "saveDecision");
workflow.addEdge("escalate", "saveDecision");

// Compile
const app = workflow.compile();

// Execute
export async function triageEmail(emailId: string, userId: string) {
  const result = await app.invoke({ emailId, userId });
  return result.decision;
}
```

**Rules:**

- Keep nodes focused and small — one responsibility per node
- Use conditional edges for branching logic
- Always wrap `app.invoke()` in try/catch
- Never use browser APIs in LangChain nodes (server-only)
- Log each node's progress for debugging

### Node Examples

```typescript
// Node: classify
const classifyEmailNode = async (state: TriageState) => {
  const email = state.email!;
  const result = await classifyEmail(email);
  return { classification: result };
};

// Node: applyRules
const applyRulesNode = async (state: TriageState) => {
  const rules = await getEscalationRules(state.userId);
  const classification = state.classification!;

  let shouldEscalate = false;
  let priority = "medium";

  for (const rule of rules) {
    if (rule.condition === "confidence_below" &&
        classification.confidence < parseFloat(rule.value)) {
      shouldEscalate = true;
      priority = rule.priority;
    }
    // ... other rule types
  }

  return { shouldEscalate, priority };
};
```

---

## shadcn/ui

**Check first:** Check AGENTS.md for an installed shadcn/ui skill.

### Installation

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select switch toggle tabs
```

### Usage Pattern

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Always use project tokens for variants
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

**Rules:**

- Only use shadcn/ui components — never custom build what shadcn already provides
- Extend shadcn components with project tokens via className
- Never modify shadcn source files — use className overrides
- Always import from `@/components/ui/` — never from `shadcn-ui` directly

---

## URL Scraping — Business Context Auto-Fill

**Check first:** Check AGENTS.md for an installed URL scraping skill.

### Dependencies

```
npm install @mozilla/readability linkedom
```

These must be added to `code-standards.md` approved list before installing.

### Pattern

The auto-fill flow runs in a Next.js API route (`POST /api/scrape-summarize`):

```
Client sends { url } → API route
         ↓
1. fetch(url) → linkedom parse → discover linked pages
   (/about, /faq, /shipping, /returns, /terms, /pricing, /contact)
         ↓
2. Promise.allSettled(fetch all discovered pages, 4s per-page timeout)
   → some may fail, that's fine
         ↓
3. @mozilla/readability strips each to main text content
         ↓
4. Concatenate all text → Fireworks AI summarizes into structured format
         ↓
5. Return { summary: string } to client
         ↓
Client pre-fills textarea → owner reviews + edits → save to Convex
```

### Scraper Utility (`lib/scraper.ts`)

```typescript
// lib/scraper.ts
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

const DISCOVERY_KEYWORDS = [
  "about", "faq", "shipping", "return", "term",
  "pricing", "contact", "policy",
];

export function discoverLinkedPages(baseUrl: string, html: string): string[] {
  const { document } = parseHTML(html);
  const links = new Set<string>();
  const base = new URL(baseUrl);

  for (const anchor of document.querySelectorAll("a[href]")) {
    try {
      const href = anchor.getAttribute("href")!;
      const url = new URL(href, baseUrl);
      if (url.hostname !== base.hostname) continue;
      const path = url.pathname.toLowerCase();
      if (DISCOVERY_KEYWORDS.some((kw) => path.includes(kw))) {
        links.add(url.toString());
      }
    } catch {
      // Skip invalid URLs
    }
  }

  return Array.from(links).slice(0, 5);
}

export async function fetchPage(url: string, timeoutMs = 4000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "TriageAI/1.0 (context-fetcher)" },
    });
    clearTimeout(id);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export function extractContent(html: string): string | null {
  try {
    const { document } = parseHTML(html);
    const reader = new Readability(document.cloneNode(true) as Document);
    const result = reader.parse();
    return result?.textContent?.replace(/\s+/g, " ").trim() ?? null;
  } catch {
    return null;
  }
}
```

### API Route (`app/api/scrape-summarize/route.ts`)

```typescript
// app/api/scrape-summarize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { discoverLinkedPages, fetchPage, extractContent } from "@/lib/scraper";
import { fireworks } from "@/lib/fireworks";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const mainHtml = await fetchPage(url);
    if (!mainHtml) {
      return NextResponse.json({ summary: "" });
    }

    const linkedUrls = discoverLinkedPages(url, mainHtml);

    const results = await Promise.allSettled(
      linkedUrls.map((u) => fetchPage(u))
    );

    const allHtml = [mainHtml, ...results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => (r as PromiseFulfilledResult<string>).value)];

    const texts = allHtml
      .map((html) => extractContent(html))
      .filter(Boolean) as string[];

    if (texts.length === 0) {
      return NextResponse.json({ summary: "" });
    }

    const merged = texts.join("\n\n---\n\n").slice(0, 15000);
    const prompt = `Summarize this business information into a concise reference for an AI customer support agent.

Include:
- What the business sells or does
- Shipping policy
- Return/refund policy
- Support hours
- Contact methods
- Any other important policies

Business content:
${merged}

Return a structured summary. If a section has no information, write "Not specified."`;

    const response = await fireworks.invoke(prompt);
    const summary = typeof response.content === "string"
      ? response.content
      : "";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[scrape-summarize]", error);
    return NextResponse.json({ summary: "" });
  }
}
```

### Convex Injection (Agent)

```typescript
// Inside classifyEmail.ts or draftReply.ts
const user = await ctx.db.get(userId);
const businessContext = user?.business_context;

const systemPrompt = businessContext
  ? `You are an AI support agent for the following business:\n\n${businessContext}\n\n---\n\n`
  : "";

const prompt = `${systemPrompt}Classify this customer support email...`;
```

### Rules

- API route always returns `{ summary: string }` — never fails, empty string on error
- Per-page timeout: 4s — slow pages are skipped silently
- Max 5 linked pages discovered — prevents runaway requests
- Content truncated to 15,000 chars before Fireworks call (token limit safety)
- `@mozilla/readability` strips nav, footer, ads, boilerplate — only main content
- `linkedom` is used instead of JSDOM (smaller, faster, no native deps)
- Summary is pre-filled into textarea for owner review — never saved directly without owner editing
- Fireworks temperature: 0.3 (deterministic summarization)

---

## Docker

**Check first:** Check AGENTS.md for an installed Docker skill.

### Dockerfile

```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
# docker/docker-compose.yml
version: '3.8'
services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}
      - FIREWORKS_API_KEY=${FIREWORKS_API_KEY}
      - AMD_CLOUD_ENDPOINT=${AMD_CLOUD_ENDPOINT}
      - AMD_CLOUD_API_KEY=${AMD_CLOUD_API_KEY}
```

**Rules:**

- Convex, Fireworks AI, and AMD Developer Cloud are external — not self-hosted in container
- Use multi-stage builds to minimize image size
- Never include secrets in the image — use environment variables
- Always use `production` builds for the container
- Test Docker build before submission
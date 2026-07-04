# Architecture

## Stack

| Layer                          | Tool                     | Purpose                                          |
| ------------------------------ | ------------------------ | ------------------------------------------------ |
| Framework                      | Next.js 16 (App Router)  | Full stack framework                             |
| Backend + DB + Realtime        | Convex                   | Single reactive TypeScript backend               |
| Auth                           | Convex Auth or Clerk     | Authentication + Google OAuth                    |
| AI Model                       | Fireworks AI API         | Email classification, drafting, reasoning        |
| Agent Orchestration            | LangChain.js             | Multi-step agent workflow                        |
| Email Ingestion                | Gmail API or Mock Inbox  | Email fetching and webhook handling              |
| AMD Compute (ROCm)             | AMD Developer Cloud API  | Embedding generation for customer-history lookup |
| Analytics                      | PostHog                  | Event tracking and dashboard charts              |
| PDF generation                 | @react-pdf/renderer      | Weekly triage report export                      |
| Styling                        | Tailwind CSS + shadcn/ui | UI components and styling                        |
| Language                       | TypeScript strict        | Throughout                                       |

---

## Folder Structure

```
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                          → Root layout, PostHog provider
│   ├── page.tsx                            → Landing page
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx                   → Login page
│   │   └── callback/
│   │       └── page.tsx                   → OAuth callback handler
│   ├── dashboard/
│   │   └── page.tsx                       → Main dashboard with live stats
│   ├── settings/
│   │   └── page.tsx                       → Inbox connection + rules setup
│   └── decisions/
│       ├── page.tsx                       → Live triage feed
│       └── [id]/
│           └── page.tsx                   → Individual decision details
├── convex/
│   ├── schema.ts                          → Convex database schema
│   ├── auth.ts                            → Convex Auth configuration
│   ├── users.ts                           → Users queries/mutations
│   ├── emails.ts                          → Email ingestion and storage
│   ├── triage.ts                          → Triage decision queries/mutations
│   ├── escalations.ts                     → Escalation management
│   └── agent/
│       ├── classifyEmail.ts               → Agent: classify incoming email
│       ├── draftReply.ts                  → Agent: draft auto-reply
│       ├── generateEmbedding.ts           → AMD ROCm embedding step
│       └── triageWorkflow.ts              → LangChain orchestration
├── lib/
│   ├── convex-client.ts                   → Convex client configuration
│   ├── fireworks.ts                       → Fireworks AI API client
│   ├── gmail.ts                           → Gmail API client
│   ├── amd-cloud.ts                       → AMD Developer Cloud API client
│   ├── posthog-client.ts                  → PostHog browser client
│   ├── posthog-server.ts                  → PostHog server client
│   └── utils.ts                           → Shared utility functions
├── components/
│   ├── ui/                                → shadcn/ui components only
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   └── Features.tsx
│   ├── dashboard/
│   │   ├── StatsBar.tsx
│   │   ├── RecentActivity.tsx
│   │   └── AnalyticsCharts.tsx
│   ├── settings/
│   │   ├── InboxConnection.tsx
│   │   ├── EscalationRules.tsx
│   │   └── ReplyToneSelector.tsx
│   ├── triage/
│   │   ├── TriageFeed.tsx
│   │   ├── DecisionCard.tsx
│   │   ├── DecisionFilters.tsx
│   │   └── TriagePagination.tsx
│   └── decision-details/
│       ├── DecisionInfo.tsx
│       ├── ReasoningDisplay.tsx
│       ├── DraftEditor.tsx
│       └── EscalationActions.tsx
├── types/
│   └── index.ts                           → Global TypeScript types
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

---

## System Boundaries

| Folder        | Owns                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `app/`        | Pages only. No business logic.                                                                         |
| `convex/`     | All backend logic. Database queries, mutations, agent workflows. Nothing here touches React.           |
| `components/` | UI only. No data fetching logic. No direct Convex calls.                                               |
| `lib/`        | Third party client initialisation and shared utilities only.                                           |
| `types/`      | TypeScript types shared across the project.                                                            |

---

## Data Flow

### Email Ingestion Flow

```
Incoming email (Gmail webhook or mock)
        ↓
Convex mutation: ingestEmail()
        ↓
Agent: classifyEmail() runs
        ↓
Agent decides: auto-reply or escalate
        ↓
If auto-reply: draftReply() generates response
        ↓
Decision saved to triageDecisions table
        ↓
Dashboard updates reactively (Convex realtime)
```

### Triage Decision Flow

```
Email arrives → classifyEmail() classifies
        ↓
        ├── ROUTINE (90%+ confidence) → draftReply() → send draft
        └── COMPLEX (below threshold) → create escalation
                                        → show in triage feed
                                        → owner reviews/resolves
```

### AMD ROCm Embedding Flow

```
Email arrives → Extract customer email + history
        ↓
Convex mutation calls AMD Developer Cloud endpoint
        ↓
ROCm on AMD Instinct GPU generates embedding
        ↓
Embedding stored with customer record
        ↓
LangChain uses embedding for similarity search
        ↓
Context added to Fireworks AI prompt
```

---

## Convex Database Schema

### `users`

| Column        | Type     | Notes                                    |
| ------------- | -------- | ---------------------------------------- |
| _id           | Id       | Auto-generated                           |
| business_name | string   |                                          |
| email         | string   | Primary contact email                    |
| plan          | string   | free / pro                               |
| created_at    | datetime |                                          |
| updated_at    | datetime |                                          |

### `inboxConnections`

| Column           | Type     | Notes                                    |
| ---------------- | -------- | ---------------------------------------- |
| _id              | Id       |                                          |
| user_id          | Id       | References users                         |
| provider         | string   | gmail / mock                             |
| credentials      | object   | OAuth tokens (encrypted)                 |
| connected_at     | datetime |                                          |
| is_active        | boolean  |                                          |

### `emails`

| Column              | Type     | Notes                                    |
| ------------------- | -------- | ---------------------------------------- |
| _id                 | Id       |                                          |
| inbox_connection_id | Id       | References inboxConnections              |
| from_email          | string   | Sender email                             |
| from_name           | string   | Sender name (if available)               |
| subject             | string   |                                          |
| body                | string   | Full email body                          |
| body_html           | string?  | HTML version (if available)              |
| received_at         | datetime |                                          |
| status              | string   | pending / processed / replied / escalated |
| gmail_message_id    | string?  | Gmail API message ID                     |
| thread_id           | string?  | Gmail thread ID                          |

### `triageDecisions`

| Column        | Type     | Notes                                    |
| ------------- | -------- | ---------------------------------------- |
| _id           | Id       |                                          |
| email_id      | Id       | References emails                        |
| classification| string   | routine / technical / urgent / sales / other |
| confidence    | float    | 0.0 - 1.0                                |
| action        | string   | auto_reply / escalate                    |
| draft_text    | string?  | Generated reply draft (if auto_reply)    |
| reasoning     | string   | Full reasoning from agent                |
| model_used    | string   | Fireworks AI model name                  |
| created_at    | datetime |                                          |
| processed_at  | datetime |                                          |

### `escalations`

| Column        | Type     | Notes                                    |
| ------------- | -------- | ---------------------------------------- |
| _id           | Id       |                                          |
| decision_id   | Id       | References triageDecisions               |
| priority      | string   | low / medium / high / urgent             |
| status        | string   | pending / in_progress / resolved         |
| assigned_to   | Id?      | References users (if team)               |
| resolved_by   | Id?      | References users                         |
| resolved_at   | datetime |                                          |
| resolution_note | string? | Optional note from resolver              |
| created_at    | datetime |                                          |

### `customerEmbeddings`

| Column        | Type     | Notes                                    |
| ------------- | -------- | ---------------------------------------- |
| _id           | Id       |                                          |
| email_address | string   | Customer email                           |
| embedding     | array    | ROCm-generated embedding (float32 array) |
| updated_at    | datetime |                                          |
| used_in_query | boolean  | Track AMD usage                          |

---

## Convex Realtime Pattern

Convex provides reactive queries out of the box. No manual WebSocket setup needed.

```typescript
// convex/triage.ts
import { mutation, query } from "./_generated/server";

// Query — automatically reactive
export const getTriageFeed = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return decisions;
  },
});

// Mutation — triggers realtime updates
export const resolveEscalation = mutation({
  args: { decisionId: v.id("triageDecisions"), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Update escalation
    // Dashboard will update automatically
  },
});
```

**Usage in React components:**

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function TriageFeed() {
  const decisions = useQuery(api.triage.getTriageFeed, { userId });
  // decisions updates in realtime as new emails arrive
}
```

---

## Agent Architecture

### LangChain Orchestration

```
Email arrives → LangChain workflow triggered
        ↓
Step 1: classifyEmail() → Fireworks AI classification
        ↓
Step 2: If confidence < 0.7 → escalate
        ↓
Step 3: If confidence >= 0.7 → draftReply() → Fireworks AI draft
        ↓
Step 4: Save decision to Convex
        ↓
Step 5: (Optional) Send email via Gmail API
```

### Agent Workflow Code

```typescript
// convex/agent/triageWorkflow.ts
import { StateGraph } from "@langchain/langgraph";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

const workflow = new StateGraph<TriageState>({
  channels: {
    email: null,
    classification: null,
    draft: null,
    decision: null,
  },
});

workflow.addNode("classify", classifyEmailNode);
workflow.addNode("draft", draftReplyNode);
workflow.addNode("escalate", escalateNode);
workflow.addEdge("classify", (state) => {
  return state.confidence >= 0.7 ? "draft" : "escalate";
});
```

### Fireworks AI Integration

```typescript
// lib/fireworks.ts
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

export const fireworks = new ChatFireworks({
  modelName: "accounts/fireworks/models/llama-v3-70b-instruct",
  temperature: 0.3,
  apiKey: process.env.FIREWORKS_API_KEY,
});
```

**Models available via Fireworks (hackathon):**

- `accounts/fireworks/models/llama-v3-70b-instruct` — primary
- `accounts/fireworks/models/llama-v3-8b-instruct` — fallback
- `accounts/fireworks/models/mixtral-8x7b-instruct` — alternative

---

## AMD ROCm Embedding Step

### Explicit AMD Usage (Submission Requirement)

One named step must use AMD Developer Cloud with ROCm on AMD Instinct GPU.

```typescript
// lib/amd-cloud.ts
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(process.env.AMD_CLOUD_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.AMD_CLOUD_API_KEY!,
    },
    body: JSON.stringify({
      model: "intfloat/e5-large-v2", // runs on AMD Instinct via ROCm
      input: text,
      instruction: "Represent the customer support email for retrieval: ",
    }),
  });

  if (!response.ok) {
    throw new Error(`AMD Cloud error: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding; // float32 array
}
```

**When embeddings are used:**

1. Customer email arrives
2. `generateEmbedding()` called on the email text
3. Embedding saved to `customerEmbeddings` table
4. Similarity search finds past interactions with this customer
5. Context injected into Fireworks AI prompt

**Why this qualifies:**
- Runs on ROCm (AMD Instinct GPU)
- Explicitly named step (not just implied)
- Real workload (embedding generation for retrieval)
- Demonstrates AMD's value (faster than CPU embeddings)

---

## Authentication

- Provider: Convex Auth or Clerk
- Methods: Google OAuth
- Protected routes: `/dashboard`, `/settings`, `/decisions`, `/decisions/[id]`
- Public routes: `/`, `/login`
- Middleware protects routes (Next.js 16 uses `proxy.ts`)
- On login → redirect to `/dashboard`

---

## Convex Client Pattern

```typescript
// lib/convex-client.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Browser client
export const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
);

// Server client (for mutations in server components)
import { fetchMutation, fetchQuery } from "convex/nextjs";
```

**Server-side usage (API routes, server components):**

```typescript
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const result = await fetchMutation(api.emails.ingest, {
  from: "customer@example.com",
  subject: "Help with order",
  body: "...",
});
```

---

## Email Ingestion Pattern

### Gmail API Integration

```typescript
// lib/gmail.ts
export class GmailClient {
  constructor(private accessToken: string) {}

  async watchInbox() {
    // Set up Gmail push notifications
    await this.request("POST", "/gmail/v1/users/me/watch", {
      labelIds: ["INBOX"],
      topicName: "projects/your-project/topics/gmail",
    });
  }

  async fetchEmail(messageId: string) {
    const response = await this.request(
      "GET",
      `/gmail/v1/users/me/messages/${messageId}`,
    );
    return this.parseEmail(response);
  }

  async sendReply(threadId: string, body: string) {
    const raw = Buffer.from(
      `Thread-ID: ${threadId}\n\n${body}`,
    ).toString("base64");
    await this.request("POST", "/gmail/v1/users/me/messages/send", {
      raw,
    });
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
    // Insert email directly into Convex
    const emailId = await ctx.db.insert("emails", {
      inbox_connection_id: mockConnectionId,
      from_email: args.from,
      subject: args.subject,
      body: args.body,
      received_at: new Date().toISOString(),
      status: "pending",
    });

    // Trigger triage workflow
    await ctx.scheduler.runAfter(0, api.agent.classifyEmail, { emailId });
  },
});
```

---

## Escalation Rules

Rules defined in settings page. Stored in Convex.

```typescript
type EscalationRule = {
  id: string;
  condition: "contains" | "startsWith" | "confidence_below";
  value: string | number;
  priority: "low" | "medium" | "high" | "urgent";
  action: "escalate";
};

// Example rules
const rules: EscalationRule[] = [
  {
    condition: "confidence_below",
    value: 0.6,
    priority: "medium",
    action: "escalate",
  },
  {
    condition: "contains",
    value: "refund",
    priority: "high",
    action: "escalate",
  },
  {
    condition: "contains",
    value: "urgent",
    priority: "urgent",
    action: "escalate",
  },
];
```

**Rules apply after classification:**

1. Agent classifies email (confidence + classification)
2. System checks escalation rules
3. If any rule matches → override action to escalate
4. Priority set from matching rule

---

## Invariants

Rules the AI agent must never violate:

- API routes contain no UI logic. Components contain no DB logic.
- Convex functions never import from `/components` or `/lib/client`.
- All Convex queries are scoped to the current user — never query without user filter.
- Every Fireworks AI call is wrapped in try/catch. Failures are logged, never thrown.
- AMD Developer Cloud calls are wrapped in try/catch. If AMD endpoint fails → fallback to simple embedding (no GPU).
- `email.status` is always one of: `pending`, `processed`, `replied`, `escalated`.
- `triageDecisions.action` is always `auto_reply` or `escalate`.
- `escalations.priority` is always `low`, `medium`, `high`, or `urgent`.
- Confidence threshold for auto-reply is always `0.7` — never hardcode elsewhere.

---

## PostHog Events

```typescript
email_ingested; // { userId, from, subject }
email_classified; // { userId, emailId, classification, confidence }
email_auto_replied; // { userId, emailId, draftLength }
email_escalated; // { userId, emailId, priority, reason }
triage_resolved; // { userId, decisionId, resolution }
```

---

## Submission Compliance Notes

### AMD ROCm Usage

**How it's used:** Customer email embeddings generated via AMD Developer Cloud API with ROCm on AMD Instinct GPU.

**Why it's not "just Fireworks":**

| Fireworks AI | AMD ROCm Step |
|--------------|---------------|
| LLM inference (classification, drafting) | Embedding generation (customer retrieval) |
| Runs on Fireworks infrastructure | Runs explicitly on AMD Developer Cloud |
| Prompt → response | Text → 768-dim embedding |
| Optional | **Required for context retrieval** |

**Code path:**

```
Email arrives
    ↓
Check if customer has existing embedding
    ↓
If NOT → Call AMD Developer Cloud endpoint
    ↓
ROCm on AMD Instinct generates embedding
    ↓
Embedding stored in Convex
    ↓
Customer context added to Fireworks prompt
```

### Dockerization

Project is Dockerized. Convex, Fireworks, and AMD Developer Cloud are external services connected via SDK/API — not self-hosted in the container.

```
docker/
├── Dockerfile          → Next.js app container
└── docker-compose.yml  → App + any local services
```

### README Requirements

- [ ] Project overview
- [ ] Setup instructions
- [ ] AMD/ROCm usage explanation
- [ ] Fireworks AI API usage
- [ ] Hackathon submission details

---

## Environment Variables

| Variable                        | Used In                |
| ------------------------------- | ---------------------- |
| `NEXT_PUBLIC_CONVEX_URL`        | lib/convex-client.ts   |
| `CONVEX_DEPLOYMENT`             | convex deployment      |
| `FIREWORKS_API_KEY`             | lib/fireworks.ts       |
| `GOOGLE_CLIENT_ID`              | Convex Auth / Clerk    |
| `GOOGLE_CLIENT_SECRET`          | Convex Auth / Clerk    |
| `NEXT_PUBLIC_POSTHOG_KEY`       | lib/posthog-client.ts  |
| `NEXT_PUBLIC_POSTHOG_HOST`      | lib/posthog-client.ts  |
| `AMD_CLOUD_ENDPOINT`            | lib/amd-cloud.ts       |
| `AMD_CLOUD_API_KEY`             | lib/amd-cloud.ts       |
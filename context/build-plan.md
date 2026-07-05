# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is built and wired to the UI step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

---

## Phase 1 — Foundation

### 01 Landing Page

Build the complete landing page UI.

**UI:**

- Navbar — logo, Login button
- Hero section — headline "AI that handles your support inbox while you sleep", subheadline "TriageAI reads every incoming email, auto-responds to routine questions, and escalates what matters — so you never lose a customer to slow replies", Get Started CTA
- Features section — three value props:
  - "Auto-responds to routine questions" — handles order status, shipping, hours, common FAQs
  - "Escalates what matters" — refunds, complaints, technical issues, urgent requests
  - "Full transparency" — see exactly why every decision was made
- How It Works section — 3-step flow: Connect inbox → AI triages emails → Review & resolve
- Tech trust section — "Powered by AMD ROCm on AMD Instinct GPU" badge, Fireworks AI logo, Convex realtime badge
- Footer

**Logic:**

- Get Started → `/login` if not authenticated, `/dashboard` if authenticated
- Login → `/login`

---

### 02 Auth

Convex Auth — Google OAuth.

**UI:**

- Login page — Google OAuth button
- Loading state while redirecting

**Logic:**

- Google OAuth via Convex Auth
- OAuth callback handler
- Session management via Convex Auth
- `proxy.ts` protecting `/dashboard`, `/settings`, `/decisions`, `/decisions/[id]` (Next.js 16 uses `proxy.ts` instead of `middleware.ts`)
- After login → redirect to `/dashboard`
- User record created in Convex `users` table on first login

**PostHog events:** `login`

---

### 03 PostHog Initialization

Set up PostHog before any events fire. Must be done before any agent features.

**Logic:**

- Create `lib/posthog-client.ts` — PostHog browser client, initialized with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- Create `lib/posthog-server.ts` — PostHog server client with `flushAt: 1` and `flushInterval: 0`
- Initialize PostHog in root app layout — wraps entire app
- `posthog.identify()` called after successful login with user ID
- `posthog.reset()` called on logout

---

### 04 Convex Database Schema

All Convex tables created before any data is written.

**Logic:**

- Create `users` table with all columns from `architecture.md`
- Create `inboxConnections` table
- Create `emails` table
- Create `triageDecisions` table
- Create `escalations` table
- Create `customerEmbeddings` table
- Set up indexes for all foreign keys and common query patterns:
  - `emails.by_inbox_connection`
  - `triageDecisions.by_user`
  - `triageDecisions.by_user_and_status`
  - `escalations.by_decision`
  - `escalations.by_user_and_status`
  - `customerEmbeddings.by_email`
- Set up authentication rules — all queries scoped to current user via `auth` in Convex

**Convex CLI commands:**

```bash
npx convex dev
npx convex import --schema convex/schema.ts
```

---

## Phase 2 — Settings Page

### 05 Settings Page — Full UI

Build the complete settings page UI with mock data. No save logic yet.

**UI:**

- **Page header:** "Settings" title + subtitle "Connect your inbox and configure how TriageAI handles your emails"
- **Inbox Connection card:**
  - "Connect Gmail Inbox" button (large, primary)
  - "Use Mock Inbox for testing" toggle
  - Connection status indicator (connected/disconnected)
  - Connected email address display (if connected)
  - When mock enabled: shows "Send Test Email" button
- **Business Context card:**
  - "Business Context" title + subtitle "Help the AI understand your business so it drafts accurate, policy-aware replies"
  - Website URL input + "Auto-fill from Website" button (calls `/api/scrape-summarize`)
  - Auto-fill loading state: "Analyzing your website..." with spinner
  - Large textarea pre-filled with auto-fill result (owner reviews + edits)
  - Textarea placeholder: "Describe what your business sells, your shipping/return policy, support hours, and any other details the AI should know..."
  - "Save Context" button
  - Auto-fill failure: textarea stays empty, no error state — owner just types
- **Escalation Rules card:**
  - "When to escalate" section with explanation
  - Rule list with add/remove functionality:
    - "Confidence below 60%" (toggle)
    - "Contains 'refund'" (toggle)
    - "Contains 'urgent'" (toggle)
    - "Contains 'complaint'" (toggle)
    - Custom rule input + Add button
  - Priority levels per rule (Low/Medium/High/Urgent dropdown)
- **Reply Tone card:**
  - Tone selector: Professional / Friendly / Casual / Enthusiastic
  - Preview of sample reply in selected tone
- **Save Settings button** at bottom

**Backend:**

- `app/api/scrape-summarize/route.ts` — POST endpoint: fetch URL + discover linked pages (`/about`, `/faq`, `/shipping`, `/returns`, `/terms`, `/pricing`, `/contact`) → strip via Readability → summarize via Fireworks → return `{ summary: string }`
- `lib/scraper.ts` — page discovery, parallel fetch with 4s per-page timeout, content extraction
- `@mozilla/readability` + `linkedom` — HTML parsing and content extraction
- `convex/users.ts` — `saveBusinessContext` mutation stores `business_context` on user record
- `convex/schema.ts` — `business_context: v.optional(v.string())` on `users` table
- Agent: both `classifyEmail.ts` and `draftReply.ts` prepend business context as system prompt prefix

---

### 05.5 Business Context Logic

Wire the auto-fill and save logic for business context.

**UI:**
- URL input + "Auto-fill from Website" button
- Textarea with auto-fill result (editable)
- Loading state during auto-fill
- Save button saves to Convex

**Logic:**
- "Auto-fill from Website" → POST `/api/scrape-summarize` with URL
- API route: `fetch()` main URL → `linkedom` parse + discover linked pages → `Promise.allSettled` fetch all (4s per-page timeout) → `@mozilla/readability` strip each → Fireworks summarize into structured text → return summary
- On success: pre-fill textarea with summary
- On failure: textarea stays empty — owner types manually
- Save: Convex mutation `saveBusinessContext` writes to `users.business_context`
- Agent injection: both `classifyEmail()` and `draftReply()` query `business_context` and prepend it as system prompt prefix

**PostHog events:** `business_context_saved`, `business_context_autofilled`

---

### 06 Inbox Connection Logic

Wire inbox connection to real Gmail API or mock.

**Logic:**

- "Connect Gmail Inbox" initiates OAuth flow with Gmail API scope
- OAuth callback stores tokens in `inboxConnections` table (encrypted via Convex)
- Connection status shows real-time state from Convex
- "Use Mock Inbox" toggle:
  - When enabled: shows mock inbox UI with "Send Test Email" button
  - When disabled: shows Gmail connection flow
- Mock inbox: click "Send Test Email" → opens modal with From, Subject, Body fields → triggers `triggerMockEmail` mutation → email appears in triage feed immediately

**PostHog events:** `inbox_connected`, `mock_inbox_toggled`

---

### 07 Escalation Rules Logic

Save escalation rules to Convex.

**Logic:**

- Mutation saves rules to `users.escalation_rules` as JSON array
- Rules applied in agent classification flow via `triageWorkflow.ts`
- Rule priority overrides agent confidence
- Form pre-fills with existing rules on return visits
- `revalidatePath('/settings')` called after save

**PostHog events:** `rule_created`, `rule_deleted`, `rule_toggled`

---

### 08 Reply Tone Logic

Save reply tone preference to Convex.

**Logic:**

- Tone saved to `users.reply_tone` field
- Agent uses tone preference when drafting replies via `draftReplyNode`
- Preview updates in real-time based on selected tone
- `revalidatePath('/settings')` called after save

---

## Phase 3 — Triage Feed

### 09 Triage Feed — Full UI

Build the complete triage feed UI with mock data. No logic yet.

**UI:**

- **Page header:** "Triage Feed" title + subtitle "Every email is classified and actioned automatically"
- **Stats bar:** Emails Today, Auto-replied, Escalations Pending
- **Feed controls:**
  - Filter tabs: All / Auto-replied / Escalated / Pending
  - Sort dropdown: Newest / Oldest / Priority
  - Search input: "Filter by subject, sender, or content..."
- **Decision cards list:** (infinite scroll or pagination)
  - Each card shows:
    - Sender name/email
    - Subject line (truncated)
    - Classification badge (Routine/Technical/Urgent/Sales/Other)
    - Confidence score with mini progress bar
    - Action badge (Auto-replied / Escalated)
    - Timestamp (relative time)
    - Click → opens decision details page
- **Empty state:** No emails processed yet. Connect your inbox to get started.
- **Mock inbox testing:** Shows "Send Test Email" button if mock inbox is enabled

---

### 10 Email Ingestion Agent

Agent listens for incoming emails (Gmail webhook or mock trigger), processes each one.

**Logic:**

- Gmail watch setup via `gmail.watch()` (push notifications) OR mock trigger mutation
- On email arrival → `ingestEmail()` Convex mutation stores email
- Agent runs `classifyEmail()` with Fireworks AI via LangChain:
  - Input: email subject, body, sender
  - Output: classification (routine/technical/urgent/sales/other), confidence (0-1), reasoning
- Check escalation rules against classification via `applyRules()`
- If confidence < CONFIDENCE_THRESHOLD OR rule matches → escalate
- If confidence >= CONFIDENCE_THRESHOLD AND no rule matches → auto-reply
- Save decision to `triageDecisions` table
- Trigger realtime update via Convex's reactive queries

**PostHog events:** `email_ingested`, `email_classified`

---

### 11 Auto-Reply Drafting

Agent drafts reply for auto-replied emails.

**Logic:**

- If decision is auto-reply → call `draftReply()` with Fireworks AI:
  - Input: email subject, body, sender, user's reply tone preference, escalation rules (context)
  - Output: draft reply text
- Draft saved to `triageDecisions.draft_text`
- Decision status updated to "replied"
- **For hackathon:** Save draft, show in feed with "Draft" badge
- **Optional extension:** Send via Gmail API with one click

**PostHog events:** `email_auto_replied`

---

### 12 Escalation Management

Escalated emails appear in triage feed with priority.

**Logic:**

- If decision is escalate → create record in `escalations` table
- Priority set from escalation rule (Low/Medium/High/Urgent) or default Medium if confidence-based
- Escalations appear in feed with priority badges (color-coded)
- Click escalation → opens decision details page

**PostHog events:** `email_escalated`

---

### 13 Filter + Sort + Search

Wire filter tabs, sort dropdown, and text search to real Convex data.

**Logic:**

- All tab — all decisions for current user
- Auto-replied filter — decisions with action = "auto_reply"
- Escalated filter — decisions with action = "escalate"
- Pending filter — escalations with status = "pending"
- Sort by Newest/Oldest — order by created_at desc/asc
- Sort by Priority — order by escalation priority (urgent > high > medium > low)
- Text search — filter by subject, from_email, or from_name (case insensitive) using Convex search with `db.query().filter()`

**Convex query example:**

```typescript
// convex/triage.ts
export const getTriageFeed = query({
  args: {
    userId: v.id("users"),
    filter: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.search) {
      query = query.filter((q) =>
        q.or(
          q.eq(q.field("from_email"), args.search),
          q.eq(q.field("subject"), args.search),
        )
      );
    }

    if (args.filter === "auto_reply") {
      query = query.filter((q) => q.eq(q.field("action"), "auto_reply"));
    } else if (args.filter === "escalate") {
      query = query.filter((q) => q.eq(q.field("action"), "escalate"));
    }

    return await query.collect();
  },
});
```

---

### 14 Realtime Updates

Leverage Convex's built-in reactivity.

**Logic:**

- Dashboard and triage feed use `useQuery()` from Convex
- New emails appear automatically without page refresh
- Decision status updates appear live
- No manual WebSocket/Socket.IO wiring needed

**Example:**

```typescript
// app/decisions/page.tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DecisionsPage() {
  const decisions = useQuery(api.triage.getTriageFeed, { userId });
  // decisions updates in realtime as new emails arrive
}
```

---

## Phase 4 — Decision Details Page

### 15 Decision Details Page — Full UI

Build the complete decision details page UI. Data from Convex is already available from Phase 3.

**UI:**

- **Back to Feed link** (arrow + "Back to Triage Feed")
- **Email header:** From, Subject, Received date, Status badge
- **Email body** — full content displayed in a card
- **AI Decision section:**
  - Classification badge (Routine/Technical/Urgent/Sales/Other)
  - Confidence score with progress bar
  - Action badge (Auto-replied/Escalated)
  - Full reasoning text from agent in a highlighted box
- **Draft section (if auto-replied):**
  - Draft reply text displayed in a card
  - Edit Draft button (opens textarea editor)
  - Send Draft button (sends via Gmail API)
  - Regenerate Draft button (re-runs Fireworks AI)
- **Escalation section (if escalated):**
  - Priority badge (Low/Medium/High/Urgent)
  - Status: Pending / In Progress / Resolved
  - Resolution note textarea
  - Resolve Escalation button
- **AMD ROCm context (if embedding exists):**
  - "Powered by AMD ROCm" badge
  - Similar past customer interactions shown
  - Embedding generation timestamp

---

### 16 Draft Editing + Resolution

Wire draft editing and escalation resolution to Convex.

**Logic:**

- Edit Draft: mutation updates `draft_text` in `triageDecisions`
- Regenerate Draft: re-runs `draftReply()` with Fireworks AI, updates draft
- Send Draft: (optional extension) sends via Gmail API, marks as replied
- Resolve Escalation: mutation updates `escalations` status to "resolved", adds resolution note
- All mutations trigger realtime updates in triage feed via Convex
- `revalidatePath('/decisions')` called after each mutation

**PostHog events:** `draft_edited`, `draft_sent`, `triage_resolved`

---

### 17 AMD ROCm Embedding Step (Explicit AMD Usage)

Customer history embedding generation via AMD Developer Cloud with ROCm on AMD Instinct GPU. This is the **named AMD step** required for hackathon submission.

**Logic:**

- When email arrives → extract sender email address
- Check `customerEmbeddings` for existing embedding for this email
- If embedding missing or stale (> 30 days):
  - Call AMD Developer Cloud endpoint with ROCm on AMD Instinct GPU
  - Generate embedding from email text + subject
  - Save embedding to `customerEmbeddings` table with timestamp
- If embedding exists and is fresh:
  - Use existing embedding for similarity search
- Fireworks AI prompt includes similar past interactions as context

**AMD ROCm API call:**

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
}
```

**Why this is the named AMD step:**
- Runs on ROCm (AMD Instinct GPU) — named explicitly
- Separate from Fireworks AI (different API endpoint)
- Real workload (embedding generation for retrieval)
- Demonstrable in README and video
- Falls back gracefully if AMD endpoint is unavailable

**PostHog events:** `embedding_generated` — includes `hardware: "AMD Instinct GPU with ROCm"`

**Fallback:** If AMD endpoint fails → use simple TF-IDF or skip context (still works, but AMD usage is logged for demo)

---

## Phase 5 — Dashboard

### 18 Dashboard Page — Full UI

Build the complete dashboard UI with mock data.

**UI:**

- **Page header:** "Dashboard" title + subtitle "Your email triage performance at a glance"
- **Stats bar — 4 cards:**
  - Emails Processed Today
  - Auto-reply Rate (percentage)
  - Escalations Pending
  - Estimated Time Saved (hours)
- **Triage Activity chart:** Line chart showing email volume over last 7 days (recharts)
- **Classification Distribution chart:** Pie or bar chart showing Routine vs Technical vs Urgent vs Sales vs Other
- **Recent Activity feed:** Last 5-10 decisions with timestamps and status
- **AMD Usage badge:** Shows "Powered by AMD ROCm" with checkmark and last embedding generation time

---

### 19 Stats Bar — Real Data

Wire four stat cards to real Convex data for current user.

**Logic:**

- Emails Processed Today — COUNT of emails where user_id = current user AND received_at >= today (0:00)
- Auto-reply Rate — COUNT(auto_reply) / COUNT(emails processed) * 100 for current user
- Escalations Pending — COUNT(escalations) where status = "pending" AND user_id = current user
- Estimated Time Saved — auto_reply_count * 2 minutes (assuming 2 min saved per reply) — compute in JS

**Convex queries:**

```typescript
// convex/dashboard.ts
export const getDashboardStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emailsToday = await ctx.db
      .query("emails")
      .withIndex("by_user_and_received", (q) =>
        q.eq("userId", args.userId).gte("received_at", today.toISOString())
      )
      .collect();

    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const autoReplies = decisions.filter(d => d.action === "auto_reply");
    const escalations = await ctx.db
      .query("escalations")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", "pending")
      )
      .collect();

    return {
      emailsToday: emailsToday.length,
      autoReplyRate: decisions.length > 0
        ? (autoReplies.length / decisions.length) * 100
        : 0,
      escalationsPending: escalations.length,
      timeSaved: autoReplies.length * 2, // 2 minutes per reply
    };
  },
});
```

---

### 20 Recent Activity — Real Data

Wire recent activity feed to real Convex data for current user.

**Logic:**

- Query `triageDecisions` — most recent 10 decisions for current user
- Format each into human readable string:
  - auto_reply → "Auto-replied to [sender] — [time ago]"
  - escalate → "Escalated [sender] — [priority] priority — [time ago]"
- Color coded dot per decision type — green for auto-reply, red/orange for escalation

**Convex query:**

```typescript
// convex/dashboard.ts
export const getRecentActivity = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    return decisions.map((d) => ({
      ...d,
      timeAgo: formatRelativeTime(d.created_at),
    }));
  },
});
```

---

### 21 Analytics Charts — Real Data

Wire dashboard charts to real Convex data.

**Logic:**

- Triage Activity — query `triageDecisions` for last 7 days, group by day, COUNT per day
- Classification Distribution — query `triageDecisions`, group by classification, COUNT per type
- All charts rendered with recharts
- Empty state shown for each chart when no data exists yet

**Convex query:**

```typescript
// convex/dashboard.ts
export const getChartData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("created_at"), sevenDaysAgo.toISOString()))
      .collect();

    // Group by day for activity chart
    const dailyActivity = {};
    decisions.forEach((d) => {
      const day = d.created_at.split("T")[0];
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    // Group by classification for distribution chart
    const classificationCounts = {};
    decisions.forEach((d) => {
      classificationCounts[d.classification] =
        (classificationCounts[d.classification] || 0) + 1;
    });

    return {
      dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({
        date,
        count,
      })),
      classification: Object.entries(classificationCounts).map(
        ([name, value]) => ({ name, value })
      ),
    };
  },
});
```

**PostHog events:** `dashboard_viewed`

---

## Feature Count

| Phase                 | Features |
| --------------------- | -------- |
| Phase 1 — Foundation  | 4        |
| Phase 2 — Settings    | 4        |
| Phase 3 — Triage Feed | 6        |
| Phase 4 — Details     | 3        |
| Phase 5 — Dashboard   | 4        |
| **Total**             | **21**   |

---

## Hackathon-Specific Notes

### AMD ROCm Usage

**Feature 17** is the **explicit AMD ROCm step** required for submission. This must be:

1. **Named explicitly** — function called `generateEmbedding()` with AMD Developer Cloud call
2. **Demonstrated in video** — show embedding generation in action (log output or UI indicator)
3. **Documented in README** — explain how AMD ROCm is used
4. **Separate from Fireworks AI** — not just "Fireworks uses AMD" (Fireworks may use AMD, but hackathon wants explicit usage)

### Fireworks AI Usage

Features 10 and 11 use Fireworks AI API:

- `classifyEmail()` — classification + confidence + reasoning
- `draftReply()` — draft generation

Both use `accounts/fireworks/models/llama-v3-70b-instruct` as primary model with fallback to `accounts/fireworks/models/llama-v3-8b-instruct`.

### Cost Optimization

- Build and test against mock Fireworks responses first (use `NODE_ENV=development`)
- Use `CONFIDENCE_THRESHOLD = 0.7` to minimize API calls
- Cache Fireworks responses for identical emails during testing
- Only hit AMD Developer Cloud endpoint when embedding is needed (check `customerEmbeddings` first)

### Submission Timeline

| Date | Milestone |
|------|-----------|
| July 2 | Register for hackathon, apply for Fireworks credits |
| July 6-11 | Hackathon event |
| July 11 | Submission deadline |

### Convex Advantages for Hackathon

- **No infrastructure management** — no server to deploy or maintain
- **Realtime out of the box** — dashboard updates live without WebSocket code
- **Type-safe** — all Convex functions are fully typed
- **Serverless** — scales automatically, no ops work
- **Free tier** — generous enough for hackathon demo

### Dockerization

Project is Dockerized for submission:

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

**Note:** Convex, Fireworks AI, and AMD Developer Cloud are external services — not self-hosted in the container.

### Mock Data Strategy

For development and testing:

```typescript
// lib/mock-data.ts
export const mockEmails = [
  {
    from: "customer@example.com",
    subject: "Where is my order?",
    body: "I ordered on Monday and haven't received shipping info yet.",
  },
  {
    from: "angry@example.com",
    subject: "URGENT: Product defective",
    body: "The product arrived broken. I need a refund immediately.",
  },
  {
    from: "curious@example.com",
    subject: "What are your hours?",
    body: "Do you have weekend support hours?",
  },
];

// Use in development
if (process.env.NODE_ENV === "development") {
  // Use mock classification instead of Fireworks
}
```

### Submission Checklist

- [ ] Project Dockerized
- [ ] Public GitHub repo + README with AMD/ROCm explanation
- [ ] AMD/ROCm usage named explicitly in README and demo video
- [ ] MIT-compliant, original work
- [ ] Registered before July 2 for Fireworks credits
- [ ] Fireworks AI API integrated
- [ ] Convex realtime working
- [ ] AMD Developer Cloud endpoint integrated
- [ ] PostHog analytics events firing
- [ ] Dashboard shows live data
# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap agent operations in try/catch, log failures, never let one failure crash everything

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- React 19 — use React 19 APIs throughout
- All components are Server Components by default
- Only add `"use client"` when the component requires:
  - useState or useReducer
  - useEffect
  - Browser APIs
  - Event listeners
  - Third party client-only libraries (PostHog browser side, recharts)
- Never add `"use client"` to layout files unless absolutely required
- Data fetching happens in Server Components — never fetch in Client Components directly
- Route handlers live in `app/api/` — never put business logic directly in route handlers
- Caching is uncached by default — all dynamic code runs at request time
- Always read Next.js documentation before implementing any Next.js specific feature — APIs may differ from training data

---

## File and Folder Naming

- Folders: kebab-case — `decision-details`, `triage-feed`
- Component files: PascalCase — `StatsBar.tsx`, `RecentActivity.tsx`
- Utility files: camelCase — `fireworks.ts`, `posthog-client.ts`
- Type files: camelCase — `index.ts`
- Convex files: camelCase — `emails.ts`, `triage.ts`
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { DecisionCard } from "@/components/triage/DecisionCard";

// 3. Type definitions
type Props = {
  decisionId: string;
  classification: string;
  confidence: number;
};

// 4. Component
export function ComponentName({ decisionId, classification, confidence }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared
- No inline styles — all styling via Tailwind classes using CSS variables from ui-tokens.md

---

## Convex Functions

### Query

```typescript
// convex/triage.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTriageFeed = query({
  args: {
    userId: v.id("users"),
    filter: v.optional(v.string()),
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Always scope to user
    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return decisions;
  },
});
```

**Rules:**
- Every query scoped to current user — never query without user filter
- Use `withIndex()` for efficient queries — always define indexes in schema
- Return only what the UI needs — never return sensitive data
- Use `v.optional()` for optional arguments

### Mutation

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
    // Validate user has access
    const decision = await ctx.db.get(args.decisionId);
    if (!decision) throw new Error("Decision not found");

    // Update escalation
    await ctx.db.patch(args.decisionId, {
      status: "resolved",
      resolvedAt: new Date().toISOString(),
      resolutionNote: args.note,
    });
  },
});
```

**Rules:**
- Always validate the user has access to the data being mutated
- Use `ctx.db.patch()` for partial updates — `replace()` only for full overwrites
- Never trust client input — validate all args
- Mutations are atomic — no need for transactions for single operations

### Database Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    business_name: v.string(),
    email: v.string(),
    plan: v.string(),
  }).index("by_email", ["email"]),

  triageDecisions: defineTable({
    userId: v.id("users"),
    emailId: v.id("emails"),
    classification: v.string(),
    confidence: v.float64(),
    action: v.string(),
    draft_text: v.optional(v.string()),
    reasoning: v.string(),
  }).index("by_user", ["userId"]),
});
```

**Rules:**
- Every table must have appropriate indexes for all query patterns
- Use `v.id()` for references to other tables
- Use `v.float64()` for confidence scores and embeddings
- Use `v.optional()` for optional fields
- Indexes defined inline with the table — no separate index declarations

---

## Agent Code

### LangChain Workflow

```typescript
// convex/agent/triageWorkflow.ts
import { StateGraph } from "@langchain/langgraph";

export async function triageEmail(emailId: string, userId: string) {
  try {
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

    const app = workflow.compile();
    const result = await app.invoke({ emailId, userId });

    return { success: true, decision: result.decision };
  } catch (error) {
    await logAgentError(emailId, error);
    return { success: false, error: String(error) };
  }
}
```

**Rules:**
- Every agent function has a try/catch — never let one failure crash the workflow
- Errors are always logged to Convex before returning
- Agent functions never import from `components/`
- Agent functions never use React hooks or browser APIs

### Fireworks AI Calls

```typescript
// convex/agent/classifyEmail.ts
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

export async function classifyEmail(email: Email) {
  try {
    const model = new ChatFireworks({
      modelName: "accounts/fireworks/models/llama-v3-70b-instruct",
      temperature: 0.3,
      apiKey: process.env.FIREWORKS_API_KEY,
    });

    const prompt = `Classify this support email as routine, technical, urgent, sales, or other.
    Email: ${email.subject}\n${email.body}
    Return JSON with classification, confidence (0-1), and reasoning.`;

    const response = await model.invoke(prompt);
    const result = JSON.parse(response.content);

    return result;
  } catch (error) {
    console.error("[classifyEmail]", error);
    throw error;
  }
}
```

**Rules:**
- Always use `temperature: 0.3` for deterministic classification
- Use `temperature: 0.7` for drafting (natural variation)
- Always wrap in try/catch
- Always parse JSON response — never assume valid JSON
- Model string is always full path: `accounts/fireworks/models/...`

---

## AMD ROCm Embedding Step

### Explicit AMD Usage

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
        model: "intfloat/e5-large-v2",
        input: text,
        instruction: "Represent the support email for retrieval: ",
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

**Rules:**
- This function is the **explicit AMD ROCm step** — must be named clearly
- Always wrap in try/catch
- Always log errors with context prefix `[amd-cloud]`
- If AMD endpoint fails → fallback to simple embedding (TF-IDF or random) — never crash the workflow

---

## Convex Client Usage

```typescript
// Browser context — Client Components only
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Usage:
const decisions = useQuery(api.triage.getTriageFeed, { userId });
const resolve = useMutation(api.triage.resolveEscalation);

// Server context — Server Components, API Routes
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// Usage:
const result = await fetchQuery(api.triage.getTriageFeed, { userId });
```

**Rules:**
- Never use `useQuery` in server components
- Never use `fetchQuery` in client components
- Always scope every query to the current user_id — never query without a user filter
- Use `useMutation` for client-side mutations — `fetchMutation` for server-side

---

## Error Handling

- Never use empty catch blocks — always log or handle
- Console errors always include context prefix: `[component/function name]`
- User-facing errors must be human readable — never expose raw error messages
- Agent errors go to Convex logs — never surface raw agent errors to the UI
- API route errors return `status: 500` with generic message — never expose internals
- Convex mutations throw errors — let them propagate to the client

---

## PostHog Events

All PostHog events must use these exact event names. Never invent new event names without adding them here first.

| Event                | When                                       | Key Properties             |
| -------------------- | ------------------------------------------ | -------------------------- |
| `login`              | User successfully signs in                 | userId                     |
| `inbox_connected`    | User connects Gmail inbox                  | userId, provider           |
| `email_ingested`     | Email arrives and is stored                | userId, from, subject      |
| `email_classified`   | Agent classifies an email                  | userId, classification, confidence |
| `email_auto_replied` | Agent sends auto-reply                     | userId, emailId, draftLength |
| `email_escalated`    | Agent escalates an email                   | userId, emailId, priority, reason |
| `triage_resolved`    | User resolves an escalation                | userId, decisionId         |
| `embedding_generated`| AMD ROCm generates embedding               | userId, emailId, timestamp |
| `dashboard_viewed`   | User views dashboard                       | userId                     |

These eight events are the only events in this project. Do not add more without updating this list first.

`email_ingested` powers the Triage Activity dashboard chart.
`email_classified` powers the Classification Distribution chart.
Always fire these with correct properties.

---

## Environment Variables

All environment variables defined in `.env.local` for development. Never hardcode any key, URL, or secret anywhere in the codebase.

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

`NEXT_PUBLIC_` prefix means the variable is exposed to the browser. Never add `NEXT_PUBLIC_` to secret keys.

---

## Confidence Threshold

The auto-reply confidence threshold is defined once as a constant. Never hardcode this value anywhere else.

```typescript
// lib/utils.ts
export const CONFIDENCE_THRESHOLD = 0.7;
```

Import and use `CONFIDENCE_THRESHOLD` everywhere this value is needed.

---

## Import Aliases

Always use the `@/` alias — never use relative imports that go up more than one level.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { CONFIDENCE_THRESHOLD } from "@/lib/utils";

// Never
import { Button } from "../../../components/ui/button";
```

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious decision
- Agent functions may have a brief comment explaining the Fireworks strategy
- Never leave TODO comments in committed code
- **AMD ROCm comments** — must explicitly state "Runs on AMD Instinct GPU with ROCm" for the embedding step

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn/ui already have this component?
2. Does Next.js already provide this functionality?
3. Is there a simpler native solution?

Approved dependencies for this project:

- `convex` — Convex client and server
- `@langchain/langgraph` — Agent orchestration
- `@langchain/community` — LangChain integrations
- `posthog-js` — PostHog browser client
- `posthog-node` — PostHog server client
- `@react-pdf/renderer` — Weekly report PDF generation
- `lucide-react` — Icons
- `tailwindcss` — Styling
- `shadcn/ui` components — UI primitives
- `zod` — Schema validation (optional)

Do not install any other packages without updating this list first.

---

## AMD ROCm Rules

These rules are specific to hackathon submission requirements.

### Named Step

The AMD ROCm usage must be:

1. **Named explicitly** — function called `generateEmbedding()` or similar
2. **Called from a named step** — not buried inside a generic "process email" function
3. **Documented** — README explains what it does and why AMD was chosen
4. **Demonstrated** — video shows the AMD step in action

### Fallback Behavior

```typescript
export async function getCustomerContext(email: string, text: string) {
  try {
    // Try AMD ROCm first
    const embedding = await generateEmbedding(text);
    return await searchSimilarCustomers(email, embedding);
  } catch (error) {
    console.error("[amd] Fallback to simple similarity", error);
    // Fallback to simple text search or no context
    return [];
  }
}
```

### Logging

Always log AMD ROCm usage:

```typescript
posthog.capture("embedding_generated", {
  userId,
  emailId,
  model: "intfloat/e5-large-v2",
  hardware: "AMD Instinct GPU with ROCm",
  timestamp: new Date().toISOString(),
});
```

---

## Hackathon-Specific Rules

### Cost Optimization

- Build against mock Fireworks responses first
- Use `NODE_ENV=development` to bypass Fireworks API calls
- Only hit AMD Developer Cloud endpoint when embedding is needed
- Cache embeddings for 30 days to minimize AMD API calls

### Docker

Project must be Dockerized for submission:

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
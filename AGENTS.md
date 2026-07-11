# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
 
# Next.js: ALWAYS read docs before coding
 
Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
 
<!-- END:nextjs-agent-rules -->


**TriageAI** — AI-Powered Customer Support Assistant
*AMD Developer Hackathon: ACT II — Unicorn Track*

---

## Project Role

You are a **senior full-stack developer** building TriageAI — an AI-powered customer support assistant for SMBs. The project uses **Next.js 16** with **Convex** as the reactive backend, **Fireworks AI** for LLM inference, and **AMD ROCm** for embedding generation.

---

## Critical Rules

### Read Context Files First — ALWAYS

**Before writing ANY code:**

1. Read the relevant context files for what you're building
2. Understand the patterns, tokens, and architecture
3. Match existing patterns — never invent new ones

| What You're Building | Read These Files |
|----------------------|------------------|
| Any UI component | `ui-tokens.md`, `ui-rules.md`, `ui-registry.md` |
| Any page/layout | `architecture.md`, `ui-rules.md` |
| Any backend/Convex | `architecture.md`, `code-standards.md` |
| Any agent/AI | `architecture.md`, `code-standards.md`, `library-docs.md` |
| Any library usage | `library-docs.md` |
| Understanding the project | `project-overview.md`, `architecture.md` |
| Planning new features | `build-plan.md`, `progress-tracker.md` |

**Never assume — always verify against these files first.**

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Backend + DB + Realtime | Convex |
| Auth | Convex Auth |
| AI Model | Fireworks AI API (Llama 3 70B) |
| Agent Orchestration | LangChain.js |
| Email Ingestion | Gmail API or Mock Inbox |
| AMD Compute (ROCm) | AMD Developer Cloud API |
| Analytics | PostHog |
| Styling | Tailwind CSS + shadcn/ui |
| Language | TypeScript strict |

---

## Architecture Principles

### Convex-First

- All backend logic lives in `convex/` — queries, mutations, and agent workflows
- Database schema defined in `convex/schema.ts`
- All queries scoped to current user via Convex Auth
- Realtime updates are automatic — no manual WebSocket/Socket.IO wiring

### Agent Architecture

- LangChain StateGraph orchestrates the triage workflow
- Fireworks AI for classification and drafting
- AMD ROCm for embedding generation (explicit step)
- Agent code in `convex/agent/`
- Never import agent code into React components

### UI Components

- Server Components by default
- `"use client"` only for hooks, browser APIs, or client-only libraries
- shadcn/ui for primitives — never custom build what shadcn provides
- All styles via CSS variables — no hardcoded colors

---

## Folder Structure

```
/
├── app/
│   ├── (auth)/login/         → Login page
│   ├── dashboard/            → Dashboard page
│   ├── decisions/            → Triage feed + decision details
│   ├── settings/             → Settings page
│   └── api/                  → API routes (if needed)
├── components/
│   ├── ui/                   → shadcn/ui components
│   ├── layout/               → Navbar, Footer
│   ├── dashboard/            → Stats, charts, alerts
│   ├── triage/               → Feed, cards, filters
│   ├── decision-details/     → Reasoning, draft editor, escalation
│   └── settings/             → Inbox connection, rules, tone
├── convex/
│   ├── schema.ts             → Database schema
│   ├── auth.ts               → Convex Auth config
│   ├── users.ts              → User queries/mutations
│   ├── emails.ts             → Email ingestion
│   ├── triage.ts             → Decision queries/mutations
│   ├── escalations.ts        → Escalation management
│   └── agent/
│       ├── classifyEmail.ts  → Fireworks AI classification
│       ├── draftReply.ts     → Fireworks AI drafting
│       ├── generateEmbedding.ts → AMD ROCm step
│       └── triageWorkflow.ts → LangChain orchestration
├── lib/
│   ├── convex-client.ts      → Convex client
│   ├── fireworks.ts          → Fireworks AI client
│   ├── gmail.ts              → Gmail API client
│   ├── amd-cloud.ts          → AMD Developer Cloud client
│   ├── posthog-client.ts     → PostHog browser client
│   └── posthog-server.ts     → PostHog server client
├── types/
│   └── index.ts              → Global TypeScript types
└── context/                  → Project context files
    ├── architecture.md
    ├── build-plan.md
    ├── code-standards.md
    ├── library-docs.md
    ├── project-overview.md
    ├── progress-tracker.md
    ├── ui-registry.md
    ├── ui-rules.md
    └── ui-tokens.md
```

---

## Skills

Load skills only when explicitly triggered. Never load a skill just because it exists.

| Command | Trigger | Action |
|---------|---------|--------|
| `/architect` | Before building something non-trivial with no plan yet | Load architecture planning skill |
| `/review` | When a feature is done and needs a production check | Load code review skill |
| `/recover` | When something is broken and the fix isn't obvious | Load debugging/recovery skill |
| `/imprint` | **After any new UI component** | Capture patterns, classes, and tokens used |
| `/remember restore` | **First action of every session** | Restore session context |
| `/remember save` | **Last action of every session** | Save session progress |

---

## `/imprint` — UI Pattern Capture

**When to run:** After creating ANY new UI component

**What it does:** Records the component's patterns so future components match

**What to document:**

```markdown
### ComponentName — `path/to/component.tsx`

usage:      <ComponentName prop={value} />
structure:  brief layout description
classes:    exact Tailwind classes used
variants:   any variants (if applicable)
patterns:   any notable patterns or decisions
```

**Why it matters:** Prevents pattern drift. Every new component matches existing ones.

**Example after creating StatCard:**

```markdown
### StatCard — `components/dashboard/StatCard.tsx`

usage:      <StatCard label="Emails" value="124" trend={{ value: 12, direction: "up" }} />
structure:  flex flex-col gap-1 p-6 bg-surface border rounded-lg shadow-card
classes:    label: text-sm font-medium text-text-secondary
            value: text-3xl font-bold text-text-primary tabular-nums
            trend-up: bg-success-lightest text-success-dark px-2 py-0.5 rounded-sm text-xs
            trend-down: bg-error-light text-error px-2 py-0.5 rounded-sm text-xs
variants:   default / highlight / warning / error
patterns:   onClick prop for navigation to filtered view
```

---

## Session Continuity

**REQUIRED — do not skip, do not wait to be asked:**

1. **First action of every session:** Run `/remember restore`
2. **Last action of every session:** Run `/remember save`

---

## Code Standards (Summary)

For full details, read `context/code-standards.md`.

### TypeScript
- Strict mode — no exceptions
- Never use `any` — use `unknown` and narrow
- All function parameters and return types explicitly typed
- Use `type` for objects/unions, `interface` for component props

### Convex Functions
- Always scope queries to current user
- Use `withIndex()` for efficient queries
- Mutations validate user access before writes
- Never trust client input — validate all args

### Agent Code
- Every agent function has try/catch
- Errors logged to Convex before returning
- Never import from `components/` or `lib/client`

### PostHog Events
Exact event names — never invent new ones:
- `login`
- `inbox_connected`
- `email_ingested`
- `email_classified`
- `email_auto_replied`
- `email_escalated`
- `triage_resolved`
- `embedding_generated`
- `dashboard_viewed`

### AMD ROCm Step
The embedding generation step must be:
1. **Named explicitly** — `generateEmbedding()` function
2. **Called from a named step** — not buried in generic code
3. **Documented** — README explains AMD ROCm usage
4. **Demonstrated** — video shows AMD step in action
5. **Fallback** — if AMD fails, use simple fallback (never crash)

---

## Build Phases

See `context/build-plan.md` for full details.

| Phase | Features | Status |
|-------|----------|--------|
| 1 — Foundation | Landing, Auth, PostHog, Convex schema | Not Started |
| 2 — Settings | Inbox connection, Rules, Reply tone | Not Started |
| 3 — Triage Feed | Email ingestion, Classification, Drafting, Filtering | Not Started |
| 4 — Details | Decision view, Draft editing, Escalation, AMD ROCm | Not Started |
| 5 — Dashboard | Stats, Charts, Activity feed | Not Started |

**Current status:** See `context/progress-tracker.md`

---

## Environment Variables

| Variable | Used In |
|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | lib/convex-client.ts |
| `CONVEX_DEPLOYMENT` | Convex deployment |
| `FIREWORKS_API_KEY` | lib/fireworks.ts, lib/llm.ts |
| `LLM_PROVIDER` | lib/llm.ts — `"gemma"` (default), `"fireworks"`, or `"gemini"` |
| `FIREWORKS_MODEL` | lib/llm.ts, convex/agent/lib.ts — defaults to `accounts/fireworks/models/llama-v3p3-70b-instruct`; set to `accounts/fireworks/models/gemma-4-31b-it` when dedicated deployment is created |
| `GOOGLE_API_KEY` | lib/llm.ts — used when `LLM_PROVIDER=gemini` |
| `GOOGLE_CLIENT_ID` | Convex Auth |
| `GOOGLE_CLIENT_SECRET` | Convex Auth |
| `NEXT_PUBLIC_POSTHOG_KEY` | lib/posthog-client.ts |
| `NEXT_PUBLIC_POSTHOG_HOST` | lib/posthog-client.ts |
| `AMD_CLOUD_ENDPOINT` | lib/amd-cloud.ts |
| `AMD_CLOUD_API_KEY` | lib/amd-cloud.ts |

---

## Hackathon Submission Checklist

- [ ] Project Dockerized
- [ ] Public GitHub repo + README
- [ ] AMD/ROCm usage named explicitly in README and demo video
- [ ] MIT-compliant, original work
- [ ] Registered before July 2 for Fireworks credits
- [ ] Fireworks AI API integrated
- [ ] Convex realtime working
- [ ] AMD Developer Cloud endpoint integrated
- [ ] PostHog analytics events firing

---

## Context Files Reference

| File | Content |
|------|---------|
| `architecture.md` | Full stack architecture, data flow, DB schema |
| `build-plan.md` | 21 features across 5 phases |
| `code-standards.md` | TypeScript, Convex, Agent, PostHog rules |
| `library-docs.md` | Project-specific library usage patterns |
| `project-overview.md` | Problem, user flow, success criteria |
| `progress-tracker.md` | Current status, completed features |
| `ui-registry.md` | Component classes and usage |
| `ui-rules.md` | Layout, typography, dark mode, accessibility |
| `ui-tokens.md` | Colors, spacing, component tokens |

---

## Quick Reference

### Read Context Files (Always)
```typescript
// Before ANY code:
// 1. Identify what you're building
// 2. Read the matching context files
// 3. Match existing patterns
```

### Import Convex
```typescript
// Client components
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Server components
import { fetchQuery, fetchMutation } from "convex/nextjs";
```

### Fireworks AI
```typescript
import { fireworks } from "@/lib/fireworks";
const response = await fireworks.invoke(prompt);
```

### AMD ROCm
```typescript
import { generateEmbedding } from "@/lib/amd-cloud";
const embedding = await generateEmbedding(text);
```

### PostHog
```typescript
// Client
posthog.capture("event_name", { userId, ...props });

// Server
const posthog = createPostHogServer();
posthog.capture({ distinctId: userId, event: "event_name", properties: {...}});
await posthog.shutdown();
```

### Convex Query
```typescript
export const getData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("table")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
```

---

---

## ECC Skills & Agents

This project includes a curated selection from the [ECC Tools](https://ecc.tools/) ecosystem — 261+ skills, 64+ agents, and 102 security rules. These work across Claude Code, Codex, Cursor, OpenCode, Antigravity, and any harness that reads `AGENTS.md` and `.agents/skills/`.

### Available Skills (13)

Skills are the primary workflow surface. They live in `.agents/skills/` and are auto-discovered by most harnesses. Invoke by name in your prompt.

| Skill | Use Case |
|-------|----------|
| `frontend-patterns` | Next.js 16 App Router, Server Components, data fetching |
| `backend-patterns` | API design, database access, caching patterns |
| `tdd-workflow` | Test-driven development with 80%+ coverage enforcement |
| `verification-loop` | Build → test → lint → typecheck → security gate |
| `api-design` | REST API design, pagination, error responses |
| `e2e-testing` | Playwright E2E patterns and Page Object Model |
| `security-review` | OWASP Top 10 checklist, secret detection, secure coding |
| `search-first` | Research-before-coding workflow — read docs before implementing |
| `deployment-patterns` | CI/CD, Docker, health checks, rollbacks |
| `database-migrations` | Schema migration patterns (Convex, Prisma, Drizzle) |
| `cost-aware-llm-pipeline` | LLM cost optimization, model routing, budget tracking |
| `docker-patterns` | Docker Compose, multi-stage builds, networking, security |
| `coding-standards` | Universal best practices — immutability, strict typing, naming |

### Available Agents (15)

Agents are specialized subagents for delegation. They live in `agents/` directory and can be invoked directly.

| Agent | Purpose | Invoke With |
|-------|---------|-------------|
| `planner` | Feature implementation planning with phases and dependencies | "Use the planner agent..." |
| `architect` | System design decisions — database schema, auth flow | "Use the architect agent..." |
| `code-reviewer` | Quality, security, and maintainability code review | "Use the code-reviewer agent..." |
| `typescript-reviewer` | TypeScript/JavaScript code review | "Use the typescript-reviewer agent..." |
| `tdd-guide` | Test-driven development enforcement | "Use the tdd-guide agent..." |
| `security-reviewer` | Vulnerability analysis, OWASP Top 10 audit | "Use the security-reviewer agent..." |
| `build-error-resolver` | Systematic build and CI error resolution | "Use the build-error-resolver agent..." |
| `e2e-runner` | Playwright E2E test orchestration | "Use the e2e-runner agent..." |
| `refactor-cleaner` | Dead code cleanup and simplification | "Use the refactor-cleaner agent..." |
| `doc-updater` | Documentation sync — keeps README, AGENTS.md current | "Use the doc-updater agent..." |
| `docs-lookup` | Documentation/API reference research during coding | "Use the docs-lookup agent..." |
| `database-reviewer` | Database query audit, index usage, N+1 detection | "Use the database-reviewer agent..." |
| `loop-operator` | Autonomous loop execution for batch/iteration tasks | "Use the loop-operator agent..." |
| `harness-optimizer` | Harness config tuning — context, token usage optimization | "Use the harness-optimizer agent..." |
| `chief-of-staff` | Communication triage, drafting, and summarization | "Use the chief-of-staff agent..." |

### Project Rules

Rules in `.claude/rules/ecc/` provide always-follow guidelines:
- `rules/common/` — Language-agnostic principles (coding style, git workflow, testing, patterns, security)
- `rules/typescript/` — TypeScript/JavaScript specific patterns and tools

These are auto-loaded by Claude Code. Other harnesses should read them via this AGENTS.md reference.

### Harness Adapters

ECC assets are wired into harness-specific config directories so they auto-discover regardless of which tool you use:

| Harness | Config Directory | Auto-Discovers |
|---------|-----------------|----------------|
| **OpenCode** | `.opencode/` | Agents, commands, instructions, plugins |
| **Cursor** | `.cursor/` | Rules, hooks, agents, skills |
| **Codex CLI** | `.codex/` | AGENTS.md, agents, config.toml |
| **Gemini CLI** | `.gemini/` | Instructions, config |
| **Zed** | `.zed/` | Settings, rules, commands, agents |
| **Antigravity** | (uses `.agent/` — not yet installed) |

Switch between harnesses freely — each reads its own adapter directory. Run any harness from the project root and it will auto-discover the installed skills, agents, and rules.

### AgentShield — Security Scanner

Scan your agent configs for vulnerabilities at any time:

```bash
# Quick scan of current directory
npx ecc-agentshield scan --path .

# Deep analysis with Opus 4.6 multi-agent pipeline
npx ecc-agentshield scan --opus --stream

# Auto-fix safe issues
npx ecc-agentshield scan --fix

# Generate secure baseline config
npx ecc-agentshield init
```

### Global CLI

ECC is installed globally — use from any directory:

```bash
ecc --version              # Check version
ecc consult "mlops"        # Find relevant components
npx ecc-agentshield scan   # Security audit from anywhere
```

---

## Golden Rules

1. **Read context files first** — always, without exception
2. **Match existing patterns** — never invent new ones
3. **Run `/remember restore` first** — every session
4. **Run `/imprint` after UI components** — capture patterns
5. **Run `/remember save` last** — every session
6. **AMD ROCm is explicit** — named step, documented, demonstrated
7. **Convex is reactive** — use queries, not WebSocket code
8. **Never hardcode colors** — use CSS variables
9. **All queries scope to user** — never query without user filter
10. **Ship features testable** — if it can't be verified, it's incomplete
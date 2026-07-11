# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 5 — Dashboard (Complete)
**Last completed:** All 22 features + hackathon submission prep
**Next:** Hackathon submission (due July 11)

---

## Progress

### Phase 1 — Foundation

- [x] 01 Landing Page
- [x] 02 Auth — Full (Google OAuth, Convex Auth, Callback, Proxy)
- [x] 03 PostHog Initialization
- [x] 04 Convex Database Schema

### Phase 2 — Settings Page

- [x] 05 Settings Page — Full UI
- [x] 05.5 Business Context — Auto-fill + Save + Agent Injection
- [x] 06 Inbox Connection Logic
- [x] 07 Escalation Rules Logic
- [x] 08 Reply Tone Logic

### Phase 3 — Triage Feed

- [x] 09 Triage Feed — Full UI
- [x] 10 Email Ingestion Agent
- [x] 11 Auto-Reply Drafting
- [x] 12 Escalation Management
- [x] 13 Filter + Sort + Search
- [x] 14 Realtime Updates

### Phase 4 — Decision Details Page

- [x] 15 Decision Details Page — Full UI
- [x] 16 Draft Editing + Resolution
- [x] 17 AMD ROCm Embedding Step (Explicit AMD Usage)

### Phase 5 — Dashboard

- [x] 18 Dashboard Page — Full UI
- [x] 19 Stats Bar — Real Data
- [x] 20 Recent Activity — Real Data
- [x] 21 Analytics Charts — Real Data

---

## Feature Count

| Phase                 | Features | Completed |
| --------------------- | -------- | --------- |
| Phase 1 — Foundation  | 4        | 4         |
| Phase 2 — Settings    | 5        | 5         |
| Phase 3 — Triage Feed | 6        | 6         |
| Phase 4 — Details     | 3        | 3         |
| Phase 5 — Dashboard   | 4        | 4         |
| **Total**             | **22**   | **22**    |

---

- **Feature 10 — StateGraph in Convex action**: LangChain StateGraph (v1.4.7) runs inside a Convex internal action with `"use node"` directive. StateGraph constructor uses deprecated `channels` API with `as any` casts to work around complex generic type inference issues with newer Annotation API.
- **Feature 10 — `"use node"` for agent files**: Agent files that import `posthog-node` or make `fetch` calls need `"use node"` directive. Mutations cannot use Node.js runtime — only actions. PostHog events (`email_ingested`, `email_classified`) fired from the `triageWorkflow` action, not from mutations.
- **Feature 10 — Provider-agnostic LLM**: `convex/agent/lib.ts` provides `callLLM()` that checks `LLM_PROVIDER` env var. Routes to Fireworks (default, direct fetch) or Gemini (Google GenAI API). Not using `ChatFireworks` from LangChain for agent calls — direct fetch gives simpler provider switching.
- **Feature 10 — IMAP IDLE for real email**: Gmail push via IMAP IDLE (`node-imap`) with a background listener script (`scripts/inbox-listener.ts` + `npm run listen:inbox`). Connects via OAuth2 XOAUTH2 token. Fetches new emails, POSTs to Convex HTTP endpoint `/ingest-email`. Reconnects automatically on drop.
- **Feature 10 — Agent module path**: Convex files in `convex/agent/` are registered as `"agent/*"` modules. Internal references use dots: `internal.agent._helpers.getEmailForProcessing`. `triageWorkflow.ts` exports as `internal.agent.triageWorkflow.triageWorkflow` — the `.triageWorkflow.triageWorkflow` doubling is because the module name and export name collide. Pre-existing `app/api/gmail/callback/route.ts:116` null→undefined type error fixed.

## Decisions Made During Build

- **Feature 09 — Mock data fallback pattern**: `TriageFeed` uses `useQuery(api.triage.listDecisions)` first; falls back to `mockDecisions` when real data is empty/undefined. Swaps transparently when Feature 10 wires live agent data.
- **Feature 09 — Client-side filter/sort/search**: All filtering/sorting/searching done in-memory on the mock data array. No Convex query filtering yet — Feature 13 upgrades to server-side.
- **Feature 09 — Custom badge colors**: Classification and action badges use inline `cn()` config maps instead of shadcn `Badge` variants. This allows dark mode overrides (`dark:bg-*/20`) that shadcn Badge doesn't natively support with project tokens.
- **PostHog `api_host` uses local `/ingest` proxy** — Next.js rewrites in `next.config.ts` proxy `/ingest/:path*` → PostHog EU servers. Avoids CORS issues and ad-blocker detection. Requires `/ingest(.*)` in `proxy.ts` `isPublicPage` to bypass auth middleware.
- **`posthog.init()` lives in `PostHogProvider` only** — module-level `useEffect` with `__loaded` guard prevents double init. `lib/posthog-client.ts` is a pure re-export of the singleton.
- **`getPostHogServerClient()` uses singleton** — lazy-initialized, returns `null` if PostHog key is missing (no crash).
- **Auth watcher pattern** over inline identify/reset calls — auto-handles all auth transitions globally.
- **Feature 04 — Schema convention**: `snake_case` for all DB fields (`user_id`, `email_id`). Denormalized `user_id` on `emails`, `triageDecisions`, `escalations` for direct user-scoped queries (Convex can't efficiently join). No `status` on `triageDecisions` — `action` field is sufficient. Replaced `by_user_and_status` index with `by_user_and_action`.
- **Feature 12 — Escalation records atomic**: `saveTriageDecision` in `_helpers.ts` creates `escalations` records when `action === "escalate"` — no separate step. Priority determined by `escalateNode` in the workflow (keyword match → rule priority; low confidence → "medium" default).
- **Feature 12 — Priority in StateGraph**: `priority` channel was missing from `StateGraph` channels config — `escalateNode` returned priority but it was silently dropped. Fixed by adding `priority: null` to channels.
- **Feature 13 — `getTriageFeed` replaces `listDecisions`**: New query created alongside existing, then `listDecisions` removed as dead code. Server-side filter/sort/search (text search in-memory — Convex lacks case-insensitive full-text).
- **Feature 14 — Convex reactive by default**: `useQuery()` on `getTriageFeed` with filter/sort/search args automatically re-fetches on arg changes — no manual WebSocket/Socket.IO needed.
- **Test email differentiation**: `isTest` flag set in query by checking `inboxConnections.provider === "mock"`. `clearTestData` mutation only wipes mock connection data. Test badge uses neutral gray (`bg-surface-tertiary text-text-muted`).
- **Feature 15 — Shared triage configs**: Extracted `classificationConfig`, `actionConfig`, `priorityConfig`, `escalationStatusConfig` to `lib/triage-config.ts`. `StatusBadge`, `PriorityBadge`, `ConfidenceBar` reusable components in `components/triage/StatusBadge.tsx`. Used by both `DecisionCard` and all decision-details components.
- **Feature 15 — Dual-mode DraftCard**: Auto-reply emails show read-only "AI Sent Reply" with filled border. Escalated emails show editable "Draft Reply" with empty textarea for manual composition. Empty `draft_text` for escalations noted — auto-generating drafts deferred to Feature 16.
- **Feature 15 — 12-col grid layout**: Left 7 cols (content + draft), right 5 cols (AI logic + resolution + context). Matches Stitch design system layout.
- **Feature 15 — Material Symbols font**: Added via `<link>` in `app/layout.tsx`. Previously missing — icons weren't rendering.
- **Feature 15 — Architecture route update**: Updated `architecture.md` route references from `/decisions` → `/dashboard/decisions`, `/settings` → `/dashboard/settings`.
- **Feature 16 — Draft editing mutations**: `convex/decisions.ts` with `updateDraft` (mutation) and `resolveEscalation` (mutation). `convex/agent/regenerateDraft.ts` action with `"use node"` for LLM calls.
- **Feature 16 — Regenerate uses callLLM**: `regenerateDraft` action calls `callLLM()` from `lib.ts` which routes to Gemini or Fireworks based on `LLM_PROVIDER` env var. Retries 3x on 503/429 with exponential backoff, falls back to mock.
- **Feature 16 — Mock fallback fix**: Added `mockDraft()` function to `lib.ts`. Old `mockClassify()` was used for both classification and drafting — drafts got JSON instead of replies. Now `callLLM` detects context from system prompt (`"drafting replies"`) and uses appropriate mock.
- **Feature 16 — Gemini in Convex**: `LLM_PROVIDER=gemini` must be set in Convex env (not just `.env.local`). Convex actions run on Convex servers, not locally. Using `gemini-3-flash` model.
- **Feature 16 — UI state sync**: `DraftCard` added `useEffect` to sync `draft` state with `draftText` prop when Convex reactive queries refetch after regeneration.
- **`as any` casts**: Pre-existing workaround for Convex/LangChain type mismatches — documented in `progress-tracker.md`, not new technical debt.

---

## Decisions Made During Build

- **Feature 19 — Time-saved min floor**: `Math.max(0.1, value)` ensures even 1 auto-reply (2 min) shows at least "0.1h" instead of rounding to "0h".
- **Feature 20 — 3d-card as universal card base**: `SettingsCard` migrated from shadcn `Card` to `3d-card` (`CardContainer`/`CardBody`/`CardItem`) to match `StatsBar`. All card-like sections (`StatsBar`, `SettingsCard`, `DecisionCard` uses the same 3d-card visual system.
- **Feature 20 — Activity description format**: Auto-reply decisions show `"{Classification} — {subject}"`. Escalated decisions show `"{Priority} priority — {subject}"`. Uses `by_decision` index to fetch escalation priority per decision.
- **Feature 21 — Enrichment in component**: `AnalyticsCharts` computes `label` (day name from ISO date), `color` (classification → CSS variable map), and `percent` (raw count ÷ total × 100) inside `useMemo` hooks. Query returns raw `{ date, count }` and `{ name, value }` only.
- **Feature 21 — Empty charts**: Both line chart and pie chart show empty state with icon + message when no data exists in the 7-day window.

## Known Issues

---

- **Feature 18 — Desktop-first dashboard layout**: Dashboard uses `max-w-5xl` width (matching triage feed) with a 12-column grid for charts (8+4) and activity feed + similar interactions (8+4). Stats bar uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Mock data in `lib/mock-dashboard-data.ts` — Features 19-21 will swap mock for real Convex queries per component.
- **Feature 18 — AMD badge in two places**: A pill badge in the page header (always visible) + a dedicated gradient card below stats. The pill is immediate visual confirmation for the demo video; the card provides context ("Embedding engine active", "Last run" timestamp).
- **Feature 18 — Welcome banner pattern**: Green left border (`border-l-4 border-l-success`) with checkmark status message — matches the "all caught up" pattern from Stitch design.
- **Feature 18 — Stat card consistency**: Clickable stat cards with `hover:shadow-md` transition, icon in colored circle top-right (`bg-*/10 p-2 rounded-lg`), trend indicator below value. Pattern mirrors existing `DecisionCard` hover pattern.
- **Feature 18 — recharts for both charts**: LineChart for activity (monotone, `var(--color-primary)` stroke 2.5px, grid with dashed lines), PieChart for classification (donut variant, innerRadius 45/outerRadius 70, custom legend below).

---

## Hackathon Submission Checklist

- [x] Project Dockerized
- [x] Public GitHub repo + README (https://github.com/NabilJint/triage-ai)
- [x] AMD/ROCm usage named explicitly in README and demo video
- [x] MIT-compliant, original work (LICENSE added)
- [ ] ~~Registered before July 2 for Fireworks credits~~ (deadline passed)
- [x] Fireworks AI API integrated
- [x] Convex realtime working (dev: canny-dog-569, prod: fleet-gnu-752)
- [x] AMD Developer Cloud endpoint integrated
- [x] PostHog analytics events firing
- [x] Dashboard shows live data

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._

---

## Timeline

| Date      | Milestone                                           |
| --------- | --------------------------------------------------- |
| July 2    | Register for hackathon, apply for Fireworks credits |
| July 6-11 | Hackathon event                                     |
| July 11   | Submission deadline                                 |

---

## Quick Links

- **Architecture:** `context/architecture.md`
- **Build Plan:** `context/build-plan.md`
- **Code Standards:** `context/code-standards.md`
- **UI Tokens:** `context/ui-tokens.md`
- **UI Rules:** `context/ui-rules.md`
- **UI Registry:** `context/ui-registry.md`
- **Library Docs:** `context/library-docs.md`
- **Project Overview:** `context/project-overview.md`

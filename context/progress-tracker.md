# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 1 — Foundation (In Progress)
**Last completed:** 04 Convex Database Schema
**Next:** 05 Settings Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Landing Page
- [x] 02 Auth — Full (Google OAuth, Convex Auth, Callback, Proxy)
- [x] 03 PostHog Initialization
- [x] 04 Convex Database Schema

### Phase 2 — Settings Page

- [ ] 05 Settings Page — Full UI
- [ ] 05.5 Business Context — Auto-fill + Save + Agent Injection
- [ ] 06 Inbox Connection Logic
- [ ] 07 Escalation Rules Logic
- [ ] 08 Reply Tone Logic

### Phase 3 — Triage Feed

- [ ] 09 Triage Feed — Full UI
- [ ] 10 Email Ingestion Agent
- [ ] 11 Auto-Reply Drafting
- [ ] 12 Escalation Management
- [ ] 13 Filter + Sort + Search
- [ ] 14 Realtime Updates

### Phase 4 — Decision Details Page

- [ ] 15 Decision Details Page — Full UI
- [ ] 16 Draft Editing + Resolution
- [ ] 17 AMD ROCm Embedding Step (Explicit AMD Usage)

### Phase 5 — Dashboard

- [ ] 18 Dashboard Page — Full UI
- [ ] 19 Stats Bar — Real Data
- [ ] 20 Recent Activity — Real Data
- [ ] 21 Analytics Charts — Real Data

---

## Feature Count

| Phase                 | Features | Completed |
| --------------------- | -------- | --------- |
| Phase 1 — Foundation  | 4        | 4         |
| Phase 2 — Settings    | 5        | 0         |
| Phase 3 — Triage Feed | 6        | 0         |
| Phase 4 — Details     | 3        | 0         |
| Phase 5 — Dashboard   | 4        | 0         |
| **Total**             | **22**   | **4**     |

---

## Decisions Made During Build

- **PostHog `api_host` uses local `/ingest` proxy** — Next.js rewrites in `next.config.ts` proxy `/ingest/:path*` → PostHog EU servers. Avoids CORS issues and ad-blocker detection. Requires `/ingest(.*)` in `proxy.ts` `isPublicPage` to bypass auth middleware.
- **`posthog.init()` lives in `PostHogProvider` only** — module-level `useEffect` with `__loaded` guard prevents double init. `lib/posthog-client.ts` is a pure re-export of the singleton.
- **`getPostHogServerClient()` uses singleton** — lazy-initialized, returns `null` if PostHog key is missing (no crash).
- **Auth watcher pattern** over inline identify/reset calls — auto-handles all auth transitions globally.
- **Feature 04 — Schema convention**: `snake_case` for all DB fields (`user_id`, `email_id`). Denormalized `user_id` on `emails`, `triageDecisions`, `escalations` for direct user-scoped queries (Convex can't efficiently join). No `status` on `triageDecisions` — `action` field is sufficient. Replaced `by_user_and_status` index with `by_user_and_action`.

---

## Known Issues

- (none)

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
- [ ] Dashboard shows live data

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

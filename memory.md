# Memory — Hackathon Submission Prep (Final Session)

Last updated: 2026-07-11

## What was built

### Session work (continuing from Feature 18)

- **Dashboard wired to real Convex** — all mock data removed: `StatsBar`, `AnalyticsCharts`, `RecentActivity` read from `getDashboardStats`, `getChartData`, `getRecentActivity` queries
- **AmdBadge** reads `amdLastRun` from live `getDashboardStats` (latest `customerEmbeddings.updated_at`)
- **TriageStatsBar** wired to `getTriageStats` (real aggregate counts — 3 queries)
- **`lib/mock-dashboard-data.ts`** deleted; types consolidated in `types/index.ts`
- **Gemma 4 provider** added to both `lib/llm.ts` and `convex/agent/lib.ts`
- **`LLM_PROVIDER=gemma`** new default (was `gemini`)
- **`FIREWORKS_MODEL`** env var replaces hardcoded `gpt-oss-120b`; defaults to `llama-v3p3-70b-instruct` (serverless)
- **Auto-send**: triage workflow calls `api.gmailAccounts.sendReply` immediately on `auto_reply` action
- **AMD embedding server** script at `scripts/amd-embedding-server.py` — runs `intfloat/e5-large-v2` on ROCm behind `cloudflared`
- **`AMD_CLOUD_API_KEY`** made optional — falls back gracefully to Gemini embeddings
- **Docker**: multi-stage `Dockerfile` (output: standalone), `docker-compose.yml`, `.dockerignore`
- **`presentation.html`** — hackathon presentation slides
- **`README.md`** — rewritten comprehensively for hackathon submission
- **MIT `LICENSE`** added
- **`tsconfig.json`** — excludes `.next/dev` to fix typecheck
- **`opencode.json`** — Stitch API key replaced with placeholder to pass GitHub secret scanning

### Hackathon submission prep

- **Typecheck**: passes clean (0 errors)
- **Build**: passes (Next.js 16, compiled successfully)
- **Commit + push to GitHub**: `https://github.com/NabilJint/triage-ai`
- **Convex deployment**: dev (`canny-dog-569`) running with all functions deployed
- **Convex functions verified**: 60+ functions including `dashboard.*`, `agent/*`, `triage.*`, `gmailAccounts.*`, `decisions.*`

## Decisions made

- **Prod deployment is read-only** — user must deploy to prod manually from their Convex account
- **Docker daemon not available locally** — Dockerfile/Compose files are in place but untested on this machine; user should `docker build` on their own
- **Gemma 4 uses serverless Llama by default** — dedicated Gemma 4 deployment can be activated via `FIREWORKS_MODEL` env var
- **`/remember save` run at session end** as required by project rules

## Current state

- All 22 features complete across all 5 phases
- All checklist items done (GitHub, Docker, MIT license, AMD ROCm, Fireworks, Convex, PostHog, README, presentation)
- Project is in demo-ready state with graceful fallbacks for every external dependency
- Hackathon submission deadline: today (July 11)

## Next session starts with

Anything the user wants — the project is complete for hackathon submission. Possible next steps:
1. Push code to prod Convex deployment
2. Build Docker image (requires Docker daemon)
3. Record demo video showing AMD ROCm embedding step
4. Submit to hackathon

## Open questions

- Docker build untested (no daemon on this machine)
- Prod Convex deployment not pushed (requires interactive `npx convex deploy`)

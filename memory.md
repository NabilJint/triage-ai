# Memory — PostHog Initialization (Feature 03)

Last updated: 2026-07-05

## What was built

- **`lib/posthog-client.ts`** — pure re-export of `posthog-js` singleton (no init)
- **`lib/posthog-server.ts`** — lazy singleton for `posthog-node`, env var fallback, returns `null` if key missing
- **`components/PostHogProvider.tsx`** — single source of `posthog.init()` in a `useEffect` with `__loaded` guard, `debug` scoped to dev, `api_host: "/ingest"` for local proxy
- **`components/PostHogAuthWatcher.tsx`** — auto identify/reset on auth changes, try/catch wrapped
- **`app/layout.tsx`** — provider order: `PostHogProvider > ConvexClientProvider > ThemeProvider`
- **`proxy.ts`** — added `/ingest(.*)` to `isPublicPage` so PostHog's API requests bypass auth middleware
- **`opencode.json`** — PostHog MCP server at `https://mcp.posthog.com/mcp`
- **`components/layout/Navbar.tsx`** — "Sign Out" button (calls `signOut()`) shown when authenticated

## Decisions made

- **PostHog `api_host` uses local `/ingest` proxy** from `next.config.ts` rewrites. Avoids CORS and ad-blockers.
- **`posthog.init()` lives in `PostHogProvider` only** — module-level `useEffect` prevents double init.
- **Auth watcher** over inline calls — auto-handles all auth transitions globally.
- **`getPostHogServerClient()`** is a lazy singleton returning `null` if key missing.

## Problems solved

- **Env var name mismatch** — `.env.local` uses `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` but code read `NEXT_PUBLIC_POSTHOG_KEY`. Fixed with `??` fallback in all files.
- **Proxy middleware intercepting PostHog requests** — `/ingest(.*)` added to `isPublicPage` in `proxy.ts` so PostHog API calls aren't redirected to login.
- **Rate limiter HTML/JSON parse error** — was caused by requests hitting Next.js server (via proxy redirect or direct URL) instead of PostHog's API. Fixed by using `/ingest` proxy path.
- **Review issues** — duplicate `posthog.init()`, missing env fallback in server client, missing try/catch, `debug: true` always on. All fixed.

## Current state

- Feature 03 complete, all review issues resolved
- PostHog browser client initialized at `/ingest` proxy path
- Server client lazy singleton with null-safe return
- Auth watcher fires `identify()` + `capture("login")` on auth, `reset()` on de-auth
- TypeScript passes clean
- Progress tracker updated (3/22 complete)

## Next session starts with

- Feature 04 — Convex Database Schema. Create all Convex tables (`userProfiles`, `inboxConnections`, `emails`, `triageDecisions`, `escalations`, `customerEmbeddings`) with indexes and auth rules.

## Open questions

- (none)

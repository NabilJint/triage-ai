# Memory — Scrape-Summarize API, Dead Code Cleanup, Shared Components

Last updated: 2026-07-07

## What was built

### API & Backend
- **`lib/scraper.ts`** — multi-page URL discovery, Jina Reader + direct fetch fallback, Readability extraction, business name derivation (filters generic titles)
- **`lib/llm.ts`** — unified `summarize(text)` with `LLM_PROVIDER` env var; supports Gemini 2.0 Flash and Fireworks Llama 3 70B
- **`app/api/scrape-summarize/route.ts`** — POST endpoint receiving URL, calling scraper + LLM, returning `{ summary, businessName, note }`
- **`convex/schema.ts`** — added `business_url: v.optional(v.string())` to `userProfiles`
- **`convex/userProfiles.ts`** — `updateBusinessContext` now accepts `business_url`; fixed `as any` casts

### UI Wiring (BusinessContext)
- **`components/settings/BusinessContext.tsx`** — real fetch to `/api/scrape-summarize`, loading states, business name input, Convex `updateBusinessContext` save, `getMe` load on mount, modal closes on save
- **`components/onboarding/StepBusinessContext.tsx`** — Fetch Context button, business name input, URL required only when description blank

### Shared Components
- **`components/ui/toggle.tsx`** — extracted `role="switch"` primitive (design system: focus ring `primary/20`)
- **`components/ui/loading-screen.tsx`** — extracted shared loading screen with `variant="spinner" | "skeleton"`
- **`components/ui/settings-card.tsx`** — wraps all 4 settings cards (~8 lines saved per card)
- **`components/ui/auth-background.tsx`** — shared radial gradient for login + onboarding
- **`components/ui/sign-out-button.tsx`** — shared sign out button for both navbars
- **`components/ui/skeleton.tsx`** — shadcn/ui skeleton primitive
- **`components/gmail/GmailConnectButton.tsx`** — shared Gmail connect button (replaced 3 duplicates)
- **`components/layout/FloatingAppNavbar.tsx`** — floating pill navbar variant (available, not wired)

### Reusable Hooks
- **`lib/hooks/useAuthGuard.ts`** — consolidates auth guard + redirect pattern across 5 pages
- **`lib/hooks/useWebsiteScraper.ts`** — consolidates scrape-summarize fetch in StepBusinessContext + BusinessContext
- **`lib/hooks/useScrollPosition.ts`** — consolidates scroll detection in Navbar + AppNavbar

### Code Quality
- **Unified Navbar** — `components/layout/Navbar.tsx` now accepts `mode="landing" | "app"`, merged AppNavbar into it; deleted `AppNavbar.tsx`
- **Replaced `window.location.href`** with `useRouter().push()` in all pages
- **Deleted dead code**: `Confetti.tsx`, `lib/posthog-client.ts`, `progress.tsx`, `animated-tooltip.tsx` (deleted after restoring useful files from over-aggressive cleanup)
- **Deleted `confettiParticle` variant** from `lib/variants.ts` (zero consumers)
- **Applied SettingsCard** to all 4 settings components
- **Applied AuthBackground** to login + onboarding
- **Applied unified Navbar** to dashboard + settings
- **Upgraded LoadingScreen** to accept `variant="skeleton"`; Settings page uses skeleton loading
- **Fixed Toggle focus ring** from `secondary/40` to `primary/20`

## Decisions made

- Business name auto-derived from URL domain; explicit text input visible for manual entry
- URL saved as `business_url` in Convex — AI can reference it later
- Scraper priority: direct fetch first (static → multi-page Readability), Jina Reader fallback (JS-rendered)
- Gemini free tier used for dev to conserve Fireworks credits; `LLM_PROVIDER=fireworks` for submission
- `/settings` and `/dashboard` removed from `proxy.ts` `isPublicPage` — must be protected by auth middleware
- Unified Navbar uses `mode` prop instead of two separate files — 70% shared, 30% mode-specific
- Hooks in `lib/hooks/` to match existing lib-file pattern
- Skeleton kept as available primitive (no mandatory consumers) — LoadingScreen uses it optionally
- FloatingAppNavbar created for planned floating pill pattern but not wired anywhere

## Problems solved

- `proxy.ts` had `/settings` and `/dashboard` in `isPublicPage` — removed so auth middleware protects them server-side
- `BusinessContext.tsx` handleSave lacked try/catch — added proper error handling
- `StepBusinessContext.tsx` focus rings used `secondary` (indigo) instead of `primary` (teal) — fixed
- Over-aggressive file deletion during dead code cleanup deleted useful files (`card-hover-effect.tsx`, `posthog-server.ts`, `debug/cookies/route.ts`) — restored
- Settings page loading state was a spinner — upgraded to skeleton layout matching the 4-card page structure
- `businessContext` in `convex/schema.ts` had wrong property name — fixed from `summary` to `businessContext`

## Current state

- Feature 05.5 (BusinessContext auto-fill + Convex save) complete — real API endpoint, scraper, LLM, save/load cycle
- Shared component extraction complete — 8 new shared components, 3 reusable hooks
- Code quality sweep complete — unified Navbar, dead code removed, loading/empty/error states on all pages
- All changes build with zero errors (TypeScript + Turbopack)
- Build phases: Phase 1-2 complete, Phase 3 (Triage Feed) is next

## Next session starts with

- Wire agent injection: `classifyEmail()` and `draftReply()` read `business_context` and `business_url` from user profile (Phase 3)
- Build Triage Feed UI: email ingestion display, classification cards, filtering
- Wire FloatingAppNavbar if floating pill pattern is desired

## Open questions

- None

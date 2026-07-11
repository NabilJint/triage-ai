# Memory — Dashboard Page + Aceternity UI Wiring

Last updated: 2026-07-11

## What was built

### Feature 18 — Dashboard Page (mock data UI)
- **4 stat cards** in `components/dashboard/StatsBar.tsx` wrapped in Aceternity `3d-card`
- **LineChart + PieChart** in `components/dashboard/AnalyticsCharts.tsx` using Recharts
- **RecentActivity feed** in `components/dashboard/RecentActivity.tsx`
- **AMD ROCm badge** in `components/dashboard/AmdBadge.tsx` repurposed below StatsBar
- Mock data in `lib/mock-dashboard-data.ts`
- Dashboard page wired at `app/dashboard/page.tsx` with staggered entrance animations

### All 6 Aceternity components wired
- `BackgroundBeams` → login + onboarding pages
- `TypewriterEffectSmooth` → landing Hero headline
- Animated tab indicator (`layoutId` spring) → DecisionFilters
- `3d-card` (CardContainer/CardBody/CardItem) → StatsBar stat cards
- `FloatingNav` → shared dashboard layout via `app/dashboard/layout.tsx`
- `card-hover-effect` pattern → DecisionCard hover (CSS group-hover via `bg-surface-secondary`)

### Dead components repurposed
- `AmdBadge.tsx` — moved from unused to live below dashboard StatsBar
- `FloatingAppNavbar.tsx` — replaced by Aceternity FloatingNav throughout dashboard
- FloatingNav active link pattern → applied to DecisionCard hover

### Fixes
- FloatingNav: `<a>` → `<Link>` for SPA navigation; `usePathname()` active link highlighting; width adjustments (`min-w-[280px] sm:min-w-[440px]`)
- DecisionCard hover: hardcoded `bg-neutral-100 dark:bg-slate-800/[0.3]` → `bg-surface-secondary`
- Decisions page: fixed indentation

## Decisions made
- **FloatingNav is always visible** — no scroll-hide logic. Simple entrance animation only. Keeps nav predictable and avoids complexity.
- **Active link highlighting**: `text-primary bg-primary-muted` for active; `text-text-secondary hover:bg-surface-secondary hover:text-text-primary` for inactive. Matches existing Navbar's mobile pattern exactly.
- **Shared layout pattern**: FloatingNav lives in `app/dashboard/layout.tsx` — all `/dashboard/*` pages get it automatically. Children slot for user avatar + ThemeToggle.
- **CSS variables everywhere**: No hardcoded color values in FloatingNav. All classes use design tokens.
- **Features 19-21 deferred**: Dashboard uses mock data. Real Convex queries will be wired in subsequent phases.

## Current state
- Dashboard page complete with mock data UI and entrance animations
- Aceternity components fully wired across the app
- Old `FloatingAppNavbar.tsx` still exists at `components/layout/FloatingAppNavbar.tsx` but is no longer imported anywhere
- Feature 18 complete, progress at 19/22
- TypeScript compiles with 0 errors
- ui-registry.md updated with FloatingNav + DashboardLayout patterns

## Next session starts with
**Feature 19 — Wire Dashboard Stats to Convex:**
1. Create a Convex query in `convex/dashboard.ts` that returns real stats (emailsToday, autoReplied, escalationsPending, avgResponseTime)
2. Replace mock data in `app/dashboard/page.tsx` with the real query
3. Update StatsBar, AnalyticsCharts, RecentActivity to use real data

## Open questions
- `FloatingAppNavbar.tsx` at `components/layout/FloatingAppNavbar.tsx` — should be deleted since FloatingNav replaces it

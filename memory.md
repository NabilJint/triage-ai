# Memory — Landing Page + Review Fixes

Last updated: 2026-07-04

## What was built

- **Full landing page** — Hero (with Spotlight + live triage feed), Features (3 cards), How It Works (3 steps), Pricing (3 plans with featured), Powered By (InfiniteMovingCards with AMD/Fireworks/Convex logos), Contact (3 cards), Footer, Navbar, ThemeProvider/ThemeToggle
- **Aceternity UI components** — `Spotlight`, `MovingBorder`, `InfiniteMovingCards`
- **Theme system** — light/dark/system with localStorage persistence and system preference detection
- **File structure:** `components/landing/`, `components/theme/`, `components/layout/Navbar.tsx`

## Decisions made

- Spotlight uses `fillOpacity={0.35}` with teal `#2bb1a4` for the glow animation
- Moving border CTA button uses primary (teal) → secondary (indigo) conic gradient
- All landing CTAs link to `/login` (auth pages not built yet)
- Theme uses `.dark` class on `<html>` with CSS variables — matching ui-tokens.md
- Section heading pattern: `text-lg font-semibold text-text-primary` (not the hero/page title size)
- FadeInUp uses 300ms duration to match ui-rules animation guidelines

## Problems solved

- **Spotlight invisible** — was behind page background due to `-z-10` on container div; removed it
- **Navbar hover broken** — `hover:bg-bg-secondary` referenced a non-existent token; fixed to `hover:bg-surface-secondary`

## Current state

- Landing page complete — all sections render, responsive, dark/light mode working
- Build passes clean (`npm run build` succeeds)
- ui-registry.md populated with patterns from all 9+ landing components
- Progress tracker updated: Phase 1 Feature 01 done

## Next session starts with

- **Phase 1 Feature 02 — Auth** (Convex Auth + login page + callback page)
- `/remember restore` to pick up from here

## Open questions

- "View Live Demo" CTA currently goes to `/login` — user chose to revisit for a `/demo` page later

# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

---

### Landing Section (generic)

File: `components/landing/*.tsx`
Last updated: 2026-07-04

| Property | Class |
|----------|-------|
| Background | `bg-bg-primary` |
| Outer padding | `py-16 md:py-24` |
| Max width wrapper | `max-w-1280px mx-auto px-6` |
| Scroll offset | `scroll-mt-16` |
| Section heading | `text-lg font-semibold text-text-primary` |

**Pattern notes:**
All landing sections follow the same scroll-target layout: section wrapper → max-width container → heading + content.

---

### Navbar — `components/layout/Navbar.tsx`

| Property | Class |
|----------|-------|
| Background | `bg-surface/80 backdrop-blur-md` |
| Border | `border-b border-border` |
| Height | `h-16` |
| Scrolled shadow | `shadow-card` |
| Logo text | `text-primary text-xl font-bold tracking-tight flex items-center gap-2` |
| Nav link (inactive) | `text-text-dark text-sm font-medium` |
| Nav link (hover) | `hover:text-text-primary transition-colors duration-200` |
| App nav link (active) | `text-primary text-sm font-medium relative flex items-center gap-1.5` |
| App nav link (inactive) | `text-text-secondary text-sm font-medium hover:text-text-primary relative flex items-center gap-1.5` |
| App nav active indicator | `motion.div layoutId="nav-indicator" absolute -bottom-[18px] left-0 right-0 h-0.5 bg-primary` — spring animation (stiffness 380, damping 30) |
| Mobile app active | `text-primary bg-primary-muted` |
| Mobile app inactive | `text-text-dark hover:text-text-primary hover:bg-surface-secondary` |
| Mobile menu button | `p-2 rounded-md hover:bg-surface-secondary` |
| App actions | User avatar `size-8 rounded-full border-2 border-border` with initials fallback (`bg-primary-muted text-primary text-xs font-semibold`), `SignOutButton` |
| Landing Sign In | `variant="ghost" size="sm"` |
| Landing Get Started | primary `size="sm"` |

**Pattern notes:**
- Accepts `mode="landing" | "app"` prop to switch between landing and authenticated nav
- Landing links are hash-anchored (`#features`, `#how-it-works`, `#pricing`, `#contact`)
- App links use `usePathname()` active detection with Framer Motion `layoutId` spring indicator
- Sticky top navbar (`sticky top-0 z-50`)
- Uses `max-w-1280px mx-auto px-6` inner container matching section layout
- Mobile uses Sheet component with 288px width (`w-72`)
- Nav item icons are `size-4` with `gap-1.5` between icon and label
- Sign Out uses `SignOutButton` component (`variant="ghost" size="sm"` with LogOut icon)

---

### Hero — `components/landing/Hero.tsx`

| Property | Class |
|----------|-------|
| Background | `bg-bg-primary` |
| Padding | `py-16 md:py-24` |
| Headline | `text-4xl md:text-5xl md:leading-[52px] font-extrabold text-text-darkest tracking-tight` |
| Subheadline | `text-xl text-text-secondary max-w-2xl leading-relaxed` |
| Live feed card | `bg-surface border border-border rounded-lg p-4 shadow-card` |
| Feed row | `p-4 border-b border-border last:border-b-0 bg-bg-primary/50 rounded-sm` |

**Pattern notes:**
- Spotlight glow sits behind hero content in `absolute inset-0` container
- Two CTAs: primary (moving-border) + outline "View Live Demo"
- Uses `FadeInUp` animation wrapper for staggered entrance

---

### Features Card — `components/landing/Features.tsx`

| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Border | `border border-border` |
| Border radius | `rounded-lg` |
| Padding | `p-6` |
| Shadow | `shadow-card` |
| Hover border | `hover:border-primary/30` |
| Icon | `text-primary size-8 strokeWidth=1.5` |
| Title | `text-base font-semibold text-text-primary` |
| Description | `text-sm text-text-secondary leading-relaxed` |

**Pattern notes:**
- Grid: `grid-cols-1 md:grid-cols-3 gap-6`
- Each card uses `h-full` to equalize height across rows
- `whileHover={{ y: -4 }}` lift effect on the motion wrapper (not the card itself)
- Card has `transition-colors duration-200` on hover

---

### Pricing Card — `components/landing/Pricing.tsx`

| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Border | `border border-border` |
| Border radius | `rounded-2xl` |
| Padding | `p-6 lg:p-8` |
| Featured border | `border-primary shadow-lg scale-105 md:scale-110` |
| Featured badge | `bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full` |
| Plan name | `text-lg font-semibold text-text-primary` |
| Price | `text-3xl md:text-4xl font-bold text-text-darkest` |
| Price period | `text-sm text-text-muted` |
| Feature text | `text-sm text-text-secondary` |
| Feature icon | `text-primary size-4 shrink-0` |

**Pattern notes:**
- Grid: `grid md:grid-cols-3 gap-6 lg:gap-8`
- Featured plan uses `relative` to position "Most Popular" badge absolutely at `-top-3`
- Uses `flex flex-col` to push CTA button to bottom via `flex-1`
- CTA button is `w-full` below the feature list

---

### How It Works Step — `components/landing/HowItWorks.tsx`

| Property | Class |
|----------|-------|
| Step number | `text-2xl md:text-3xl font-bold text-primary/30` |
| Title | `text-base md:text-lg font-semibold text-text-primary` |
| Description | `text-sm md:text-base text-text-secondary leading-relaxed` |

**Pattern notes:**
- Grid: `grid md:grid-cols-3 gap-8 md:gap-12`
- All content is `text-center`
- Step number uses `primary/30` opacity — very subtle brand accent

---

### Contact Card — `components/landing/ContactSection.tsx`

| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Border | `border border-border` |
| Border radius | `rounded-lg` |
| Padding | `p-6` |
| Icon | `text-primary size-8` |
| Card title | `font-semibold text-text-primary` |
| Description | `text-sm text-text-secondary` |
| Link | `text-sm text-primary hover:underline` |

**Pattern notes:**
- Grid: `grid md:grid-cols-3 gap-6`
- Each card is `flex flex-col items-center text-center p-6`
- Card uses `h-full` implicit from grid

---

### Powered By Section — `components/landing/PoweredBy.tsx`

| Property | Class |
|----------|-------|
| Background | `bg-bg-primary` |
| Padding | `py-16 md:py-20` |
| Heading | `text-lg font-semibold text-text-primary` |
| Subtitle | `text-sm text-text-secondary` |
| Logo size | `className="size-16 md:size-[72px]"` |

**Pattern notes:**
- Uses `InfiniteMovingCards` from Aceternity UI for scrolling brand showcase
- AMD logo uses `SiAmd` icon from `react-icons/si` with `text-amd` color token
- Fireworks and Convex use inline SVGs

---

### Footer — `components/landing/Footer.tsx`

| Property | Class |
|----------|-------|
| Background | `bg-surface` |
| Border | `border-t border-border` |
| Padding | `py-6` |
| Text | `text-sm text-text-muted` |
| Link | `hover:text-text-primary transition-colors duration-200` |

**Pattern notes:**
- Simple two-column layout: brand text left, nav links right
- Responsive: stacks vertically on mobile, row on `md:`
- Uses `max-w-1280px mx-auto px-6` inner container

---

### Theme Provider — `components/theme/ThemeProvider.tsx`

| Property | Detail |
|----------|--------|
| Storage key | `triageai-theme` |
| Themes | `light`, `dark`, `system` |
| DOM class | `.dark` on `<html>` |
| Default | `system` |

**Pattern notes:**
- Supports system preference detection via `matchMedia`
- Persists preference to `localStorage`
- Uses React Context API — wraps entire app in root layout

---

### Theme Toggle — `components/theme/ThemeToggle.tsx`

| Property | Class |
|----------|-------|
| Button variant | `variant="ghost" size="icon"` |
| Button size | `size-9` |
| Icon | `size-4` (lucide-react Sun/Moon) |
| SSR placeholder | `size-9` (empty div before mount) |

**Pattern notes:**
- Uses `useTheme()` hook from ThemeProvider
- Shows Sun icon when dark mode active, Moon icon when light
- Prevents hydration mismatch by not rendering until mounted
- aria-label switches based on current theme

---

### FadeInUp — `components/landing/FadeInUp.tsx`

| Property | Detail |
|----------|--------|
| Animation lib | `motion/react` (Framer Motion) |
| Variant | `fadeInUp` from `lib/variants.ts` |
| Duration | 300ms (`duration: 0.3`) |
| Trigger | `whileInView`, `viewport={{ once: true, margin: "-80px" }}` |

**Pattern notes:**
- Reusable animation wrapper for scroll-triggered entrance animations
- Accepts `delay` prop for staggered sequencing
- All landing sections wrap content in FadeInUp for consistent entrance

---

### Logo — `components/ui/logo.tsx`

| Property | Detail |
|----------|--------|
| Usage | `<Logo size={28} className="text-primary" />` |
| Structure | Mail envelope outline + circle checkmark badge at top-right |
| Envelope | `rect` with `rx="2.5"`, `stroke="currentColor"`, `strokeWidth="1.5"` |
| Envelope flap | `path` with V-shape lines |
| Badge circle | `circle` with `className="fill-primary"`, overlapping envelope top-right |
| Checkmark | `path` with `stroke="white"`, `strokeWidth="1.5"` |
| ViewBox | `0 0 28 28` |
| Default size | `28` |

**Pattern notes:**
- `currentColor` for envelope lets it inherit parent text color
- Badge uses `fill-primary` for consistent brand teal
- Checkmark is always white for contrast against teal circle

---

### Login Page — `app/(auth)/login/page.tsx`

| Property         | Class |
|-----------------|-------|
| Page background | `bg-bg-primary` |
| Gradient top    | `radial-gradient(circle at top right, var(--color-primary-muted), transparent 40%)` |
| Gradient bottom | `radial-gradient(circle at bottom left, var(--color-primary-light), transparent 30%)` |
| Card background | `bg-surface` |
| Card border     | `border border-border` |
| Card radius     | `rounded-lg` |
| Card shadow     | `shadow-card` |
| Card padding    | `p-8` |
| Heading         | `text-3xl md:text-[32px] font-bold text-text-primary` |
| Subtitle        | `text-sm text-text-secondary` |
| Google button   | `bg-surface hover:bg-surface-secondary border border-border rounded-md py-4 px-6 text-sm font-semibold` |
| Primary button  | `bg-primary hover:bg-primary-dark text-primary-foreground rounded-md py-4 px-6 text-sm font-semibold shadow-sm` |
| Input           | `bg-surface border border-border rounded-md px-4 py-4 text-sm text-text-primary placeholder:text-text-muted focus:border-secondary focus:ring-1 focus:ring-secondary` |
| Divider line    | `h-px bg-border` |
| Divider text    | `text-xs text-text-muted font-medium` |
| Footer text     | `text-xs text-text-muted` |
| Footer link     | `text-primary hover:text-primary-dark underline` |
| AMD badge       | `text-xs font-semibold text-amd` |
| Loading spinner | `size-5 animate-spin` |

**Pattern notes:**
- Full-screen centered layout with `min-h-screen flex flex-col items-center justify-center`
- Radial gradient overlay uses CSS variables; matches onboarding page gradient exactly
- Google button has 3 states: default (icon + text), loading (spinner + "Connecting..."), disabled
- `max-w-md` container centers the card, responsive padding on mobile
- Both buttons disabled when loading with `disabled:opacity-60 disabled:cursor-not-allowed`
- Auth guard: uses `useConvexAuth` + `getMe` profile query; redirects existing users to `/dashboard`, new users to `/onboarding`
- Single loading guard `authLoading || isAuthenticated` shows spinner; text toggles "Loading..." / "Redirecting..."

---

### Onboarding Orchestrator — `app/(auth)/onboarding/page.tsx`

| Property | Class |
|----------|-------|
| Page background | `bg-bg-primary` |
| Gradient top | `radial-gradient(circle at top right, var(--color-primary-muted), transparent 40%)` |
| Gradient bottom | `radial-gradient(circle at bottom left, var(--color-primary-light), transparent 30%)` |
| Progress bar | `h-1.5 rounded-full bg-border` / `bg-primary` (active) |
| Progress gap | `gap-1.5` |
| Step transition | `AnimatePresence mode="wait"` with `opacity 0↔1, y ±16` |

**Pattern notes:**
- 4-step linear flow: Welcome → Connect Inbox → Business Context → Configuration
- Step state managed via `useState` with `step` index (0-3)
- Progress bar is `flex` row of `TOTAL_STEPS` bars, animating `backgroundColor`
- On completion renders `<CompletedScreen>` instead of steps
- Completed screen shows success checkmark, summary list (checkmarks), and "Go to Dashboard" CTA
- LogoFormation animation overlays the completed screen via absolute positioning
- Radial gradient overlay uses CSS variables; matches login page gradient exactly
- Both the stepper view and `CompletedScreen` use the same gradient pattern

---

### StepWelcome — `components/onboarding/StepWelcome.tsx`

| Property | Class |
|----------|-------|
| Card | `bg-surface border border-border shadow-card rounded-lg p-8` |
| Icon circle | `size-20 rounded-full bg-primary-muted flex items-center justify-center` |
| Heading | `text-2xl font-bold text-text-primary text-center` |
| Subtitle | `text-sm text-text-secondary text-center leading-relaxed` |
| Step number badge | `size-6 rounded-full bg-primary-muted text-primary text-xs font-semibold` |
| Step title | `text-sm font-semibold text-text-primary` |
| Step desc | `text-xs text-text-muted` |
| CTA button | `bg-primary hover:bg-primary-dark rounded-md py-3.5 px-6 text-sm font-semibold` |

**Pattern notes:**
- Shows 3-step preview list with staggered entrance animation (`delay: 0.15 + i * 0.08`)
- Central logo icon in muted primary circle draws attention

---

### StepConnectInbox — `components/onboarding/StepConnectInbox.tsx`

| Property | Class |
|----------|-------|
| Provider card | `p-4 rounded-md border flex items-center gap-4` |
| Connected state | `border-success bg-success-light/20` (with checkmark icon) |
| Disconnected state | `border-border bg-surface hover:bg-surface-secondary` |
| Info banner | `bg-success-light/10 border border-success/20 rounded-md p-3` |
| Back button | `bg-surface hover:bg-surface-secondary border border-border rounded-md py-3.5 px-6 text-sm font-semibold` |

**Pattern notes:**
- Gmail connect is a toggle — clicking simulates connection (shows checkmark + info banner)
- "Skip for now" text on continue when not connected
- Back/Continue button row uses `flex-[2]` for continue and `flex-1` for back

---

### StepBusinessContext — `components/onboarding/StepBusinessContext.tsx`

| Property | Class |
|----------|-------|
| Input wrapper | `relative` with icon absolutely positioned `left-3.5 top-1/2 -translate-y-1/2` |
| Input | `w-full bg-surface border border-border rounded-md pl-10 pr-4 py-3.5 text-sm` |
| Textarea | `w-full bg-surface border border-border rounded-md px-4 py-3.5 text-sm resize-none` |
| Input focus | `focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all` |
| Label | `text-sm font-semibold text-text-primary mb-1.5` |
| Hint | `text-xs text-text-muted mt-1.5` |

**Pattern notes:**
- URL field has globe icon inside input at left
- Textarea has 4 rows with placeholder encouraging detail
- Same Back/Continue button pattern as StepConnectInbox

---

### StepConfiguration — `components/onboarding/StepConfiguration.tsx`

| Property | Class |
|----------|-------|
| Section label | `text-xs font-semibold text-text-muted uppercase tracking-wider mb-3` |
| Toggle switch | `role="switch"` — via `components/ui/toggle.tsx` (active: `bg-primary`, inactive: `bg-surface-tertiary`, knob: `size-4 rounded-full bg-white shadow-sm`) |
| Tone button (selected) | `border-primary bg-primary-muted text-primary-dark` |
| Tone button (default) | `border-border bg-surface hover:bg-surface-secondary text-text-secondary` |
| Tone grid | `grid grid-cols-3 gap-2` |

**Pattern notes:**
- Rules section uses custom `<Toggle>` component with `role="switch"` and `aria-checked`
- Tone selector uses 3-column grid of card-style buttons
- "Complete Setup" button has `buttonShine` effect (gradient sweep overlay via `group-hover:translate-x-full`)
---

### BusinessContextForm — `components/business/BusinessContextForm.tsx`

| Property | Class |
|----------|-------|
| Container | `space-y-5` |
| Label | `block text-sm font-medium text-text-secondary mb-1.5` |
| Input | `w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all` |
| Input with icon | Same + icon in `absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none` |
| URL input error state | `border-error focus:border-error focus:ring-error/20` |
| Button | shadcn `<Button>` (not raw button) — uses `useWebsiteScraper` internally |
| Textarea | Same as input + `resize-none`, `rows={6}`, `px-4` (no left icon) |
| Error text | `text-xs text-error mt-1.5` |
| Hint text | `text-xs text-text-muted mt-1.5` |

**Pattern notes:**
- Shared presentational component used by both `settings/BusinessContext.tsx` and `onboarding/StepBusinessContext.tsx`
- Owns `useWebsiteScraper` internally; parents only manage state and save/next logic
- Accepts `urlError?: boolean` for URL validation state (used by onboarding's validate-on-next pattern)
- Uses shadcn `<Button>` for the autofill button — consistent with design system
- Input focus rings use `primary` (teal) for normal state, `error` for validation errors

---

### InboxConnectButton — `components/gmail/InboxConnectButton.tsx`

| Property | Class |
|----------|-------|
| Container | `w-full flex items-center gap-4 p-4 rounded-lg border transition-all` |
| Connected state | `border-success bg-success-light/20` |
| Disconnected state | `border-border bg-surface hover:bg-surface-secondary` |
| Google SVG | `size-8 shrink-0` |
| Title | `text-sm font-semibold text-text-primary` |
| Subtitle | `text-xs text-text-muted` |
| Checkmark | `size-5 text-success shrink-0` (shown only when connected) |

**Pattern notes:**
- Shared presentational component used by both `settings/InboxConnection.tsx` and `onboarding/StepConnectInbox.tsx`
- PostHog tracking handled by parent (not the button) — parent wraps `onToggle` with capture call
- No state of its own — pure controlled component via `connected` and `onToggle` props

---

### Toggle — `components/ui/toggle.tsx`

| Property | Class |
|----------|-------|
| Container | `relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent` |
| Active bg | `bg-primary` |
| Inactive bg | `bg-surface-tertiary` |
| Focus ring | `focus:outline-none focus:ring-2 focus:ring-primary/20` |
| Knob | `pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm ring-0` |
| Knob active | `translate-x-4` |
| Knob inactive | `translate-x-0` |
| Transition | `transition-colors duration-200` (container and knob) |

**Pattern notes:**
- Uses `role="switch"` + `aria-checked` for accessible toggle
- Accepts `checked` and `onChange` props — pure controlled component
- Focus ring uses `primary/20` (teal 20% opacity) — matches `--input-focus-ring` token
- Replaced inline toggle pattern across `StepConfiguration`, `EscalationRules`, `InboxConnection`

---

### Skeleton — `components/ui/skeleton.tsx`

| Property | Class |
|----------|-------|
| Base | `animate-pulse rounded-md bg-primary/10` |

**Pattern notes:**
- Generic skeleton primitive — accepts `className` for size/shape overrides
- Used by `LoadingScreen` with `variant="skeleton"` for page-level skeleton placeholders
- Matches shadcn/ui skeleton pattern

---

### LoadingScreen — `components/ui/loading-screen.tsx`

| Property | Class |
|----------|-------|
| Page background | `bg-bg-primary` |
| Spinner variant | `min-h-screen flex items-center justify-center`, text `text-text-secondary text-sm` with `Loader2 size-5 animate-spin` |
| Skeleton variant | `min-h-screen bg-bg-primary`, inner `max-w-3xl mx-auto px-6 py-10 space-y-6` |

**Pattern notes:**
- Accepts `variant="spinner" | "skeleton"` prop
- Skeleton variant renders 4 card-shaped skeleton placeholders matching settings page layout
- Spinner variant used for auth guard loading, skeleton for data-loading states

---

### SettingsCard — `components/ui/settings-card.tsx`

| Property | Class |
|----------|-------|
| Card | `bg-surface border-border shadow-card` (shadcn `Card`) |
| Inner padding | `p-6` (via `CardContent`) |
| Heading | `text-lg font-semibold text-text-primary` |
| Description | `text-sm text-text-secondary mb-6 leading-relaxed` |
| Header right slot | `shrink-0 ml-4` |

**Pattern notes:**
- Accepts `title`, `description`, `headerRight`, `children` props
- Wraps all 4 settings cards (InboxConnection, BusinessContext, EscalationRules, ReplyToneSelector)
- Saves ~8 lines per card vs. inline Card + CardContent

---

### AuthBackground — `components/ui/auth-background.tsx`

| Property | Detail |
|----------|--------|
| Position | `absolute inset-0 pointer-events-none z-0` |
| Gradient top | `radial-gradient(circle at top right, var(--color-primary-muted), transparent 40%)` |
| Gradient bottom | `radial-gradient(circle at bottom left, var(--color-primary-light), transparent 30%)` |

**Pattern notes:**
- Shared radial gradient overlay for login + onboarding pages
- Replaces previously inline gradient style in both auth pages
- Uses CSS variables for theme-adaptive colors

---

### SignOutButton — `components/ui/sign-out-button.tsx`

| Property | Class |
|----------|-------|
| Button | `variant="ghost" size="sm"` |
| Icon | `LogOut size-4` |

**Pattern notes:**
- Wraps `useAuthActions().signOut()` from `@convex-dev/auth/react`
- Used in both Navbar (landing mode app actions) and mobile menu
- Single import point for sign-out — keeps sign-out logic in one place

---

### FloatingAppNavbar — `components/layout/FloatingAppNavbar.tsx`

| Property | Class |
|----------|-------|
| Position | `fixed top-4 left-1/2 -translate-x-1/2 z-50` |
| Width | `w-[90%] max-w-5xl` |
| Background | `bg-surface/90 backdrop-blur-lg` |
| Border | `border border-border` |
| Radius | `rounded-full` |
| Shadow | `shadow-lg` (scrolled: `shadow-xl`) |
| Height | `h-14` |
| Inner padding | `px-6` |

**Pattern notes:**
- Floating pill navbar — uses `useScrollPosition(10)` to detect scrolled state
- Children slot for nav links/actions (designed to be composed, not hardcoded)
- Available as alternative navbar style but not wired into any page yet

---

### Dashboard Page — `app/dashboard/page.tsx`

| Property | Class |
|----------|-------|
| Page background | `bg-bg-primary` |
| Icon circle | `size-16 rounded-full bg-primary/10 flex items-center justify-center` |
| Icon | `size-8 text-primary` |
| Heading | `text-2xl font-bold text-text-primary` |
| Subtitle | `text-sm text-text-secondary` |
| Loading spinner | `size-5 animate-spin` |

**Pattern notes:**
- Uses `useConvexAuth` + `getMe` profile query for auth and new-user guards
- Auth redirect: unauthenticated → `/login`, new user → `/onboarding`
- Single loading guard covers all non-dashboard states (loading auth, loading profile, not authenticated, new user)

---

### Settings Card (generic) — `components/settings/*.tsx`

File: `components/settings/`
Last updated: 2026-07-05

| Property                 | Class                                                         |
| ------------------------ | ------------------------------------------------------------- |
| Card background          | `bg-surface`                                                  |
| Card border              | `border-border`                                               |
| Card radius              | `rounded-xl` / `rounded-lg` (shadcn Card sets `rounded-xl`)   |
| Card shadow              | `shadow-card`                                                 |
| Card padding             | `p-6`                                                         |
| Card heading             | `text-lg font-semibold text-text-primary`                     |
| Card description         | `text-sm text-text-secondary leading-relaxed`                 |
| Section heading          | `text-lg font-semibold text-text-primary mb-1`                |
| Subtitle / body          | `text-sm text-text-secondary leading-relaxed mb-6`            |
| Label                    | `block text-sm font-medium text-text-secondary mb-1.5`        |
| Input                    | `w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all` |
| Input with icon          | Same as input + `pl-10` for icon + icon in `absolute left-3 top-1/2 -translate-y-1/2` |
| Textarea                 | Same as input + `resize-none`                                 |
| Hint text                | `text-xs text-text-muted mt-1.5`                              |
| Toggle (switch)          | `role="switch" aria-checked` — `h-5 w-9 rounded-full border-2`, active `bg-primary`, inactive `bg-surface-tertiary`, knob `size-4 rounded-full bg-white shadow-sm` |
| Toggle knob (active)     | `translate-x-4`                                               |
| Toggle knob (inactive)   | `translate-x-0`                                               |
| Info banner              | `bg-success-light/10 border border-success/20 rounded-lg p-3` |
| Divider                  | `border-t border-border`                                      |
| Page heading             | `text-3xl font-bold text-text-darkest tracking-tight`         |
| Page subtitle            | `text-sm text-text-secondary mt-1`                            |
| Loading spinner          | `size-5 animate-spin`                                         |

**Pattern notes:**
- All settings cards use the same pattern: `Card` → `CardContent` → heading + description + content
- Toggle component is imported from `components/ui/toggle.tsx` — shared `role="switch"` primitive used across settings and onboarding
- Shadcn `RadioGroup` + `Label` with `peer/sr-only` pattern for card-style tone selector
- Stitch design inspiration: cards in `bg-[oklch(1_0_0)]` map to `bg-surface`, `rounded-xl` maps to shadcn Card default, `border-border-subtle` maps to `border-border`
- Input focus uses `ring-primary` (teal) — consistent with primary brand
- Two-column tone grid: `grid grid-cols-2 gap-2`
- Rule priority colors use 4px left border (`border-l-4`) with priority-specific colors

**Escalation rule priority colors:**
| Priority | Classes |
|----------|---------|
| Low      | `border-border bg-surface-secondary` |
| Medium   | `border-secondary/40 bg-secondary-muted` |
| High     | `border-warning bg-warning-light` |
| Urgent   | `border-error bg-error-light` |

**Aceternity integrations:**
- `AnimatedModal` in `BusinessContext.tsx` — Save Context button triggers confirmation modal with spring animation (stiffness 260, damping 15)
- `FloatingAppNavbar` at `components/layout/FloatingAppNavbar.tsx` — floating pill navbar using Aceternity `FloatingNav`, hides on scroll down, appears on scroll up
- `AnimatedTooltip` installed but not integrated — avatar-group specific, doesn't match settings form fields
- `bento-grid-with-skeletons` requires auth (premium block) — skipped

**Animation patterns:**
- Settings page uses `pageVariants` (stagger children at 0.08s delay) on main container
- Page header uses `sectionVariants` (fade in + slide up 30px, 0.6s easeOut)
- Card list uses `staggerContainer` (stagger children at 0.1s, delayChildren 0.1s)
- Each card wraps in `motion.div` with `staggerItem` (fade + slide up 20px, 0.5s easeOut)

**Tone selector pattern:**
- Uses shadcn `RadioGroup` with `RadioGroupItem` as `peer sr-only`
- `Label` styled as card button: `flex flex-col p-3 rounded-lg border cursor-pointer`
- Selected state: `peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary-muted`
- Preview panel: `bg-bg-primary rounded-lg border border-border p-4`

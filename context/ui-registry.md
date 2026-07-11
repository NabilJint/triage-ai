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
| Error text | `text-xs text-error mt-1.5` (used for both `urlError` and `fetchError`) |
| Hint text | `text-xs text-text-muted mt-1.5` |

**Pattern notes:**
- Shared presentational component used by both `settings/BusinessContext.tsx` and `onboarding/StepBusinessContext.tsx`
- Owns `useWebsiteScraper` internally; parents only manage state and save/next logic
- Accepts `urlError?: boolean` for URL validation state (used by onboarding's validate-on-next pattern)
- Uses shadcn `<Button>` for the autofill button — consistent with design system
- Input focus rings use `primary` (teal) for normal state, `error` for validation errors
- Both `urlError` and `fetchError` use `text-error` for red error styling
- Invalid URL in `useWebsiteScraper` now sets `"Please enter a valid URL starting with http:// or https://"` instead of silent failure

---

### Mock Inbox Form — `components/settings/InboxConnection.tsx` (inline)

| Property | Class |
|----------|-------|
| Section divider | `mt-6 pt-4 border-t border-border` |
| Section icon + label | `flex items-center gap-2` — `size-4 text-text-muted` + `text-sm text-text-primary font-medium` |
| Section description | `text-xs text-text-muted mt-1.5` |
| Toggle row | `flex items-center justify-between` |
| Form container | `bg-bg-primary border border-border rounded-lg p-4 space-y-3` |
| Form label | `block text-xs font-medium text-text-secondary mb-1` |
| Input | `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all` |
| Textarea | Same as input + `resize-none` rows=3 |
| Button row | `flex gap-2 pt-1` — primary + outline buttons, both `size="sm"` |
| Status banner | `bg-success-light/10 border border-success/20 rounded-lg p-3 text-xs text-text-secondary` |
| Status dismiss | `ml-2 text-text-muted hover:text-text-primary` — raw `&times;` button |

**Pattern notes:**
- Inline form (no shadcn form/field components) — lightweight for simple mock email send
- Uses raw `<input>` and `<textarea>` with consistent surface/border/ring classes matching form inputs elsewhere
- Toggle and mock form state managed locally: `mockMode` → `showMockForm` → form rendered conditionally
- Send button disabled when any field empty or sending in progress
- Loading state: spinner replaces Send icon, text changes to "Sending..."
- Status messages auto-show from OAuth redirect params (`?gmail=connected|error|no_client`) or from mock send result
- Connected Gmail section shows info banner: `bg-success-light/10 border border-success/20 rounded-lg p-3 flex items-start gap-2` with `Info` icon
- URL param cleanup uses `new URL(href) + router.replace(url.pathname + url.search)` pattern

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
| Connected subtitle | `` Connected — ${email ?? "your connected inbox"} `` |

**Pattern notes:**
- Shared presentational component used by both `settings/InboxConnection.tsx` and `onboarding/StepConnectInbox.tsx`
- PostHog tracking handled by parent (not the button) — parent wraps `onToggle` with capture call
- Pure controlled component via `connected`, `email`, and `onToggle` props — no state of its own
- `email: string | null` prop displays the connected email address; falls back to "your connected inbox" when null

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

### FloatingNav — `components/ui/floating-navbar.tsx`

| Property | Class |
|----------|-------|
| Wrapper | `flex fixed top-3 inset-x-0 mx-auto z-[5000] items-center justify-center` |
| Container | `flex items-center justify-center gap-1 rounded-full border border-border bg-surface/80 px-3 py-1.5 shadow-card backdrop-blur-lg w-auto min-w-[280px] sm:min-w-[440px]` |
| Entrance animation | `motion.div` with `initial={{ opacity: 0, y: -20 }}` → `animate={{ opacity: 1, y: 0 }}`, 0.3s easeOut |
| Nav link (active) | `text-primary bg-primary-muted rounded-full px-3 py-1.5 text-sm font-medium` |
| Nav link (inactive) | `text-text-secondary hover:bg-surface-secondary hover:text-text-primary rounded-full px-3 py-1.5 text-sm font-medium transition-colors` |
| Icon (mobile only) | `block sm:hidden` |
| Label (desktop only) | `hidden sm:block` |
| Divider | `h-5 w-px bg-border` |
| Children slot | Right side — absolute position within the pill |

**Pattern notes:**
- Always visible — no scroll-hide logic. Simple entrance animation on mount.
- Active link detection via `usePathname()`: exact match for `/dashboard`, prefix match for sub-routes
- Uses `<Link>` from Next.js (not `<a>`) for SPA navigation
- All classes use CSS variables — no hardcoded colors
- Width auto-sizes with `min-w` constraint: 280px mobile, 440px sm+
- Children rendered after a vertical divider — typically user avatar + ThemeToggle

### Dashboard Layout — `app/dashboard/layout.tsx`

| Property | Class |
|----------|-------|
| Page background | `min-h-screen bg-bg-primary` |
| Nav offset | `pt-16` (content below FloatingNav) |
| User avatar img | `size-7 rounded-full border-2 border-border object-cover` |
| User avatar fallback | `size-7 rounded-full bg-primary-muted border-2 border-border flex items-center justify-center text-[10px] font-semibold text-primary` (initials) |
| User name | `hidden sm:block text-text-secondary max-w-[100px] truncate` |

**Pattern notes:**
- Single shared layout for all `/dashboard/*` routes using Next.js `layout.tsx`
- Queries `useQuery(api.userProfiles.getMe)` for user profile (name, image)
- Initials derived from first two name parts, uppercased
- ThemeToggle placed in FloatingNav's children slot, separated by divider

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

---

### Triage Stats Bar — `components/triage/TriageStatsBar.tsx`

| Property | Class |
|----------|-------|
| Container | `grid grid-cols-1 sm:grid-cols-3 gap-4` |
| Stat card (default) | `bg-surface border-border shadow-card rounded-lg p-6` |
| Stat card (highlight) | `bg-primary-muted border-primary-light` |
| Stat card (warning) | `bg-warning-light border-warning` |
| Stat card (error) | `bg-error-light border-error` |
| Stat icon | `size-4 text-text-muted` |
| Stat label | `text-sm font-medium text-text-secondary` |
| Stat value | `text-3xl font-bold text-text-primary tabular-nums` |

**Pattern notes:**
- Pure presentational — accepts `emailsToday`, `autoReplied`, `escalationsPending` as props
- Highlight variant used for Auto-replied card
- Warning variant conditionally applied to escalations when > 0
- Animation: fade in + slide up on mount via `motion.div`

---

### Decision Card — `components/triage/DecisionCard.tsx`

| Property | Class |
|----------|-------|
| Card shape | `Card` with `hover:border-primary/30 transition-colors duration-200 cursor-pointer` |
| Inner padding | `p-4` (via `CardContent`) |
| Sender name | `text-sm font-medium text-text-primary truncate` |
| Sender email | `text-xs text-text-muted shrink-0` |
| Subject | `text-sm text-text-primary truncate` |
| Classification badge | `rounded-full px-2.5 py-0.5 text-xs font-medium border-0` + variant colors |
| Confidence bar track | `h-1 w-16 rounded-full bg-border overflow-hidden` |
| Confidence bar fill | `h-full rounded-full` — color varies by score: `bg-success` (90%+), `bg-primary` (70-89%), `bg-warning` (50-69%), `bg-error` (<50%) |
| Confidence text | `text-xs text-text-muted tabular-nums` |
| Action badge | `rounded-full px-2.5 py-0.5 text-xs font-medium border-0` + variant colors |
| Priority badge | `rounded-full px-2 py-0.5 text-[10px] font-semibold border-0 uppercase tracking-wider` + variant colors |
| Test badge | `rounded-full px-2 py-0.5 text-[10px] font-semibold border-0 uppercase tracking-wider bg-surface-tertiary text-text-muted` |
| Failed badge | `rounded-full px-2.5 py-0.5 text-xs font-medium border-0 bg-error-light text-error` |
| Retry button | `h-7 px-2 text-xs` — shadcn `Button variant="outline"` with `RotateCcw` or `Loader2` icon |
| Retry error | `text-xs text-error` |
| Timestamp | `text-xs text-text-muted shrink-0 ml-auto` |

**Classification badge colors:**
| Type | Background | Text |
|------|------------|------|
| Routine | `bg-primary-light` | `text-primary-dark` |
| Technical | `bg-secondary-light` | `text-secondary-dark` |
| Urgent | `bg-error-light` | `text-error` |
| Sales | `bg-success-light` | `text-success-dark` |
| Other | `bg-surface-secondary` | `text-text-secondary` |

**Action badge colors:**
| Action | Background | Text |
|--------|------------|------|
| Auto-replied | `bg-success-light` | `text-success-dark` |
| Escalated | `bg-warning-light` | `text-warning` |

**Priority badge colors:**
| Priority | Background | Text |
|----------|------------|------|
| Urgent | `bg-error-light` | `text-error` |
| High | `bg-warning-light` | `text-warning` |
| Medium | `bg-primary-light` | `text-primary-dark` |
| Low | `bg-surface-secondary` | `text-text-muted` |

**Pattern notes:**
- Controlled component — accepts `decision` object and `onClick` handler
- Classification, action, and priority badge colors defined via static config maps (not shadcn Badge variants)
- Dark mode overrides: badges use `dark:bg-*/20 dark:text-*` variants
- Priority badge uses smaller size (`text-[10px]`, `px-2 py-0.5`) vs classification/action (`text-xs`, `px-2.5 py-0.5`) — visually distinct as metadata
- Test badge is always `bg-surface-tertiary text-text-muted` (neutral gray) — never colored,区分s test from real data without drawing attention
- Badges wrap with `flex-wrap` — card handles overflow gracefully on narrow screens
- **Failed state:** When `decision.action === "failed"`, shows red "Failed" badge + retry button instead of normal classification/action badges
- Retry button uses `useAction(api.agent.retryTriage.retryTriage)` and reloads page on success
- Failed state shows error message if retry fails (`text-xs text-error`)
- Retry button disabled during retry with loading spinner (`Loader2 size-3 animate-spin`)

---

### Decision Card Skeleton — `components/triage/DecisionCardSkeleton.tsx`

| Property | Class |
|----------|-------|
| Card | `Card animate-pulse` |
| Skeleton blocks | `rounded bg-primary/10` — matching content dimensions |

**Pattern notes:**
- Matches `DecisionCard` layout (sender row, subject, metadata row)
- Uses `animate-pulse` and `bg-primary/10` — matching existing skeleton pattern

---

### Decision Filters — `components/triage/DecisionFilters.tsx`

| Property | Class |
|----------|-------|
| Container | `flex flex-col sm:flex-row items-start sm:items-center gap-4` |
| Tab group | `bg-surface border border-border rounded-lg p-1` |
| Active tab | `bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium` |
| Inactive tab | `text-text-secondary hover:text-text-primary hover:bg-surface-secondary px-3 py-1.5 text-sm font-medium rounded-md` |
| Search wrapper | `relative flex-1 sm:flex-initial sm:w-64` |
| Search icon | `absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none` |
| Search input | `pl-8 h-9 text-sm` (via shadcn `Input`) |
| Sort trigger | `w-[130px] h-9 text-sm` (via shadcn `Select`) |

**Pattern notes:**
- Controlled component — accepts filter/sort/search state + change handlers
- Uses shadcn `Input` and `Select` components
- Filter tabs are raw `<button>` elements (not shadcn Tabs) — lighter weight
- Responsive: stacks vertically on mobile, row on `sm:`

---

### Triage Empty State — `components/triage/TriageEmptyState.tsx`

| Property | Class |
|----------|-------|
| Container | `flex flex-col items-center justify-center py-16 text-center` |
| Icon circle | `size-16 rounded-full bg-primary/10 flex items-center justify-center` |
| Icon (not connected) | `size-8 text-primary` (MailQuestion from lucide) |
| Icon (connected) | `size-8 text-primary animate-spin` (Loader2 from lucide) |
| Heading | `text-lg font-semibold text-text-primary mb-1` |
| Description | `text-sm text-text-secondary mb-6 max-w-sm` |
| Connected description | `text-sm text-text-secondary mb-2 max-w-sm` |
| Connected hint | `text-xs text-text-muted` |
| CTA (not connected) | shadcn `Button` asChild wrapping Link to `/settings` |
| CTA (connected) | None — `MockEmailButton` rendered below this component |

**Pattern notes:**
- Two variants controlled by `hasConnection` prop: connected (spinner + "Waiting for emails") and not-connected (icon + CTA to settings)
- Connected variant has no CTA button — relies on MockEmailButton below in the parent
- Same icon circle pattern as Dashboard placeholder page
- Matching `py-16` vertical spacing with FeedErrorBoundary

---

### Mock Email Button — `components/triage/MockEmailButton.tsx`

| Property | Class |
|----------|-------|
| Container | `flex flex-col items-center pt-2` |
| Trigger button | shadcn `Button variant="outline" size="sm"` with `Plus size-4 mr-1.5` |
| Clear test button | shadcn `Button variant="outline" size="sm"` with `Trash2 size-4 mr-1.5` + `text-error hover:text-error` |
| Button group | `flex gap-2` |
| Form panel | `w-full max-w-md bg-surface border border-border rounded-lg p-4 space-y-3 shadow-card` |
| Form header | `flex items-center justify-between` — title `text-sm font-medium text-text-primary` + X close `text-text-muted hover:text-text-primary transition-colors` |
| Form label | `block text-xs font-medium text-text-secondary mb-1` |
| Input | `w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all` |
| Textarea | Same as input + `resize-none` |
| Button row | `flex gap-2 pt-1` — primary + outline buttons, both `size="sm"` |
| Send button (loading) | Spinner `Loader2 size-3.5 animate-spin` + "Sending..." text |
| Success text | `mt-2 text-xs text-success-dark` |

**Pattern notes:**
- Self-contained component — owns `useMutation(api.emails.triggerMockEmail)` and `useMutation(api.emails.clearTestData)` internally
- Inline expandable form (no dialog/modal) — matches `settings/InboxConnection.tsx` mock form pattern exactly
- Button group layout: "Send Test Email" + "Clear Test Emails" side by side when form is closed
- Form state managed locally: `showForm` → conditionally renders form panel
- Send button disabled when any field empty or sending in progress
- Success text auto-dismisses after 3 seconds
- Clear button uses `text-error hover:text-error` to signal destructive action
- `clearTestData` only wipes mock provider data — real emails preserved

---

### Triage Feed Page — `app/decisions/page.tsx`

| Property | Class |
|----------|-------|
| Page background | `min-h-screen bg-bg-primary` |
| Container | `max-w-5xl mx-auto px-6 py-10` |
| Page heading | `text-3xl font-bold text-text-darkest tracking-tight` |
| Page subtitle | `text-sm text-text-secondary mt-1` |
| Auth guard | `useAuthGuard()` → `LoadingScreen variant="skeleton"` or content |

**Pattern notes:**
- Follows identical pattern to `app/settings/page.tsx`
- Uses `pageVariants`, `sectionVariants` from `lib/variants.ts`
- Orchestrates `TriageFeed` component (not inline content)

---

### FeedErrorBoundary — `components/triage/FeedErrorBoundary.tsx`

| Property | Class |
|----------|-------|
| Container | `flex flex-col items-center justify-center py-16 text-center` |
| Icon circle | `size-16 rounded-full bg-error-light flex items-center justify-center` |
| Icon | `size-8 text-error` (AlertCircle from lucide) |
| Heading | `text-lg font-semibold text-text-primary mb-1` ("Something went wrong") |
| Description | `text-sm text-text-secondary mb-6 max-w-sm` |
| CTA | shadcn `Button` with `RefreshCw` icon + "Try Again" text |
| Error state bg | `bg-error-light` for icon circle, `text-error` for icon |
| Retry action | `handleRetry` resets `hasError` state to re-render children |

**Pattern notes:**
- Class-based React error boundary — `getDerivedStateFromError` catches Convex query failures
- Matches `TriageEmptyState` layout (centered icon circle, heading, description, CTA)
- Uses same `py-16` vertical spacing as empty state for visual consistency
- Error variant uses `error-light` / `error` colors instead of `primary/10` / `primary`

---

### Decision Header — `components/decision-details/DecisionHeader.tsx`

| Property | Class |
|----------|-------|
| Container | `flex flex-col gap-6` |
| Back link | `flex items-center gap-1.5 text-primary hover:text-primary-dark transition-colors text-sm font-medium` |
| Back icon | `material-symbols-outlined text-[16px]` |
| Card | `glass-card p-6 flex flex-col gap-4` |
| Section header | `flex items-center gap-2 pb-3 border-b border-border` |
| Section icon | `material-symbols-outlined text-text-muted text-[20px]` |
| Section title | `text-lg font-semibold text-text-primary` |
| Label | `text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5` |
| Value | `text-sm font-semibold text-text-primary` |
| Date value | `text-sm text-text-secondary` |
| Badge row | `flex items-center gap-3 mt-1` |

**Pattern notes:**
- Uses `StatusBadge` and `ConfidenceBar` from shared triage components
- Back link points to `/dashboard/decisions`
- Material Symbols icon: `arrow_back`

---

### Email Body Card — `components/decision-details/EmailBodyCard.tsx`

| Property | Class |
|----------|-------|
| Card | `glass-card p-6 flex flex-col gap-4` |
| Body wrapper | `p-4 bg-surface-secondary rounded-lg border border-border` |
| Body text | `whitespace-pre-wrap text-sm text-text-primary leading-relaxed` |

**Pattern notes:**
- Simple card — wraps raw email body in styled container
- Uses `whitespace-pre-wrap` to preserve line breaks from original email

---

### Draft Card — `components/decision-details/DraftCard.tsx`

| Property | Class |
|----------|-------|
| Card | `glass-card p-6 flex flex-col gap-4 border-l-4` |
| Auto-reply border | `border-success` |
| Escalate border | `border-primary` |
| Icon (auto_reply) | `material-symbols-outlined text-[20px] text-success` — `check_circle` |
| Icon (escalate) | `material-symbols-outlined text-[20px] text-primary` — `auto_fix_high` |
| Title | `text-lg font-semibold text-text-primary` |
| Textarea | `w-full p-4 border border-border rounded-lg text-sm text-text-primary resize-none` |
| Textarea (auto_reply) | `bg-surface-secondary cursor-default` |
| Textarea (escalate) | `bg-surface-secondary focus:border-secondary focus:ring-1 focus:ring-secondary` |
| Outline button | `px-4 py-2 border border-border text-primary rounded-lg text-xs font-medium hover:bg-surface-secondary transition-colors flex items-center gap-2` |
| Primary button | `px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors flex items-center gap-2` |
| Success button | `px-4 py-2 bg-success text-white rounded-lg text-xs font-medium hover:bg-success-dark transition-colors flex items-center gap-2` |
| Disabled button | `bg-surface-secondary text-text-muted cursor-not-allowed opacity-50` |
| Button icon | `material-symbols-outlined text-[16px]` |
| Filled icon | `fontVariationSettings: "'FILL' 1"` |
| Feedback (success) | `text-xs px-3 py-1.5 rounded-md bg-success/10 text-success` |
| Feedback (error) | `text-xs px-3 py-1.5 rounded-md bg-error/10 text-error` |
| Spinner | `material-symbols-outlined text-[16px] animate-spin` |

**Pattern notes:**
- Dual-mode component: `auto_reply` shows read-only "AI Sent Reply"; `escalate` shows editable "Draft Reply"
- Auto-reply mode: textarea is `readOnly`, buttons are Save + Sent (disabled) — no Regenerate (email already sent)
- Escalate mode: textarea is editable, buttons are Regenerate/Save Changes/Send Reply
- Wired to Convex: `useMutation(api.decisions.updateDraft)` + `useAction(api.agent.regenerateDraft.regenerateDraft)`
- Accepts `decisionId: Id<"triageDecisions">` prop for mutations
- `useEffect` syncs `draft` state with `draftText` prop (for reactive updates after regeneration)
- Feedback messages auto-clear after 3 seconds
- PostHog events: `draft_edited` on save
- Loading states: spinner icon + "Saving..."/"Regenerating..." text

---

### AI Decision Card — `components/decision-details/AiDecisionCard.tsx`

| Property | Class |
|----------|-------|
| Card | `glass-card p-6 flex flex-col gap-4 border-l-4` |
| Escalate border | `border-error` |
| Auto-reply border | `border-primary` |
| Header | `flex justify-between items-center pb-3 border-b border-border` |
| Section icon | `material-symbols-outlined text-text-primary text-[20px]` — `memory` |
| Section title | `text-lg font-semibold text-text-primary` |
| Classification label | `text-xs font-medium text-text-muted uppercase tracking-wider` |
| Classification value | `text-xs font-semibold text-primary` |
| Confidence bar width | `w-full` (overrides default) |
| Reasoning label | `text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5` |
| Reasoning text | `text-sm text-text-primary bg-surface-secondary p-3 rounded-lg border border-border leading-relaxed` |
| AMD badge | `flex items-center gap-2 bg-surface-secondary p-2.5 rounded-lg border border-border` |
| AMD icon | `material-symbols-outlined text-[18px] text-[oklch(0.55_0.15_25)]` — `developer_board` |
| AMD text | `text-xs text-text-muted` |
| AMD highlight | `font-semibold text-[oklch(0.55_0.15_25)]` |

**Pattern notes:**
- AMD ROCm badge is always shown — uses `oklch(0.55_0.15_25)` (red) for AMD brand color
- `border-l-4` changes based on action: `border-error` for escalations, `border-primary` for auto-replies
- `ConfidenceBar` receives `className="w-full"` override

---

### Escalation Card — `components/decision-details/EscalationCard.tsx`

| Property | Class |
|----------|-------|
| Card | `glass-card p-6 flex flex-col gap-4` |
| Header | `flex justify-between items-center pb-3 border-b border-border` |
| Title | `text-lg font-semibold text-text-primary` |
| Resolved date | `text-xs text-text-muted` |
| Notes label | `text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5` |
| Notes textarea | `w-full p-3 border border-border rounded-lg bg-surface-secondary focus:border-secondary focus:ring-1 focus:ring-secondary text-sm text-text-primary resize-none placeholder:text-text-muted` |
| Notes textarea (resolved) | Same + `cursor-default` |
| Resolve button | `w-full py-3 border border-success text-success rounded-lg text-xs font-medium hover:bg-success/10 transition-colors flex justify-center items-center gap-2` |
| Resolve icon | `material-symbols-outlined text-[18px]` — `check_circle` |
| Feedback (success) | `text-xs px-3 py-1.5 rounded-md bg-success/10 text-success` |
| Feedback (error) | `text-xs px-3 py-1.5 rounded-md bg-error/10 text-error` |
| Spinner | `material-symbols-outlined text-[18px] animate-spin` |

**Pattern notes:**
- Uses `StatusBadge` and `PriorityBadge` from shared components
- Wired to Convex: `useMutation(api.decisions.resolveEscalation)`
- Accepts `escalationId: Id<"escalations">` prop for mutation
- Resolve button hidden when `status === "resolved"`
- Notes textarea disabled when resolved
- Feedback messages auto-clear after 3 seconds
- PostHog events: `triage_resolved` on resolve
- Loading states: spinner icon + "Resolving..." text

---

### AMD Context Card — `components/decision-details/AmdContextCard.tsx`

| Property | Class |
|----------|-------|
| Card | `glass-card p-6 flex flex-col gap-4` |
| Header | `flex justify-between items-center pb-3 border-b border-border` |
| Section icon | `material-symbols-outlined text-text-muted text-[20px]` — `history` |
| Section title | `text-lg font-semibold text-text-primary` |
| Subtitle | `text-xs text-text-muted` |
| Interaction list | `flex flex-col gap-2` |
| Interaction item | `p-3 bg-surface-secondary rounded-lg border border-border hover:border-primary transition-colors cursor-pointer` |
| Interaction subject | `text-xs font-semibold text-text-primary` |
| Interaction time | `text-[10px] text-text-muted shrink-0 ml-2` |
| Interaction summary | `text-[11px] text-text-muted truncate` |
| Empty state | `text-xs text-text-muted italic` |
| Footer | `text-[10px] text-text-muted mt-1` |

**Pattern notes:**
- Shows similar past interactions (AMD ROCm embedding-powered)
- Empty state: "No similar past interactions found."
- Each interaction item is hoverable (`hover:border-primary`)
- Summary text truncated with `truncate` class

---

### Shared Badge Components — `components/triage/StatusBadge.tsx`

**StatusBadge:**

| Property | Class |
|----------|-------|
| Badge | `rounded-full px-2.5 py-0.5 text-xs font-medium border-0` + config colors |

**PriorityBadge:**

| Property | Class |
|----------|-------|
| Badge | `rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider` + priority config |

**ConfidenceBar:**

| Property | Class |
|----------|-------|
| Wrapper | `flex items-center gap-1.5` |
| Track | `h-1.5 w-20 rounded-full bg-border overflow-hidden` |
| Fill | `h-full rounded-full` + color by score |
| Label | `text-xs text-text-muted tabular-nums` |

**Confidence colors:**
| Score | Color |
|-------|-------|
| 90%+ | `bg-success` |
| 70-89% | `bg-primary` |
| 50-69% | `bg-warning` |
| <50% | `bg-error` |

**Pattern notes:**
- All badge types (classification, action, priority, status) use same config maps from `lib/triage-config.ts`
- `PriorityBadge` wraps `StatusBadge` with additional size override (`text-[10px]`, `px-2 py-0.5`)
- `ConfidenceBar` accepts optional `className` override (used by AiDecisionCard with `w-full`)

---

### Shared Configs — `lib/triage-config.ts`

**Config maps:**
- `classificationConfig` — routine, technical, urgent, sales, other
- `actionConfig` — auto_reply, escalate
- `priorityConfig` — urgent, high, medium, low
- `escalationStatusConfig` — pending, in_progress, resolved

**Functions:**
- `confidenceColor(score)` — returns bg class by score range
- `getBadgeConfig(type, value)` — returns label/bg/text for any badge type+value combo

**Pattern notes:**
- Used by `StatusBadge`, `DecisionCard`, and all decision-details components
- Dark mode variants via `dark:bg-*/20 dark:text-*` suffixes
- Default fallback: `{ label: value, bg: "bg-surface-secondary", text: "text-text-muted" }`

---

### Decision Details Page — `app/dashboard/decisions/[id]/page.tsx`

| Property | Class |
|----------|-------|
| Page bg | `min-h-screen bg-bg-primary` |
| Container | `max-w-7xl mx-auto px-6 py-10` |
| Grid | `grid grid-cols-1 lg:grid-cols-12 gap-6` |
| Left column | `lg:col-span-7 flex flex-col gap-6` |
| Right column | `lg:col-span-5 flex flex-col gap-6` |
| Skeleton card | `glass-card p-6 flex flex-col gap-4` |
| Not found card | `glass-card p-12 flex flex-col items-center gap-4 text-center` |
| Not found icon | `material-symbols-outlined text-text-muted text-[48px]` — `inbox` |
| Not found heading | `text-lg font-semibold text-text-primary` |
| Not found desc | `text-sm text-text-muted max-w-md` |
| Back button | `mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors` |

**Pattern notes:**
- Uses `use(params)` for Next.js 16 async params
- Auth guard: `useAuthGuard()` — shows skeleton while loading
- Loading state: full skeleton with `DecisionDetailSkeleton` (matches 12-col grid layout)
- Not found state: styled empty state with icon, heading, description, and back link
- `decisionId` cast as `Id<"triageDecisions">`
- `decision.email` and `decision.escalation` and `decision.embedding` checked before rendering child components
- Data fetched via `api.triage.getDecisionById` with `{ decisionId }`

---

### StatsBar — `components/dashboard/StatsBar.tsx`

Last updated: 2026-07-11

| Property | Class |
|----------|-------|
| Container | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` |
| Card | `bg-surface border-border rounded-xl p-6 shadow-card hover:shadow-md transition-shadow cursor-pointer` |
| Card (warning) | Same + `border-l-4 border-l-warning` + `border-warning` |
| Icon wrapper | `p-2 rounded-lg` + variant `bg-*/10 text-*` |
| Label | `text-sm font-medium text-text-secondary` |
| Value | `text-3xl font-bold text-text-primary tabular-nums` |
| Trend text | `text-xs font-medium` — up: `text-success-dark`, down: `text-error`, neutral: `text-text-muted` |
| Hover | `hover:shadow-md transition-shadow cursor-pointer` |
| Focus | `tabIndex={0} role="button"` with keydown Enter handler |

**Pattern notes:**
- Each card links to a filtered view via `router.push(href)` on click
- Icon colors match semantic meaning: primary (emails), success (auto-reply), warning (escalations), secondary (time saved)
- Cards use `motion.div` with `staggerItem` variants for staggered entrance animation
- Trend indicator shows below value, uses arrow prefix (↑/↓)

---

### AnalyticsCharts — `components/dashboard/AnalyticsCharts.tsx`

Last updated: 2026-07-11

| Property | Class |
|----------|-------|
| Container | `grid grid-cols-1 lg:grid-cols-12 gap-6` |
| Chart card (8 cols) | `lg:col-span-8 bg-surface border border-border rounded-xl p-6 shadow-card` |
| Side card (4 cols) | `lg:col-span-4 bg-surface border border-border rounded-xl p-6 shadow-card` |
| Section heading | `text-lg font-semibold text-text-primary mb-6` |
| Chart height | `h-64` (line), `h-40 w-40` (pie wrapper) |
| Line chart grid | `stroke="var(--color-border)" strokeDasharray="3 3" vertical={false}` |
| Line chart stroke | `stroke="var(--color-primary)" strokeWidth={2.5}` |
| Line chart dot | `fill="var(--color-primary)" r=4` |
| Pie inner/outer | `innerRadius={45} outerRadius={70} paddingAngle={2}` |
| Legend dot | `size-3 rounded-full` |
| Legend labels | `text-sm text-text-secondary` — value: `font-semibold text-text-primary tabular-nums` |
| Tooltip style | `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: 8px` |

**Pattern notes:**
- Uses recharts `LineChart` + `PieChart` (responsive via `ResponsiveContainer`)
- Line chart uses `type="monotone"` for smooth curves
- Pie chart is donut variant (`innerRadius` > 0)
- Classification colors array maps to token CSS variables (`var(--color-primary)`, `var(--color-secondary)`, etc.)
- Custom legend rendered below pie (not recharts default) — matches Stitch design pattern

---

### RecentActivity — `components/dashboard/RecentActivity.tsx`

Last updated: 2026-07-11

| Property | Class |
|----------|-------|
| Card | `bg-surface border border-border rounded-xl p-6 shadow-card` |
| Section heading | `text-lg font-semibold text-text-primary mb-6` |
| Item container | `flex items-start gap-3` |
| Icon circle | `p-2 rounded-full shrink-0` — `bg-success/10 text-success` (auto-reply) or `bg-warning/10 text-warning` (escalate) |
| Icon | `size-3.5` (Send for auto-reply, ArrowUpFromLine for escalate) |
| Sender text | `text-sm font-medium text-text-primary truncate` |
| Timestamp + desc | `text-xs text-text-muted mt-0.5` |

**Pattern notes:**
- Icon color + bg matches action type: green for auto-reply, amber/warning for escalate
- Sender name is truncated with `truncate` class for overflow
- Syncs with mock data shape — Features 19-20 will swap to real Convex data

---

### AmdBadge — `components/dashboard/AmdBadge.tsx`

Last updated: 2026-07-11

| Property | Class |
|----------|-------|
| Card | `bg-gradient-to-br from-surface to-primary/5 border border-primary/20 rounded-xl p-6 shadow-card` |
| Inner layout | `flex items-center justify-between flex-wrap gap-4` |
| AMD pill | `flex items-center gap-2 bg-amd-light rounded-lg px-3 py-1.5` |
| AMD icon | `size-4 text-amd` |
| AMD label | `text-xs font-semibold text-amd` |
| Checkmark | `size-4 text-success` |
| Status text | `text-sm text-text-secondary` |
| Timestamp | `text-xs text-text-muted` |
| Live dot | `size-2 rounded-full bg-success animate-pulse` |

**Pattern notes:**
- Uses gradient card variant (`bg-gradient-to-br from-surface to-primary/5 border-primary/20`)
- AMD brand colors via `text-amd`, `bg-amd-light` tokens
- Animated pulse dot signals "active" state
- Matches the pill badge variant in page header (`bg-surface border border-border rounded-full px-3 py-1.5`)

---

### FloatingNav — `components/ui/floating-navbar.tsx`

Last updated: 2026-07-11

| Property | Class |
|----------|-------|
| Position | `fixed top-3 inset-x-0 mx-auto z-[5000]` |
| Width | `w-auto min-w-[320px] sm:min-w-[480px]` |
| Background | `bg-surface/80 backdrop-blur-lg` |
| Border | `border border-border` |
| Radius | `rounded-full` |
| Shadow | `shadow-card` |
| Padding | `px-4 py-2` |
| Nav link | `text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary rounded-full px-3 py-1.5` |
| Divider | `h-5 w-px bg-border` |

**Pattern notes:**
- Always visible (no scroll-hide logic) — mounts with fade+slide entrance animation
- Accepts `children` to replace the right-side CTA slot (theme toggle + user info)
- Uses theme CSS variables throughout — respects light/dark mode
- Originally from Aceternity UI — simplified to always-show variant

---

### DashboardLayout — `app/dashboard/layout.tsx`

Last updated: 2026-07-11

| Property | Class |
|----------|-------|
| Page background | `min-h-screen bg-bg-primary` |
| Nav spacing | `pt-16` (pushes content below fixed FloatingNav) |
| User avatar | `size-7 rounded-full border-2 border-border object-cover` |
| User initials | `size-7 rounded-full bg-primary-muted border-2 border-border text-[10px] font-semibold text-primary` |
| User name | `text-sm text-text-secondary max-w-[100px] truncate hidden sm:block` |
| Theme toggle | Uses existing `ThemeToggle` component |
| Nav items | `Dashboard`, `Triage Feed`, `Settings` with `size-4` lucide icons |

**Pattern notes:**
- Shared layout for all `/dashboard/*` routes — FloatingNav appears on every dashboard page
- Fetches user profile via `api.userProfiles.getMe` for avatar display
- Children are wrapped in `pt-16` to avoid overlap with the fixed navbar
- No auth guard here — individual pages handle their own auth checks

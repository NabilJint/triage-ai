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
| Logo text | `text-primary text-xl font-bold tracking-tight` |
| Nav link (inactive) | `text-text-dark text-sm font-medium` |
| Nav link (hover) | `hover:text-text-primary transition-colors duration-200` |
| Mobile menu button | `p-2 rounded-md hover:bg-surface-secondary` |

**Pattern notes:**
- Sticky top navbar (`sticky top-0 z-50`)
- Uses `max-w-1280px mx-auto px-6` inner container matching section layout
- Sign In uses `variant="ghost" size="sm"`, Get Started uses primary `size="sm"`
- Mobile uses Sheet component with 288px width (`w-72`)

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

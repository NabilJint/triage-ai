# UI Tokens

Design tokens for TriageAI. All colors, typography, spacing, and component values aligned with modern design standards. Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `app/globals.css`. No `tailwind.config.ts` needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-primary` → `bg-primary`, `text-primary`, `border-primary`
- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Also correct — references CSS variable directly
style={{ color: 'var(--color-text-primary)' }}

// Never — hardcoded hex values
className="bg-[#0D9488] text-[#0F172A]"

// Never — raw Tailwind color classes
className="bg-teal-500 text-gray-800"
```

---

## Token Hierarchy

This design system uses a **three-layer token hierarchy**:

| Layer | Purpose | Example |
|-------|---------|---------|
| **Primitive tokens** | Raw values | `--color-primary: oklch(0.65 0.15 190)` |
| **Semantic tokens** | Intent-based | `--color-bg-primary: var(--color-background)` |
| **Component tokens** | Component-scoped | `--card-bg: var(--color-surface)` |

This structure prevents changes to one component from affecting others unintentionally.

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* ===== FONT ===== */
  --font-sans: "Inter", sans-serif;

  /* ===== PRIMITIVE TOKENS ===== */
  /* Brand Colors — OKLCH for better color quality */
  --color-primary: oklch(0.65 0.15 190);
  --color-primary-dark: oklch(0.55 0.15 190);
  --color-primary-light: oklch(0.85 0.06 190);
  --color-primary-muted: oklch(0.92 0.04 190);
  --color-primary-foreground: oklch(1 0 0);

  --color-secondary: oklch(0.55 0.2 270);
  --color-secondary-dark: oklch(0.45 0.2 270);
  --color-secondary-light: oklch(0.88 0.06 270);
  --color-secondary-muted: oklch(0.94 0.03 270);
  --color-secondary-foreground: oklch(1 0 0);

  /* Status Colors */
  --color-success: oklch(0.6 0.15 160);
  --color-success-dark: oklch(0.5 0.15 160);
  --color-success-light: oklch(0.88 0.06 160);
  --color-success-lightest: oklch(0.95 0.03 160);
  --color-success-foreground: oklch(0.35 0.1 160);

  --color-warning: oklch(0.7 0.15 80);
  --color-warning-light: oklch(0.92 0.06 80);
  --color-warning-foreground: oklch(0.45 0.1 80);

  --color-error: oklch(0.55 0.2 25);
  --color-error-light: oklch(0.88 0.06 25);
  --color-error-foreground: oklch(0.35 0.1 25);

  --color-info: oklch(0.6 0.15 240);
  --color-info-light: oklch(0.88 0.06 240);
  --color-info-foreground: oklch(0.35 0.1 240);

  /* AMD Brand — used for ROCm badge */
  --color-amd: oklch(0.55 0.15 25);
  --color-amd-light: oklch(0.92 0.04 25);
  --color-amd-foreground: oklch(1 0 0);

  /* Surface Colors — Light Mode */
  --color-background: oklch(0.98 0.01 0);
  --color-surface: oklch(1 0 0);
  --color-surface-secondary: oklch(0.96 0.01 0);
  --color-surface-tertiary: oklch(0.94 0.01 0);
  --color-border: oklch(0.9 0.01 0);
  --color-border-light: oklch(0.94 0.01 0);

  /* Text Colors — Light Mode */
  --color-text-primary: oklch(0.15 0.02 0);
  --color-text-secondary: oklch(0.45 0.02 0);
  --color-text-muted: oklch(0.6 0.02 0);
  --color-text-dark: oklch(0.2 0.02 0);
  --color-text-darkest: oklch(0.05 0.02 0);

  /* Overlay */
  --color-overlay: oklch(0.15 0.02 0 / 0.5);

  /* ===== SEMANTIC TOKENS ===== */
  /* Backgrounds */
  --color-bg-primary: var(--color-background);
  --color-bg-surface: var(--color-surface);
  --color-bg-surface-hover: var(--color-surface-secondary);

  /* ===== COMPONENT TOKENS ===== */
  /* Cards */
  --card-bg: var(--color-surface);
  --card-border: var(--color-border);
  --card-radius: var(--radius-lg);
  --card-shadow: 0px 1px 3px oklch(0 0 0 / 0.06),
                  0px 1px 2px -1px oklch(0 0 0 / 0.04);

  /* Card Variants */
  --card-highlight-bg: var(--color-primary-muted);
  --card-highlight-border: var(--color-primary-light);
  --card-warning-bg: var(--color-warning-light);
  --card-warning-border: var(--color-warning);
  --card-error-bg: var(--color-error-light);
  --card-error-border: var(--color-error);
  --card-gradient-bg: linear-gradient(
    to bottom right,
    var(--color-surface),
    var(--color-primary-muted)
  );

  /* Buttons — Primary */
  --btn-primary-bg: var(--color-primary);
  --btn-primary-bg-hover: var(--color-primary-dark);
  --btn-primary-text: var(--color-primary-foreground);
  --btn-primary-radius: var(--radius-md);
  --btn-primary-padding: 0.5rem 1rem;
  --btn-primary-font-size: 0.875rem;
  --btn-primary-font-weight: 500;

  /* Buttons — Secondary */
  --btn-secondary-bg: var(--color-secondary);
  --btn-secondary-bg-hover: var(--color-secondary-dark);
  --btn-secondary-text: var(--color-secondary-foreground);
  --btn-secondary-radius: var(--radius-md);
  --btn-secondary-padding: 0.5rem 1rem;
  --btn-secondary-font-size: 0.875rem;
  --btn-secondary-font-weight: 500;

  /* Buttons — Outline */
  --btn-outline-bg: var(--color-surface);
  --btn-outline-border: var(--color-border);
  --btn-outline-text: var(--color-text-primary);
  --btn-outline-bg-hover: var(--color-surface-secondary);

  /* Stats */
  --stat-value-font-size: 2rem;
  --stat-value-font-weight: 700;
  --stat-label-font-size: 0.875rem;
  --stat-label-font-weight: 500;
  --stat-trend-up-bg: var(--color-success-lightest);
  --stat-trend-up-text: var(--color-success-dark);
  --stat-trend-down-bg: var(--color-error-light);
  --stat-trend-down-text: var(--color-error);

  /* Inputs */
  --input-bg: var(--color-surface);
  --input-border: var(--color-border);
  --input-radius: var(--radius-md);
  --input-padding: 0.5rem 0.75rem;
  --input-font-size: 0.875rem;
  --input-text: var(--color-text-primary);
  --input-placeholder: var(--color-text-muted);
  --input-focus-ring: var(--color-primary);
  --input-focus-ring-opacity: 0.2;

  /* Badges */
  --badge-radius: var(--radius-full);
  --badge-padding: 0.125rem 0.625rem;
  --badge-font-size: 0.75rem;
  --badge-font-weight: 500;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;
}

/* ===== DARK MODE ===== */
.dark {
  --color-background: oklch(0.1 0.02 0);
  --color-surface: oklch(0.15 0.02 0);
  --color-surface-secondary: oklch(0.2 0.02 0);
  --color-surface-tertiary: oklch(0.25 0.02 0);
  --color-border: oklch(0.25 0.02 0);
  --color-border-light: oklch(0.2 0.02 0);

  --color-text-primary: oklch(0.9 0.01 0);
  --color-text-secondary: oklch(0.7 0.01 0);
  --color-text-muted: oklch(0.5 0.01 0);
  --color-text-dark: oklch(0.8 0.01 0);
  --color-text-darkest: oklch(0.95 0.01 0);

  --color-primary-muted: oklch(0.25 0.15 190);
  --color-primary-light: oklch(0.3 0.15 190);

  --card-bg: var(--color-surface);
  --card-border: var(--color-border);
  --card-shadow: 0px 1px 3px oklch(0 0 0 / 0.3);

  --input-bg: var(--color-surface);
  --input-border: var(--color-border);
}
```

---

## Color Usage Guide

### Page Layout

| Element | Token | Dark Mode |
|---------|-------|-----------|
| Page background | `bg-bg-primary` | `oklch(0.1 0.02 0)` |
| Card / surface | `bg-surface` | `oklch(0.15 0.02 0)` |
| Secondary surface | `bg-surface-secondary` | `oklch(0.2 0.02 0)` |
| Default border | `border-border` | `oklch(0.25 0.02 0)` |

### Brand Colors

| Element | Token | Dark Mode |
|---------|-------|-----------|
| Primary (Teal) | `bg-primary` / `text-primary` | Same (unchanged) |
| Primary dark | `bg-primary-dark` | Same |
| Primary light background | `bg-primary-light` | `oklch(0.3 0.15 190)` |
| Secondary (Indigo) | `bg-secondary` / `text-secondary` | Same |

**Usage:**
- **Primary (Teal):** Primary buttons, active nav items, brand elements, main CTAs
- **Secondary (Indigo):** Highlights, secondary CTAs, focus rings, subtle accents
- Never use both in the same UI element — pick one and stick with it

### Typography

| Element | Token | Size | Weight | Dark Mode |
|---------|-------|------|--------|-----------|
| Headings, primary text | `text-text-primary` | — | — | `oklch(0.9 0.01 0)` |
| Secondary text, labels | `text-text-secondary` | — | — | `oklch(0.7 0.01 0)` |
| Placeholder, muted | `text-text-muted` | — | — | `oklch(0.5 0.01 0)` |
| Dark labels | `text-text-dark` | — | — | `oklch(0.8 0.01 0)` |

### Card Variants

| Variant | Background | Border | Use Case |
|---------|------------|--------|----------|
| Default | `bg-surface` | `border-border` | Standard content |
| Highlight | `bg-primary-muted` | `border-primary-light` | Key metrics, featured content |
| Warning | `bg-warning-light` | `border-warning` | Needs attention, moderate priority |
| Error | `bg-error-light` | `border-error` | Urgent issues, critical alerts |
| Gradient | `bg-gradient-to-br from-surface to-primary/5` | `border-primary/20` | Premium sections, AMD badge area |

### Confidence Score Colors

| Score Range | Color | Token | Dark Mode |
|-------------|-------|-------|-----------|
| 0.9 - 1.0 | Green | `text-success` / `bg-success-lightest` | `oklch(0.6 0.15 160)` |
| 0.7 - 0.89 | Teal | `text-primary` / `bg-primary-light` | `oklch(0.65 0.15 190)` |
| 0.5 - 0.69 | Amber | `text-warning` / `bg-warning-light` | `oklch(0.7 0.15 80)` |
| Below 0.5 | Red | `text-error` / `bg-error-light` | `oklch(0.55 0.2 25)` |

### Classification Badges

| Type | Background | Text | Dark Mode |
|------|------------|------|-----------|
| Routine | `bg-primary-light` | `text-primary-dark` | `bg-primary/20` |
| Technical | `bg-secondary-light` | `text-secondary-dark` | `bg-secondary/20` |
| Urgent | `bg-error-light` | `text-error` | `bg-error/20` |
| Sales | `bg-success-light` | `text-success-dark` | `bg-success/20` |
| Other | `bg-surface-secondary` | `text-text-secondary` | `bg-surface-tertiary` |

### Priority Badges (Escalations)

| Priority | Background | Text | Dark Mode |
|----------|------------|------|-----------|
| Urgent | `bg-error-light` | `text-error` | `bg-error/20` |
| High | `bg-warning-light` | `text-warning` | `bg-warning/20` |
| Medium | `bg-secondary-light` | `text-secondary-dark` | `bg-secondary/20` |
| Low | `bg-surface-secondary` | `text-text-secondary` | `bg-surface-tertiary` |

### Status Badges

| Status | Background | Text | Dark Mode |
|--------|------------|------|-----------|
| Processed | `bg-primary-light` | `text-primary-dark` | `bg-primary/20` |
| Replied | `bg-success-light` | `text-success-dark` | `bg-success/20` |
| Escalated | `bg-warning-light` | `text-warning` | `bg-warning/20` |
| Resolved | `bg-surface-secondary` | `text-text-secondary` | `bg-surface-tertiary` |
| Pending | `bg-error-light` | `text-error` | `bg-error/20` |

### AMD ROCm Badge

| Element | Token | Dark Mode |
|---------|-------|-----------|
| Badge bg | `bg-amd-light` | `bg-amd/20` |
| Badge text | `text-amd` | Same |
| Badge border | `border-amd/20` | Same |

---

## Typography

| Element | Size | Weight | Line Height | Token | Dark Mode |
|---------|------|--------|-------------|-------|-----------|
| Logo text | 20px | 700 | 28px | `text-primary` | Same |
| Hero headline | 48px | 800 | 52px | `text-text-darkest` | `text-text-primary` |
| Hero subheadline | 20px | 400 | 28px | `text-text-secondary` | Same |
| Stat number | 32px | 700 | 38px | `text-text-primary` | Same |
| Section heading | 18px | 600 | 26px | `text-text-primary` | Same |
| Card title | 16px | 600 | 24px | `text-text-primary` | Same |
| Nav item (active) | 14px | 500 | 20px | `text-primary` | Same |
| Nav item (inactive) | 14px | 500 | 20px | `text-text-dark` | `text-text-secondary` |
| Body text | 14px | 400 | 20px | `text-text-primary` | Same |
| Card label | 13px | 500 | 18px | `text-text-secondary` | Same |
| Small / muted | 12px | 400 | 16px | `text-text-muted` | Same |
| Badge text | 12px | 500 | 16px | — | — |
| Chart axis labels | 12px | 400 | 15px | `#94A3B8` | `#6B7280` |

Font family: **Inter** — import from Google Fonts or use `next/font/google`.

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight inline gaps, badge spacing |
| `gap-2` | 8px | Tag gaps, icon+text spacing |
| `gap-3` | 12px | Form field gaps, button groups |
| `gap-4` | 16px | Section internal gaps |
| `gap-6` | 24px | Between sections, card spacing |
| `gap-8` | 32px | Page section gaps |
| `p-4` | 16px | Small card padding |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Large section padding |
| `px-4 py-2` | 16px / 8px | Standard button padding |
| `px-3 py-1` | 12px / 4px | Badge padding |
| `px-6 py-3` | 24px / 12px | Large button padding |

---

## Component Tokens Reference

### Cards

```
Default:
  background: var(--card-bg)
  border: 1px solid var(--card-border)
  border-radius: var(--card-radius)
  padding: var(--spacing-6)
  box-shadow: var(--card-shadow)

Highlight:
  background: var(--card-highlight-bg)
  border: 1px solid var(--card-highlight-border)

Warning:
  background: var(--card-warning-bg)
  border: 1px solid var(--card-warning-border)

Error:
  background: var(--card-error-bg)
  border: 1px solid var(--card-error-border)

Gradient:
  background: var(--card-gradient-bg)
  border: 1px solid var(--card-highlight-border)
```

### Buttons

**Primary (Teal):**
```
background: var(--btn-primary-bg)
text: var(--btn-primary-text)
border-radius: var(--btn-primary-radius)
padding: var(--btn-primary-padding)
font-size: var(--btn-primary-font-size)
font-weight: var(--btn-primary-font-weight)
hover: var(--btn-primary-bg-hover)
focus: ring-2 ring-primary/20
```

**Secondary (Indigo):**
```
background: var(--btn-secondary-bg)
text: var(--btn-secondary-text)
border-radius: var(--btn-secondary-radius)
padding: var(--btn-secondary-padding)
font-size: var(--btn-secondary-font-size)
font-weight: var(--btn-secondary-font-weight)
hover: var(--btn-secondary-bg-hover)
focus: ring-2 ring-secondary/20
```

**Outline:**
```
background: var(--btn-outline-bg)
border: 1px solid var(--btn-outline-border)
text: var(--btn-outline-text)
border-radius: var(--btn-primary-radius)
padding: var(--btn-primary-padding)
hover: var(--btn-outline-bg-hover)
```

### Stat Cards

```
background: var(--stat-card-bg) or variant
border: 1px solid var(--card-border)
border-radius: var(--card-radius)
padding: var(--spacing-6)
box-shadow: var(--card-shadow)
value: var(--stat-value-font-size) var(--stat-value-font-weight)
label: var(--stat-label-font-size) var(--stat-label-font-weight)
trend-up: var(--stat-trend-up-bg) var(--stat-trend-up-text)
trend-down: var(--stat-trend-down-bg) var(--stat-trend-down-text)
```

### Decision Cards

```
background: var(--card-bg)
border: 1px solid var(--card-border)
border-radius: var(--card-radius)
padding: var(--spacing-4)
hover: border-primary/30
transition: border-color 0.2s ease
```

---

## Dark Mode Support

Dark mode is built into the token system. To enable:

1. Add `.dark` class to `<html>` element
2. All tokens automatically switch

```tsx
// Toggle dark mode
const toggleDarkMode = () => {
  document.documentElement.classList.toggle("dark");
};
```

**Rules:**
- All colors have dark mode equivalents
- Never hardcode dark mode colors — use tokens
- Test both modes before shipping
- Dark mode should be optional, not forced

---

## Accessibility Tokens

| Token | Purpose | Value |
|-------|---------|-------|
| `--color-focus-ring` | Focus ring color | `var(--color-primary)` |
| `--color-focus-ring-opacity` | Focus ring opacity | `0.2` |
| `--color-text-link` | Link color (accessible contrast) | `var(--color-primary)` |
| `--color-text-link-hover` | Link hover | `var(--color-primary-dark)` |

**Minimum contrast ratios:**
- Text on background: 4.5:1
- Large text: 3:1
- UI components: 3:1

---

## Invariants

- Never use hex values directly in components — always use CSS variables via Tailwind tokens
- Font is Inter — always import via `next/font/google`, never use a fallback system font
- Never use raw Tailwind color classes like `bg-teal-500` or `text-gray-600` — use project tokens only
- Primary color is Teal (`oklch(0.65 0.15 190)`) — never use a different teal shade
- Secondary color is Indigo (`oklch(0.55 0.2 270)`) — for accents and highlights only
- Confidence bars always use color tokens based on score range — never hardcoded colors
- All borders default to `--color-border` — never use `border-gray-*`
- AMD badge always uses `--color-amd` with light background — never generic red
- Dark mode must use tokens, not hardcoded values
- Component tokens always reference semantic tokens, never primitive tokens directly
# UI Rules

Concise rules for building TriageAI UI. These rules cover the most important patterns and constraints to keep the UI consistent, modern, and accessible. Design assets are available — use them as the source of truth for visual decisions.

---

## Font

Always import Inter via `next/font/google` in the root layout.

```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
```

The `--font-sans` variable is already declared in `@theme` in globals.css. Apply the font variable class to the `<html>` tag in root layout. Never use system fonts as the primary font.

---

## Layout

- Page max-width: 1280px, centered
- Main content area padding: 24px on all sides
- Gap between page sections: 24px
- Header height: 64px, full width, surface background, padding 0 24px
- All pages use top navbar only — no sidebar, no drawer

---

## Navbar

Three nav items: Dashboard, Triage Feed, Settings.

- Active item: `color: var(--color-primary)`, font-weight 500, 14px
- Inactive item: `color: var(--color-text-secondary)`, font-weight 500, 14px
- No underline — active state is color change only
- Navbar always surface background, full viewport width

---

## Cards

Every content section lives in a card. Use card variants for visual hierarchy.

**Default card:**

```
background: var(--card-bg)
border: 1px solid var(--card-border)
border-radius: var(--card-radius)
padding: 24px
box-shadow: var(--card-shadow)
```

**Card variants (use sparingly for emphasis):**

| Variant | Use Case | Classes |
|---------|----------|---------|
| Default | Standard content | `bg-surface border-border` |
| Highlight | Key metrics, featured content | `bg-primary-muted border-primary-light` |
| Warning | Needs attention, moderate priority | `bg-warning-light border-warning` |
| Error | Urgent issues, critical alerts | `bg-error-light border-error` |
| Gradient | Premium sections, AMD badge area | `bg-gradient-to-br from-surface to-primary/5 border-primary/20` |

**Rules:**
- Default cards are the default — use variants only when content needs emphasis
- Never use more than 2 card variants on a single page
- Gradient cards should be used sparingly (1-2 per page max)

---

## Typography Hierarchy

Six levels used consistently throughout:

**Hero / Page titles**

```
font-size: 32px (text-3xl)
font-weight: 700
color: var(--color-text-darkest)
line-height: 40px
```

**Section headings** — card titles, page section titles

```
font-size: 18px (text-lg)
font-weight: 600
color: var(--color-text-primary)
line-height: 26px
```

**Card titles / Subheadings**

```
font-size: 16px (text-base)
font-weight: 600
color: var(--color-text-primary)
line-height: 24px
```

**Body / primary content text**

```
font-size: 14px (text-sm)
font-weight: 400
color: var(--color-text-primary)
line-height: 20px
```

**Secondary / muted text** — labels, timestamps, subtitles

```
font-size: 13px (text-sm)
font-weight: 500
color: var(--color-text-secondary)
line-height: 18px
```

**Small / metadata text** — badge text, chart labels, fine print

```
font-size: 12px (text-xs)
font-weight: 400
color: var(--color-text-muted)
line-height: 16px
```

Stat numbers on dashboard use 32px / weight 700 / color var(--color-text-primary).

---

## Badges

All badges use `border-radius: 9999px` (pill shape) unless specified otherwise.

```
padding: 2px 10px
font-size: 12px
font-weight: 500
```

Trend badges on stat cards use `border-radius: 4px` (not pill) with `bg-success-lightest` background and `text-success-dark` text.

---

## Buttons

**Primary button (Teal):**

```
background: var(--btn-primary-bg)
color: var(--btn-primary-text)
border-radius: var(--btn-primary-radius)
padding: var(--btn-primary-padding)
font-size: var(--btn-primary-font-size)
font-weight: var(--btn-primary-font-weight)
hover: var(--btn-primary-bg-hover)
focus: ring-2 ring-primary/20
```

**Secondary button (Indigo):**

```
background: var(--btn-secondary-bg)
color: var(--btn-secondary-text)
border-radius: var(--btn-secondary-radius)
padding: var(--btn-secondary-padding)
font-size: var(--btn-secondary-font-size)
font-weight: var(--btn-secondary-font-weight)
hover: var(--btn-secondary-bg-hover)
focus: ring-2 ring-secondary/20
```

**Outline button:**

```
background: var(--btn-outline-bg)
border: 1px solid var(--btn-outline-border)
color: var(--btn-outline-text)
border-radius: var(--btn-primary-radius)
padding: var(--btn-primary-padding)
hover: var(--btn-outline-bg-hover)
```

**Ghost button:**

```
background: transparent
color: var(--color-text-secondary)
border-radius: var(--radius-md)
padding: 8px 16px
hover: bg-surface-secondary
```

---

## Form Inputs

```
background: var(--input-bg)
border: 1px solid var(--input-border)
border-radius: var(--input-radius)
padding: var(--input-padding)
font-size: var(--input-font-size)
color: var(--input-text)
placeholder: var(--input-placeholder)
focus: ring-2 ring-primary/20 border-primary
```

---

## Smart Dashboard Patterns

### Welcome Banner

Show at top of dashboard. Variants based on state:

**No inbox connected:**
```
background: var(--card-highlight-bg)
border: 1px solid var(--card-highlight-border)
padding: 16px
flex items-center justify-between
```

**Pending escalations:**
```
background: var(--card-error-bg)
border: 1px solid var(--card-error-border)
padding: 16px
```

**All caught up:**
```
background: var(--color-success-lightest)
border: 1px solid var(--color-success)
padding: 16px
```

### Stat Cards

Each stat card should be clickable and link to filtered view.

```
background: var(--card-bg) or variant
border: 1px solid var(--card-border)
border-radius: var(--card-radius)
padding: 24px
cursor: pointer
hover: shadow-md transition-shadow
```

**Stat card elements:**
- Label: `text-sm font-medium text-text-secondary`
- Value: `text-3xl font-bold text-text-primary tabular-nums`
- Trend: `px-2 py-0.5 rounded-sm text-xs font-medium`
  - Up: `bg-success-lightest text-success-dark`
  - Down: `bg-error-light text-error`
  - Neutral: `bg-surface-secondary text-text-muted`

### Priority Alerts

Show urgent and high-priority escalations prominently.

```
background: var(--card-bg) or variant
border-left: 4px solid (priority color)
border-radius: var(--radius-lg)
padding: 16px
```

**Priority colors:**
- Urgent: `border-error bg-error-light`
- High: `border-warning bg-warning-light`
- Medium: `border-secondary-light bg-secondary-muted`
- Low: `border-border bg-surface-secondary`

**Alert elements:**
- Priority label with icon
- From email
- Subject line
- Preview (truncated)
- View and Resolve buttons

---

## Interactive Charts

All charts should be interactive:

**Click behavior:**
- Click on chart → filter feed by that date or category
- Hover → show tooltip with detailed data
- Empty state → show "No data yet" message

**Chart colors:**
- Triage Activity: `var(--color-primary)` stroke, 2.5px width
- Classification Distribution: Primary, Secondary, Error, Success, Muted

---

## Decision Cards (Triage Feed)

- No alternating row colors — white rows only, separated by border
- Row border: `1px solid var(--card-border)` between rows
- Card hover: `border-primary/30`
- Card padding: `16px`
- Sender: 14px font-weight 500
- Subject: 14px font-weight 400 (truncated if long)
- Metadata row: 12px with badges and timestamp

---

## Confidence Bar

Inline progress bar shown next to the percentage number.

```
height: 4px
border-radius: 9999px
background track: var(--color-border)
```

Fill color by score:

| Score Range | Color Token |
|-------------|-------------|
| 0.9 - 1.0 | `bg-success` |
| 0.7 - 0.89 | `bg-primary` |
| 0.5 - 0.69 | `bg-warning` |
| Below 0.5 | `bg-error` |

---

## Empty States

Every section that can be empty must have an empty state. Keep it minimal:

- Short descriptive text in `color: var(--color-text-muted)`
- Optional icon above text
- CTA button if there's a logical next action

---

## Dark Mode

Dark mode is supported via CSS variables. All components should work in both modes.

**To enable:**
```tsx
// Add .dark class to html element
document.documentElement.classList.add("dark");
```

**Rules:**
- Never hardcode dark mode colors — use tokens
- Test both modes before shipping
- Dark mode should be optional, not forced
- All contrast ratios must meet WCAG AA standards

---

## Responsive Breakpoints

Use these breakpoints consistently:

| Breakpoint | Class | Width |
|------------|-------|-------|
| Mobile | (default) | < 640px |
| Tablet | `sm:` | ≥ 640px |
| Desktop | `md:` | ≥ 768px |
| Large | `lg:` | ≥ 1024px |
| XL | `xl:` | ≥ 1280px |

**Common patterns:**
- Stack vertically on mobile, grid on tablet+
- Full-width inputs on mobile, inline on tablet+
- Cards: 1 column mobile, 2 columns tablet, 3-4 columns desktop

---

## Animation Guidelines

Keep animations minimal and purposeful:

| Use Case | Animation |
|----------|-----------|
| Hover states | `transition-colors duration-200` |
| Card expansion | `transition-all duration-200` |
| Loading spinner | `animate-spin` |
| Toast messages | `animate-in slide-in-from-top-2` |
| Skeleton loading | `animate-pulse` |

**Rules:**
- Never use animations over 300ms
- Never animate width/height — animate transform and opacity only
- Never use @keyframes for UI elements — use Tailwind's built-in animations

---

## Accessibility

**Required for all components:**

1. **Focus indicators:** All interactive elements must have visible focus states
2. **Color contrast:** Minimum 4.5:1 for text, 3:1 for UI components
3. **Semantic HTML:** Use `button`, `input`, `label` tags — not divs with click handlers
4. **ARIA labels:** Add `aria-label` to icon-only buttons
5. **Alt text:** All images must have descriptive alt text

**Focus ring tokens:**
```
--color-focus-ring: var(--color-primary)
--color-focus-ring-opacity: 0.2
```

---

## Tailwind v4 Note

This project uses Tailwind v4. Tokens are defined with `@theme` in globals.css — no `tailwind.config.ts` needed. Never define colors in a config file. Always use `@theme` for new tokens.

---

## Do Nots

- Never use Tailwind's built-in color classes (`bg-teal-500`, `text-gray-600`) — use project tokens only
- Never define colors in `tailwind.config.ts` — use `@theme` in globals.css
- Never add gradients to card backgrounds except for the Gradient variant
- Never hardcode colors — always use CSS variables
- Never show raw error messages to users — always show human readable text
- Never stack more than 2 levels of border radius inside each other
- Never use `position: fixed` for UI elements — use normal flow layout
- Never mix primary (teal) and secondary (indigo) in the same button or interactive element
- Never use red for non-error states — red means error/danger only
- Never use dark mode without testing both modes
- Never skip accessibility requirements

---

## Component Usage Patterns

### Stat Card with Trend

```tsx
<StatCard
  label="Emails Processed"
  value="124"
  trend={{ value: 12, direction: "up", label: "from yesterday" }}
  onClick={() => router.push("/decisions?filter=today")}
/>
```

### Priority Alert

```tsx
<PriorityAlert
  priority="urgent"
  from="sarah@example.com"
  subject="Refund request"
  preview="Product arrived damaged - need immediate refund"
  onView={() => router.push("/decisions/123")}
  onResolve={() => resolveEscalation("123")}
/>
```

### Welcome Banner

```tsx
<WelcomeBanner
  userName="Acme Corp"
  pendingCount={3}
  highPriorityCount={2}
  hasInbox={true}
  onConnectInbox={() => router.push("/settings")}
/>
```

### Card Variants

```tsx
// Default
<div className="bg-surface border border-border rounded-lg p-6 shadow-card">

// Highlight
<div className="bg-primary-muted border border-primary-light rounded-lg p-6">

// Error (urgent)
<div className="bg-error-light border border-error rounded-lg p-6">

// Gradient (premium)
<div className="bg-gradient-to-br from-surface to-primary/5 border border-primary/20 rounded-lg p-6">
```
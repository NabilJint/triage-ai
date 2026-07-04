# Project Overview

## About the Project

TriageAI is an AI-powered customer support assistant for small businesses. It connects to your shared support inbox, reads every incoming email, automatically drafts and sends replies for routine questions, and escalates only what genuinely needs a human — with full visibility into *why* every decision was made.

Built for the **AMD Developer Hackathon: ACT II — Unicorn Track** ($10,000 prize pool), TriageAI demonstrates the power of AMD ROCm on AMD Instinct GPUs for embedding generation, combined with Fireworks AI for LLM inference and Convex for real-time reactive backend.

---

## The Problem It Solves

SMBs (small e-commerce, SaaS, and service businesses) lose customers to slow support replies but can't afford a full support team. Every hour a customer waits for a reply increases the chance they'll take their business elsewhere.

TriageAI eliminates the backlog:
- Routine questions (shipping status, store hours, order tracking) are handled instantly
- Complex issues (refunds, complaints, technical problems) are escalated with full reasoning
- Business owners see exactly *why* each decision was made and can override anything

The result: customers get fast replies, SMBs save hours every day, and no customer falls through the cracks.

---

## Pages

```
/                  → Landing page
/login             → Auth page (Google OAuth)
/dashboard         → Overview, stats, recent activity
/settings          → Inbox connection, escalation rules, reply tone
/decisions         → Live triage feed (all decisions)
/decisions/[id]    → Individual decision details + resolution
```

---

## Navigation

Top navbar. Clean and minimal. Three navigation items:

```
Dashboard    Triage Feed    Settings
```

Full width layout on all pages. No sidebar.

---

## Core User Flow

### Landing Page

- Hero section with value proposition
- "Get Started" CTA → redirects to login
- Features section: auto-reply, escalation, transparency
- Tech trust section: AMD ROCm, Fireworks AI, Convex realtime

### Onboarding

- User signs up via Convex Auth (Google OAuth)
- On login → redirect to `/dashboard`
- Dashboard shows setup banner if inbox not connected

### Settings Setup

- User connects their inbox (Gmail API or mock inbox for testing)
- User configures escalation rules:
  - "Confidence below 60%" → escalate
  - "Contains 'refund'" → escalate
  - "Contains 'urgent'" → escalate
  - Custom rules with priority levels
- User selects reply tone: Professional / Friendly / Casual / Enthusiastic
- Save settings

### Email Processing Flow

1. Email arrives (Gmail webhook or mock trigger)
2. Email is ingested and stored in Convex
3. Agent classifies the email via Fireworks AI:
   - Classification: routine / technical / urgent / sales / other
   - Confidence score (0-1)
   - Reasoning text
4. Agent checks escalation rules against classification
5. Decision:
   - **If confidence >= 0.7 AND no rule matches** → auto-reply drafted via Fireworks AI
   - **If confidence < 0.7 OR rule matches** → escalated with priority

### AMD ROCm Step (Explicit Hackathon Requirement)

1. When email arrives, extract sender email address
2. Check if customer embedding exists
3. If missing or stale → call AMD Developer Cloud endpoint
4. ROCm on AMD Instinct GPU generates embedding
5. Embedding stored in Convex for future similarity search
6. Similar past interactions added to Fireworks AI prompt as context

### Triage Feed

- All decisions displayed in real-time feed
- Cards show: sender, subject, classification, confidence, action, timestamp
- Filter: All / Auto-replied / Escalated / Pending
- Sort: Newest / Oldest / Priority
- Search: filter by subject or sender

### Decision Details

- Full email content displayed
- AI decision section: classification, confidence, reasoning
- Draft section (if auto-replied):
  - Draft text shown
  - Edit Draft button (opens editor)
  - Regenerate Draft button
  - Send Draft button (optional Gmail API)
- Escalation section (if escalated):
  - Priority badge
  - Status: Pending / Resolved
  - Resolution note input
  - Resolve Escalation button
- AMD ROCm context (if embedding exists):
  - "Powered by AMD ROCm" badge
  - Similar past interactions shown

### Dashboard

- Stats bar — 4 cards:
  - Emails Processed Today
  - Auto-reply Rate (%)
  - Escalations Pending
  - Estimated Time Saved (hours)
- Triage Activity chart — daily volume over 7 days (recharts)
- Classification Distribution chart — breakdown by type (recharts)
- Recent Activity feed — last 5-10 decisions

---

## Data Architecture

### Main Data Flows

**Email → Decision → Action**

- Email stored in `emails` table
- Decision stored in `triageDecisions` table (classification, confidence, reasoning, action)
- Auto-reply: draft stored in `triageDecisions.draft_text`
- Escalation: record in `escalations` table with priority and status

### Customer Embeddings (AMD ROCm)

- Generated via AMD Developer Cloud with ROCm on AMD Instinct GPU
- Stored in `customerEmbeddings` table
- Used for similarity search in future interactions
- Updated every 30 days or on new customer interaction

### User Settings

- `users.reply_tone` — tone preference for auto-replies
- `users.escalation_rules` — JSON array of rule objects
- `users.plan` — free/pro (future, for hackathon all free)

---

## Features In Scope

### Core Features (Required)

- Google OAuth via Convex Auth
- Landing page with hero, features, tech trust
- Dashboard with stats, charts, activity feed
- Settings page: inbox connection, escalation rules, reply tone
- Triage feed with real-time decisions (Convex reactive queries)
- Email ingestion (mock inbox or Gmail API)
- Fireworks AI classification + drafting
- AMD ROCm embedding generation (named step)
- Decision details page with edit/resolution
- PostHog analytics throughout

### Stretch Features (Nice to Have)

- Real Gmail API integration (push notifications)
- Auto-send replies via Gmail API
- PDF weekly report export
- Email reply history threading

### Out of Scope

- Team accounts / multi-user
- Billing / subscription
- Multi-inbox support
- Multi-language support
- Mobile app
- Third-party integrations (Slack, Discord, etc.)
- Advanced analytics beyond dashboard

---

## PostHog Events

```typescript
login                // { userId }
inbox_connected      // { userId, provider }
email_ingested       // { userId, from, subject }
email_classified     // { userId, classification, confidence }
email_auto_replied   // { userId, emailId, draftLength }
email_escalated      // { userId, emailId, priority, reason }
triage_resolved      // { userId, decisionId }
embedding_generated  // { userId, emailId, hardware: "AMD Instinct GPU with ROCm" }
dashboard_viewed     // { userId }
```

---

## Target User

A small business owner or operator who:

- Has a shared support inbox (team@, help@, support@)
- Gets 10-100 customer emails per day
- Has no dedicated support staff
- Wants to save time on routine replies
- Needs to catch urgent issues quickly
- Is comfortable with a modern web application

---

## Success Criteria

- User can sign up, connect inbox, and start processing emails in under 5 minutes
- Routine questions (order status, hours, shipping) auto-reply correctly 90%+ of the time
- Urgent issues (refunds, complaints) escalate with clear reasoning
- AMD ROCm embedding step is explicitly named and demonstrable
- Fireworks AI classification is accurate and fast
- Triage feed updates in real-time (Convex reactivity)
- Dashboard stats and charts show meaningful data
- All PostHog events fire correctly

---

## Hackathon Submission Requirements

### AMD ROCm Usage (Explicit)

The AMD ROCm step must be:
1. **Named explicitly** — `generateEmbedding()` function with AMD Cloud API call
2. **Demonstrated in video** — show the embedding generation step in action
3. **Documented in README** — explain AMD ROCm usage and benefits
4. **Separate from Fireworks AI** — not just "Fireworks uses AMD" (Fireworks may, but hackathon wants explicit usage)

### Fireworks AI Usage

- Classification of emails (LLM inference)
- Drafting replies (LLM generation)
- Models: `llama-v3-70b-instruct` (primary) with fallback to `llama-v3-8b-instruct`

### Dockerization

- Project Dockerized for submission
- Convex, Fireworks AI, and AMD Developer Cloud are external services
- Connected via SDK/API, not self-hosted in container

### Submission Checklist

- [ ] Project Dockerized
- [ ] Public GitHub repo + README
- [ ] AMD/ROCm usage named explicitly in README and demo video
- [ ] MIT-compliant, original work
- [ ] Registered before July 2 for day-one Fireworks credits
- [ ] Fireworks AI API integrated
- [ ] Convex real-time working
- [ ] AMD Developer Cloud endpoint integrated

---

## AMD ROCm Explanation (For README)

**Why AMD ROCm?**

TriageAI uses AMD ROCm on AMD Instinct GPUs for customer embedding generation:

1. **Email arrives** → sender email extracted
2. **Check embedding cache** → if missing or stale (30+ days)
3. **Call AMD Developer Cloud** → ROCm on AMD Instinct generates embedding
4. **Store embedding** → saved in Convex for future use
5. **Similarity search** → find past interactions with this customer
6. **Context injection** → past interactions added to Fireworks AI prompt

**Why this matters:**
- Embeddings enable context-aware replies — the AI knows the customer's history
- ROCm on AMD Instinct is faster than CPU embeddings (fits within 10s timeout)
- Explicit AMD usage demonstrates AMD's value in AI workloads
- Cost-effective for SMBs (AMD Developer Cloud credits available)

**Separation from Fireworks AI:**
- Fireworks AI = LLM inference (classification + drafting)
- AMD ROCm = embedding generation (customer retrieval)
- Two separate steps, two separate APIs, two separate purposes
# TriageAI

**AI-Powered Customer Support Assistant**

Built for the [AMD Developer Hackathon](https://notebooks.amd.com/hackathon) — *ACT II: Unicorn Track*.

TriageAI connects to your support inbox, automatically classifies every incoming email, drafts replies using AI, and escalates complex issues to your human team. Built with **Next.js 16**, **Convex**, **Fireworks AI**, and **AMD ROCm** for GPU-accelerated embeddings.

---

## Demo

[![TriageAI Demo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://youtu.be/VIDEO_ID)

> Replace `VIDEO_ID` with your demo video link before submission.

---

## Features

- **Automated triage** — Every email is classified (routine, technical, urgent, sales, other) with confidence scoring
- **Auto-reply drafting** — AI drafts replies using your business context and tone preferences, then sends them automatically
- **Smart escalation** — Keyword and confidence-based rules trigger human review when needed
- **AMD ROCm embeddings** — GPU-accelerated semantic search across customer history for context-aware replies
- **Gemma 4 via Fireworks AI** — Latest Google open model for high-quality classification and drafting
- **Real-time dashboard** — Live stats, activity feed, and analytics powered by Convex reactive queries
- **Customizable rules** — Define escalation conditions, set reply tone, add business context
- **Mock inbox** — Test with preset demo emails without a real email connection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components) |
| Backend + DB | [Convex](https://convex.dev) (reactive, realtime queries) |
| LLM Inference | [Fireworks AI](https://fireworks.ai) — **Gemma 4 31B** (dedicated) or Llama 3.3 70B (serverless) |
| Embeddings | **AMD ROCm** — `intfloat/e5-large-v2` on AMD Instinct GPU |
| Auth | [Convex Auth](https://labs.convex.dev/auth) (Google OAuth) |
| Agent Orchestration | [LangChain StateGraph](https://langchain-ai.github.io/langgraph/) |
| UI | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) + [Aceternity UI](https://ui.aceternity.com) (3D cards) |
| Analytics | [PostHog](https://posthog.com) (self-hosted proxy) |

---

## Quick Start (Testable in 5 Minutes)

### Prerequisites

- Node.js 20+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- A [Fireworks AI](https://fireworks.ai) API key

### 1. Install & Run

```bash
git clone <your-repo>
cd triage-ai
cp .env.example .env.local
pnpm install
pnpm dev
```

### 2. Set up Convex

```bash
npx convex dev
```

Follow the CLI prompts to create a deployment. It will automatically set `NEXT_PUBLIC_CONVEX_URL` in your `.env.local`.

### 3. Configure Environment

Fill in `.env.local`:

```env
# Required — get from https://fireworks.ai/api-keys
FIREWORKS_API_KEY=fw_xxxxxxxxxx

# Convex (auto-set by npx convex dev)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Google OAuth for login — get from Google Cloud Console
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

### 4. Open the App

Go to `http://localhost:3000`, sign in with Google, and you're in.

> **Note:** Without `AMD_CLOUD_ENDPOINT` set, embeddings fall back to Gemini API (requires `GOOGLE_API_KEY`). Everything else works out of the box with the serverless Llama model default.

---

## Docker

```bash
# Build
docker compose build

# Run (pass your env vars)
docker compose run -e FIREWORKS_API_KEY=fw_xxx ... triageai

# Or with .env file
docker compose up
```

The Docker image uses multi-stage build with Next.js standalone output for minimal size (~200 MB).

---

## AMD ROCm Embeddings

This is the explicit AMD hardware showcase. The embedding generation step in `convex/agent/triageWorkflow.ts:114` calls `generateEmbedding()` which runs on AMD Instinct GPUs.

### Architecture

```
AMD AI Notebook (ROCm GPU)
└─ sentence-transformers (e5-large-v2)
   └─ HTTP server → cloudflared tunnel
                        ↓
                Next.js App (Convex action)
                  ↓ if tunnel down
                Gemini API (fallback)
```

### Setup

1. Open [AMD AI Notebooks](https://notebooks.amd.com/hackathon)
2. In a terminal, install dependencies and run the embedding server:

```bash
pip install sentence-transformers flask numpy
# Then run the provided server script
python scripts/amd-embedding-server.py
```

3. The script prints a tunnel URL and API key. Set them in your Convex environment:

```bash
npx convex env set AMD_CLOUD_ENDPOINT https://xxx.trycloudflare.com/embed
npx convex env set AMD_CLOUD_API_KEY xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

4. Verify in PostHog — the `embedding_generated` event fires with `hardware: "AMD Instinct GPU with ROCm"`.

---

## Gemma 4 Deployment

By default, the app uses `llama-v3p3-70b-instruct` (serverless, always available). To use **Gemma 4 31B**:

### 1. Create a Dedicated Deployment on Fireworks

- Go to [Fireworks Deployments](https://app.fireworks.ai/deployments)
- Create a deployment: **Google → Gemma 4 31B IT**
- Shape: **Minimal** (NVIDIA H200, 4 GPUs, $28/h)
- Auto-scaling: min 0 / max 1 (costs $0 when idle)
- Once deployed, get the deployment model ID (typically `accounts/fireworks/models/gemma-4-31b-it`)

### 2. Configure

```bash
npx convex env set FIREWORKS_MODEL accounts/fireworks/models/gemma-4-31b-it
npx convex env set LLM_PROVIDER gemma
```

> **Cost:** With min replicas=0, it scales to zero when idle. Your $49.99 credits cover hours of testing.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | — | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Yes | — | Convex deployment name |
| `FIREWORKS_API_KEY` | Yes | — | Fireworks AI API key |
| `LLM_PROVIDER` | No | `gemma` | `gemma`, `fireworks`, or `gemini` |
| `FIREWORKS_MODEL` | No | `llama-v3p3-70b-instruct` | Fireworks model ID |
| `GOOGLE_CLIENT_ID` | For auth | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For auth | — | Google OAuth client secret |
| `GOOGLE_API_KEY` | For Gemini fallback | — | Google AI API key |
| `AMD_CLOUD_ENDPOINT` | For AMD | — | AMD embedding server URL |
| `AMD_CLOUD_API_KEY` | For AMD | — | AMD embedding server API key |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | — | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | — | PostHog host URL |

---

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, onboarding
│   └── dashboard/          # Dashboard, triage feed, settings
├── components/
│   ├── ui/                 # shadcn/ui + Aceternity primitives
│   ├── dashboard/          # Stats, charts, activity feed
│   ├── triage/             # Decision cards, filters, stats bar
│   └── settings/           # Inbox, rules, tone, business context
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── agent/              # LangChain StateGraph triage workflow
│   │   ├── triageWorkflow.ts  # Orchestration (AMD step visible here)
│   │   ├── classifyEmail.ts   # Fireworks AI classification
│   │   ├── draftReply.ts      # Fireworks AI drafting
│   │   └── lib.ts             # LLM abstraction (gemma/fireworks/gemini)
│   ├── triage.ts           # Decision queries
│   ├── dashboard.ts        # Dashboard aggregation queries
│   └── userProfiles.ts     # Business context, rules, tone
├── lib/
│   ├── amd-cloud.ts        # AMD ROCm embedding client
│   ├── llm.ts              # Website summarizer LLM client
│   └── fireworks.ts        # LangChain Fireworks integration
├── scripts/
│   └── amd-embedding-server.py  # Run on AMD AI Notebooks
└── types/                  # Global TypeScript types
```

---

## Architecture

```
Email arrives
    │
    ▼
Convex HTTP endpoint /ingest-email
    │
    ▼
LangChain StateGraph (Convex action)
    │
    ├── 1. AMD ROCm embedding → vector search (similar past emails)
    ├── 2. Classify email (Gemma 4 / Fireworks AI)
    ├── 3. Draft reply (Gemma 4 / Fireworks AI)
    └── 4. Escalate or auto-send
            │
            ▼
    ┌── auto_reply ──► Send via Gmail API (immediate)
    └── escalate ──► Mark pending, visible in triage feed
```

---

## Key Design Decisions

- **Convex-first**: All backend logic in `convex/` — queries, mutations, agent workflows. Realtime via `useQuery()` subscriptions, zero WebSocket code.
- **Provider-agnostic LLM**: `callLLM()` abstraction routes to Gemma 4 (Fireworks dedicated), Llama (Fireworks serverless), or Gemini based on a single env var.
- **AMD ROCm as a named step**: The `generateEmbedding()` call is explicitly visible in `triageWorkflow.ts` — not buried in a generic wrapper. PostHog captures `hardware: "AMD Instinct GPU with ROCm"` on every embedding.
- **Graceful fallback**: If AMD endpoint is down → Gemini embeddings. If Fireworks deployment is down → Llama serverless. Never crashes.
- **3D card design system**: All card-like sections use Aceternity's `3d-card` component for consistent depth and hover effects.

---

## Submission Checklist

- [x] Fireworks AI API integrated
- [x] Convex realtime working
- [x] AMD ROCm code path (named step + fallback)
- [x] AMD Developer Cloud notebook script
- [x] PostHog analytics events firing
- [x] Dashboard showing live data
- [x] Project Dockerized
- [x] MIT license

---

## License

MIT — original work for the AMD Developer Hackathon.

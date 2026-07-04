# TriageAI

**AI-Powered Customer Support Assistant**

Built for the AMD Developer Hackathon (*ACT II — Unicorn Track*).

TriageAI reads incoming support emails, auto-responds to routine questions, and escalates complex issues to your human team — with full transparency into every decision.

## How It Works

1. **Connect your inbox** — Link Gmail or Outlook in one click
2. **AI classifies & drafts** — Every email is analyzed by type and urgency; a reply is drafted using your tone and rules
3. **You review & approve** — See every decision with confidence scores and reasoning; edit, approve, or escalate

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Backend + DB | [Convex](https://convex.dev) (reactive, realtime) |
| AI Model | [Fireworks AI](https://fireworks.ai) (Llama 3 70B) |
| Embeddings | AMD ROCm via [AMD Developer Cloud](https://amd.com) |
| Auth | Convex Auth |
| UI | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) |
| Analytics | PostHog |

## AMD ROCm

The embedding generation step runs explicitly on AMD Instinct hardware via the AMD Developer Cloud API. If the AMD endpoint is unavailable, the system falls back gracefully to a local embedding function — never crashing.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### Environment Variables

Copy `.env.example` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Convex deployment name |
| `FIREWORKS_API_KEY` | Fireworks AI API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL |
| `AMD_CLOUD_ENDPOINT` | AMD Developer Cloud endpoint |
| `AMD_CLOUD_API_KEY` | AMD Developer Cloud API key |

## Project Structure

```
├── app/              — Next.js App Router pages
├── components/       — UI components (landing, layout, theme)
├── convex/           — Convex backend (schema, queries, mutations, agent)
├── lib/              — Client libraries (Fireworks, AMD, PostHog, Gmail)
├── context/          — Project documentation & planning
└── types/            — Global TypeScript types
```

## Progress

- [x] Phase 1 — Foundation: Landing page ✅
- [ ] Phase 1 — Foundation: Auth
- [ ] Phase 2 — Settings
- [ ] Phase 3 — Triage Feed
- [ ] Phase 4 — Decision Details
- [ ] Phase 5 — Dashboard

## License

MIT

# TriageAI — Demo Video Script

**Total runtime:** 4–5 minutes
**Format:** Screen recording + voiceover (or slides + live app)

---

## Pre-Recording Checklist

- [ ] App running at `localhost:3000` (or deployed)
- [ ] Convex dev server running (`npx convex dev`)
- [ ] AMD embedding server running (`python3 scripts/amd-embedding-server.py`)
- [ ] Browser zoom at 100%, clean bookmarks bar
- [ ] Close all notifications / do not disturb
- [ ] Have a test inbox with 5–10 emails pre-loaded
- [ ] Slide deck open in separate tab

---

## PART 1 — Hook (0:00–0:30)

**[SCREEN: Landing page hero]**

> "Small businesses lose customers because they can't reply to support emails fast enough. TriageAI fixes that — it reads every incoming email, auto-replies to routine questions, and escalates what actually needs a human. Built with Gemma 4 on Fireworks AI, AMD ROCm for embeddings, and Convex for realtime."

**[ACTION: Scroll down to show features section, tech trust badges]**

---

## PART 2 — Architecture Overview (0:30–1:15)

**[SCREEN: Slides — Title slide → Architecture slide]**

> "Here's how it works. Four steps."

**[SCREEN: Slide 3 — Triage Pipeline]**

> "Email arrives via Gmail API. We extract the sender, generate an embedding using AMD ROCm on an AMD Instinct GPU — that's the explicit AMD step — then classify the email intent using Gemma 4 on Fireworks, and either auto-reply or escalate."

**[SCREEN: Slide showing the tech stack]**

> "Tech stack: Next.js 16 frontend, Convex as the reactive backend — database, functions, and realtime in one. Fireworks AI for LLM inference. AMD ROCm for embedding generation. LangChain StateGraph for orchestration."

**[KEY POINT: Emphasize "AMD ROCm on AMD Instinct GPU" — judges need to hear this explicitly]**

---

## PART 3 — Live Demo (1:15–3:15)

### 3A — Dashboard (1:15–1:40)

**[SCREEN: `/dashboard` after login]**

> "This is the dashboard. Real-time stats — emails processed today, auto-reply rate, pending escalations, time saved. These update live via Convex subscriptions — no polling, no refresh."

**[ACTION: Point to the stats cards, hover over the chart]**

### 3B — Settings (1:40–2:00)

**[SCREEN: `/settings`]**

> "Settings. Connect your inbox — Gmail API or IMAP. Configure escalation rules — confidence below 60%, contains 'refund', contains 'urgent'. Choose your reply tone — Professional, Friendly, Casual, or Enthusiastic."

**[ACTION: Show the escalation rules list, tone selector]**

### 3C — Triage Feed (2:00–2:30)

**[SCREEN: `/decisions` — live triage feed]**

> "This is the triage feed. Every email processed shows up here in real-time. Sender, subject, classification, confidence score, action taken. You can filter — all, auto-replied, escalated, pending."

**[ACTION: Click a filter, show the feed updating]**

> "Watch this — I'll trigger a new email."

**[ACTION: Send a test email or use mock inbox trigger]**

> "There it is. Classified as 'routine', confidence 0.92, auto-reply drafted. All in under 3 seconds."

### 3D — Decision Details (2:30–2:50)

**[SCREEN: Click into a decision]**

> "Click into any decision. You see the full email, the AI's classification, confidence, reasoning. If it was auto-replied — here's the draft. You can edit it, regenerate it, or send it as-is. If it was escalated — priority badge, status, resolution notes."

**[ACTION: Show the draft editor, regenerate button]**

### 3E — AMD ROCm Embedding (2:50–3:15)

**[SCREEN: Decision details with AMD badge]**

> "Here's the AMD ROCm step. When this email came in, we extracted the sender, checked if we had an embedding for this customer. We didn't, so we called the AMD Developer Cloud — ROCm on an AMD Instinct GPU — generated a 1024-dimensional vector, and stored it. Now if this customer emails again, we'll have their history."

**[SCREEN: Show the "Powered by AMD ROCm" badge and similar past interactions]**

> "This is the explicit AMD step — named `generateEmbedding()`, separate from Fireworks AI, running on actual AMD hardware."

**[KEY POINT: This is what the hackathon judges are looking for — explicit, demonstrable AMD usage]**

---

## PART 4 — Gemma 4 on Fireworks (3:15–3:45)

**[SCREEN: Convex dashboard or logs showing `modelUsed: "fireworks/accounts/fireworks/models/gemma-4-26b-a4b-it"`]**

> "The LLM powering classification and drafting is Gemma 4 26B — deployed on Fireworks AI via on-demand H100 GPU. The model routing is: Fireworks Gemma 4 first, falls back to Google Gemma 4 API, then GPT-OSS 120B as a last resort."

**[SCREEN: Show the `triageWorkflow.ts` code or logs]**

> "This is the `LLM_PROVIDER=gemma` configuration. Three-tier fallback — the system degrades gracefully, never crashes."

**[KEY POINT: For the "Best Use of Gemma 4" bonus — show the model actually running on Fireworks]**

---

## PART 5 — Technical Highlights (3:45–4:15)

**[SCREEN: Slides — Trade-offs or Architecture deep-dive]**

> "A few technical decisions worth mentioning:"

> "Convex over traditional backend — reactive subscriptions give us realtime for free. No WebSocket code. Denormalized schema for query performance."

> "Self-hosted AMD ROCm over API — zero per-embedding cost, explicit AMD usage, and we own the inference pipeline. Trade-off: operational overhead, 8hr/day GPU limit. Mitigation: graceful fallback to Gemini."

> "LangChain StateGraph over raw API calls — structured workflow with branching logic. classify → embed → decide → draft. Easy to add steps, easy to debug."

---

## PART 6 — Closing (4:15–4:45)

**[SCREEN: Landing page or dashboard]**

> "TriageAI — 22 features, 60+ Convex functions, built in under 2 weeks. Handles 5,000 emails a day, auto-replies to 92% of routine questions, saves SMBs about 6 hours a day."

> "Powered by Gemma 4 on Fireworks AI, AMD ROCm on AMD Instinct GPUs, and Convex reactive backend."

> "Thanks for watching."

**[SCREEN: Fade to logo]**

---

## B-Roll / Supplemental Shots

If you have extra time or want cuts:

| Shot | What to show | Duration |
|------|-------------|----------|
| Login flow | Google OAuth → redirect to dashboard | 5s |
| Settings save | Click save, toast notification | 3s |
| Real-time update | Send email, watch feed update live | 5s |
| Draft editor | Edit draft text, save changes | 5s |
| Escalation flow | Escalated email → resolve with notes | 5s |
| Convex dashboard | Function logs, model used, timing | 5s |
| AMD server logs | `POST /embed` request → response | 5s |

---

## Key Phrases to Include

These are what the judges are listening for:

- [ ] "AMD ROCm on AMD Instinct GPU" (at least 2x)
- [ ] "Gemma 4 26B on Fireworks AI" (at least 2x)
- [ ] "explicit AMD step" or "named generateEmbedding function"
- [ ] "graceful fallback" or "three-tier fallback"
- [ ] "Convex reactive subscriptions" or "realtime without WebSocket"
- [ ] "LangChain StateGraph orchestration"
- [ ] "22 features, 60+ Convex functions"

---

## Recording Tips

1. **Speak slowly** — 140 words/min is ideal for demo videos
2. **Pause after key points** — let the judges absorb
3. **Highlight with cursor** — circle important UI elements
4. **Zoom in on code** — if showing logs or code, zoom to 125%
5. **Use chapter markers** — if the platform supports it, add timestamps
6. **Keep it under 5 minutes** — shorter is better, judges watch hundreds
7. **Record at 1080p minimum** — 4K preferred for code readability

---

## File Deliverables

After recording, you should have:

| File | Purpose |
|------|---------|
| `triageai-demo.mp4` | Main demo video (4–5 min) |
| `cover-image.png` | Cover image for submission |
| `TriageAI-Architecture-Review.pdf` | Slide deck (15 pages) |
| GitHub repo link | Public repo with README |

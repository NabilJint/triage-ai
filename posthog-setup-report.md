<wizard-report>
# PostHog post-wizard report

The wizard completed a deep integration of PostHog analytics into TriageAI. `instrumentation-client.ts` is the single initialization point for PostHog (the recommended pattern for Next.js 15.3+), using a reverse proxy through `/ingest` to the EU cluster already configured in `next.config.ts`. User identification fires via `PostHogAuthWatcher` on every authenticated page load, ensuring both new and returning sessions link to the correct PostHog person. Three new events were added on top of the events already present in the codebase, bringing full coverage from landing page CTA through onboarding completion: `hero_cta_clicked` on the Hero section buttons, `pricing_cta_clicked` on the Pricing plan buttons, and `onboarding_started` when a user first lands on the onboarding page.

| Event | Description | File |
|---|---|---|
| `hero_cta_clicked` | User clicks "Get Started Free" or "View Live Demo" in the hero section | `components/landing/Hero.tsx` |
| `pricing_cta_clicked` | User clicks a pricing plan CTA button | `components/landing/Pricing.tsx` |
| `onboarding_started` | User lands on the onboarding page and begins the setup flow | `app/(auth)/onboarding/page.tsx` |
| `login` | User initiates Google OAuth sign-in | `app/(auth)/login/page.tsx` |
| `login_error` | Google sign-in fails with an error | `app/(auth)/login/page.tsx` |
| `signup_cta_clicked` | User clicks Get Started or Sign In in the navbar | `components/layout/Navbar.tsx` |
| `inbox_connected` | User connects Gmail inbox during onboarding | `components/onboarding/StepConnectInbox.tsx` |
| `onboarding_step_completed` | User advances from one onboarding step to the next | `app/(auth)/onboarding/page.tsx` |
| `onboarding_completed` | User completes all onboarding steps | `app/(auth)/onboarding/page.tsx` |
| `contact_clicked` | User clicks email, live chat, or GitHub in the contact section | `components/landing/ContactSection.tsx` |
| `dashboard_viewed` | Authenticated user views the dashboard | `app/dashboard/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/216514/dashboard/795529)
- [Acquisition → Activation Funnel (wizard)](https://eu.posthog.com/project/216514/insights/nont2mbR)
- [Signup CTA Clicks (wizard)](https://eu.posthog.com/project/216514/insights/9ok8B0j8)
- [Pricing CTA Clicks by Plan (wizard)](https://eu.posthog.com/project/216514/insights/EhH1bQeL)
- [Login vs Login Error Trend (wizard)](https://eu.posthog.com/project/216514/insights/ApRFxXXR)
- [Onboarding Completion Rate (wizard)](https://eu.posthog.com/project/216514/insights/e5XrvX25)

## Verify before merging

- [ ] Run a full production build (`pnpm build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any deployment environment so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — `PostHogAuthWatcher` handles this, but verify it works end-to-end after the Convex auth flow completes.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

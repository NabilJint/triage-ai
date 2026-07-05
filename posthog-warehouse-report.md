# PostHog Data Warehouse Setup Report

**Date:** 2026-07-05  
**Project:** Default project (ID: 216514)

---

## Summary

One data source was detected: **Convex**. Setup could not be completed automatically because the Convex data warehouse integration requires the **Convex Professional plan** (for streaming export access), which the user confirmed is not currently active.

---

## Sources

### Convex — Skipped (Professional Plan Required)

- **Kind:** Convex
- **Mode:** in-cli
- **Status:** Skipped — Convex Professional plan not available
- **Reason:** The PostHog ↔ Convex data warehouse integration uses Convex's streaming export API, which is only available on the Professional plan or higher.

---

## Files Modified or Created

- `posthog-warehouse-report.md` — this report (created)

No application source files were modified.

---

## Manual Steps

When you are ready to connect Convex to the PostHog data warehouse:

1. **Upgrade to Convex Professional** at [https://www.convex.dev/plans](https://www.convex.dev/plans)

2. **Open the PostHog setup URL:**  
   [https://eu.posthog.com/project/216514/data-warehouse/new-source?kind=Convex](https://eu.posthog.com/project/216514/data-warehouse/new-source?kind=Convex)

3. **Provide your Convex credentials** (found in your Convex Dashboard under **Settings → URL & Deploy Key**):
   - **Deployment URL** — e.g. `https://your-deployment-123.convex.cloud`
   - **Deploy Key** — e.g. `prod:...`

4. **Select which tables to sync** and configure incremental or full-refresh sync as needed.

Once connected, your Convex tables will be queryable alongside PostHog analytics events in the Data Warehouse section.

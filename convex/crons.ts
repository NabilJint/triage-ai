import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "auto-retry-failed-emails",
  { minutes: 5 },
  internal.agent.autoRetry.autoRetryFailedEmails,
);

crons.interval(
  "check-non-gmail-inboxes",
  { minutes: 5 },
  internal.agent.checkInboxes.checkNonGmailInboxes,
);

crons.interval(
  "renew-gmail-watches",
  { hours: 1 },
  internal.gmailAccounts.renewExpiringWatches,
);

export default crons;

import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const created = new Date(dateStr);
  const diffMin = Math.floor((now.getTime() - created.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
}

export const getDashboardStats = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        emailsToday: 0,
        autoReplyRate: 0,
        escalationsPending: 0,
        timeSaved: 0,
        amdLastRun: null,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emailsToday = await ctx.db
      .query("emails")
      .withIndex("by_user_and_received", (q) =>
        q.eq("user_id", userId).gte("received_at", today.toISOString()),
      )
      .collect();

    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    const autoReplies = decisions.filter((d) => d.action === "auto_reply");

    const pendingEscalations = await ctx.db
      .query("escalations")
      .withIndex("by_user_and_status", (q) =>
        q.eq("user_id", userId).eq("status", "pending"),
      )
      .collect();

    const totalMinutes = autoReplies.length * 2;
    const timeSaved = autoReplies.length > 0
      ? Math.max(0.1, Math.round((totalMinutes / 60) * 10) / 10)
      : 0;

    const latestEmbedding = await ctx.db
      .query("customerEmbeddings")
      .order("desc")
      .first();
    const amdLastRun = latestEmbedding?.updated_at ?? null;

    return {
      emailsToday: emailsToday.length,
      autoReplyRate:
        decisions.length > 0
          ? Math.round((autoReplies.length / decisions.length) * 100)
          : 0,
      escalationsPending: pendingEscalations.length,
      timeSaved,
      amdLastRun,
    };
  },
});

export const getRecentActivity = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .order("desc")
      .take(5);

    const enriched = await Promise.all(
      decisions.map(async (d) => {
        const email = await ctx.db.get(d.email_id);

        const sender = email?.from_name ?? email?.from_email ?? "Unknown";
        const timeAgo = formatTimeAgo(d.created_at);
        const cls =
          d.classification.charAt(0).toUpperCase() + d.classification.slice(1);

        let description: string;
        if (d.action === "auto_reply") {
          description = `${cls} — ${email?.subject ?? "No subject"}`;
        } else {
          const escalation = await ctx.db
            .query("escalations")
            .withIndex("by_decision", (q) => q.eq("decision_id", d._id))
            .first();
          const priority = escalation?.priority ?? "medium";
          description = `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority — ${email?.subject ?? "No subject"}`;
        }

        return {
          id: d._id,
          type: d.action as "auto_reply" | "escalate",
          sender,
          description,
          timeAgo,
        };
      }),
    );

    return enriched;
  },
});

export const getChartData = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { dailyActivity: [], classification: [] };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const decisions = await ctx.db
      .query("triageDecisions")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    const recentDecisions = decisions.filter(
      (d) => new Date(d.created_at) >= sevenDaysAgo,
    );

    const dailyMap: Record<string, number> = {};
    const classMap: Record<string, number> = {};

    for (const d of recentDecisions) {
      const day = d.created_at.split("T")[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
      classMap[d.classification] = (classMap[d.classification] || 0) + 1;
    }

    const dailyActivity = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const classification = Object.entries(classMap).map(([name, value]) => ({
      name,
      value,
    }));

    return { dailyActivity, classification };
  },
});

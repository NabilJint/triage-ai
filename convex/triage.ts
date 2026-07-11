import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { cosineSimilarity } from "../lib/similarity";

const PRIORITY_RANK: Record<string, number> = {
	urgent: 0,
	high: 1,
	medium: 2,
	low: 3,
};

function formatTimeAgo(dateStr: string): string {
	const now = new Date();
	const created = new Date(dateStr);
	const diffMin = Math.floor((now.getTime() - created.getTime()) / 60000);
	if (diffMin < 1) return "just now";
	if (diffMin < 60) return `${diffMin} min ago`;
	if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
	return `${Math.floor(diffMin / 1440)}d ago`;
}

export const getTriageFeed = query({
	args: {
		filter: v.optional(v.string()),
		sortBy: v.optional(v.string()),
		search: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		if (args.filter === "failed") {
			const failedEmails = await ctx.db
				.query("emails")
				.withIndex("by_user_and_received", (q) => q.eq("user_id", userId))
				.filter((q) => q.eq(q.field("status"), "error"))
				.order("desc")
				.collect();

			const connectionIds = [
				...new Set(failedEmails.map((e) => e.inbox_connection_id)),
			];
			const connections = await Promise.all(
				connectionIds.map((id) => ctx.db.get(id)),
			);
			const connectionMap = new Map(
				connections.filter(Boolean).map((c) => [c!._id, c!]),
			);

			let enriched = failedEmails.map((e) => ({
				_id: e._id,
				id: e._id,
				fromName: e.from_name ?? e.from_email,
				fromEmail: e.from_email,
				subject: e.subject,
				classification: "failed" as const,
				confidence: 0,
				action: "failed" as const,
				reasoning: "Triage failed",
				timeAgo: formatTimeAgo(e.received_at),
				createdAt: e.received_at,
				priority: null,
				escalationStatus: null,
				isTest: connectionMap.get(e.inbox_connection_id)?.provider === "mock",
				emailStatus: e.status,
			}));

			if (args.search?.trim()) {
				const q = args.search.toLowerCase();
				enriched = enriched.filter(
					(d) =>
						d.subject.toLowerCase().includes(q) ||
						d.fromName.toLowerCase().includes(q) ||
						d.fromEmail.toLowerCase().includes(q),
				);
			}

			if (args.sortBy === "oldest") {
				enriched.reverse();
			}

			return enriched;
		}

		let decisions = await ctx.db
			.query("triageDecisions")
			.withIndex("by_user", (q) => q.eq("user_id", userId))
			.order("desc")
			.collect();

		if (args.filter === "auto_reply") {
			decisions = decisions.filter((d) => d.action === "auto_reply");
		} else if (args.filter === "escalate" || args.filter === "pending") {
			decisions = decisions.filter((d) => d.action === "escalate");
		}

		const escalatedIds = decisions
			.filter((d) => d.action === "escalate")
			.map((d) => d._id);

		const escalations = await Promise.all(
			escalatedIds.map((id) =>
				ctx.db
					.query("escalations")
					.withIndex("by_decision", (q) => q.eq("decision_id", id))
					.first(),
			),
		);
		const escalationMap = new Map(
			escalations.filter(Boolean).map((e) => [e!.decision_id, e!]),
		);

		if (args.filter === "pending") {
			decisions = decisions.filter((d) => {
				const esc = escalationMap.get(d._id);
				return esc && esc.status === "pending";
			});
		}

		const emails = await Promise.all(
			decisions.map((d) => ctx.db.get(d.email_id)),
		);
		const emailMap = new Map(emails.filter(Boolean).map((e) => [e!._id, e!]));

		const connectionIds = [
			...new Set(emails.filter(Boolean).map((e) => e!.inbox_connection_id)),
		];
		const connections = await Promise.all(
			connectionIds.map((id) => ctx.db.get(id)),
		);
		const connectionMap = new Map(
			connections.filter(Boolean).map((c) => [c!._id, c!]),
		);

		let enriched = decisions.map((d) => {
			const email = emailMap.get(d.email_id);
			const esc = escalationMap.get(d._id);
			const conn = email ? connectionMap.get(email.inbox_connection_id) : null;
			const fromName = email?.from_name ?? email?.from_email ?? "";
			const fromEmail = email?.from_email ?? "";
			const subject = email?.subject ?? "";

			return {
				_id: d._id,
				id: d._id,
				fromName,
				fromEmail,
				subject,
				classification: d.classification,
				confidence: d.confidence,
				action: d.action,
				reasoning: d.reasoning,
				timeAgo: formatTimeAgo(d.created_at),
				createdAt: d.created_at,
				priority: esc?.priority ?? null,
				escalationStatus: esc?.status ?? null,
				isTest: conn?.provider === "mock",
				emailStatus: null,
			};
		});

		if (args.search?.trim()) {
			const q = args.search.toLowerCase();
			enriched = enriched.filter(
				(d) =>
					d.subject.toLowerCase().includes(q) ||
					d.fromName.toLowerCase().includes(q) ||
					d.fromEmail.toLowerCase().includes(q),
			);
		}

		if (args.sortBy === "oldest") {
			enriched.reverse();
		} else if (args.sortBy === "priority") {
			enriched.sort((a, b) => {
				const pa = a.priority ? (PRIORITY_RANK[a.priority] ?? 99) : 99;
				const pb = b.priority ? (PRIORITY_RANK[b.priority] ?? 99) : 99;
				return pa - pb;
			});
		}

		return enriched;
	},
});

export const getDecisionById = query({
	args: { decisionId: v.id("triageDecisions") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const decision = await ctx.db.get(args.decisionId);
		if (!decision || decision.user_id !== userId) return null;

		const email = await ctx.db.get(decision.email_id);

		const escalation = await ctx.db
			.query("escalations")
			.withIndex("by_decision", (q) => q.eq("decision_id", decision._id))
			.first();

		let embedding = null;
		if (email) {
			embedding = await ctx.db
				.query("customerEmbeddings")
				.withIndex("by_email", (q) =>
					q.eq("email_address", email.from_email),
				)
				.first();
		}

		return {
			id: decision._id,
			userId: decision.user_id,
			classification: decision.classification,
			confidence: decision.confidence,
			action: decision.action,
			draftText: decision.draft_text ?? null,
			reasoning: decision.reasoning,
			modelUsed: decision.model_used,
			createdAt: decision.created_at,
			processedAt: decision.processed_at ?? null,
			email: email
				? {
						id: email._id,
						fromName: email.from_name ?? email.from_email,
						fromEmail: email.from_email,
						subject: email.subject,
						body: email.body,
						bodyHtml: email.body_html ?? null,
						receivedAt: email.received_at,
						status: email.status,
					}
				: null,
			escalation: escalation
				? {
						id: escalation._id,
						priority: escalation.priority,
						status: escalation.status,
						resolvedBy: escalation.resolved_by ?? null,
						resolvedAt: escalation.resolved_at ?? null,
						resolutionNote: escalation.resolution_note ?? null,
						createdAt: escalation.created_at,
					}
				: null,
			embedding: embedding
				? {
						updatedAt: embedding.updated_at,
						usedInQuery: embedding.used_in_query,
					}
				: null,
		};
	},
});

export const getTriageStats = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { emailsToday: 0, autoReplied: 0, escalationsPending: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const [emailsToday, decisions, pendingEscalations] = await Promise.all([
      ctx.db
        .query("emails")
        .withIndex("by_user_and_received", (q) =>
          q.eq("user_id", userId).gte("received_at", todayIso),
        )
        .collect(),
      ctx.db
        .query("triageDecisions")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .collect(),
      ctx.db
        .query("escalations")
        .withIndex("by_user_and_status", (q) =>
          q.eq("user_id", userId).eq("status", "pending"),
        )
        .collect(),
    ]);

    const autoReplied = decisions.filter((d) => d.action === "auto_reply").length;

    return {
      emailsToday: emailsToday.length,
      autoReplied,
      escalationsPending: pendingEscalations.length,
    };
  },
});

export const getSimilarInteractions = query({
	args: { decisionId: v.id("triageDecisions") },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const decision = await ctx.db.get(args.decisionId);
		if (!decision || decision.user_id !== userId) return [];

		const email = await ctx.db.get(decision.email_id);
		if (!email) return [];

		const embedding = await ctx.db
			.query("customerEmbeddings")
			.withIndex("by_email_id", (q) => q.eq("email_id", email._id))
			.first();

		if (!embedding) return [];

		const allEmbeddings = await ctx.db
			.query("customerEmbeddings")
			.collect();

		const scored: {
			subject: string;
			summary: string;
			timeAgo: string;
			score: number;
		}[] = [];

		for (const emb of allEmbeddings) {
			if (!emb.email_id || emb.email_id === email._id) continue;

			const otherEmail = await ctx.db.get(emb.email_id);
			const emailDoc = otherEmail as any;

			if (!emailDoc || emailDoc.user_id !== userId) continue;

			const score = cosineSimilarity(embedding.embedding, emb.embedding);
			if (score > 0.3) {
				const diffMs = Date.now() - new Date(emb.updated_at).getTime();
				const diffDays = Math.floor(diffMs / 86400000);
				const timeAgo =
					diffDays === 0
						? "today"
						: diffDays === 1
							? "yesterday"
							: `${diffDays}d ago`;

				scored.push({
					subject: emailDoc.subject,
					summary: emailDoc.body.slice(0, 120),
					timeAgo,
					score,
				});
			}
		}

		scored.sort((a, b) => b.score - a.score);
		return scored.slice(0, 3);
	},
});

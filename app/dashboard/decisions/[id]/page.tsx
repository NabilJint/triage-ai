"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { DecisionHeader } from "@/components/decision-details/DecisionHeader";
import { EmailBodyCard } from "@/components/decision-details/EmailBodyCard";
import { DraftCard } from "@/components/decision-details/DraftCard";
import { AiDecisionCard } from "@/components/decision-details/AiDecisionCard";
import { EscalationCard } from "@/components/decision-details/EscalationCard";
import { AmdContextCard } from "@/components/decision-details/AmdContextCard";
import type { Classification } from "@/types";

function DecisionDetailSkeleton() {
	return (
		<main className="max-w-7xl mx-auto px-6 py-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					<div className="lg:col-span-7 flex flex-col gap-6">
						<Skeleton className="h-4 w-32" />
						<div className="glass-card p-6 flex flex-col gap-4">
							<Skeleton className="h-5 w-40" />
							<div className="flex justify-between">
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-4 w-24" />
							</div>
							<Skeleton className="h-4 w-64" />
							<div className="flex gap-3">
								<Skeleton className="h-5 w-16 rounded-full" />
								<Skeleton className="h-5 w-20 rounded-full" />
							</div>
						</div>
						<div className="glass-card p-6">
							<Skeleton className="h-32 w-full" />
						</div>
						<div className="glass-card p-6 border-l-4 border-primary">
							<Skeleton className="h-5 w-48 mb-4" />
							<Skeleton className="h-24 w-full mb-4" />
							<div className="flex justify-end gap-3">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-8 w-24" />
							</div>
						</div>
					</div>
					<div className="lg:col-span-5 flex flex-col gap-6">
						<div className="glass-card p-6 flex flex-col gap-4">
							<Skeleton className="h-5 w-36" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-16 w-full" />
						</div>
						<div className="glass-card p-6 flex flex-col gap-4">
							<Skeleton className="h-5 w-36" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					</div>
				</div>
			</main>
	);
}

function DecisionNotFound() {
	return (
		<main className="max-w-7xl mx-auto px-6 py-10">
				<div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
					<span className="material-symbols-outlined text-text-muted text-[48px]">
						inbox
					</span>
					<h2 className="text-lg font-semibold text-text-primary">
						Decision not found
					</h2>
					<p className="text-sm text-text-muted max-w-md">
						This decision may have been deleted or you may not have access to it.
					</p>
					<a
						href="/dashboard/decisions"
						className="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
					>
						Back to Triage Feed
					</a>
				</div>
			</main>
	);
}

export default function DecisionDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const { isLoading: authLoading } = useAuthGuard();
	const decisionId = id as Id<"triageDecisions">;

	const decision = useQuery(api.triage.getDecisionById, { decisionId });
	const similarInteractions = useQuery(
		api.triage.getSimilarInteractions,
		{ decisionId },
	);

	if (authLoading || decision === undefined) {
		return <DecisionDetailSkeleton />;
	}

	if (!decision) {
		return <DecisionNotFound />;
	}

	const receivedDate = decision.email
		? new Date(decision.email.receivedAt).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
			})
		: "Unknown";

	return (
		<main className="max-w-7xl mx-auto px-6 py-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					<div className="lg:col-span-7 flex flex-col gap-6">
						<DecisionHeader
							classification={decision.classification as Classification}
							confidence={decision.confidence}
							action={decision.action}
							fromName={decision.email?.fromName ?? "Unknown"}
							fromEmail={decision.email?.fromEmail ?? ""}
							subject={decision.email?.subject ?? "No subject"}
							receivedAt={receivedDate}
						/>

						{decision.email && (
							<EmailBodyCard body={decision.email.body} />
						)}

						<DraftCard
							decisionId={decision.id}
							draftText={decision.draftText ?? ""}
							action={decision.action as "auto_reply" | "escalate"}
							emailStatus={decision.email?.status}
						/>
					</div>

					<div className="lg:col-span-5 flex flex-col gap-6">
						<AiDecisionCard
							classification={decision.classification}
							confidence={decision.confidence}
							action={decision.action}
							reasoning={decision.reasoning}
							priority={decision.escalation?.priority}
						/>

						{decision.escalation && (
							<EscalationCard
								escalationId={decision.escalation.id}
								priority={decision.escalation.priority}
								status={decision.escalation.status}
								resolvedAt={decision.escalation.resolvedAt}
								resolutionNote={decision.escalation.resolutionNote}
							/>
						)}

						{decision.embedding && (
							<AmdContextCard
								updatedAt={decision.embedding.updatedAt}
								interactions={similarInteractions ?? []}
							/>
						)}
					</div>
				</div>
			</main>
	);
}

"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
	StatusBadge,
	PriorityBadge,
	ConfidenceBar,
} from "@/components/triage/StatusBadge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
import type { TriageDecisionDisplay } from "@/types";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

type DecisionCardProps = {
	decision: TriageDecisionDisplay;
	onClick: () => void;
};

export function DecisionCard({ decision, onClick }: DecisionCardProps) {
	const [isRetrying, setIsRetrying] = useState(false);
	const [retryError, setRetryError] = useState<string | null>(null);
	const retryTriage = useAction(api.agent.retryTriage.retryTriage);

	const isFailed = decision.action === "failed";

	const handleRetry = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsRetrying(true);
		setRetryError(null);

		try {
			await retryTriage({ emailId: decision.id as any });
			window.location.reload();
		} catch (err) {
			setRetryError(err instanceof Error ? err.message : "Retry failed");
		} finally {
			setIsRetrying(false);
		}
	};

	return (
		<CardContainer containerClassName="py-0 w-full" className="w-full">
			<CardBody className="w-full h-auto p-0 [transform-style:preserve-3d]">
				<CardItem
					translateZ={20}
					className="w-full bg-surface border border-border rounded-xl p-4 shadow-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
					onClick={onClick}
				>
					<CardItem translateZ={30} className="w-full">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2 mb-0.5">
									<span className="text-sm font-medium text-text-primary truncate">
										{decision.fromName}
									</span>
									<span className="text-xs text-text-muted shrink-0">
										{decision.fromEmail}
									</span>
								</div>
								<p className="text-sm text-text-primary truncate">
									{decision.subject}
								</p>
							</div>
						</div>
					</CardItem>

					<CardItem translateZ={25} className="w-full">
						<div className="flex items-center gap-3 mt-3 flex-wrap">
							{isFailed ? (
								<>
									<span className="rounded-full px-2.5 py-0.5 text-xs font-medium border-0 bg-error-light text-error">
										Failed
									</span>
									<span className="text-xs text-text-muted ml-auto shrink-0">
										{decision.timeAgo}
									</span>
									<Button
										variant="outline"
										size="sm"
										disabled={isRetrying}
										onClick={handleRetry}
										className="h-7 px-2 text-xs"
									>
										{isRetrying ? (
											<Loader2 className="size-3 animate-spin mr-1" />
										) : (
											<RotateCcw className="size-3 mr-1" />
										)}
										{isRetrying ? "Retrying..." : "Retry"}
									</Button>
									{retryError && (
										<span className="text-xs text-error">{retryError}</span>
									)}
								</>
							) : (
								<>
									<StatusBadge type="classification" value={decision.classification} />
									<ConfidenceBar score={decision.confidence} />
									<StatusBadge type="action" value={decision.action} />
									{decision.priority && <PriorityBadge value={decision.priority} />}
									{decision.isTest && (
										<span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-surface-tertiary text-text-muted">
											Test
										</span>
									)}
									<span className="text-xs text-text-muted ml-auto shrink-0">
										{decision.timeAgo}
									</span>
								</>
							)}
						</div>
					</CardItem>
				</CardItem>
			</CardBody>
		</CardContainer>
	);
}

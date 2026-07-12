"use client";

import {
	StatusBadge,
	ConfidenceBar,
} from "@/components/triage/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

type AiDecisionCardProps = {
	classification: string;
	confidence: number;
	action: string;
	reasoning: string;
	priority?: string | null;
};

export function AiDecisionCard({
	classification,
	confidence,
	action,
	reasoning,
}: AiDecisionCardProps) {
	return (
		<Card
			className={`border-l-4 ${
				action === "escalate" ? "border-error" : "border-primary"
			}`}
		>
			<CardContent className="p-6">
				<div className="flex justify-between items-center pb-3 border-b border-border">
					<div className="flex items-center gap-2">
						<span className="material-symbols-outlined text-text-primary text-[20px]">
							memory
						</span>
						<h2 className="text-lg font-semibold text-text-primary">
							AI Logic Summary
						</h2>
					</div>
					<StatusBadge type="action" value={action} />
				</div>

				<div className="flex flex-col gap-4">
					<div>
						<div className="flex justify-between items-center mb-1.5">
							<span className="text-xs font-medium text-text-muted uppercase tracking-wider">
								Classification
							</span>
							<span className="text-xs font-semibold text-primary">
								{classification.charAt(0).toUpperCase() + classification.slice(1)}{" "}
								({Math.round(confidence * 100)}% Confidence)
							</span>
						</div>
						<ConfidenceBar score={confidence} className="w-full" />
					</div>

					<div>
						<span className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1.5">
							Reasoning
						</span>
						<p className="text-sm text-text-primary bg-surface-secondary p-3 rounded-lg border border-border leading-relaxed">
							{reasoning}
						</p>
					</div>

					<div className="flex items-center gap-2 bg-surface-secondary p-2.5 rounded-lg border border-border">
						<span className="material-symbols-outlined text-[18px] text-[oklch(0.55_0.15_25)]">
							developer_board
						</span>
						<span className="text-xs text-text-muted">
							Processed on{" "}
							<span className="font-semibold text-[oklch(0.55_0.15_25)]">
								AMD Instinct GPU (ROCm)
							</span>
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

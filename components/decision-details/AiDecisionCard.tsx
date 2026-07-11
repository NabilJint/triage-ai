"use client";

import { Badge } from "@/components/ui/badge";
import {
	StatusBadge,
	ConfidenceBar,
} from "@/components/triage/StatusBadge";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

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
		<CardContainer containerClassName="py-0 w-full" className="w-full">
			<CardBody className="w-full h-auto p-0 [transform-style:preserve-3d]">
				<CardItem
					translateZ={20}
					className={`w-full bg-surface border border-border rounded-xl p-6 shadow-card border-l-4 ${
						action === "escalate" ? "border-error" : "border-primary"
					}`}
				>
					<CardItem translateZ={30} className="w-full">
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
					</CardItem>

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
				</CardItem>
			</CardBody>
		</CardContainer>
	);
}

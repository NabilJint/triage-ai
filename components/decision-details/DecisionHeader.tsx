"use client";

import Link from "next/link";
import {
	StatusBadge,
	ConfidenceBar,
} from "@/components/triage/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { Classification } from "@/types";

type DecisionHeaderProps = {
	classification: Classification;
	confidence: number;
	action: string;
	fromName: string;
	fromEmail: string;
	subject: string;
	receivedAt: string;
};

export function DecisionHeader({
	classification,
	confidence,
	action,
	fromName,
	fromEmail,
	subject,
	receivedAt,
}: DecisionHeaderProps) {
	return (
		<div className="flex flex-col gap-6">
			<Link
				href="/dashboard/decisions"
				className="flex items-center gap-1.5 text-primary hover:text-primary-dark transition-colors text-sm font-medium"
			>
				<span className="material-symbols-outlined text-[16px]">
					arrow_back
				</span>
				Back to Triage Feed
			</Link>

			<Card>
				<CardContent className="p-6">
					<div className="flex items-center gap-2 pb-3 border-b border-border">
						<span className="material-symbols-outlined text-text-muted text-[20px]">
							mail
						</span>
						<h2 className="text-lg font-semibold text-text-primary">
							Original Request
						</h2>
					</div>

					<div className="flex justify-between items-start">
						<div>
							<div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5">
								From
							</div>
							<div className="text-sm font-semibold text-text-primary">
								{fromName}
							</div>
							<div className="text-xs text-text-muted">{fromEmail}</div>
						</div>
						<div className="text-right">
							<div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5">
								Received
							</div>
							<div className="text-sm text-text-secondary">{receivedAt}</div>
						</div>
					</div>

					<div>
						<div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5">
							Subject
						</div>
						<div className="text-sm font-semibold text-text-primary">{subject}</div>
					</div>

					<div className="flex items-center gap-3 mt-1">
						<StatusBadge type="classification" value={classification} />
						<ConfidenceBar score={confidence} />
						<StatusBadge type="action" value={action} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

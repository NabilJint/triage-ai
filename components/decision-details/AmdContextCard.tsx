"use client";

import { Card, CardContent } from "@/components/ui/card";

type SimilarInteraction = {
	subject: string;
	summary: string;
	timeAgo: string;
};

type AmdContextCardProps = {
	updatedAt: string;
	interactions?: SimilarInteraction[];
};

export function AmdContextCard({
	updatedAt,
	interactions = [],
}: AmdContextCardProps) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex justify-between items-center pb-3 border-b border-border">
					<div className="flex items-center gap-2">
						<span className="material-symbols-outlined text-text-muted text-[20px]">
							history
						</span>
						<h2 className="text-lg font-semibold text-text-primary">
							Customer Context
						</h2>
					</div>
				</div>

				<p className="text-xs text-text-muted">
					Similar past interactions powered by AMD ROCm embeddings.
				</p>

				{interactions.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{interactions.map((item, i) => (
							<li
								key={`${item.subject}-${i}`}
								className="p-3 bg-surface-secondary rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
							>
								<div className="flex justify-between items-start mb-1">
									<span className="text-xs font-semibold text-text-primary">
										{item.subject}
									</span>
									<span className="text-[10px] text-text-muted shrink-0 ml-2">
										{item.timeAgo}
									</span>
								</div>
								<p className="text-[11px] text-text-muted truncate">{item.summary}</p>
							</li>
						))}
					</ul>
				) : (
					<p className="text-xs text-text-muted italic">
						No similar past interactions found.
					</p>
				)}

				<div className="text-[10px] text-text-muted mt-1">
					Last embedding generated:{" "}
					{new Date(updatedAt).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					})}
				</div>
			</CardContent>
		</Card>
	);
}

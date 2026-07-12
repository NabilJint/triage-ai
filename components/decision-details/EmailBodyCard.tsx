"use client";

import { Card, CardContent } from "@/components/ui/card";

type EmailBodyCardProps = {
	body: string;
};

export function EmailBodyCard({ body }: EmailBodyCardProps) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="p-4 bg-surface-secondary rounded-lg border border-border">
					<p className="whitespace-pre-wrap text-sm text-text-primary leading-relaxed">
						{body}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

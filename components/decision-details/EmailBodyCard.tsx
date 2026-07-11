"use client";

import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

type EmailBodyCardProps = {
	body: string;
};

export function EmailBodyCard({ body }: EmailBodyCardProps) {
	return (
		<CardContainer containerClassName="py-0 w-full" className="w-full">
			<CardBody className="w-full h-auto p-0 [transform-style:preserve-3d]">
				<CardItem
					translateZ={20}
					className="w-full bg-surface border border-border rounded-xl p-6 shadow-card"
				>
					<div className="p-4 bg-surface-secondary rounded-lg border border-border">
						<p className="whitespace-pre-wrap text-sm text-text-primary leading-relaxed">
							{body}
						</p>
					</div>
				</CardItem>
			</CardBody>
		</CardContainer>
	);
}

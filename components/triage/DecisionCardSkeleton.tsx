import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

export function DecisionCardSkeleton() {
	return (
		<CardContainer containerClassName="py-0 w-full" className="w-full">
			<CardBody className="w-full h-auto p-0 [transform-style:preserve-3d]">
				<CardItem
					translateZ={20}
					className="w-full bg-surface border border-border rounded-xl p-4 shadow-card animate-pulse"
				>
					<CardItem translateZ={30} className="w-full">
						<div className="flex items-center gap-2 mb-2">
							<div className="h-4 w-32 rounded bg-primary/10" />
							<div className="h-3 w-24 rounded bg-primary/10" />
						</div>
					</CardItem>
					<CardItem translateZ={25} className="w-full">
						<div className="h-4 w-64 rounded bg-primary/10 mb-3" />
					</CardItem>
					<CardItem translateZ={20} className="w-full">
						<div className="flex items-center gap-3">
							<div className="h-5 w-16 rounded-full bg-primary/10" />
							<div className="h-1 w-16 rounded-full bg-primary/10" />
							<div className="h-3 w-8 rounded bg-primary/10" />
							<div className="h-5 w-24 rounded-full bg-primary/10" />
							<div className="h-3 w-16 rounded bg-primary/10 ml-auto" />
						</div>
					</CardItem>
				</CardItem>
			</CardBody>
		</CardContainer>
	);
}

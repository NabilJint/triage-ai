import { Card, CardContent } from "@/components/ui/card";

export function DecisionCardSkeleton() {
	return (
		<Card className="py-4 px-4 animate-pulse">
			<CardContent className="p-4">
				<div className="flex items-center gap-2 mb-2">
					<div className="h-4 w-32 rounded bg-primary/10" />
					<div className="h-3 w-24 rounded bg-primary/10" />
				</div>
				<div className="h-4 w-64 rounded bg-primary/10 mb-3" />
				<div className="flex items-center gap-3">
					<div className="h-5 w-16 rounded-full bg-primary/10" />
					<div className="h-1 w-16 rounded-full bg-primary/10" />
					<div className="h-3 w-8 rounded bg-primary/10" />
					<div className="h-5 w-24 rounded-full bg-primary/10" />
					<div className="h-3 w-16 rounded bg-primary/10 ml-auto" />
				</div>
			</CardContent>
		</Card>
	);
}

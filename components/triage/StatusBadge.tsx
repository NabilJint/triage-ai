import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	classificationConfig,
	actionConfig,
	priorityConfig,
	escalationStatusConfig,
	confidenceColor,
} from "@/lib/triage-config";

export { confidenceColor };

type BadgeType = "classification" | "action" | "priority" | "status";

const configMap = {
	classification: classificationConfig,
	action: actionConfig,
	priority: priorityConfig,
	status: escalationStatusConfig,
} as const;

type StatusBadgeProps = {
	type: BadgeType;
	value: string;
	className?: string;
};

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
	const config = configMap[type][value];
	if (!config) return null;

	return (
		<Badge
			className={cn(
				"rounded-full px-2.5 py-0.5 text-xs font-medium border-0",
				config.bg,
				config.text,
				className,
			)}
		>
			{config.label}
		</Badge>
	);
}

type PriorityBadgeProps = {
	value: string;
	className?: string;
};

export function PriorityBadge({ value, className }: PriorityBadgeProps) {
	return (
		<StatusBadge
			type="priority"
			value={value}
			className={cn(
				"rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
				className,
			)}
		/>
	);
}

type ConfidenceBarProps = {
	score: number;
	className?: string;
};

export function ConfidenceBar({ score, className }: ConfidenceBarProps) {
	return (
		<div className={cn("flex items-center gap-1.5", className)}>
			<div className="h-1.5 w-20 rounded-full bg-border overflow-hidden">
				<div
					className={cn("h-full rounded-full", confidenceColor(score))}
					style={{ width: `${Math.round(score * 100)}%` }}
				/>
			</div>
			<span className="text-xs text-text-muted tabular-nums">
				{Math.round(score * 100)}%
			</span>
		</div>
	);
}

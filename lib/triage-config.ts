export type BadgeConfig = {
	label: string;
	bg: string;
	text: string;
};

export const classificationConfig: Record<string, BadgeConfig> = {
	routine: {
		label: "Routine",
		bg: "bg-primary-light",
		text: "text-primary-dark dark:bg-primary/20 dark:text-primary",
	},
	technical: {
		label: "Technical",
		bg: "bg-secondary-light",
		text: "text-secondary-dark dark:bg-secondary/20 dark:text-secondary",
	},
	urgent: {
		label: "Urgent",
		bg: "bg-error-light",
		text: "text-error dark:bg-error/20",
	},
	sales: {
		label: "Sales",
		bg: "bg-success-light",
		text: "text-success-dark dark:bg-success/20 dark:text-success",
	},
	other: {
		label: "Other",
		bg: "bg-surface-secondary",
		text: "text-text-secondary dark:bg-surface-tertiary",
	},
};

export const actionConfig: Record<string, BadgeConfig> = {
	auto_reply: {
		label: "Auto-replied",
		bg: "bg-success-light",
		text: "text-success-dark dark:bg-success/20 dark:text-success",
	},
	escalate: {
		label: "Escalated",
		bg: "bg-error-light",
		text: "text-error dark:bg-error/20",
	},
};

export const priorityConfig: Record<string, BadgeConfig> = {
	urgent: {
		label: "Urgent",
		bg: "bg-error-light",
		text: "text-error dark:bg-error/20",
	},
	high: {
		label: "High",
		bg: "bg-warning-light",
		text: "text-warning dark:bg-warning/20",
	},
	medium: {
		label: "Medium",
		bg: "bg-primary-light",
		text: "text-primary-dark dark:bg-primary/20 dark:text-primary",
	},
	low: {
		label: "Low",
		bg: "bg-surface-secondary",
		text: "text-text-muted dark:bg-surface-tertiary",
	},
};

export const escalationStatusConfig: Record<string, BadgeConfig> = {
	pending: {
		label: "Pending",
		bg: "bg-warning-light",
		text: "text-warning dark:bg-warning/20",
	},
	in_progress: {
		label: "In Progress",
		bg: "bg-primary-light",
		text: "text-primary-dark dark:bg-primary/20 dark:text-primary",
	},
	resolved: {
		label: "Resolved",
		bg: "bg-success-light",
		text: "text-success-dark dark:bg-success/20 dark:text-success",
	},
};

export function confidenceColor(score: number): string {
	if (score >= 0.9) return "bg-success";
	if (score >= 0.7) return "bg-primary";
	if (score >= 0.5) return "bg-warning";
	return "bg-error";
}

export function getBadgeConfig(
	type: "classification" | "action" | "priority" | "status",
	value: string,
): BadgeConfig {
	const configs = {
		classification: classificationConfig,
		action: actionConfig,
		priority: priorityConfig,
		status: escalationStatusConfig,
	};
	return configs[type][value] ?? { label: value, bg: "bg-surface-secondary", text: "text-text-muted" };
}

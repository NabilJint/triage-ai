export type EscalationRule = {
	id: string;
	condition: "contains" | "confidence_below";
	value: string | number;
	priority: "low" | "medium" | "high" | "urgent";
	action: "escalate";
	label: string;
	desc: string;
	enabled: boolean;
};

export type Classification =
	| "routine"
	| "technical"
	| "urgent"
	| "sales"
	| "other"
	| "failed";
export type Action = "auto_reply" | "escalate" | "failed";
export type FilterTab = "all" | "auto_reply" | "escalate" | "pending" | "failed";
export type SortOption = "newest" | "oldest" | "priority";

export type TriageDecisionDisplay = {
	id: string;
	fromName: string;
	fromEmail: string;
	subject: string;
	classification: Classification;
	confidence: number;
	action: Action;
	reasoning: string;
	timeAgo: string;
	createdAt: string;
	priority?: "low" | "medium" | "high" | "urgent" | null;
	escalationStatus?: "pending" | "in_progress" | "resolved" | null;
	isTest?: boolean;
	emailStatus?: string | null;
};

export type DashboardStats = {
	emailsToday: number;
	autoReplyRate: number;
	escalationsPending: number;
	timeSaved: number;
	amdLastRun: string | null;
};

export type DailyActivity = {
	date: string;
	count: number;
};

export type ClassificationData = {
	name: string;
	value: number;
};

export type RecentDecisionItem = {
	id: string;
	type: "auto_reply" | "escalate";
	sender: string;
	description: string;
	timeAgo: string;
};

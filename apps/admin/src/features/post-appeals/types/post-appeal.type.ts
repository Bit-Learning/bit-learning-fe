export type AppealTicketStatus = "OPEN" | "CLOSED";

export interface AppealUser {
	id: number;
	firstName?: string | null;
	lastName?: string | null;
	name?: string | null;
	avatar?: string | null;
	email?: string | null;
}

export interface AppealRelatedPost {
	id: number;
	title: string;
	slug: string;
	isBanned: boolean;
	currentBanReason?: string | null;
	categoryName?: string | null;
	author?: AppealUser | null;
}

export interface PostAppealSummary {
	id: number;
	code: string;
	title: string;
	status: AppealTicketStatus;
	createdAt: string;
	updatedAt: string;
	createdBy?: AppealUser | null;
	resolvedBy?: AppealUser | null;
	post?: AppealRelatedPost | null;
	appealMessage: string;
	originalBanReason?: string | null;
}

export interface TicketCommentDetail {
	id: number;
	content: string;
	createdAt: string;
	updatedAt: string;
	author?: AppealUser | null;
	replies: TicketCommentDetail[];
}

export interface PostAppealDetail extends PostAppealSummary {
	description: string;
	comments: TicketCommentDetail[];
}

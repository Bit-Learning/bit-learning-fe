export interface UserSummary {
	id: number;
	firstName: string;
	lastName: string;
	avatar?: string;
	role: string;
}

export interface CommentResponse {
	id: number;
	user: UserSummary;
	content: string;
	videoTimestamp: number | null;
	upVoteCount: number;
	replyCount: number;
	isUpvotedByCurrentUser: boolean;
	isPinned: boolean;
	createdAt: string;
}

export interface CommentRequest {
	content: string;
	videoTimestampSecond: number;
	lectureId: number;
	parentId?: number;
}

export interface ReviewResponse {
	id: number;
	user: UserSummary;
	rating: number;
	comment: string;
	createdAt: string;
}

export interface ReviewRequest {
	courseId: number;
	rating: number;
	comment?: string;
}

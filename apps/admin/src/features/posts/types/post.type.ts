export interface AttachmentDetail {
	id: number;
	url: string;
	publicId?: string;
	type: AttachmentType;
}

export interface HashtagDetail {
	id: number;
	name: string;
	slug?: string;
	postCount?: number;
}

export interface ForumCategory {
	id: number;
	name: string;
	slug: string;
	iconKey?: string;
	postsCount?: number;
}

export interface Author {
	id: number;
	name?: string;
	firstName: string;
	lastName: string;
	avatar?: string;
	email?: string;
}

export interface ReactionSummary {
	LIKE: number;
	LOVE: number;
	HAHA: number;
	WOW: number;
	SAD: number;
	ANGRY: number;
}

export type ReactionType = keyof ReactionSummary;

export interface PostPreview {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	thumbnailUrl: string;
	category?: ForumCategory;
	tags: HashtagDetail[];
	author: Author;
	createdAt: string;
	updatedAt: string;
	viewsCount: number;
	commentsCount: number;
	reactionSummary: ReactionSummary;
	totalReactions: number;
	currentUserReaction?: ReactionType | null;
	isFeatured: boolean;
	isTrending: boolean;
	content: string;
	isBanned: boolean;
	isEdited: boolean;
	isEditAllowed?: boolean;
	likes: number;
	dislikes: number;
	hashtags: HashtagDetail[];
	attachments: AttachmentDetail[];
}

export interface PostDetail extends PostPreview {}

export interface CommentDetail {
	id: number;
	content: string;
	isBanned: boolean;
	isEdited: boolean;
	isEditAllowed: boolean;
	likes: number;
	dislikes: number;
	author: Author;
	postId: number;
	parentId?: number;
	replies: CommentDetail[];
	createdAt: string;
	updatedAt: string;
}

export enum AttachmentType {
	IMAGE = "IMAGE",
	FILE = "FILE",
}

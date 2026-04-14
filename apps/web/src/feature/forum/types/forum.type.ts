export enum AttachmentType {
	IMAGE = "IMAGE",
	FILE = "FILE",
}

export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

export interface Author {
	id: number;
	firstName: string;
	lastName: string;
	username?: string;
	name?: string;
	avatar?: string;
	email?: string;
}

export interface ForumCategory {
	id: number;
	name: string;
	slug: string;
	iconKey: string;
	postsCount?: number;
}

export interface Tag {
	id: number;
	name: string;
	slug: string;
	postCount?: number;
}

export interface Hashtag extends Tag {}

export interface Attachment {
	id: number;
	url: string;
	type: AttachmentType;
}

export interface ReactionSummary {
	LIKE: number;
	LOVE: number;
	HAHA: number;
	WOW: number;
	SAD: number;
	ANGRY: number;
}

export interface Post {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	thumbnailUrl: string;
	category?: ForumCategory | null;
	tags: Tag[];
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

	// Compatibility fields used by existing detail/form/my-post pages.
	content: string;
	isBanned: boolean;
	banReason?: string | null;
	isEdited: boolean;
	isEditAllowed: boolean;
	likes: number;
	dislikes: number;
	attachments: Attachment[];
	hashtags: Hashtag[];
}

export interface Comment {
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
	replies?: Comment[];
	createdAt: string;
	updatedAt: string;
}

export interface CreatePostRequest {
	title: string;
	content: string;
	categorySlug: string;
	tags?: string[];
}

export interface UpdatePostRequest {
	title: string;
	content: string;
	categorySlug: string;
	tags?: string[];
	deletedAttachmentIds?: number[];
}

export interface CreateCommentRequest {
	postId: number;
	content: string;
}

export interface UpdateCommentRequest {
	content: string;
}

export interface PaginationParams {
	page?: number;
	size?: number;
}

export interface PostFeedParams extends PaginationParams {
	category?: string;
	tag?: string;
	q?: string;
	sort?: "latest" | "trending" | "most_viewed" | "most_reacted";
}

export interface FilterByTagsParams extends PaginationParams {
	tagNames: string[];
	mode: "min" | "max";
}

export interface FilterByAuthorParams extends PaginationParams {
	authorId: number;
}

export interface ForumSubscriptionRequest {
	email: string;
	langKey?: string;
}

export interface ForumSubscription {
	id: number;
	email: string;
	langKey: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

import type {
	Author,
	HashtagDetail,
	PostDetail,
	PostPreview,
} from "./types/post.type";

type PostLike = Pick<PostPreview, "excerpt" | "content" | "tags" | "hashtags">;

export const stripHtml = (value: string | undefined | null) =>
	(value ?? "")
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/\s+/g, " ")
		.trim();

export const getPostExcerpt = (post: Pick<PostLike, "excerpt" | "content">) => {
	const excerpt = stripHtml(post.excerpt);
	if (excerpt) {
		return excerpt;
	}

	return stripHtml(post.content);
};

export const getPostTags = (
	post: Pick<PostLike, "tags" | "hashtags">,
): HashtagDetail[] => (post.tags?.length ? post.tags : (post.hashtags ?? []));

export const getAuthorName = (author: Author) =>
	author.name?.trim() ||
	`${author.firstName ?? ""} ${author.lastName ?? ""}`.trim() ||
	`User #${author.id}`;

export const getAuthorInitials = (author: Author) =>
	getAuthorName(author)
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

export const getTotalAttachments = (post: Pick<PostDetail, "attachments">) =>
	post.attachments?.length ?? 0;

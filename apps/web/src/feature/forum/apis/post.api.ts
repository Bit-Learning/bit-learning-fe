import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	CreatePostRequest,
	FilterByAuthorParams,
	FilterByTagsParams,
	PaginationParams,
	Post,
	PostBanAppealRequest,
	PostFeedParams,
	ReactionType,
	UpdatePostRequest,
} from "../types/forum.type";

export const postApi = {
	getAllPosts: async (params: PostFeedParams = {}) => {
		const { page = 0, size = 12, category, tag, q, sort = "latest" } = params;
		const response = await api.get<ApiResponse<Post[]>>("/posts", {
			params: { page, size, category, tag, q, sort },
		});
		return response.data;
	},

	getFeaturedPosts: async (limit = 4) => {
		const response = await api.get<ApiResponse<Post[]>>("/posts/featured", {
			params: { limit },
		});
		return response.data;
	},

	getTrendingPosts: async (limit = 8) => {
		const response = await api.get<ApiResponse<Post[]>>("/posts/trending", {
			params: { limit },
		});
		return response.data;
	},

	getLatestPosts: async (params: PaginationParams = {}) => {
		const { page = 0, size = 12 } = params;
		const response = await api.get<ApiResponse<Post[]>>("/posts/latest", {
			params: { page, size },
		});
		return response.data;
	},

	getRecommendedPosts: async (limit = 6) => {
		const response = await api.get<ApiResponse<Post[]>>("/posts/recommended", {
			params: { limit },
		});
		return response.data;
	},

	getPostById: async (id: number) => {
		const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);
		return response.data;
	},

	getPostBySlug: async (slug: string) => {
		const response = await api.get<ApiResponse<Post>>(`/posts/slug/${slug}`);
		return response.data;
	},

	getPostsByAuthor: async (params: FilterByAuthorParams) => {
		const { authorId, page = 0, size = 10 } = params;
		const response = await api.get<ApiResponse<Post[]>>("/posts/author", {
			params: { authorId, page, size },
		});
		return response.data;
	},

	getPostsByTagsMin: async (params: FilterByTagsParams) => {
		const { tagNames, page = 0, size = 10 } = params;
		const response = await api.post<ApiResponse<Post[]>>(
			"/posts/tags/min",
			tagNames,
			{
				params: { page, size },
			},
		);
		return response.data;
	},

	getPostsByTagsMax: async (params: FilterByTagsParams) => {
		const { tagNames, page = 0, size = 10 } = params;
		const response = await api.post<ApiResponse<Post[]>>(
			"/posts/tags/max",
			tagNames,
			{
				params: { page, size },
			},
		);
		return response.data;
	},

	createPost: async (data: CreatePostRequest, attachments?: File[]) => {
		const formData = new FormData();
		formData.append(
			"request",
			new Blob([JSON.stringify(data)], { type: "application/json" }),
		);

		if (attachments?.length) {
			attachments.forEach((file) => {
				formData.append("attachments", file);
			});
		}

		const response = await api.post<ApiResponse<void>>("/posts", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	updatePost: async (
		id: number,
		data: UpdatePostRequest,
		attachments?: File[],
	) => {
		const formData = new FormData();
		formData.append(
			"request",
			new Blob([JSON.stringify(data)], { type: "application/json" }),
		);

		if (attachments?.length) {
			attachments.forEach((file) => {
				formData.append("attachments", file);
			});
		}

		const response = await api.patch<ApiResponse<void>>(
			`/posts/${id}`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);
		return response.data;
	},

	deletePost: async (id: number) => {
		const response = await api.delete<ApiResponse<void>>(`/posts/${id}`);
		return response.data;
	},

	appealPostBan: async (id: number, data: PostBanAppealRequest) => {
		const response = await api.post<ApiResponse<void>>(
			`/posts/${id}/appeal`,
			data,
		);
		return response.data;
	},

	reactToPost: async (id: number, reactionType: ReactionType) => {
		const response = await api.post<ApiResponse<void>>(`/posts/${id}/react`, {
			reactionType,
		});
		return response.data;
	},

	likePost: async (id: number) => {
		const response = await api.post<ApiResponse<void>>(`/posts/${id}/like`);
		return response.data;
	},

	dislikePost: async (id: number) => {
		const response = await api.post<ApiResponse<void>>(`/posts/${id}/dislike`);
		return response.data;
	},

	unlikeOrUndislikePost: async (id: number) => {
		const response = await api.post<ApiResponse<void>>(
			`/posts/${id}/unlike_or_undislike`,
		);
		return response.data;
	},

	getPostLikes: async (id: number) => {
		const response = await api.get<ApiResponse<number>>(`/posts/${id}/like`);
		return response.data;
	},

	getPostDislikes: async (id: number) => {
		const response = await api.get<ApiResponse<number>>(`/posts/${id}/dislike`);
		return response.data;
	},
};

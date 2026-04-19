import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	PostDetail,
	PostPreview,
	CommentDetail,
} from "../types/post.type";

export const postApi = {
	getAllPosts(
		page = 0,
		size = 10,
	): Promise<AxiosResponse<ApiResponse<PostPreview[]>>> {
		return api.get("/posts", {
			params: { page, size, includeBanned: true },
		});
	},

	getPostById(id: number): Promise<AxiosResponse<ApiResponse<PostDetail>>> {
		return api.get(`/posts/${id}`);
	},

	getPostsByAuthor(
		authorId: number,
		page = 0,
		size = 10,
	): Promise<AxiosResponse<ApiResponse<PostPreview[]>>> {
		return api.get("/posts/author", {
			params: { authorId, page, size },
		});
	},

	getPostsByTags(
		tagNames: string[],
		matchAll: boolean,
		page = 0,
		size = 10,
	): Promise<AxiosResponse<ApiResponse<PostPreview[]>>> {
		const endpoint = matchAll ? "/posts/tags/max" : "/posts/tags/min";
		return api.post(endpoint, tagNames, {
			params: { page, size },
		});
	},

	banPost(
		id: number,
		reason?: string,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/posts/${id}/ban`, {
			reason,
		});
	},

	unbanPost(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/posts/${id}/unban`);
	},

	featurePost(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/posts/${id}/feature`);
	},

	unfeaturePost(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/posts/${id}/unfeature`);
	},

	getCommentsOfPost(
		postId: number,
		page = 0,
		size = 10,
	): Promise<AxiosResponse<ApiResponse<CommentDetail[]>>> {
		return api.get("/comments", {
			params: { postId, page, size },
		});
	},

	banComment(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/comments/${id}/ban`);
	},

	unbanComment(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/comments/${id}/unban`);
	},
};

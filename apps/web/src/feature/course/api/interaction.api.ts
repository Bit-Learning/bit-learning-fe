import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	CommentRequest,
	CommentResponse,
	ReviewRequest,
	ReviewResponse,
} from "../types/interaction.type";
import { AxiosResponse } from "axios";

export const interactionApi = {
	getRootComments: async (
		lectureId: number,
		page = 0,
		size = 10,
		sort = "upVotes",
		direction = "DESC",
	): Promise<AxiosResponse<ApiResponse<CommentResponse[]>>> => {
		return await api.get(`/interactions/comments/lectures/${lectureId}`, {
			params: { page, size, sort, direction },
		});
	},

	getReplies: async (
		parentId: number,
	): Promise<AxiosResponse<ApiResponse<CommentResponse[]>>> => {
		return await api.get(`/interactions/comments/${parentId}/replies`);
	},

	postComment: async (
		request: CommentRequest,
	): Promise<AxiosResponse<ApiResponse<CommentResponse>>> => {
		return await api.post("/interactions/comments", request);
	},

	toggleVote: async (
		commentId: number,
	): Promise<AxiosResponse<ApiResponse<void>>> => {
		return await api.post(`/interactions/comments/${commentId}/vote`);
	},

	getCourseReviews: async (
		courseId: number,
		page = 0,
		size = 5,
		sort = "createdAt",
		direction = "DESC",
	): Promise<AxiosResponse<ApiResponse<ReviewResponse[]>>> => {
		return await api.get(`/interactions/reviews/courses/${courseId}`, {
			params: { page, size, sort, direction },
		});
	},

	postReview: async (
		request: ReviewRequest,
	): Promise<AxiosResponse<ApiResponse<ReviewResponse>>> => {
		return await api.post("/interactions/reviews", request);
	},
};

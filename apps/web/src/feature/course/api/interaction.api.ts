import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	CommentRequest,
	CommentResponse,
	ReviewRequest,
	ReviewResponse,
} from "../types/interaction.type";

export const interactionApi = {
	getRootComments: async (
		lectureId: number,
		page = 0,
		size = 10,
		sort = "upVotes",
		direction = "DESC",
	): Promise<ApiResponse<CommentResponse[]>> => {
		const { data } = await api.get(
			`/interactions/comments/lectures/${lectureId}`,
			{
				params: { page, size, sort, direction },
			},
		);
		return data;
	},

	getReplies: async (
		parentId: number,
	): Promise<ApiResponse<CommentResponse[]>> => {
		const { data } = await api.get(
			`/interactions/comments/${parentId}/replies`,
		);
		return data;
	},

	postComment: async (
		request: CommentRequest,
	): Promise<ApiResponse<CommentResponse>> => {
		const { data } = await api.post("/interactions/comments", request);
		return data;
	},

	toggleVote: async (commentId: number): Promise<ApiResponse<void>> => {
		const { data } = await api.post(`/interactions/comments/${commentId}/vote`);
		return data;
	},

	getCourseReviews: async (
		courseId: number,
		page = 0,
		size = 5,
		sort = "createdAt",
		direction = "DESC",
	): Promise<ApiResponse<ReviewResponse[]>> => {
		const { data } = await api.get(
			`/interactions/reviews/courses/${courseId}`,
			{
				params: { page, size, sort, direction },
			},
		);
		return data;
	},

	postReview: async (
		request: ReviewRequest,
	): Promise<ApiResponse<ReviewResponse>> => {
		const { data } = await api.post("/interactions/reviews", request);
		return data;
	},
};

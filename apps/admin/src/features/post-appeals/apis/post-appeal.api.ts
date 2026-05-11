import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	AppealTicketStatus,
	PostAppealDetail,
	PostAppealSummary,
} from "../types/post-appeal.type";

export const postAppealApi = {
	getPostAppeals(
		page = 0,
		size = 10,
		status?: AppealTicketStatus,
	): Promise<AxiosResponse<ApiResponse<PostAppealSummary[]>>> {
		return api.get("/tickets/post-appeals", {
			params: {
				page,
				size,
				status: status || undefined,
			},
		});
	},

	getPostAppealDetail(
		id: number,
	): Promise<AxiosResponse<ApiResponse<PostAppealDetail>>> {
		return api.get(`/tickets/post-appeals/${id}`);
	},

	closePostAppeal(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/tickets/${id}/close`);
	},

	commentOnPostAppeal(
		id: number,
		content: string,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/tickets/${id}/comment`, content, {
			headers: {
				"Content-Type": "text/plain",
			},
		});
	},

	replyOnPostAppeal(
		ticketCommentId: number,
		content: string,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/tickets/comment/${ticketCommentId}/reply`, content, {
			headers: {
				"Content-Type": "text/plain",
			},
		});
	},

	unbanAppealPost(postId: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/posts/${postId}/unban`);
	},
};

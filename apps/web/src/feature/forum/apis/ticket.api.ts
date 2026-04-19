import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	AppealTicketStatus,
	PostAppealDetail,
	PostAppealSummary,
} from "../types/forum.type";

export const ticketApi = {
	getMyPostAppeals(
		page = 0,
		size = 10,
		status?: AppealTicketStatus,
	): Promise<AxiosResponse<ApiResponse<PostAppealSummary[]>>> {
		return api.get("/tickets/my-post-appeals", {
			params: {
				page,
				size,
				status: status || undefined,
			},
		});
	},

	getMyPostAppealDetail(
		id: number,
	): Promise<AxiosResponse<ApiResponse<PostAppealDetail>>> {
		return api.get(`/tickets/my-post-appeals/${id}`);
	},

	commentOnAppeal(
		id: number,
		content: string,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/tickets/${id}/comment`, content, {
			headers: {
				"Content-Type": "text/plain",
			},
		});
	},

	replyOnAppeal(
		ticketCommentId: number,
		content: string,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/tickets/comment/${ticketCommentId}/reply`, content, {
			headers: {
				"Content-Type": "text/plain",
			},
		});
	},
};

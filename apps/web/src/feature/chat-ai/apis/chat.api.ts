import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	Conversation,
	CreateConversationRequest,
	MessageHistoryResponse,
	ChatResult,
	ChatRequest,
	ChatQuota,
} from "../types/chat.type";

export const chatApi = {
	createConversation: async (
		request: CreateConversationRequest,
	): Promise<AxiosResponse<ApiResponse<Conversation>>> => {
		return api.post("/conversations", request);
	},

	getConversation: async (
		id: string,
	): Promise<AxiosResponse<ApiResponse<Conversation>>> => {
		return api.get(`/conversations/${id}`);
	},

	getUserConversations: async (
		page = 0,
		size = 10,
		sort = "createdAt,desc",
	): Promise<AxiosResponse<ApiResponse<Conversation[]>>> => {
		return api.get("/conversations", {
			params: { page, size, sort },
		});
	},

	getConversationMessages: async (
		conversationId: string,
		size = 20,
		before?: number,
	): Promise<AxiosResponse<ApiResponse<MessageHistoryResponse>>> => {
		return api.get(`/conversations/${conversationId}/messages`, {
			params: { size, before },
		});
	},

	deleteConversation: async (
		id: string,
	): Promise<AxiosResponse<ApiResponse<void>>> => {
		return api.delete(`/conversations/${id}`);
	},

	getChatQuota: async (): Promise<AxiosResponse<ApiResponse<ChatQuota>>> => {
		return api.get("/conversations/chat-quota");
	},

	sendMessage: async (
		conversationId: string,
		request: ChatRequest,
	): Promise<AxiosResponse<ApiResponse<ChatResult>>> => {
		const formData = new FormData();
		formData.append("question", request.question);

		if (request.model) {
			formData.append("model", request.model);
		}

		if (request.files && request.files.length > 0) {
			request.files.forEach((file) => {
				formData.append("files", file);
			});
		}

		return api.post(`/conversations/${conversationId}/chat`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},
};

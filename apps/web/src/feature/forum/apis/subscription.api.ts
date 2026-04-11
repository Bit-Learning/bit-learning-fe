import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	ForumSubscription,
	ForumSubscriptionRequest,
} from "../types/forum.type";

export const forumSubscriptionApi = {
	subscribe: async (data: ForumSubscriptionRequest) => {
		const response = await api.post<ApiResponse<ForumSubscription>>(
			"/forum-subscriptions",
			data,
		);
		return response.data;
	},
};

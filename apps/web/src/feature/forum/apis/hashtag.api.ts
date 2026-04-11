import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { Hashtag } from "../types/forum.type";

export const hashtagApi = {
	getTagByName: async (name: string) => {
		const response = await api.get<ApiResponse<Hashtag>>(`/hashtags/${name}`);
		return response.data;
	},

	getAllTags: async () => {
		const response = await api.get<ApiResponse<Hashtag[]>>("/hashtags");
		return response.data;
	},

	getPopularTags: async (limit = 20) => {
		const response = await api.get<ApiResponse<Hashtag[]>>("/tags/popular", {
			params: { limit },
		});
		return response.data;
	},
};

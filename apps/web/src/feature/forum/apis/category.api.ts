import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { ForumCategory } from "../types/forum.type";

export const categoryApi = {
	getAllCategories: async () => {
		const response = await api.get<ApiResponse<ForumCategory[]>>("/categories");
		return response.data;
	},
};

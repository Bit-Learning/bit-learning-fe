import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { TagResponse } from "../types/tag.type";

export const tagApi = {
	getAllTags(): Promise<AxiosResponse<ApiResponse<TagResponse[]>>> {
		return api.get("/coding/tags");
	},
};

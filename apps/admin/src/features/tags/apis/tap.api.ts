import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	CreateTagRequest,
	TagResponse,
	UpdateTagRequest,
} from "../types/tag.type";

export const tagApi = {
	getAllTags(): Promise<AxiosResponse<ApiResponse<TagResponse[]>>> {
		return api.get("/coding/tags");
	},

	createTag(
		data: CreateTagRequest,
	): Promise<AxiosResponse<ApiResponse<TagResponse>>> {
		return api.post("/coding/tags", data);
	},

	updateTag(
		tagId: string,
		data: UpdateTagRequest,
	): Promise<AxiosResponse<ApiResponse<TagResponse>>> {
		return api.put(`/coding/tags/${tagId}`, data);
	},

	deleteTag(tagId: string): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/coding/tags/${tagId}`);
	},
};

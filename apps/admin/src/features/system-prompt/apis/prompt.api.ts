import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	SystemPromptPatchRequest,
	SystemPromptRequest,
	SystemPromptResponse,
} from "../types/prompt.type";

export const promptApi = {
	getAll(): Promise<AxiosResponse<ApiResponse<SystemPromptResponse[]>>> {
		return api.get("/admin/system-prompts");
	},

	create(
		data: SystemPromptRequest,
	): Promise<AxiosResponse<ApiResponse<SystemPromptResponse>>> {
		return api.post("/admin/system-prompts", data);
	},

	patch(
		id: number,
		data: SystemPromptPatchRequest,
	): Promise<AxiosResponse<ApiResponse<SystemPromptResponse>>> {
		return api.patch(`/admin/system-prompts/${id}`, data);
	},

	delete(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/admin/system-prompts/${id}`);
	},
};

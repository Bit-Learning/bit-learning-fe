import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	KidsBlocklyBootstrapResponse,
	KidsBlocklyLevel,
	KidsBlocklyProgressResponse,
	SubmitKidsBlocklyRunRequest,
	SubmitKidsBlocklyRunResponse,
} from "../types";

const basePath = "/kids-blockly";

export const kidsBlocklyApi = {
	getBootstrap: async () => {
		const response = await api.get<ApiResponse<KidsBlocklyBootstrapResponse>>(
			`${basePath}/bootstrap`,
		);
		return response.data;
	},

	getLevels: async () => {
		const response = await api.get<ApiResponse<{ levels: KidsBlocklyLevel[] }>>(
			`${basePath}/levels`,
		);
		return response.data;
	},

	getProgress: async () => {
		const response = await api.get<ApiResponse<KidsBlocklyProgressResponse>>(
			`${basePath}/progress`,
		);
		return response.data;
	},

	submitRun: async (levelId: string, request: SubmitKidsBlocklyRunRequest) => {
		const response = await api.post<ApiResponse<SubmitKidsBlocklyRunResponse>>(
			`${basePath}/levels/${levelId}/runs`,
			request,
		);
		return response.data;
	},
};

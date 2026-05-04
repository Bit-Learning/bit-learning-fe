import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	KidsBlocklyBootstrapResponse,
	KidsBlocklyLevel,
	KidsBlocklyRunDetail,
	KidsBlocklyProgressResponse,
	SubmitKidsBlocklyRunRequest,
	SubmitKidsBlocklyRunResponse,
	KidsBlocklyLeaderboardEntry,
} from "../types/kid-blockly.types";

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
	getRun: async (runId: string) => {
		const response = await api.get<ApiResponse<KidsBlocklyRunDetail>>(
			`${basePath}/runs/${runId}`,
		);
		return response.data;
	},
	getLeaderboard: async (page = 0, size = 20) => {
		const response = await api.get<ApiResponse<KidsBlocklyLeaderboardEntry[]>>(
			`${basePath}/leaderboard`,
			{
				params: { page, size },
			},
		);
		return response.data;
	},
};

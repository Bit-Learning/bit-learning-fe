import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";

export interface TrendingConfig {
	id: number;
	lookbackDays: number;
	minScore: number;
	commentWeight: number;
	reactionWeight: number;
	viewWeight: number;
	updatedAt: string;
}

export interface UpdateTrendingConfigRequest {
	lookbackDays: number;
	minScore: number;
	commentWeight: number;
	reactionWeight: number;
	viewWeight: number;
}

export const trendingConfigApi = {
	getConfig(): Promise<AxiosResponse<ApiResponse<TrendingConfig>>> {
		return api.get("/forum/config/trending");
	},

	updateConfig(
		data: UpdateTrendingConfigRequest,
	): Promise<AxiosResponse<ApiResponse<TrendingConfig>>> {
		return api.put("/forum/config/trending", data);
	},
};

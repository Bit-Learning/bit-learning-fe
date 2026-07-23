import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { AxiosResponse } from "axios";
import type {
	MentorDashboardStatsResponse,
	MentorWithViewsResponse,
	MentorWithReactionsResponse,
} from "../types/mentor.type";

export const mentorStatsApi = {
	getMentorStats(): Promise<
		AxiosResponse<ApiResponse<MentorDashboardStatsResponse>>
	> {
		return api.get("/statistics/mentor");
	},

	getTopMentorsByViews(
		limit = 5,
	): Promise<AxiosResponse<ApiResponse<MentorWithViewsResponse[]>>> {
		return api.get("/statistics/mentor/top-by-post-views", {
			params: { limit },
		});
	},

	getTopMentorsByReactions(
		limit = 5,
	): Promise<AxiosResponse<ApiResponse<MentorWithReactionsResponse[]>>> {
		return api.get("/statistics/mentor/top-by-post-reactions", {
			params: { limit },
		});
	},
};

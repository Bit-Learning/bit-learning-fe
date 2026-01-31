import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type {
	ApiResponse,
	GlobalLeaderboardEntry,
	UserProgress,
} from "../types";

const GAMIFICATION_ENDPOINT = "/games/gamification";

export const GamificationService = {
	/**
	 * Get current user's gamification progress (level, EXP, coins, streak)
	 */
	getUserProgress: (): Promise<AxiosResponse<ApiResponse<UserProgress>>> => {
		return api.get(`${GAMIFICATION_ENDPOINT}/progress`);
	},

	getGlobalLeaderboard: (
		limit: number,
	): Promise<AxiosResponse<ApiResponse<GlobalLeaderboardEntry[]>>> => {
		return api.get(`${GAMIFICATION_ENDPOINT}/leaderboard`, {
			params: { limit },
		});
	},
};

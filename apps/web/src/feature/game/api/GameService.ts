import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type {
	ApiResponse,
	CheckAnswerRequest,
	CheckAnswerResponse,
	GameDetail,
	GameListItem,
	GameLog,
	LeaderboardEntry,
	PageResponse,
	SubmitGameRequest,
	SubmitGameResponse,
	TGameSection,
} from "../types";

const GAMES_ENDPOINT = "/games";

export const GameService = {
	/**
	 * Get all games with pagination and optional type filter
	 */
	getAllGames: (
		page = 0,
		size = 10,
		type?: string,
	): Promise<AxiosResponse<ApiResponse<PageResponse<GameListItem>>>> => {
		const params = new URLSearchParams({
			page: String(page),
			size: String(size),
		});
		if (type) params.append("type", type);
		return api.get(`${GAMES_ENDPOINT}?${params}`);
	},

	/**
	 * Get dashboard games grouped by type
	 */
	getDashboardGames: (
		limit = 10,
	): Promise<AxiosResponse<ApiResponse<TGameSection[]>>> => {
		return api.get(`${GAMES_ENDPOINT}/dashboard?limit=${limit}`);
	},

	/**
	 * Get game detail by ID (without correct answers)
	 */
	getGameById: (
		gameId: number,
	): Promise<AxiosResponse<ApiResponse<GameDetail>>> => {
		return api.get(`${GAMES_ENDPOINT}/${gameId}`);
	},

	/**
	 * Submit answer for one question
	 */
	checkAnswer: (
		gameId: number,
		request: CheckAnswerRequest,
	): Promise<AxiosResponse<ApiResponse<CheckAnswerResponse>>> => {
		return api.post(`${GAMES_ENDPOINT}/${gameId}/check`, request);
	},

	/**
	 * Submit final game results
	 */
	submitGameResult: (
		gameId: number,
		request: SubmitGameRequest,
	): Promise<AxiosResponse<ApiResponse<SubmitGameResponse>>> => {
		return api.post(`${GAMES_ENDPOINT}/${gameId}/submit`, request);
	},

	/**
	 * Get user's game logs for a specific game
	 */
	getUserGameLogs: (
		gameId: number,
	): Promise<AxiosResponse<ApiResponse<GameLog[]>>> => {
		return api.get(`${GAMES_ENDPOINT}/${gameId}/logs`);
	},

	/**
	 * Get leaderboard for a game
	 */
	getLeaderboard: (
		gameId: number,
		limit = 10,
	): Promise<AxiosResponse<ApiResponse<LeaderboardEntry[]>>> => {
		return api.get(`${GAMES_ENDPOINT}/${gameId}/leaderboard?limit=${limit}`);
	},
};

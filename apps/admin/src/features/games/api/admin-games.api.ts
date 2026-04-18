import api from "@/shared/api/api";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "@/shared/api/api.type";

const ADMIN_GAMES_ENDPOINT = "/admin/games";

export type AdminGameType = "QUIZ" | "TYPING" | "MATCHING";

// This mirrors the backend Game entity JSON we actually use in admin.
export interface AdminGameDto {
	id: number;
	title: string;
	description?: string;
	gameType?: AdminGameType;
	minioObjectName?: string;
	thumbnailUrl?: string;
	status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
	difficulty?: string;
	scoringBaseScoreMax?: number;
	scoringDifficultyMultiplier?: number;
	scoringPassingThreshold?: number;
	featuredViewWeight?: number;
	featuredLikeWeight?: number;
	featuredManualBoost?: number;
	trendScore?: number;
	categoryId?: number | null;
	views?: number;
	likes?: number;
}

export interface CreateGamePayload {
	file: File;
	title: string;
	desc: string;
	difficulty?: string;
	baseScoreMax?: number;
	difficultyMultiplier?: number;
	passingThreshold?: number;
	featuredViewWeight?: number;
	featuredLikeWeight?: number;
	featuredManualBoost?: number;
	categoryId?: number;
	thumbnailUrl?: string;
	thumbnail?: File;
}

export interface UpdateGamePayload {
	file?: File;
	title: string;
	desc: string;
	difficulty?: string;
	baseScoreMax?: number;
	difficultyMultiplier?: number;
	passingThreshold?: number;
	featuredViewWeight?: number;
	featuredLikeWeight?: number;
	featuredManualBoost?: number;
	categoryId?: number;
	thumbnailUrl?: string;
	thumbnail?: File;
}

export interface AdminGameAnalyticsOverview {
	rangeDays: number;
	totalAttempts: number;
	completedAttempts: number;
	partialAttempts: number;
	distinctGames: number;
	distinctTopics: number;
	completionRate: number;
	partialRate: number;
	averageAccuracy: number;
	averageDurationSeconds: number;
	timeoutRate: number;
}

export interface AdminGameDailyPlayPoint {
	date: string;
	plays: number;
	completed: number;
	partial: number;
}

export interface AdminGamePerformanceItem {
	gameId: number;
	gameTitle: string;
	gameType?: string | null;
	categoryName?: string | null;
	attempts: number;
	completedAttempts: number;
	partialAttempts: number;
	completionRate: number;
	partialRate: number;
	averageAccuracy: number;
	averageDurationSeconds: number;
	timeoutRate: number;
	averageNormalizedScore: number;
	averageLeaderboardPoints: number;
	bestLeaderboardPoints: number;
	totalQuestions: number;
	totalCorrect: number;
	totalWrong: number;
	totalTimeout: number;
	lastPlayedAt?: string | null;
}

export interface AdminTopicPerformanceItem {
	key: string;
	label: string;
	bookCode?: string | null;
	bookTitle?: string | null;
	grade?: number | null;
	topicLetter?: string | null;
	topicName?: string | null;
	attempts: number;
	completionRate: number;
	averageAccuracy: number;
	averageDurationSeconds: number;
	timeoutRate: number;
	totalQuestions: number;
	totalCorrect: number;
	totalWrong: number;
	totalTimeout: number;
	lastPlayedAt?: string | null;
}

export interface AdminGameBreakdownItem {
	key: string;
	label: string;
	count: number;
	rate: number;
}

export interface AdminRecentAttemptItem {
	id: number;
	playedAt: string;
	completed: boolean;
	accuracy: number;
	correctCount: number;
	wrongCount: number;
	timeoutCount: number;
}

export interface AdminGameAnalyticsDashboardDto {
	overview: AdminGameAnalyticsOverview;
	playsByDay: AdminGameDailyPlayPoint[];
	gamePerformance: AdminGamePerformanceItem[];
	topicPerformance: AdminTopicPerformanceItem[];
	timeoutLeaders: AdminGamePerformanceItem[];
}

export interface AdminGameDetailAnalyticsDto {
	summary: AdminGamePerformanceItem;
	playsByDay: AdminGameDailyPlayPoint[];
	attemptStates: AdminGameBreakdownItem[];
	exitReasons: AdminGameBreakdownItem[];
	questionOutcomes: AdminGameBreakdownItem[];
	recentAttempts: AdminRecentAttemptItem[];
}

export const adminGamesApi = {
	listGames: (): Promise<AxiosResponse<ApiResponse<AdminGameDto[]>>> => {
		return api.get(ADMIN_GAMES_ENDPOINT);
	},

	getAnalytics: (
		days = 30,
	): Promise<AxiosResponse<ApiResponse<AdminGameAnalyticsDashboardDto>>> => {
		return api.get(`${ADMIN_GAMES_ENDPOINT}/analytics`, {
			params: { days },
		});
	},

	getGameAnalytics: (
		id: number,
		days = 30,
	): Promise<AxiosResponse<ApiResponse<AdminGameDetailAnalyticsDto>>> => {
		return api.get(`${ADMIN_GAMES_ENDPOINT}/${id}/analytics`, {
			params: { days },
		});
	},

	createGame: (
		payload: CreateGamePayload,
	): Promise<AxiosResponse<ApiResponse<AdminGameDto>>> => {
		const formData = new FormData();
		formData.append("file", payload.file);
		formData.append("title", payload.title);
		formData.append("desc", payload.desc);
		if (payload.difficulty) {
			formData.append("difficulty", payload.difficulty);
		}
		if (payload.baseScoreMax !== undefined) {
			formData.append("baseScoreMax", String(payload.baseScoreMax));
		}
		if (payload.difficultyMultiplier !== undefined) {
			formData.append(
				"difficultyMultiplier",
				String(payload.difficultyMultiplier),
			);
		}
		if (payload.passingThreshold !== undefined) {
			formData.append("passingThreshold", String(payload.passingThreshold));
		}
		if (payload.featuredViewWeight !== undefined) {
			formData.append("featuredViewWeight", String(payload.featuredViewWeight));
		}
		if (payload.featuredLikeWeight !== undefined) {
			formData.append("featuredLikeWeight", String(payload.featuredLikeWeight));
		}
		if (payload.featuredManualBoost !== undefined) {
			formData.append(
				"featuredManualBoost",
				String(payload.featuredManualBoost),
			);
		}
		if (payload.categoryId !== undefined) {
			formData.append("categoryId", String(payload.categoryId));
		}
		if (payload.thumbnailUrl) {
			formData.append("thumbnailUrl", payload.thumbnailUrl);
		}
		if (payload.thumbnail) {
			formData.append("thumbnail", payload.thumbnail);
		}

		return api.post(ADMIN_GAMES_ENDPOINT, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	updateGame: (
		id: number,
		payload: UpdateGamePayload,
	): Promise<AxiosResponse<ApiResponse<AdminGameDto>>> => {
		const formData = new FormData();
		if (payload.file) {
			formData.append("file", payload.file);
		}
		formData.append("title", payload.title);
		formData.append("desc", payload.desc);
		if (payload.difficulty) {
			formData.append("difficulty", payload.difficulty);
		}
		if (payload.baseScoreMax !== undefined) {
			formData.append("baseScoreMax", String(payload.baseScoreMax));
		}
		if (payload.difficultyMultiplier !== undefined) {
			formData.append(
				"difficultyMultiplier",
				String(payload.difficultyMultiplier),
			);
		}
		if (payload.passingThreshold !== undefined) {
			formData.append("passingThreshold", String(payload.passingThreshold));
		}
		if (payload.featuredViewWeight !== undefined) {
			formData.append("featuredViewWeight", String(payload.featuredViewWeight));
		}
		if (payload.featuredLikeWeight !== undefined) {
			formData.append("featuredLikeWeight", String(payload.featuredLikeWeight));
		}
		if (payload.featuredManualBoost !== undefined) {
			formData.append(
				"featuredManualBoost",
				String(payload.featuredManualBoost),
			);
		}
		if (payload.categoryId !== undefined) {
			formData.append("categoryId", String(payload.categoryId));
		}
		if (payload.thumbnailUrl) {
			formData.append("thumbnailUrl", payload.thumbnailUrl);
		}
		if (payload.thumbnail) {
			formData.append("thumbnail", payload.thumbnail);
		}

		return api.put(`${ADMIN_GAMES_ENDPOINT}/${id}`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	deleteGame: (id: number): Promise<AxiosResponse<ApiResponse<void>>> => {
		return api.delete(`${ADMIN_GAMES_ENDPOINT}/${id}`);
	},

	approveGame: (
		id: number,
	): Promise<AxiosResponse<ApiResponse<AdminGameDto>>> => {
		return api.post(`${ADMIN_GAMES_ENDPOINT}/${id}/approve`);
	},

	rejectGame: (
		id: number,
	): Promise<AxiosResponse<ApiResponse<AdminGameDto>>> => {
		return api.post(`${ADMIN_GAMES_ENDPOINT}/${id}/reject`);
	},
};

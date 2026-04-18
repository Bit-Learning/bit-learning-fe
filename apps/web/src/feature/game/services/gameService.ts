import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";

export interface GameCategory {
	id: number;
	name: string;
	description: string;
}

export interface Game {
	id: number;
	title: string;
	description: string;
	playUrl: string;
	minioObjectName: string;
	gameType?: "QUIZ" | "TYPING" | "MATCHING" | "OTHER";
	scoringModel?: "FINITE_SCORE" | "HIGH_SCORE" | "NO_SCORE";
	isScored?: boolean;
	trackingConfig?: string | null;
	instructions?: string;
	dateAdded?: string;
	likes?: number;
	views?: number;
	thumbnailUrl?: string;
	thumbnailFullUrl?: string;
	status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
	scoringBaseScoreMax?: number;
	scoringDifficultyMultiplier?: number;
	scoringPassingThreshold?: number;
	category: GameCategory;
	createdBy?: string;
}

export interface GamePreview {
	id: number;
	title: string;
	description: string;
	thumbnailUrl?: string;
	likes?: number;
	views?: number;
	trendScore?: number;
}

export type FeaturedReason =
	| "MANUAL_BOOST"
	| "TOP_LIKED"
	| "TOP_VIEWED"
	| "TRENDING";

export interface FeaturedGame extends GamePreview {
	featuredReason?: FeaturedReason | null;
	categoryName?: string | null;
	categoryDescription?: string | null;
}

export interface GameCategoryWithGames {
	id: number;
	name: string;
	description: string;
	games?: GamePreview[];
}

export interface Comment {
	id: number;
	gameId: number;
	username: string;
	content: string;
	datePosted: string;
	parentCommentId?: number;
	avatar?: string | null;
	author?: {
		id?: number;
		username?: string;
		email?: string;
		firstName?: string;
		lastName?: string;
		avatar?: string | null;
	} | null;
}

export interface CommentRequest {
	gameId: number;
	username: string;
	content: string;
	parentCommentId?: number | null;
}

export interface LikeResponse {
	success: boolean;
	message: string;
	totalLikes: number;
	isLiked: boolean;
}

export interface LeaderboardEntry {
	userId: number;
	username: string;
	avatar: string | null;
	totalScore: number;
	gamesPlayed: number;
	totalAttempts: number;
}

export interface GameAttemptRequest {
	attemptType?: string;
	scoringModel?: "FINITE_SCORE" | "HIGH_SCORE" | "NO_SCORE";
	attemptState?: "PARTIAL" | "COMPLETED";
	scoreVisibility?: string;
	rawScore?: number;
	maxRawScore?: number;
	duration?: number;
	completed: boolean;
	metricsVersion?: number;
	resultMetrics?: Record<string, unknown>;
}

export interface GameAttemptResponse {
	gameId: number;
	attemptId?: number;
	scoringModel?: "FINITE_SCORE" | "HIGH_SCORE" | "NO_SCORE";
	attemptState?: "PARTIAL" | "COMPLETED";
	isScored?: boolean;
	rawScore: number;
	maxRawScore: number | null;
	normalizedScore: number | null;
	leaderboardPoints: number;
	duration: number;
	completed: boolean;
	bestAttempt: boolean;
}

export interface Page<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
	first: boolean;
	last: boolean;
}

const gameService = {
	// Get all games
	getAllGames: async (): Promise<Game[]> => {
		const response = await api.get<ApiResponse<Game[]>>("/games");
		return (response.data.data ?? []) as Game[];
	},

	// Get game by ID (increments view count)
	getGameById: async (id: number): Promise<Game> => {
		const response = await api.get<ApiResponse<Game>>(`/games/${id}`);
		return response.data.data as Game;
	},

	// Upload a new game
	uploadGame: async (formData: FormData): Promise<Game> => {
		const response = await api.post<Game>("/games/upload", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	// Update game (Admin only)
	updateGame: async (id: number, formData: FormData): Promise<Game> => {
		const response = await api.put<Game>(`/games/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},

	// Delete game (Admin only)
	deleteGame: async (id: number, username: string): Promise<void> => {
		await api.delete(`/games/${id}`, {
			params: { username },
		});
	},

	// Track play activity
	trackPlay: async (
		gameId: number,
		userId: string,
		score = 0,
		duration = 0,
	): Promise<void> => {
		await api.post(`/games/${gameId}/play`, null, {
			params: { userId, score, duration },
		});
	},

	// Like/Unlike a game (toggle)
	toggleLike: async (
		gameId: number,
		username: string,
	): Promise<LikeResponse> => {
		const response = await api.post<ApiResponse<LikeResponse>>(
			`/games/${gameId}/like`,
			null,
			{ params: { username } },
		);
		return response.data.data as LikeResponse;
	},

	// Check if user has liked a game
	checkLikeStatus: async (
		gameId: number,
		username: string,
	): Promise<boolean> => {
		const response = await api.get<ApiResponse<boolean>>(
			`/games/${gameId}/like/status`,
			{
				params: { username },
			},
		);
		return response.data.data as boolean;
	},

	// Get comments for a game
	getComments: async (gameId: number): Promise<Comment[]> => {
		const response = await api.get<ApiResponse<Comment[]>>(
			`/games/${gameId}/comments`,
		);
		return response.data.data ?? [];
	},

	// Add a comment or reply
	addComment: async (request: CommentRequest): Promise<Comment> => {
		const response = await api.post<ApiResponse<Comment>>(
			`/games/${request.gameId}/comments`,
			request,
		);
		return response.data.data as Comment;
	},

	// Get game categories with games (Netflix style)
	getCategoriesWithGames: async (): Promise<GameCategoryWithGames[]> => {
		const response = await api.get<ApiResponse<GameCategoryWithGames[]>>(
			"/games/game-categories",
		);
		return response.data.data ?? [];
	},

	getFeaturedGames: async (limit = 5): Promise<FeaturedGame[]> => {
		const response = await api.get<ApiResponse<FeaturedGame[]>>(
			"/games/featured",
			{
				params: { limit },
			},
		);
		return response.data.data ?? [];
	},

	getLeaderboard: async (
		page = 0,
		size = 10,
	): Promise<Page<LeaderboardEntry>> => {
		const response = await api.get<ApiResponse<Page<LeaderboardEntry>>>(
			"/games/leaderboard",
			{
				params: { page, size },
			},
		);
		return response.data.data as Page<LeaderboardEntry>;
	},

	// Record score for authenticated user (no game entity required)
	recordScore: async (
		gameId: number,
		score = 0,
		duration = 0,
	): Promise<void> => {
		await api.post("/games/record-score", null, {
			params: { gameId, score, duration },
		});
	},

	submitAttempt: async (
		gameId: number,
		payload: GameAttemptRequest,
	): Promise<GameAttemptResponse> => {
		const response = await api.post<ApiResponse<GameAttemptResponse>>(
			`/games/${gameId}/attempts`,
			payload,
		);
		return response.data.data as GameAttemptResponse;
	},
};

export default gameService;

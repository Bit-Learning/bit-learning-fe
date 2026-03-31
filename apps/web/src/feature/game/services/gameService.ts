import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";

export interface GameCategory {
	id: number;
	name: string;
	description: string;
	games?: Game[];
}

export interface Game {
	id: number;
	title: string;
	description: string;
	playUrl: string;
	minioObjectName: string;
	instructions?: string;
	dateAdded?: string;
	likes?: number;
	views?: number;
	thumbnailUrl?: string;
	thumbnailFullUrl?: string;
	status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
	category: GameCategory;
	createdBy?: string;
}

export interface Comment {
	id: number;
	gameId: number;
	username: string;
	content: string;
	datePosted: string;
	parentCommentId?: number;
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

	// Get all categories
	getAllCategories: async (): Promise<GameCategory[]> => {
		const response =
			await api.get<ApiResponse<GameCategory[]>>("/games-categories");
		return (response.data.data ?? []) as GameCategory[];
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
		score: number = 0,
		duration: number = 0,
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
		const response = await api.post<LikeResponse>(
			`/games/${gameId}/like`,
			null,
			{ params: { username } },
		);
		return response.data;
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
		const response = await api.post<Comment>(
			`/games/${request.gameId}/comments`,
			request,
		);
		return response.data;
	},

	// Get game categories with games (Netflix style)
	getCategoriesWithGames: async (): Promise<GameCategory[]> => {
		const response = await api.get<ApiResponse<GameCategory[]>>(
			"/games/game-categories",
		);
		return response.data.data ?? [];
	},

	getLeaderboard: async (
		page: number = 0,
		size: number = 10,
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
		score: number = 0,
		duration: number = 0,
	): Promise<void> => {
		await api.post("/games/record-score", null, {
			params: { score, duration },
		});
	},
};

export default gameService;

import api from "@/shared/api/api";

export type UserPlayHistoryItem = {
	id: number;
	gameId: number;
	gameTitle: string;
	gameThumbnail: string | null;
	playedAt: string;
	score: number | null;
	rawScore: number | null;
	maxScore: number | null;
	normalizedScore: number | null;
	leaderboardPoints: number | null;
	duration: number | null;
	completed: boolean | null;
	attemptState: string | null;
	accuracy: number | null;
	grade: number | null;
	topicName: string | null;
	questionSetTitle: string | null;
};

export type UserPlayHistoryResponse = {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	content: UserPlayHistoryItem[];
};

export type UserPlayHistoryParams = {
	userId: number;
	page?: number;
	size?: number;
	sortBy?: string;
	sortDirection?: "ASC" | "DESC";
};

export async function getUserPlayHistory(params: UserPlayHistoryParams) {
	const queryParams = new URLSearchParams();
	queryParams.append("page", String(params.page ?? 0));
	queryParams.append("size", String(params.size ?? 10));
	queryParams.append("sortBy", params.sortBy ?? "playedAt");
	queryParams.append("sortDirection", params.sortDirection ?? "DESC");

	const response = await api.get<UserPlayHistoryResponse>(
		`/students/${params.userId}/play-history?${queryParams.toString()}`,
	);

	return response.data;
}

import api from "@/shared/api/api";
import type { GameData, TopicCode } from "@/feature/game/data";
import type { ApiResponse } from "@/shared/api/api.type";

export interface MatchingGameLinkTarget {
	grade: number;
	topicCode: TopicCode;
}

export interface CurriculumMapping extends MatchingGameLinkTarget {
	gameId: number;
	gameTitle: string;
}

const matchingGameService = {
	getGame: async ({
		gameId,
		grade,
		topic,
	}: {
		gameId?: number;
		grade?: number;
		topic?: TopicCode;
	}): Promise<GameData> => {
		const response = await api.get<ApiResponse<GameData>>("/matching/game", {
			params: {
				...(gameId !== undefined ? { gameId } : {}),
				...(grade !== undefined ? { grade } : {}),
				...(topic ? { topic } : {}),
			},
		});
		return response.data.data as GameData;
	},

	getCurriculumMappings: async (): Promise<CurriculumMapping[]> => {
		const response = await api.get<ApiResponse<CurriculumMapping[]>>(
			"/matching/curriculum/mappings",
		);
		return (response.data.data ?? []) as CurriculumMapping[];
	},
};

export default matchingGameService;

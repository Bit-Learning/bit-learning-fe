import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";

export interface StaticGameSummaryResponse {
	gameId: number;
	title: string;
	thumbnailUrl: string | null;
	gameType: string;
	chapterId: number | null;
	chapterName: string | null;
	displayOrder: number;
}

const curriculumLinkService = {
	getGamesBySubject: async (
		subjectId: number,
	): Promise<StaticGameSummaryResponse[]> => {
		const response = await api.get<ApiResponse<StaticGameSummaryResponse[]>>(
			`/games/by-subject/${subjectId}`,
		);
		return (response.data.data ?? []) as StaticGameSummaryResponse[];
	},
};

export default curriculumLinkService;

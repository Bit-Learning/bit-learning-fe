import api from "@/shared/api/api";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "@/shared/api/api.type";

const ADMIN_GAMES_ENDPOINT = "/admin/games";

export interface CurriculumLinkResponse {
	linkId: number;
	subjectId: number;
	subjectName: string;
	classLevel: number;
	curriculumId: number;
	curriculumName: string;
	curriculumCode: string;
	chapterId: number | null;
	chapterName: string | null;
	displayOrder: number;
}

export interface CreateCurriculumLinkRequest {
	subjectId: number;
	chapterId?: number | null;
	displayOrder?: number;
}

export const curriculumLinkApi = {
	getLinks: (
		gameId: number,
	): Promise<AxiosResponse<ApiResponse<CurriculumLinkResponse[]>>> => {
		return api.get(`${ADMIN_GAMES_ENDPOINT}/${gameId}/curriculum-links`);
	},

	createLink: (
		gameId: number,
		payload: CreateCurriculumLinkRequest,
	): Promise<AxiosResponse<ApiResponse<CurriculumLinkResponse>>> => {
		return api.post(
			`${ADMIN_GAMES_ENDPOINT}/${gameId}/curriculum-links`,
			payload,
		);
	},

	deleteLink: (
		gameId: number,
		linkId: number,
	): Promise<AxiosResponse<ApiResponse<void>>> => {
		return api.delete(
			`${ADMIN_GAMES_ENDPOINT}/${gameId}/curriculum-links/${linkId}`,
		);
	},
};

import api from "@/shared/api/api";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "@/shared/api/api.type";

const MATCHING_ADMIN_BASE = "/matching/admin";
const MATCHING_PUBLIC_BASE = "/matching";

export type MatchingGameStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

// ─── DTOs mirroring the backend ────────────────────────────────────────────

export interface MatchingItemDto {
	type: "text" | "image" | "audio";
	value: string;
	alt?: string;
}

export interface MatchingPairDto {
	id?: string;
	left: MatchingItemDto;
	right: MatchingItemDto;
	hint?: string;
}

export interface MatchingStageConfigDto {
	shuffle?: boolean;
	timeLimit?: number | null;
	maxMistakes?: number | null;
	showHints?: boolean;
	/** "match" | "media-quiz"  (frontend representation of MATCH / MEDIA_QUIZ) */
	layoutType?: string;
}

export interface MatchingStageDto {
	id?: string;
	title: string;
	description?: string;
	config?: MatchingStageConfigDto;
	pairs: MatchingPairDto[];
}

export interface MatchingMetaDto {
	gameId?: number;
	grade?: number;
	topicCode?: string;
	title: string;
	description?: string;
	version?: string;
	language?: string;
	thumbnailUrl?: string;
	baseScoreMax?: number;
	difficultyMultiplier?: number;
	passingThreshold?: number;
	// Curriculum context returned by backend
	subjectId?: number | null;
	chapterId?: number | null;
	curriculumId?: number | null;
	curriculumName?: string | null;
	curriculumCode?: string | null;
}

export interface MatchingGameFullDto {
	status?: MatchingGameStatus;
	meta: MatchingMetaDto;
	stages: MatchingStageDto[];
}

export interface MatchingUpsertRequest {
	grade: number;
	topicCode: string;
	meta: MatchingMetaDto;
	stages: MatchingStageDto[];
	subjectId?: number | null;
	chapterId?: number | null;
}

export interface CurriculumMappingDto {
	grade: number;
	topicCode: string;
	gameId: number;
	gameTitle: string;
	status?: MatchingGameStatus;
}

// ─── API ───────────────────────────────────────────────────────────────────

export const adminMatchingGameApi = {
	/** List all curriculum ↔ game mappings (public endpoint) */
	listMappings: (): Promise<
		AxiosResponse<ApiResponse<CurriculumMappingDto[]>>
	> => api.get(`${MATCHING_PUBLIC_BASE}/curriculum/mappings`),

	/** Get full matching-game data for a given grade + topic (public endpoint) */
	getGame: ({
		gameId,
		grade,
		topicCode,
	}: {
		gameId?: number;
		grade?: number;
		topicCode?: string;
	}): Promise<AxiosResponse<ApiResponse<MatchingGameFullDto>>> =>
		api.get(`${MATCHING_PUBLIC_BASE}/game`, {
			params: {
				...(gameId !== undefined ? { gameId } : {}),
				...(grade !== undefined ? { grade } : {}),
				...(topicCode ? { topic: topicCode } : {}),
			},
		}),

	/** Admin: create or update a matching game */
	upsertGame: (
		request: MatchingUpsertRequest,
	): Promise<AxiosResponse<ApiResponse<MatchingGameFullDto>>> =>
		api.post(`${MATCHING_ADMIN_BASE}/upsert`, request),

	/** Admin: delete matching game by curriculum slot */
	deleteGame: (gameId: number): Promise<AxiosResponse<ApiResponse<void>>> =>
		api.delete(MATCHING_ADMIN_BASE, { params: { gameId } }),
	/** Admin: upload image or audio media for matching game pair items */
	uploadMedia: (file: File): Promise<AxiosResponse<ApiResponse<string>>> => {
		const formData = new FormData();
		formData.append("file", file);
		return api.post(`${MATCHING_ADMIN_BASE}/upload-media`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},
};

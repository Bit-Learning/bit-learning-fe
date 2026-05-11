import api from "@/shared/api/api";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "@/shared/api/api.type";

const ENDPOINT = "/admin/kids-blockly";

export type Direction = "N" | "E" | "S" | "W";

export type BlockType =
	| "move"
	| "left"
	| "right"
	| "back"
	| "turnAround"
	| "jump"
	| "repeat";

export interface Position {
	x: number;
	y: number;
}

export interface CharacterState extends Position {
	dir: Direction;
}

export interface KidsBlocklyLevel {
	id: string;
	order: number;
	title: string;
	subtitle: string;
	gridSize: { rows: number; cols: number };
	start: CharacterState;
	goal: Position;
	obstacles: Position[];
	allowedBlocks: BlockType[];
	hint: string;
	par: number;
	isPublished: boolean;
}

export interface KidsBlocklyPagedParams {
	page?: number;
	size?: number;
	isPublished?: boolean;
}

export interface CreateKidsBlocklyLevelRequest {
	id?: string;
	order: number;
	title: string;
	subtitle: string;
	gridSize: { rows: number; cols: number };
	start: CharacterState;
	goal: Position;
	obstacles: Position[];
	allowedBlocks: BlockType[];
	hint: string;
	par: number;
	isPublished: boolean;
}

export interface UpdateKidsBlocklyLevelRequest {
	order?: number;
	title?: string;
	subtitle?: string;
	gridSize?: { rows: number; cols: number };
	start?: CharacterState;
	goal?: Position;
	obstacles?: Position[];
	allowedBlocks?: BlockType[];
	hint?: string;
	par?: number;
	isPublished?: boolean;
}

export interface PublishKidsBlocklyLevelRequest {
	isPublished: boolean;
}

export const kidsBlocklyApi = {
	getLevels: (
		params: KidsBlocklyPagedParams = {},
	): Promise<AxiosResponse<ApiResponse<KidsBlocklyLevel[]>>> => {
		const { page = 0, size = 10, isPublished } = params;
		const query = new URLSearchParams();
		query.append("page", String(page));
		query.append("size", String(size));
		query.append("sort", "displayOrder,asc");
		if (isPublished !== undefined)
			query.append("isPublished", String(isPublished));
		return api.get(`${ENDPOINT}/levels?${query.toString()}`);
	},

	getLevel: (
		levelId: string,
	): Promise<AxiosResponse<ApiResponse<KidsBlocklyLevel>>> => {
		return api.get(`${ENDPOINT}/levels/${levelId}`);
	},

	createLevel: (
		payload: CreateKidsBlocklyLevelRequest,
	): Promise<AxiosResponse<ApiResponse<KidsBlocklyLevel>>> => {
		return api.post(`${ENDPOINT}/levels`, payload);
	},

	updateLevel: (
		levelId: string,
		payload: UpdateKidsBlocklyLevelRequest,
	): Promise<AxiosResponse<ApiResponse<KidsBlocklyLevel>>> => {
		return api.put(`${ENDPOINT}/levels/${levelId}`, payload);
	},

	publishLevel: (
		levelId: string,
		payload: PublishKidsBlocklyLevelRequest,
	): Promise<AxiosResponse<ApiResponse<KidsBlocklyLevel>>> => {
		return api.patch(`${ENDPOINT}/levels/${levelId}/publish`, payload);
	},
};

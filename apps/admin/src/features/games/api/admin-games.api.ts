import api from "@/shared/api/api";
import type { AxiosResponse } from "axios";

export interface ApiResponse<T> {
	data: T;
	message: string;
	status: number;
}

export interface ExcelImportResult {
	success: boolean;
	message: string;
	totalRows: number;
	successCount: number;
	failureCount: number;
	errors: string[];
	createdGameIds: number[];
}

export interface GameImportPreviewItem {
	title: string;
	thumbnailUrl?: string;
	topic?: string;
	description?: string;
	difficulty?: string;
	lessonId?: number;
	courseId?: number;
	status?: string;
}

const ADMIN_GAMES_ENDPOINT = "/admin/games";

export const adminGamesApi = {
	/** Download Excel template for game import */
	downloadTemplate: (): Promise<AxiosResponse<ArrayBuffer>> => {
		return api.get(`${ADMIN_GAMES_ENDPOINT}/excel/template`, {
			responseType: "arraybuffer",
		});
	},

	/** Export all games to Excel (optionally filtered by status) */
	exportGames: (status?: string): Promise<AxiosResponse<ArrayBuffer>> => {
		const params = status ? `?status=${encodeURIComponent(status)}` : "";
		return api.get(`${ADMIN_GAMES_ENDPOINT}/excel/export${params}`, {
			responseType: "arraybuffer",
		});
	},

	/** Import games from an Excel file */
	importGames: (
		file: File,
	): Promise<AxiosResponse<ApiResponse<ExcelImportResult>>> => {
		const formData = new FormData();
		formData.append("file", file);
		return api.post(`${ADMIN_GAMES_ENDPOINT}/excel/import`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	/** Preview games from an Excel file without persisting */
	previewImport: (
		file: File,
	): Promise<AxiosResponse<ApiResponse<GameImportPreviewItem[]>>> => {
		const formData = new FormData();
		formData.append("file", file);
		return api.post(`${ADMIN_GAMES_ENDPOINT}/excel/preview`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},
};

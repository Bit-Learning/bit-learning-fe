import { useMutation } from "@tanstack/react-query";
import {
	adminGamesApi,
	type ExcelImportResult,
	type GameImportPreviewItem,
} from "../api/admin-games.api";

export const ADMIN_GAMES_KEYS = {
	excel: ["admin-games", "excel"] as const,
};

export const useDownloadGameTemplate = () => {
	return useMutation({
		mutationFn: adminGamesApi.downloadTemplate,
	});
};

export const useExportGamesExcel = () => {
	return useMutation({
		mutationFn: (status?: string) => adminGamesApi.exportGames(status),
	});
};

export const useImportGamesExcel = () => {
	return useMutation({
		mutationFn: async (file: File) => {
			const response = await adminGamesApi.importGames(file);
			return response.data.data as ExcelImportResult;
		},
	});
};

export const usePreviewImportGamesExcel = () => {
	return useMutation({
		mutationFn: async (file: File) => {
			const response = await adminGamesApi.previewImport(file);
			return (response.data.data ?? []) as GameImportPreviewItem[];
		},
	});
};

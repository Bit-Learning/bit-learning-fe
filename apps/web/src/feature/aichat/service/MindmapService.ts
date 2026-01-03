import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "../type";

export interface MindmapGenerationRequest {
	topic: string;
	grade: number;
	maxDepth: number;
	maxBranches: number;
	includeExamples: boolean;
	collectionName: string;
}

export interface MindmapResponse {
	id: number;
	data: string;
	title: string;
	userId: number;
	code: string;
	createdAt: string;
}

export interface MindmapHistoryResponse {
	id: number;
	title: string;
	userId: number;
	code: string;
	createdAt: string;
}

export const MindmapService = {
	generateMindmap: (
		request: MindmapGenerationRequest,
	): Promise<AxiosResponse<ApiResponse<MindmapResponse>>> => {
		return api.post("/products/mindmaps/data", request);
	},

	getMindmapHistory: (
		userId: number,
	): Promise<AxiosResponse<ApiResponse<MindmapHistoryResponse[]>>> => {
		return api.get(`/products/mindmaps?userId=${userId}`);
	},

	downloadFromUrl: async (url: string, filename: string): Promise<void> => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error("Download failed:", error);
			throw error;
		}
	},
};

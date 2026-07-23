import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { TChapterRequest, TChapterResponse } from "../types/chapter.type";

export const chapterApi = {
	create(
		data: TChapterRequest,
	): Promise<AxiosResponse<ApiResponse<TChapterResponse>>> {
		return api.post("/chapters", data);
	},

	update(
		id: number,
		data: TChapterRequest,
	): Promise<AxiosResponse<ApiResponse<TChapterResponse>>> {
		return api.put(`/chapters/${id}`, data);
	},

	getById(id: number): Promise<AxiosResponse<ApiResponse<TChapterResponse>>> {
		return api.get(`/chapters/${id}`);
	},

	getBySubject(
		subjectId: number,
	): Promise<AxiosResponse<ApiResponse<TChapterResponse[]>>> {
		return api.get(`/chapters/subject/${subjectId}`);
	},

	getAll(params?: {
		page?: number;
		size?: number;
		sort?: string;
	}): Promise<AxiosResponse<ApiResponse<TChapterResponse[]>>> {
		return api.get("/chapters", { params });
	},

	delete(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/chapters/${id}`);
	},
};

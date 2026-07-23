import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { TLessonRequest, TLessonResponse } from "../types/lesson.type";

export const lessonApi = {
	create(
		data: TLessonRequest,
	): Promise<AxiosResponse<ApiResponse<TLessonResponse>>> {
		return api.post("/lessons", data);
	},

	update(
		id: number,
		data: TLessonRequest,
	): Promise<AxiosResponse<ApiResponse<TLessonResponse>>> {
		return api.put(`/lessons/${id}`, data);
	},

	getById(id: number): Promise<AxiosResponse<ApiResponse<TLessonResponse>>> {
		return api.get(`/lessons/${id}`);
	},

	getByChapter(
		chapterId: number,
	): Promise<AxiosResponse<ApiResponse<TLessonResponse[]>>> {
		return api.get(`/lessons/chapter/${chapterId}`);
	},

	getAll(params?: {
		page?: number;
		size?: number;
		sort?: string;
	}): Promise<AxiosResponse<ApiResponse<TLessonResponse[]>>> {
		return api.get("/lessons", { params });
	},

	delete(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/lessons/${id}`);
	},
};

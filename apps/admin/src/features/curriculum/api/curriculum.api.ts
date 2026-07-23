import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	TCurriculumRequest,
	TCurriculumResponse,
} from "../types/curriculum.type";

export const curriculumApi = {
	create(
		data: TCurriculumRequest,
	): Promise<AxiosResponse<ApiResponse<TCurriculumResponse>>> {
		return api.post("/curriculums", data);
	},

	update(
		id: number,
		data: TCurriculumRequest,
	): Promise<AxiosResponse<ApiResponse<TCurriculumResponse>>> {
		return api.put(`/curriculums/${id}`, data);
	},

	getById(
		id: number,
	): Promise<AxiosResponse<ApiResponse<TCurriculumResponse>>> {
		return api.get(`/curriculums/${id}`);
	},

	getByCode(
		code: string,
	): Promise<AxiosResponse<ApiResponse<TCurriculumResponse>>> {
		return api.get(`/curriculums/code/${code}`);
	},

	getAll(params?: {
		page?: number;
		size?: number;
		sort?: string;
	}): Promise<AxiosResponse<ApiResponse<TCurriculumResponse[]>>> {
		return api.get("/curriculums", { params });
	},

	getAllList(): Promise<AxiosResponse<ApiResponse<TCurriculumResponse[]>>> {
		return api.get("/curriculums/all");
	},

	delete(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/curriculums/${id}`);
	},
};

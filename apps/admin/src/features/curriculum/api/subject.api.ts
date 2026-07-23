import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { TSubjectRequest, TSubjectResponse } from "../types/subject.type";

export const subjectApi = {
	create(
		data: TSubjectRequest,
	): Promise<AxiosResponse<ApiResponse<TSubjectResponse>>> {
		return api.post("/subjects", data);
	},

	update(
		id: number,
		data: TSubjectRequest,
	): Promise<AxiosResponse<ApiResponse<TSubjectResponse>>> {
		return api.put(`/subjects/${id}`, data);
	},

	getById(id: number): Promise<AxiosResponse<ApiResponse<TSubjectResponse>>> {
		return api.get(`/subjects/${id}`);
	},

	getAll(params?: {
		page?: number;
		size?: number;
		sort?: string;
	}): Promise<AxiosResponse<ApiResponse<TSubjectResponse[]>>> {
		return api.get("/subjects", { params });
	},

	getAllList(): Promise<AxiosResponse<ApiResponse<TSubjectResponse[]>>> {
		return api.get("/subjects/all");
	},

	delete(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/subjects/${id}`);
	},
};

import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { endpoints } from "@/shared/constants/endpoints";
import type {
	CreateSectionRequest,
	UpdateSectionRequest,
} from "../types/msection.api";

export const msectionApi = {
	createSection(
		data: CreateSectionRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(endpoints.SECTIONS, data);
	},

	updateSection(
		id: number,
		data: UpdateSectionRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.patch(`${endpoints.SECTIONS}/${id}`, data);
	},

	deleteSection(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`${endpoints.SECTIONS}/${id}/force`);
	},

	hideOrShowSection(
		id: number,
		isHidden: boolean,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`${endpoints.SECTIONS}/${id}`, {
			params: { isHidden },
		});
	},
};

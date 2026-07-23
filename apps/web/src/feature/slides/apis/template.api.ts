import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { TemplateListParams, TemplateResponse } from "../types/template.type";

export const templateApi = {
	getTemplates(
		params?: TemplateListParams,
	): Promise<AxiosResponse<ApiResponse<TemplateResponse[]>>> {
		return api.get("/slides/templates", { params });
	},

	getTemplateById(
		id: number,
	): Promise<AxiosResponse<ApiResponse<TemplateResponse>>> {
		return api.get(`/slides/templates/${id}`);
	},
};

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

	createTemplate(data: {
		name: string;
		description?: string;
		templateFile: File;
		thumbnailFile?: File;
	}): Promise<AxiosResponse<ApiResponse<TemplateResponse>>> {
		const formData = new FormData();
		formData.append("name", data.name);
		if (data.description) formData.append("description", data.description);
		formData.append("templateFile", data.templateFile);
		if (data.thumbnailFile)
			formData.append("thumbnailFile", data.thumbnailFile);

		return api.post("/slides/templates", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	updateTemplate(
		id: number,
		data: {
			name?: string;
			description?: string;
			templateFile?: File;
			thumbnailFile?: File;
		},
	): Promise<AxiosResponse<ApiResponse<TemplateResponse>>> {
		const formData = new FormData();
		if (data.name) formData.append("name", data.name);
		if (data.description) formData.append("description", data.description);
		if (data.templateFile) formData.append("templateFile", data.templateFile);
		if (data.thumbnailFile)
			formData.append("thumbnailFile", data.thumbnailFile);

		return api.put(`/slides/templates/${id}`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	deleteTemplate(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/slides/templates/${id}`);
	},
};

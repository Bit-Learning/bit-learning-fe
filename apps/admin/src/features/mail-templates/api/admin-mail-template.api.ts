import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	AdminMailTemplateContent,
	AdminMailTemplateDetail,
	AdminMailTemplateDraftUpsertRequest,
	AdminMailTemplatePreviewRequest,
	AdminMailTemplateSummary,
} from "../types/admin-mail-template.types";

export async function listAdminMailTemplates(): Promise<
	AdminMailTemplateSummary[]
> {
	const response = await api.get<ApiResponse<AdminMailTemplateSummary[]>>(
		"/admin/mail-templates",
	);
	return response.data.data ?? [];
}

export async function getAdminMailTemplate(
	key: string,
): Promise<AdminMailTemplateDetail> {
	const response = await api.get<ApiResponse<AdminMailTemplateDetail>>(
		`/admin/mail-templates/${key}`,
	);
	return response.data.data as AdminMailTemplateDetail;
}

export async function getAdminMailTemplateContent(
	key: string,
): Promise<AdminMailTemplateContent> {
	const response = await api.get<ApiResponse<AdminMailTemplateContent>>(
		`/admin/mail-templates/${key}/content`,
	);
	return response.data.data as AdminMailTemplateContent;
}

export async function upsertAdminMailTemplateDraft(
	key: string,
	payload: AdminMailTemplateDraftUpsertRequest,
): Promise<AdminMailTemplateDetail> {
	const response = await api.put<ApiResponse<AdminMailTemplateDetail>>(
		`/admin/mail-templates/${key}/draft`,
		payload,
	);
	return response.data.data as AdminMailTemplateDetail;
}

export async function publishAdminMailTemplate(
	key: string,
): Promise<AdminMailTemplateDetail> {
	const response = await api.post<ApiResponse<AdminMailTemplateDetail>>(
		`/admin/mail-templates/${key}/publish`,
	);
	return response.data.data as AdminMailTemplateDetail;
}

export async function migrateAdminMailTemplateFromClasspath(
	key: string,
): Promise<AdminMailTemplateDetail> {
	const response = await api.post<ApiResponse<AdminMailTemplateDetail>>(
		`/admin/mail-templates/${key}/migrate-from-classpath`,
	);
	return response.data.data as AdminMailTemplateDetail;
}

export async function previewAdminMailTemplate(
	key: string,
	payload: AdminMailTemplatePreviewRequest,
): Promise<string> {
	const response = await api.post<string>(
		`/admin/mail-templates/${key}/preview`,
		payload,
		{
			responseType: "text",
			headers: {
				Accept: "text/html",
				"Content-Type": "application/json",
			},
		},
	);
	return response.data;
}

import { useQuery } from "@tanstack/react-query";
import { templateApi } from "../apis/template.api";
import type { TemplateListParams } from "../types/template.type";

export const templateQueryKeys = {
	all: ["templates"] as const,
	lists: () => [...templateQueryKeys.all, "list"] as const,
	list: (params?: TemplateListParams) =>
		[...templateQueryKeys.lists(), params] as const,
	details: () => [...templateQueryKeys.all, "detail"] as const,
	detail: (id: number) => [...templateQueryKeys.details(), id] as const,
};

export const useTemplates = (params?: TemplateListParams) => {
	return useQuery({
		queryKey: templateQueryKeys.list(params),
		queryFn: async () => {
			const response = await templateApi.getTemplates(params);
			return response.data;
		},
	});
};

export const useTemplate = (id: number, enabled = true) => {
	return useQuery({
		queryKey: templateQueryKeys.detail(id),
		queryFn: async () => {
			const response = await templateApi.getTemplateById(id);
			return response.data;
		},
		enabled,
	});
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { templateApi } from "../api/template.api";
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

export const useCreateTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: templateApi.createTemplate,
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: templateQueryKeys.lists() });
			toast.success("Tạo template thành công!", {
				description:
					response.data.message || "Template đã được tạo và lưu vào hệ thống.",
			});
		},
		onError: (error: any) => {
			toast.error("Tạo template thất bại!", {
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi tạo template.",
			});
		},
	});
};

export const useUpdateTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: Parameters<typeof templateApi.updateTemplate>[1];
		}) => templateApi.updateTemplate(id, data),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({ queryKey: templateQueryKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: templateQueryKeys.detail(variables.id),
			});
			toast.success("Cập nhật template thành công!", {
				description:
					response.data.message || "Thông tin template đã được cập nhật.",
			});
		},
		onError: (error: any) => {
			toast.error("Cập nhật template thất bại!", {
				description:
					error?.response?.data?.message ||
					"Đã xảy ra lỗi khi cập nhật template.",
			});
		},
	});
};

export const useDeleteTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: templateApi.deleteTemplate,
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: templateQueryKeys.lists() });
			toast.success("Xóa template thành công!", {
				description:
					response.data.message || "Template đã được xóa khỏi hệ thống.",
			});
		},
		onError: (error: any) => {
			toast.error("Xóa template thất bại!", {
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi xóa template.",
			});
		},
	});
};

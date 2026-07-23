import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateTagRequest, UpdateTagRequest } from "../types/tag.type";
import { tagApi } from "../apis/tap.api";

export const tagKeys = {
	all: ["coding-tags"] as const,
};

export const useGetAllTags = () => {
	return useQuery({
		queryKey: tagKeys.all,
		queryFn: async () => {
			const response = await tagApi.getAllTags();
			return response.data.data;
		},
		staleTime: 5 * 60 * 1000,
	});
};

export const useCreateTag = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTagRequest) => tagApi.createTag(data),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			toast.success("Tạo tag thành công", {
				description: `Tag "${response.data.data?.name}" đã được tạo.`,
			});
		},
		onError: (error: any) => {
			toast.error("Tạo tag thất bại", {
				description: error?.response?.data?.message || "Đã xảy ra lỗi.",
			});
		},
	});
};

export const useUpdateTag = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagRequest }) =>
			tagApi.updateTag(tagId, data),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			toast.success("Cập nhật tag thành công", {
				description: `Tag đã được đổi tên thành "${response.data.data?.name}".`,
			});
		},
		onError: (error: any) => {
			toast.error("Cập nhật tag thất bại", {
				description: error?.response?.data?.message || "Đã xảy ra lỗi.",
			});
		},
	});
};

export const useDeleteTag = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tagId: string) => tagApi.deleteTag(tagId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			toast.success("Xóa tag thành công");
		},
		onError: (error: any) => {
			toast.error("Xóa tag thất bại", {
				description:
					error?.response?.data?.message || "Tag có thể đang được sử dụng.",
			});
		},
	});
};

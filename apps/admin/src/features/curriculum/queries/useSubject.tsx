import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subjectApi } from "../api/subject.api";
import type { TSubjectRequest } from "../types/subject.type";

export const subjectKeys = {
	all: ["subjects"] as const,
	list: (page: number, size: number) =>
		["subjects", "list", page, size] as const,
	listAll: () => ["subjects", "listAll"] as const,
	detail: (id: number) => ["subjects", "detail", id] as const,
};

export const useSubjects = (page = 0, size = 10) => {
	return useQuery({
		queryKey: subjectKeys.list(page, size),
		queryFn: async () => {
			const response = await subjectApi.getAll({ page, size });
			return response.data;
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useSubjectsList = () => {
	return useQuery({
		queryKey: subjectKeys.listAll(),
		queryFn: async () => {
			const response = await subjectApi.getAllList();
			return response.data.data;
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useSubjectsWithChapters = () => {
	return useQuery({
		queryKey: [...subjectKeys.listAll(), "withChapters"],
		queryFn: async () => {
			const response = await subjectApi.getAllList();
			return response.data.data ?? [];
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useSubjectDetail = (id?: number) => {
	return useQuery({
		queryKey: subjectKeys.detail(id ?? 0),
		queryFn: async () => {
			if (!id) return null;
			const response = await subjectApi.getById(id);
			return response.data.data;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useCreateSubject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TSubjectRequest) => subjectApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subjectKeys.all });
			toast.success("Tạo môn học thành công");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Tạo môn học thất bại");
		},
	});
};

export const useUpdateSubject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: TSubjectRequest }) =>
			subjectApi.update(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: subjectKeys.all });
			queryClient.invalidateQueries({
				queryKey: subjectKeys.detail(variables.id),
			});
			toast.success("Cập nhật môn học thành công");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Cập nhật môn học thất bại",
			);
		},
	});
};

export const useDeleteSubject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => subjectApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subjectKeys.all });
			toast.success("Xóa môn học thành công");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Xóa môn học thất bại");
		},
	});
};

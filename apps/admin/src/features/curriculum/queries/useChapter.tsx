import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chapterApi } from "../api/chapter.api";
import type { TChapterRequest } from "../types/chapter.type";

export const chapterKeys = {
  all: ["chapters"] as const,
  list: (page: number, size: number) => ["chapters", "list", page, size] as const,
  bySubject: (subjectId: number) => ["chapters", "subject", subjectId] as const,
  detail: (id: number) => ["chapters", "detail", id] as const,
};

export const useChapters = (page = 0, size = 10) => {
  return useQuery({
    queryKey: chapterKeys.list(page, size),
    queryFn: async () => {
      const response = await chapterApi.getAll({ page, size });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useChaptersBySubject = (subjectId?: number) => {
  return useQuery({
    queryKey: chapterKeys.bySubject(subjectId ?? 0),
    queryFn: async () => {
      if (!subjectId) return null;
      const response = await chapterApi.getBySubject(subjectId);
      return response.data.data;
    },
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useChapterDetail = (id?: number) => {
  return useQuery({
    queryKey: chapterKeys.detail(id ?? 0),
    queryFn: async () => {
      if (!id) return null;
      const response = await chapterApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TChapterRequest) => chapterApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.all });
      queryClient.invalidateQueries({ queryKey: chapterKeys.bySubject(variables.subjectId) });
      toast.success("Tạo chương thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo chương thất bại");
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TChapterRequest }) => chapterApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.all });
      queryClient.invalidateQueries({ queryKey: chapterKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.bySubject(variables.data.subjectId) });
      toast.success("Cập nhật chương thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật chương thất bại");
    },
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chapterApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.all });
      toast.success("Xóa chương thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa chương thất bại");
    },
  });
};

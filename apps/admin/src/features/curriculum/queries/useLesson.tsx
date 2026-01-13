import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { lessonApi } from "../api/lesson.api";
import type { TLessonRequest } from "../types/lesson.type";

export const lessonKeys = {
  all: ["lessons"] as const,
  list: (page: number, size: number) => ["lessons", "list", page, size] as const,
  byChapter: (chapterId: number) => ["lessons", "chapter", chapterId] as const,
  detail: (id: number) => ["lessons", "detail", id] as const,
};

export const useLessons = (page = 0, size = 10) => {
  return useQuery({
    queryKey: lessonKeys.list(page, size),
    queryFn: async () => {
      const response = await lessonApi.getAll({ page, size });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useLessonsByChapter = (chapterId?: number) => {
  return useQuery({
    queryKey: lessonKeys.byChapter(chapterId ?? 0),
    queryFn: async () => {
      if (!chapterId) return null;
      const response = await lessonApi.getByChapter(chapterId);
      return response.data.data;
    },
    enabled: !!chapterId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useLessonDetail = (id?: number) => {
  return useQuery({
    queryKey: lessonKeys.detail(id ?? 0),
    queryFn: async () => {
      if (!id) return null;
      const response = await lessonApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TLessonRequest) => lessonApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.byChapter(variables.chapterId) });
      toast.success("Tạo bài học thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo bài học thất bại");
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TLessonRequest }) => lessonApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.byChapter(variables.data.chapterId) });
      toast.success("Cập nhật bài học thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật bài học thất bại");
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => lessonApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      toast.success("Xóa bài học thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa bài học thất bại");
    },
  });
};

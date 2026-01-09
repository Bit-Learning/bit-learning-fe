import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { curriculumApi } from "../api/curriculum.api";
import type { TCurriculumRequest } from "../types/curriculum.type";

export const curriculumKeys = {
  all: ["curriculums"] as const,
  list: (page: number, size: number) => ["curriculums", "list", page, size] as const,
  listAll: () => ["curriculums", "listAll"] as const,
  detail: (id: number) => ["curriculums", "detail", id] as const,
  byCode: (code: string) => ["curriculums", "code", code] as const,
};

export const useCurriculums = (page = 0, size = 10) => {
  return useQuery({
    queryKey: curriculumKeys.list(page, size),
    queryFn: async () => {
      const response = await curriculumApi.getAll({ page, size });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCurriculumsList = () => {
  return useQuery({
    queryKey: curriculumKeys.listAll(),
    queryFn: async () => {
      const response = await curriculumApi.getAllList();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCurriculumDetail = (id?: number) => {
  return useQuery({
    queryKey: curriculumKeys.detail(id ?? 0),
    queryFn: async () => {
      if (!id) return null;
      const response = await curriculumApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCurriculumByCode = (code?: string) => {
  return useQuery({
    queryKey: curriculumKeys.byCode(code ?? ""),
    queryFn: async () => {
      if (!code) return null;
      const response = await curriculumApi.getByCode(code);
      return response.data.data;
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TCurriculumRequest) => curriculumApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.all });
      toast.success("Tạo chương trình học thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo chương trình học thất bại");
    },
  });
};

export const useUpdateCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TCurriculumRequest }) => curriculumApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.all });
      queryClient.invalidateQueries({ queryKey: curriculumKeys.detail(variables.id) });
      toast.success("Cập nhật chương trình học thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật chương trình học thất bại");
    },
  });
};

export const useDeleteCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => curriculumApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.all });
      toast.success("Xóa chương trình học thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa chương trình học thất bại");
    },
  });
};

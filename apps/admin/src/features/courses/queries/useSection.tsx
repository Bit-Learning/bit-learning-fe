import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { msectionApi } from "../apis/section.api";
import { toast } from "@/components/Sonner";
import type { CreateSectionRequest, UpdateSectionRequest } from "../types/section.type";

export const sectionKeys = {
  all: ["sections"] as const,
  byCourse: (courseId: number) => [...sectionKeys.all, "course", courseId] as const,
};

export const useSectionsByCourse = (courseId: number) => {
  return useQuery({
    queryKey: sectionKeys.byCourse(courseId),
    queryFn: async () => {
      const response = await msectionApi.getAllSectionsByCourseId(courseId);
      return response.data.data;
    },
    enabled: !!courseId,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSectionRequest) => msectionApi.createSection(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.byCourse(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Tạo chương thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể tạo chương",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; courseId: number; data: UpdateSectionRequest }) =>
      msectionApi.updateSection(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.byCourse(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Cập nhật chương thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật chương",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => msectionApi.deleteSection(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Xóa chương thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể xóa chương",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useHideOrShowSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) => msectionApi.hideOrShowSection(id, isHidden),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      const action = variables.isHidden ? "ẩn" : "hiện";
      toast.success({
        title: `Đã ${action} chương`,
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể thay đổi trạng thái chương",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

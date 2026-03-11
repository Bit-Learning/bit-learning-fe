import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { msectionApi } from "../api/msection.api";
import type { CreateSectionRequest, UpdateSectionRequest } from "../types/msection.api";

export const msectionKeys = {
  all: ["msections"] as const,
  byCourse: (courseId: number) => ["msections", "course", courseId] as const,
  detail: (id: number) => ["msections", "detail", id] as const,
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSectionRequest) => msectionApi.createSection(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: msectionKeys.all });
      queryClient.invalidateQueries({
        queryKey: msectionKeys.byCourse(variables.courseId),
      });
      toast.success({
        title: "Tạo chương thành công!",
        description: response.data.message || "Chương học đã được tạo và sẵn sàng thêm bài học.",
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Tạo chương thất bại!",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi tạo chương học.",
      });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSectionRequest }) => msectionApi.updateSection(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: msectionKeys.all });
      queryClient.invalidateQueries({
        queryKey: msectionKeys.detail(variables.id),
      });
      toast.success({
        title: "Cập nhật chương thành công!",
        description: response.data.message || "Thông tin chương học đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Cập nhật chương thất bại!",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật chương học.",
      });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => msectionApi.deleteSection(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: msectionKeys.all });
      toast.success({
        title: "Xóa chương thành công!",
        description: response.data.message || "Chương học đã được xóa vĩnh viễn khỏi hệ thống.",
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Xóa chương thất bại!",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi xóa chương học.",
      });
    },
  });
};

export const useHideOrShowSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) => msectionApi.hideOrShowSection(id, isHidden),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: msectionKeys.all });
      const action = variables.isHidden ? "ẩn" : "hiển thị";
      toast.success({
        title: `${action === "ẩn" ? "Ẩn" : "Hiển thị"} chương thành công!`,
        description: response.data.message || `Chương học đã được ${action}.`,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Cập nhật trạng thái thất bại!",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật trạng thái chương học.",
      });
    },
  });
};

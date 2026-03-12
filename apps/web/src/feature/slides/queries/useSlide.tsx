import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slideApi } from "../apis/slide.api";
import { toast } from "@/shared/components/Sonner";
import type { SlideRequest } from "../types/slide.type";

export const slideKeys = {
  all: ["slide"] as const,
  mySlides: () => [...slideKeys.all, "mySlides"] as const,
  mySlidesList: (page: number, size: number) => [...slideKeys.mySlides(), page, size] as const,
  slideDetail: (id: number) => [...slideKeys.all, "detail", id] as const,
  placeholders: (filename: string) => [...slideKeys.all, "placeholders", filename] as const,
};

export const useMySlides = (page = 0, size = 10, sortBy = "createdAt", sortDir = "desc") => {
  return useQuery({
    queryKey: slideKeys.mySlidesList(page, size),
    queryFn: async () => {
      const response = await slideApi.getMySlides(page, size, sortBy, sortDir);
      return response.data;
    },
  });
};

export const useSlideDetail = (id: number) => {
  return useQuery({
    queryKey: slideKeys.slideDetail(id),
    queryFn: async () => {
      const response = await slideApi.getSlideById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useGenerateSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SlideRequest) => slideApi.generateSlide(request),
    onSuccess: (response) => {
      toast.success({
        title: "Tạo slide thành công!",
        description:
          response.data.message ||
          `Đã tạo ${response.data.data?.slideCount || 0} slides cho chủ đề "${response.data.data?.topic}".`,
      });
      queryClient.invalidateQueries({ queryKey: slideKeys.mySlides() });
    },
    onError: (error: any) => {
      toast.error({
        title: "Tạo slide thất bại!",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi tạo slide. Vui lòng thử lại.",
      });
    },
  });
};

export const useDeleteSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => slideApi.deleteSlide(id),
    onSuccess: (response) => {
      toast.success({
        title: "Xóa slide thành công!",
        description: response.data.message || "Slide đã được xóa khỏi danh sách của bạn.",
      });
      queryClient.invalidateQueries({ queryKey: slideKeys.mySlides() });
    },
    onError: (error: any) => {
      toast.error({
        title: "Xóa slide thất bại!",
        description: error?.response?.data?.message || "Không thể xóa slide. Vui lòng thử lại.",
      });
    },
  });
};

export const useExtractPlaceholders = () => {
  return useMutation({
    mutationFn: (file: File) => slideApi.extractPlaceholders(file),
    onSuccess: (response) => {
      const placeholderCount = response.data.data?.length || 0;
      toast.success({
        title: "Trích xuất thành công!",
        description: `Đã tìm thấy ${placeholderCount} placeholder trong template.`,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Trích xuất thất bại!",
        description: error?.response?.data?.message || "Không thể đọc file template. Vui lòng kiểm tra lại file.",
      });
    },
  });
};

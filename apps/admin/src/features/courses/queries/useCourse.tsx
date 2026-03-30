import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "../apis/course.api";
import type { CreateCourseRequest, UpdateCourseRequest } from "../types/course.type";
import { toast } from "@/components/Sonner";

export const courseKeys = {
  all: ["courses"] as const,
  list: (page: number, size: number) => [...courseKeys.all, "list", page, size] as const,
  detail: (id: number) => [...courseKeys.all, "detail", id] as const,
  byInstructor: (instructorId: number, page: number, size: number) =>
    [...courseKeys.all, "instructor", instructorId, page, size] as const,
  myCourses: (page: number, size: number) => [...courseKeys.all, "my-courses", page, size] as const,
};

export const useGetCourses = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: courseKeys.list(page, size),
    queryFn: async () => {
      const response = await courseApi.getAllCourses(page, size);
      return response.data;
    },
  });
};

export const useCourseDetail = (id: number) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: async () => {
      const response = await courseApi.getCourseById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCoursesByInstructor = (instructorId: number, page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: courseKeys.byInstructor(instructorId, page, size),
    queryFn: async () => {
      const response = await courseApi.getCoursesByInstructor(instructorId, page, size);
      return response.data;
    },
    enabled: !!instructorId,
  });
};

export const useValidateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isAccepted }: { id: number; isAccepted: boolean }) => courseApi.validateCourse(id, isAccepted),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });

      const action = variables.isAccepted ? "xuất bản" : "hủy xuất bản";
      toast.success({
        title: response.data.message || `Khóa học đã được ${action}.`,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật trạng thái khóa học",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, thumbnail }: { data: CreateCourseRequest; thumbnail: File }) =>
      courseApi.createCourse(data, thumbnail),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      toast.success({
        title: "Tạo khóa học thành công",
        description: response.data.message || "Khóa học đã được tạo.",
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể tạo khóa học",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseRequest }) => courseApi.updateCourse(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      toast.success({
        title: "Cập nhật khóa học thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật khóa học",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => courseApi.deleteCourse(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      toast.success({
        title: "Xóa khóa học thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể xóa khóa học",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useHideOrShowCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) => courseApi.hideOrShowCourse(id, isHidden),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });

      const action = variables.isHidden ? "ẩn" : "hiện";
      toast.success({
        title: `Đã ${action} khóa học`,
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể thay đổi trạng thái khóa học",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useUpdateCourseThumbnail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, thumbnail }: { id: number; thumbnail: File }) => courseApi.updateCourseThumbnail(id, thumbnail),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      toast.success({
        title: "Cập nhật ảnh bìa thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật ảnh bìa",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

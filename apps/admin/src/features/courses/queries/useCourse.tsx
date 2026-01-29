import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "../apis/course.api";
import { toast } from "sonner";

export const courseKeys = {
  all: ["courses"] as const,
  list: (page: number, size: number) => ["courses", "list", page, size] as const,
  detail: (id: number) => ["courses", "detail", id] as const,
  sections: (courseId: number) => ["courses", "sections", courseId] as const,
};

export const useGetCourses = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: courseKeys.list(page, size),
    queryFn: async () => {
      const response = await courseApi.getAllCourses(page, size);
      return {
        content: response.data.data || [],
        page: response.data.page,
      };
    },
  });
};

export const useGetCourseDetail = (id: number) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: async () => {
      const response = await courseApi.getCourseById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useGetSections = (courseId: number) => {
  return useQuery({
    queryKey: courseKeys.sections(courseId),
    queryFn: async () => {
      const response = await courseApi.getSectionsByCourseId(courseId);
      return response.data.data;
    },
    enabled: !!courseId,
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
      toast.success(response.data.message || `Khóa học đã được ${action}.`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật trạng thái khóa học.");
    },
  });
};

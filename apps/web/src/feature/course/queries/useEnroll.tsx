import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { enrollApi } from "../api/enroll.api";

export const useCourseAccess = (courseId: number) => {
  return useQuery({
    queryKey: ["course-access", courseId],
    queryFn: async () => {
      const response = await enrollApi.checkCourseAccess(courseId);
      return response.data.data;
    },
    enabled: !!courseId,
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => enrollApi.enrollCourse(courseId),
    onSuccess: (_, courseId) => {
      toast.success({ title: "Đăng ký khóa học thành công!" });
      queryClient.setQueryData(["course-access", courseId], true);
      queryClient.invalidateQueries({
        queryKey: ["course-progress", courseId],
      });
    },
    onError: (error: any) => {
      toast.error({
        title: error?.response?.data?.message || "Đăng ký thất bại",
      });
    },
  });
};

export const useCourseProgress = (courseId: number, enabled = true) => {
  return useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: async () => {
      const response = await enrollApi.getCourseProgress(courseId);
      return response.data.data;
    },
    enabled: !!courseId && enabled,
  });
};

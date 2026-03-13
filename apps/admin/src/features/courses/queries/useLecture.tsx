import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureApi } from "../apis/lecture.api";
import { toast } from "@/components/Sonner";
import type {
  CreateLectureQuizRequest,
  CreateLectureTextRequest,
  QuizUpdateRequest,
  UpdateLectureRequest,
  UpdateLectureTextRequest,
} from "../types/lecture.type";

export const lectureKeys = {
  all: ["lectures"] as const,
  quiz: (id: number) => [...lectureKeys.all, "quiz", id] as const,
  text: (id: number) => [...lectureKeys.all, "text", id] as const,
  video: (id: number) => [...lectureKeys.all, "video", id] as const,
};

export const useLectureQuiz = (id: number) => {
  return useQuery({
    queryKey: lectureKeys.quiz(id),
    queryFn: async () => {
      const response = await lectureApi.getLectureQuizById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useLectureText = (id: number) => {
  return useQuery({
    queryKey: lectureKeys.text(id),
    queryFn: async () => {
      const response = await lectureApi.getLectureTextById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useFetchVideoM3u8 = (id: number) => {
  return useQuery({
    queryKey: lectureKeys.video(id),
    queryFn: async () => {
      const response = await lectureApi.fetchVideoM3u8(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdateLecture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLectureRequest }) => lectureApi.updateLecture(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Cập nhật bài học thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật bài học",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useDeleteLecture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => lectureApi.deleteLecture(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Xóa bài học thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể xóa bài học",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useHideOrShowLecture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) => lectureApi.hideOrShowLecture(id, isHidden),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      const action = variables.isHidden ? "ẩn" : "hiện";
      toast.success({
        title: `Đã ${action} bài học`,
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể thay đổi trạng thái bài học",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useCreateLectureVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ request, video }: { request: string; video: File }) => lectureApi.createLectureVideo(request, video),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Tạo bài học video thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể tạo bài học video",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useUpdateLectureVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, video }: { id: number; video: File }) => lectureApi.updateLectureVideo(id, video),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.video(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Cập nhật video thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật video",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useCreateLectureQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLectureQuizRequest) => lectureApi.createLectureQuiz(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Tạo bài quiz thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể tạo bài quiz",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useUpdateLectureQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quizzes }: { id: number; quizzes: QuizUpdateRequest[] }) =>
      lectureApi.updateLectureQuiz(id, quizzes),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.quiz(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Cập nhật bài quiz thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật bài quiz",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useCreateLectureText = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLectureTextRequest) => lectureApi.createLectureText(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.all });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Tạo bài học văn bản thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể tạo bài học văn bản",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useUpdateLectureText = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLectureTextRequest }) =>
      lectureApi.updateLectureText(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.text(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success({
        title: "Cập nhật bài học văn bản thành công",
        description: response.data.message,
      });
    },
    onError: (error: any) => {
      toast.error({
        title: "Không thể cập nhật bài học văn bản",
        description: error?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useVideoUrls = (lectureId: number) => {
  const m3u8Url = lectureApi.getVideoM3u8Url(lectureId);

  const getSegmentUrl = (segment: string) => {
    return lectureApi.getVideoSegmentUrl(lectureId, segment);
  };

  return {
    m3u8Url,
    getSegmentUrl,
  };
};

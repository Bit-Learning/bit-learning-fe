import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@workspace/ui/components/Sonner";
import type {
  ExamGenerateRequest,
  ExamGenerateFromUserQuestionsRequest,
  ExamGenerateFromQuestionsRequest,
} from "../types/exam.type";
import type { ApiResponse } from "@/shared/api/api.type";
import { examApi, ExamSearchParams } from "../api/exam.api";

export const examKeys = {
  all: ["exams"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  list: (params?: ExamSearchParams) => [...examKeys.lists(), params] as const,
  details: () => [...examKeys.all, "detail"] as const,
  detail: (id: number) => [...examKeys.details(), id] as const,
  myExams: (params?: ExamSearchParams) => [...examKeys.all, "my-exams", params] as const,
  matrixExams: (matrixId: number, params?: ExamSearchParams) => [...examKeys.all, "matrix", matrixId, params] as const,
};

export const useExam = (id: number) => {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: async () => {
      const response = await examApi.getExamById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useAllExams = (params?: ExamSearchParams) => {
  return useQuery({
    queryKey: examKeys.list(params),
    queryFn: async () => {
      const response = await examApi.getAllExams(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyExams = (params?: ExamSearchParams) => {
  return useQuery({
    queryKey: examKeys.myExams(params),
    queryFn: async () => {
      const response = await examApi.getMyExams(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useExamsByMatrix = (matrixId: number, params?: ExamSearchParams) => {
  return useQuery({
    queryKey: examKeys.matrixExams(matrixId, params),
    queryFn: async () => {
      const response = await examApi.getExamsByMatrix(matrixId, params);
      return response.data;
    },
    enabled: !!matrixId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGenerateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExamGenerateRequest) => examApi.generateExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      toast.success({
        title: "Thành công",
        description: "Đề thi đã được tạo thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo đề thi",
      });
    },
  });
};

export const useGenerateExamFromUserQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExamGenerateFromUserQuestionsRequest) => examApi.generateExamFromUserQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      toast.success({
        title: "Thành công",
        description: "Đề thi đã được tạo thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo đề thi",
      });
    },
  });
};

export const useGenerateExamFromQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExamGenerateFromQuestionsRequest) => examApi.generateExamFromQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      toast.success({
        title: "Thành công",
        description: "Đề thi đã được tạo thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo đề thi",
      });
    },
  });
};

export const usePublishExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) => examApi.publishExam(id, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.id) });
      toast.success({
        title: "Thành công",
        description: variables.isPublished ? "Đã công bố đề thi" : "Đã ẩn đề thi",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật trạng thái",
      });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => examApi.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      toast.success({
        title: "Thành công",
        description: "Xóa đề thi thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa đề thi",
      });
    },
  });
};

export const useDownloadExam = () => {
  return useMutation({
    mutationFn: ({ id, format, name }: { id: number; format: "pdf" | "docx"; name: string }) =>
      examApi.downloadExam(id, format).then((blob) => ({ blob, name, format })),
    onSuccess: ({ blob, name, format }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success({
        title: "Thành công",
        description: "Tải xuống thành công",
      });
    },
    onError: () => {
      toast.error({
        title: "Lỗi",
        description: "Không thể tải xuống đề thi",
      });
    },
  });
};

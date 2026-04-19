import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/shared/api/api.type";
import { examApi, examApprovalApi } from "../apis/exam.api";
import type {
  ExamGenerateRequest,
  ExamGenerateFromUserQuestionsRequest,
  ExamGenerateFromQuestionsRequest,
  ExamUpdateRequest,
  ExamSearchParams,
  ExamApprovalFilters,
} from "../types/exam.type";
import { toast } from "@/components/Sonner";

export const examKeys = {
  all: ["exams"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  list: (params?: ExamSearchParams) => [...examKeys.lists(), params] as const,
  details: () => [...examKeys.all, "detail"] as const,
  detail: (id: number) => [...examKeys.details(), id] as const,
  myExams: (params?: ExamSearchParams) => [...examKeys.all, "my-exams", params] as const,
  allMyExams: () => [...examKeys.all, "my-exams"] as const,
  matrixExams: (matrixId: number, params?: ExamSearchParams) => [...examKeys.all, "matrix", matrixId, params] as const,
  pendingApproval: (params?: ExamSearchParams) => [...examKeys.all, "pending-approval", params] as const,
  myPublishRequests: (filters?: ExamApprovalFilters) => [...examKeys.all, "my-publish-requests", filters] as const,
};

export const useExam = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: async () => {
      const response = await examApi.getExamById(id);
      return response.data.data;
    },
    enabled: (options?.enabled ?? true) && !!id,
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

export const useGetMyPublishRequests = (filters?: ExamApprovalFilters) => {
  return useQuery({
    queryKey: examKeys.myPublishRequests(filters),
    queryFn: async () => {
      const response = await examApprovalApi.getMyPublishRequests(filters);
      return response.data;
    },
  });
};

export const useGetPendingExams = (params?: ExamSearchParams) => {
  return useQuery({
    queryKey: examKeys.pendingApproval(params),
    queryFn: async () => {
      const response = await examApprovalApi.getPendingExams(params);
      return response.data;
    },
  });
};

export const useGenerateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamGenerateRequest) => examApi.generateExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.allMyExams() });
      toast.success({ title: "Thành công", description: "Đề thi đã được tạo thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể tạo đề thi" });
    },
  });
};

export const useGenerateExamFromUserQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamGenerateFromUserQuestionsRequest) => examApi.generateExamFromUserQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.allMyExams() });
      toast.success({ title: "Thành công", description: "Đề thi đã được tạo thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể tạo đề thi" });
    },
  });
};

export const useGenerateExamFromQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamGenerateFromQuestionsRequest) => examApi.generateExamFromQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.allMyExams() });
      toast.success({ title: "Thành công", description: "Đề thi đã được tạo thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể tạo đề thi" });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExamUpdateRequest }) => examApi.updateExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.allMyExams() });
      toast.success({ title: "Thành công", description: "Cập nhật đề thi thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật đề thi" });
    },
  });
};

export const usePublishExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) => examApi.publishExam(id, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.allMyExams() });
      toast.success({ title: "Thành công", description: variables.isPublished ? "Đã công bố đề thi" : "Đã ẩn đề thi" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật trạng thái" });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examApi.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      queryClient.invalidateQueries({ queryKey: examKeys.allMyExams() });
      toast.success({ title: "Thành công", description: "Xóa đề thi thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể xóa đề thi" });
    },
  });
};

export const useRequestPublishExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examIds: number[]) => examApprovalApi.requestPublish({ examIds }),
    onSuccess: (_, examIds) => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success({ title: "Đã gửi yêu cầu", description: `${examIds.length} đề thi đang chờ phê duyệt` });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể gửi yêu cầu phê duyệt" });
    },
  });
};

export const useApproveExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examIds: number[]) => examApprovalApi.approve({ examIds }),
    onSuccess: (_, examIds) => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success({ title: "Đã phê duyệt", description: `${examIds.length} đề thi đã được phê duyệt` });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể phê duyệt đề thi" });
    },
  });
};

export const useRejectExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examIds, rejectReason }: { examIds: number[]; rejectReason: string }) =>
      examApprovalApi.reject({ examIds, rejectReason }),
    onSuccess: (_, { examIds }) => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success({ title: "Đã từ chối", description: `${examIds.length} đề thi đã bị từ chối` });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể từ chối đề thi" });
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
      toast.success({ title: "Thành công", description: "Tải xuống thành công" });
    },
    onError: () => {
      toast.error({ title: "Lỗi", description: "Không thể tải xuống đề thi" });
    },
  });
};

export const useDownloadExamAnswerKey = () => {
  return useMutation({
    mutationFn: ({ id, format, name }: { id: number; format: "pdf" | "docx"; name: string }) =>
      examApi.downloadExamAnswerKey(id, format).then((blob) => ({ blob, name, format })),
    onSuccess: ({ blob, name, format }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success({ title: "Thành công", description: "Tải xuống thành công" });
    },
    onError: () => {
      toast.error({ title: "Lỗi", description: "Không thể tải xuống đề thi" });
    },
  });
};

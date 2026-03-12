import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@/shared/components/Sonner";
import type { QuestionRequest, RequestPublishDTO, ApproveRejectDTO } from "../types/question.type";
import type { ApiResponse } from "@/shared/api/api.type";
import { questionApi, type QuestionSearchParams, type QuestionApprovalParams } from "../api/question.api";

export const questionKeys = {
  all: ["questions"] as const,
  lists: () => [...questionKeys.all, "list"] as const,
  list: (params?: QuestionSearchParams) => [...questionKeys.lists(), params] as const,
  details: () => [...questionKeys.all, "detail"] as const,
  detail: (id: number) => [...questionKeys.details(), id] as const,
  myQuestions: (params?: QuestionSearchParams) => [...questionKeys.all, "my-questions", params] as const,
  myPublishRequests: (params?: QuestionApprovalParams) => [...questionKeys.all, "my-publish-requests", params] as const,
  pendingApproval: (params?: Omit<QuestionApprovalParams, "status">) =>
    [...questionKeys.all, "pending-approval", params] as const,
};

export const useSearchQuestions = (params?: QuestionSearchParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: async () => {
      const response = await questionApi.searchQuestions(params);
      return response.data;
    },
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useQuestion = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: async () => {
      const response = await questionApi.getQuestionById(id);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!id,
  });
};

export const useMyQuestions = (params?: QuestionSearchParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: questionKeys.myQuestions(params),
    queryFn: async () => {
      const response = await questionApi.getMyQuestions(params);
      return response.data;
    },
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyPublishRequests = (params?: QuestionApprovalParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: questionKeys.myPublishRequests(params),
    queryFn: async () => {
      const response = await questionApi.getMyPublishRequests(params);
      return response.data;
    },
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePendingApproval = (
  params?: Omit<QuestionApprovalParams, "status">,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: questionKeys.pendingApproval(params),
    queryFn: async () => {
      const response = await questionApi.getPendingApproval(params);
      return response.data;
    },
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useImportQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => questionApi.importQuestions(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      toast.success({
        title: "Thành công",
        description: "Import câu hỏi thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể import câu hỏi",
      });
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuestionRequest) => questionApi.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.myQuestions() });
      toast.success({
        title: "Thành công",
        description: "Tạo câu hỏi thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo câu hỏi",
      });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuestionRequest }) => questionApi.updateQuestion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: questionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: questionKeys.myQuestions() });
      toast.success({
        title: "Thành công",
        description: "Cập nhật câu hỏi thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật câu hỏi",
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => questionApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.myQuestions() });
      toast.success({
        title: "Thành công",
        description: "Xóa câu hỏi thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa câu hỏi",
      });
    },
  });
};

export const useRequestPublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestPublishDTO) => questionApi.requestPublish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.myQuestions() });
      queryClient.invalidateQueries({
        queryKey: questionKeys.myPublishRequests(),
      });
      toast.success({
        title: "Thành công",
        description: "Đã gửi yêu cầu đưa câu hỏi vào Question Bank",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể gửi yêu cầu publish",
      });
    },
  });
};

export const useApproveQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveRejectDTO) => questionApi.approveQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: questionKeys.pendingApproval(),
      });
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      toast.success({
        title: "Thành công",
        description: "Phê duyệt câu hỏi thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể phê duyệt câu hỏi",
      });
    },
  });
};

export const useRejectQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveRejectDTO) => questionApi.rejectQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: questionKeys.pendingApproval(),
      });
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      toast.success({
        title: "Thành công",
        description: "Từ chối câu hỏi thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể từ chối câu hỏi",
      });
    },
  });
};

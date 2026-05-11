import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@/components/Sonner";
import type { ApproveRejectDTO, QuestionApprovalParams, QuestionSearchParams } from "../types/question.type";
import type { ApiResponse } from "@/shared/api/api.type";
import { questionApi } from "../apis/question.api";

export const questionKeys = {
  all: ["questions"] as const,
  lists: () => [...questionKeys.all, "list"] as const,
  list: (params?: QuestionSearchParams) => [...questionKeys.lists(), params] as const,
  details: () => [...questionKeys.all, "detail"] as const,
  detail: (id: number) => [...questionKeys.details(), id] as const,
  myQuestions: (params?: QuestionSearchParams) => [...questionKeys.all, "my-questions", params] as const,
  myQuestionsAll: () => [...questionKeys.all, "my-questions-all"] as const,
  pendingApproval: (params?: Omit<QuestionApprovalParams, "status">) =>
    [...questionKeys.all, "pending-approval", params] as const,
  pendingApprovalAll: () => [...questionKeys.all, "pending-approval-all"] as const,
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

export const usePendingApprovalAll = () => {
  return useQuery({
    queryKey: questionKeys.pendingApprovalAll(),
    queryFn: async () => {
      const response = await questionApi.getPendingApproval({ size: 9999 });
      return response.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => questionApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: questionKeys.myQuestionsAll() });
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

export const useApproveQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveRejectDTO) => questionApi.approveQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...questionKeys.all, "pending-approval"] });
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
      queryClient.invalidateQueries({ queryKey: [...questionKeys.all, "pending-approval"] });
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

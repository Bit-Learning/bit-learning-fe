import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { ApproveRejectDTO } from "../types/question.type";
import type { ApiResponse } from "@/shared/api/api.type";
import { questionApprovalApi, type QuestionApprovalParams } from "../apis/question.api";

export const questionApprovalKeys = {
  all: ["question-approval"] as const,
  pendingApproval: (params?: QuestionApprovalParams) =>
    [...questionApprovalKeys.all, "pending-approval", params] as const,
};

export const usePendingApproval = (params?: QuestionApprovalParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: questionApprovalKeys.pendingApproval(params),
    queryFn: async () => {
      const response = await questionApprovalApi.getPendingApproval(params);
      return response.data;
    },
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useApproveQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveRejectDTO) => questionApprovalApi.approveQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: questionApprovalKeys.all,
      });
      toast.success("Phê duyệt câu hỏi thành công");
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error(error.response?.data?.message || "Không thể phê duyệt câu hỏi");
    },
  });
};

export const useRejectQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveRejectDTO) => questionApprovalApi.rejectQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: questionApprovalKeys.all,
      });
      toast.success("Từ chối câu hỏi thành công");
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error(error.response?.data?.message || "Không thể từ chối câu hỏi");
    },
  });
};

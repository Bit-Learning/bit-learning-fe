import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@workspace/ui/components/Sonner";
import type { QuestionRequest } from "../types/question.type";
import type { ApiResponse } from "@/shared/api/api.type";
import { questionApi, QuestionSearchParams } from "../api/question.api";

export const questionKeys = {
  all: ["questions"] as const,
  lists: () => [...questionKeys.all, "list"] as const,
  list: (params?: QuestionSearchParams) => [...questionKeys.lists(), params] as const,
  details: () => [...questionKeys.all, "detail"] as const,
  detail: (id: number) => [...questionKeys.details(), id] as const,
  myQuestions: (params?: QuestionSearchParams) => [...questionKeys.all, "my-questions", params] as const,
};

export const useSearchQuestions = (params?: QuestionSearchParams, _p0?: { enabled: boolean }) => {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: async () => {
      const response = await questionApi.searchQuestions(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useQuestion = (id: number, _p0: { enabled: boolean }) => {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: async () => {
      const response = await questionApi.getQuestionById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useMyQuestions = (params?: QuestionSearchParams, _p0?: { enabled: boolean }) => {
  return useQuery({
    queryKey: questionKeys.myQuestions(params),
    queryFn: async () => {
      const response = await questionApi.getMyQuestions(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuestionRequest) => questionApi.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(variables.id) });
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

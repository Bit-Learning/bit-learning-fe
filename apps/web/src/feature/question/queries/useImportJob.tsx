import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@/shared/components/Sonner";
import type { ApiResponse } from "@/shared/api/api.type";
import { importJobApi } from "../api/import.api";
import type { UpdatePreviewQuestionRequest, ConfirmImportRequest } from "../types/import.type";

export const importJobKeys = {
  all: ["import-jobs"] as const,
  detail: (id: number) => [...importJobKeys.all, "detail", id] as const,
};

export const usePreviewImport = () => {
  return useMutation({
    mutationFn: (file: File) => importJobApi.previewWord(file),
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xử lý file",
      });
    },
  });
};

export const useUpdatePreviewQuestion = () => {
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: number; data: UpdatePreviewQuestionRequest }) =>
      importJobApi.updatePreviewQuestion(questionId, data),
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật câu hỏi",
      });
    },
  });
};

export const useDeletePreviewQuestion = () => {
  return useMutation({
    mutationFn: (questionId: number) => importJobApi.deletePreviewQuestion(questionId),
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa câu hỏi",
      });
    },
  });
};

export const useConfirmImport = () => {
  return useMutation({
    mutationFn: (data: ConfirmImportRequest) => importJobApi.confirmImport(data),
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xác nhận import",
      });
    },
  });
};

export const useImportJobStatus = (jobId: number | null, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: importJobKeys.detail(jobId!),
    queryFn: async () => {
      const response = await importJobApi.getImportJob(jobId!);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "PROCESSING" || status === "CONFIRMED") {
        return 2000;
      }
      return false;
    },
  });
};

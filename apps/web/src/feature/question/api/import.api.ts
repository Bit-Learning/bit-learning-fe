import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
  PreviewResponse,
  ImportJobResponse,
  UpdatePreviewQuestionRequest,
  ConfirmImportRequest,
  ImportResultResponse,
} from "../types/import.type";

export const importJobApi = {
  previewWord(file: File): Promise<AxiosResponse<ApiResponse<PreviewResponse>>> {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/import-jobs/word/preview", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updatePreviewQuestion(
    questionId: number,
    data: UpdatePreviewQuestionRequest,
  ): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.put(`/import-jobs/preview/questions/${questionId}`, data);
  },

  deletePreviewQuestion(questionId: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/import-jobs/preview/questions/${questionId}`);
  },

  confirmImport(data: ConfirmImportRequest): Promise<AxiosResponse<ApiResponse<ImportResultResponse>>> {
    return api.post("/import-jobs/word/confirm", data);
  },

  getImportJob(jobId: number): Promise<AxiosResponse<ApiResponse<ImportJobResponse>>> {
    return api.get(`/import-jobs/${jobId}`);
  },
};

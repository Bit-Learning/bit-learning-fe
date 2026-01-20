import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
  ExamResponse,
  ExamBriefResponse,
  ExamGenerateRequest,
  ExamGenerateFromUserQuestionsRequest,
  ExamGenerateFromQuestionsRequest,
} from "../types/exam.type";

export interface ExamSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export const examApi = {
  generateExam(data: ExamGenerateRequest): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
    return api.post("/exams/generate", data);
  },

  generateExamFromUserQuestions(
    data: ExamGenerateFromUserQuestionsRequest,
  ): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
    return api.post("/exams/generate-from-user-questions", data);
  },

  generateExamFromQuestions(data: ExamGenerateFromQuestionsRequest): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
    return api.post("/exams/generate-from-questions", data);
  },

  getExamById(id: number): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
    return api.get(`/exams/${id}`);
  },

  getAllExams(params?: ExamSearchParams): Promise<AxiosResponse<ApiResponse<ExamBriefResponse[]>>> {
    return api.get("/exams", { params });
  },

  getExamsByMatrix(
    matrixId: number,
    params?: ExamSearchParams,
  ): Promise<AxiosResponse<ApiResponse<ExamBriefResponse[]>>> {
    return api.get(`/exams/matrix/${matrixId}`, { params });
  },

  getMyExams(params?: ExamSearchParams): Promise<AxiosResponse<ApiResponse<ExamBriefResponse[]>>> {
    return api.get("/exams/my-exams", { params });
  },

  publishExam(id: number, isPublished: boolean): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
    return api.put(`/exams/${id}/publish`, null, {
      params: { isPublished },
    });
  },

  deleteExam(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/exams/${id}`);
  },

  downloadExam(id: number, format: "pdf" | "docx"): Promise<Blob> {
    return api
      .get(`/exams/${id}/download`, {
        params: { format },
        responseType: "blob",
      })
      .then((response) => response.data);
  },
};

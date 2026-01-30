import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { QuestionRequest, QuestionResponse } from "../types/question.type";

export interface QuestionSearchParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const questionApi = {
  importQuestions(file: File): Promise<AxiosResponse<ApiResponse<void>>> {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/questions/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  createQuestion(data: QuestionRequest): Promise<AxiosResponse<ApiResponse<QuestionResponse>>> {
    return api.post("/questions", data);
  },

  searchQuestions(params?: QuestionSearchParams): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
    return api.get("/questions/search", { params });
  },

  getQuestionById(id: number): Promise<AxiosResponse<ApiResponse<QuestionResponse>>> {
    return api.get(`/questions/${id}`);
  },

  updateQuestion(id: number, data: QuestionRequest): Promise<AxiosResponse<ApiResponse<QuestionResponse>>> {
    return api.put(`/questions/${id}`, data);
  },

  getMyQuestions(params?: QuestionSearchParams): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
    return api.get("/questions/my-questions", { params });
  },

  deleteQuestion(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/questions/${id}`);
  },
};

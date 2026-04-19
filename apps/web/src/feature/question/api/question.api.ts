import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
  QuestionRequest,
  QuestionResponse,
  RequestPublishDTO,
  ApproveRejectDTO,
  ApprovalStatus,
  QuestionType,
  QuestionLevel,
  QuestionSearchParams,
  QuestionApprovalParams,
} from "../types/question.type";

export const questionApi = {
  importQuestions(file: File): Promise<AxiosResponse<ApiResponse<void>>> {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/questions/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
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

  requestPublish(data: RequestPublishDTO): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.post("/questions/request-publish", data);
  },

  getMyPublishRequests(params?: QuestionApprovalParams): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
    return api.get("/questions/my-publish-requests", { params });
  },

  getPendingApproval(
    params?: Omit<QuestionApprovalParams, "status">,
  ): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
    return api.get("/questions/pending-approval", { params });
  },

  approveQuestions(data: ApproveRejectDTO): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.put("/questions/approve", data);
  },

  rejectQuestions(data: ApproveRejectDTO): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.put("/questions/reject", data);
  },

  uploadQuestionMedia(id: number, file: File): Promise<AxiosResponse<ApiResponse<QuestionResponse>>> {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/questions/${id}/media`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteQuestionMedia(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/questions/${id}/media`);
  },
};

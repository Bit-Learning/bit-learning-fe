import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { QuestionResponse, ApproveRejectDTO, ApprovalStatus } from "../types/question.type";

export interface QuestionApprovalParams {
  status?: ApprovalStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface QuestionSearchParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const questionApi = {
  getPendingApproval(params?: QuestionApprovalParams): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
    return api.get("/questions/pending-approval", { params });
  },

  approveQuestions(data: ApproveRejectDTO): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.put("/questions/approve", data);
  },

  rejectQuestions(data: ApproveRejectDTO): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.put("/questions/reject", data);
  },
  searchQuestions(params?: QuestionSearchParams): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
    return api.get("/questions/search", { params });
  },
  getQuestionById(id: number): Promise<AxiosResponse<ApiResponse<QuestionResponse>>> {
    return api.get(`/questions/${id}`);
  },
  deleteQuestion(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/questions/${id}`);
  },
};

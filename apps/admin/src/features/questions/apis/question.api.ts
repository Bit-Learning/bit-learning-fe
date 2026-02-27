import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { QuestionResponse, ApproveRejectDTO } from "../types/question.type";

export interface QuestionApprovalParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const questionApprovalApi = {
  getPendingApproval(params?: QuestionApprovalParams): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
    return api.get("/questions/pending-approval", { params });
  },

  approveQuestions(data: ApproveRejectDTO): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.put("/questions/approve", data);
  },

  rejectQuestions(data: ApproveRejectDTO): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.put("/questions/reject", data);
  },
};

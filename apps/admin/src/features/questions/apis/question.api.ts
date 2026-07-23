import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	QuestionResponse,
	ApproveRejectDTO,
	QuestionApprovalParams,
	QuestionSearchParams,
} from "../types/question.type";

export const questionApi = {
	getPendingApproval(
		params?: QuestionApprovalParams,
	): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
		return api.get("/questions/pending-approval", { params });
	},

	approveQuestions(
		data: ApproveRejectDTO,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.put("/questions/approve", data);
	},

	rejectQuestions(
		data: ApproveRejectDTO,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.put("/questions/reject", data);
	},
	searchQuestions(
		params?: QuestionSearchParams,
	): Promise<AxiosResponse<ApiResponse<QuestionResponse[]>>> {
		return api.get("/questions/search", { params });
	},
	getQuestionById(
		id: number,
	): Promise<AxiosResponse<ApiResponse<QuestionResponse>>> {
		return api.get(`/questions/${id}`);
	},
	deleteQuestion(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/questions/${id}`);
	},
};

import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	ExamResponse,
	ExamBriefResponse,
	ExamGenerateRequest,
	ExamGenerateFromUserQuestionsRequest,
	ExamGenerateFromQuestionsRequest,
	ExamUpdateRequest,
	ExamSearchParams,
	ExamApprovalFilters,
	RequestPublishExamRequest,
	ApproveRejectExamRequest,
} from "../types/exam.type";

export const examApi = {
	generateExam(
		data: ExamGenerateRequest,
	): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
		return api.post("/exams/generate", data);
	},

	generateExamFromUserQuestions(
		data: ExamGenerateFromUserQuestionsRequest,
	): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
		return api.post("/exams/generate-from-user-questions", data);
	},

	generateExamFromQuestions(
		data: ExamGenerateFromQuestionsRequest,
	): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
		return api.post("/exams/generate-from-questions", data);
	},

	getExamById(id: number): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
		return api.get(`/exams/${id}`);
	},

	getAllExams(
		params?: ExamSearchParams,
	): Promise<AxiosResponse<ApiResponse<ExamBriefResponse[]>>> {
		return api.get("/exams", { params });
	},

	getExamsByMatrix(
		matrixId: number,
		params?: ExamSearchParams,
	): Promise<AxiosResponse<ApiResponse<ExamBriefResponse[]>>> {
		return api.get(`/exams/matrix/${matrixId}`, { params });
	},

	getMyExams(
		params?: ExamSearchParams,
	): Promise<AxiosResponse<ApiResponse<ExamBriefResponse[]>>> {
		return api.get("/exams/my-exams", { params });
	},

	updateExam(
		id: number,
		data: ExamUpdateRequest,
	): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
		return api.put(`/exams/${id}`, data);
	},

	publishExam(
		id: number,
		isPublished: boolean,
	): Promise<AxiosResponse<ApiResponse<ExamResponse>>> {
		return api.put(`/exams/${id}/publish`, null, { params: { isPublished } });
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

	downloadExamAnswerKey(id: number, format: "pdf" | "docx"): Promise<Blob> {
		return api
			.get(`/exams/${id}/answer-key`, {
				params: { format },
				responseType: "blob",
			})
			.then((response) => response.data);
	},
};

export const examApprovalApi = {
	requestPublish(
		data: RequestPublishExamRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post("/exams/request-publish", data);
	},

	getMyPublishRequests(
		filters?: ExamApprovalFilters,
	): Promise<AxiosResponse<ApiResponse<ExamBriefResponse[]>>> {
		return api.get("/exams/my-publish-requests", { params: filters });
	},

	getPendingExams(
		params?: ExamSearchParams,
	): Promise<AxiosResponse<ApiResponse<ExamBriefResponse[]>>> {
		return api.get("/exams/pending-approval", { params });
	},

	approve(
		data: ApproveRejectExamRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.put("/exams/approve", data);
	},

	reject(
		data: ApproveRejectExamRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.put("/exams/reject", data);
	},
};

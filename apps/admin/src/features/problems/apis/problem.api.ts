import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type {
	ProblemBriefResponse,
	ProblemDetailResponse,
	ProblemStatisticsResponse,
	CreateProblemRequest,
	CreateProblemResponse,
	UpdateProblemRequest,
	CreateTestCaseRequest,
	CreateTestCaseResponse,
	UpdateTestCaseRequest,
	TestCaseResponse,
	BulkCreateTestCaseRequest,
	BulkCreateTestCaseResponse,
	CreateCodeTemplateRequest,
	CreateCodeTemplateResponse,
	CodeTemplateResponse,
	GenerateCodeTemplatesRequest,
	GenerateCodeTemplatesResponse,
	ProblemFilters,
	TagResponse,
	ApproveRejectRequest,
	Language,
} from "../types/problem.type";
import { ApiResponse } from "@/shared/api/api.type";

export const problemApi = {
	getProblems(
		filters?: ProblemFilters,
	): Promise<AxiosResponse<ApiResponse<ProblemBriefResponse[]>>> {
		return api.get("/problems", { params: filters });
	},

	getProblemDetail(
		problemId: string,
		language?: Language,
	): Promise<AxiosResponse<ApiResponse<ProblemDetailResponse>>> {
		return api.get(`/problems/${problemId}`, {
			params: { language: language || "PYTHON" },
		});
	},

	createProblem(
		data: CreateProblemRequest,
	): Promise<AxiosResponse<ApiResponse<CreateProblemResponse>>> {
		return api.post("/problems", data);
	},

	updateProblem(
		problemId: string,
		data: UpdateProblemRequest,
	): Promise<AxiosResponse<ApiResponse<CreateProblemResponse>>> {
		return api.put(`/problems/${problemId}`, data);
	},

	deleteProblem(problemId: string): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/problems/${problemId}`);
	},

	getProblemStatistics(
		problemId: string,
	): Promise<AxiosResponse<ApiResponse<ProblemStatisticsResponse>>> {
		return api.get(`/problems/${problemId}/statistics`);
	},

	createTestCase(
		problemId: string,
		data: CreateTestCaseRequest,
	): Promise<AxiosResponse<ApiResponse<CreateTestCaseResponse>>> {
		return api.post(`/problems/${problemId}/testcases`, data);
	},

	updateTestCase(
		problemId: string,
		testCaseId: string,
		data: UpdateTestCaseRequest,
	): Promise<AxiosResponse<ApiResponse<CreateTestCaseResponse>>> {
		return api.put(`/problems/${problemId}/testcases/${testCaseId}`, data);
	},

	deleteTestCase(
		problemId: string,
		testCaseId: string,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/problems/${problemId}/testcases/${testCaseId}`);
	},

	getAllTestCases(
		problemId: string,
	): Promise<AxiosResponse<ApiResponse<TestCaseResponse[]>>> {
		return api.get(`/problems/${problemId}/testcases`);
	},

	deleteAllTestCases(
		problemId: string,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/problems/${problemId}/testcases`);
	},

	bulkCreateTestCases(
		problemId: string,
		data: BulkCreateTestCaseRequest,
	): Promise<AxiosResponse<ApiResponse<BulkCreateTestCaseResponse>>> {
		return api.post(`/problems/${problemId}/testcases/bulk`, data);
	},

	importTestCasesFromFile(
		problemId: string,
		file: File,
		replaceExisting = false,
	): Promise<AxiosResponse<ApiResponse<BulkCreateTestCaseResponse>>> {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("replaceExisting", String(replaceExisting));
		return api.post(`/problems/${problemId}/testcases/import`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	createCodeTemplate(
		problemId: string,
		data: CreateCodeTemplateRequest,
	): Promise<AxiosResponse<ApiResponse<CreateCodeTemplateResponse>>> {
		return api.post(`/problems/${problemId}/code-templates`, data);
	},

	getCodeTemplates(
		problemId: string,
	): Promise<AxiosResponse<ApiResponse<CodeTemplateResponse[]>>> {
		return api.get(`/problems/${problemId}/code-templates`);
	},

	deleteCodeTemplate(
		problemId: string,
		language: Language,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/problems/${problemId}/code-templates/${language}`);
	},

	generateCodeTemplates(
		problemId: string,
		data: GenerateCodeTemplatesRequest,
	): Promise<AxiosResponse<ApiResponse<GenerateCodeTemplatesResponse>>> {
		return api.post(`/problems/${problemId}/generate-code-templates`, data);
	},

	getAllTags(): Promise<AxiosResponse<ApiResponse<TagResponse[]>>> {
		return api.get("/coding/tags");
	},

	publishProblem(
		id: string,
		isPublic: boolean,
	): Promise<AxiosResponse<ApiResponse<ProblemDetailResponse>>> {
		return api.put(`/problems/${id}/publish`, null, { params: { isPublic } });
	},

	approve(
		data: ApproveRejectRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.put("/problems/approve", data);
	},

	reject(
		data: ApproveRejectRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.put("/problems/reject", data);
	},

	getPendingProblems(
		filters?: ProblemFilters,
	): Promise<AxiosResponse<ApiResponse<ProblemBriefResponse[]>>> {
		return api.get("/problems/pending-approval", { params: filters });
	},
};

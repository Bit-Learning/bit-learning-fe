import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import {
  type CreateProblemRequest,
  type CreateProblemResponse,
  type UpdateProblemRequest,
  type CreateTestCaseRequest,
  type CreateTestCaseResponse,
  type UpdateTestCaseRequest,
  type CreateCodeTemplateRequest,
  type CreateCodeTemplateResponse,
  type CodeTemplateResponse,
  type ProblemBriefResponse,
  type ProblemDetailResponse,
  type ProblemStatisticsResponse,
  type ToggleFavoriteResponse,
  type SubmitCodeRequest,
  type SubmitCodeResponse,
  type SubmissionResultResponse,
  type SubmissionBriefResponse,
  type UserSubmissionStatsResponse,
  type ProblemFilters,
  type SubmissionFilters,
  type Language,
  type BulkCreateTestCaseRequest,
  type BulkCreateTestCaseResponse,
  type TestCaseResponse,
  type GenerateCodeTemplatesRequest,
  type GenerateCodeTemplatesResponse,
  type RunCodeRequest,
  type RunCodeResponse,
  type DebugRequest,
  type DebugResponse,
} from "../types/coding.type";

export const problemApi = {
  createProblem(data: CreateProblemRequest): Promise<AxiosResponse<ApiResponse<CreateProblemResponse>>> {
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

  getProblems(filters?: ProblemFilters): Promise<AxiosResponse<ApiResponse<ProblemBriefResponse[]>>> {
    return api.get("/problems", { params: filters });
  },

  getProblemDetail(problemId: string, language?: Language): Promise<AxiosResponse<ApiResponse<ProblemDetailResponse>>> {
    return api.get(`/problems/${problemId}`, { params: language ? { language } : undefined });
  },

  getProblemStatistics(problemId: string): Promise<AxiosResponse<ApiResponse<ProblemStatisticsResponse>>> {
    return api.get(`/problems/${problemId}/statistics`);
  },

  getProblemSubmissions(
    problemId: string,
    filters?: ProblemFilters,
  ): Promise<AxiosResponse<ApiResponse<SubmissionBriefResponse[]>>> {
    return api.get(`/problems/${problemId}/submissions`, { params: filters });
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

  deleteTestCase(problemId: string, testCaseId: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/problems/${problemId}/testcases/${testCaseId}`);
  },

  bulkCreateTestCases(
    problemId: string,
    data: BulkCreateTestCaseRequest,
  ): Promise<AxiosResponse<ApiResponse<BulkCreateTestCaseResponse>>> {
    return api.post(`/problems/${problemId}/testcases/bulk`, data);
  },

  deleteAllTestCases(problemId: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/problems/${problemId}/testcases`);
  },

  getAllTestCases(problemId: string): Promise<AxiosResponse<ApiResponse<TestCaseResponse[]>>> {
    return api.get(`/problems/${problemId}/testcases`);
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

  getCodeTemplates(problemId: string): Promise<AxiosResponse<ApiResponse<CodeTemplateResponse[]>>> {
    return api.get(`/problems/${problemId}/code-templates`);
  },

  deleteCodeTemplate(problemId: string, language: Language): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/problems/${problemId}/code-templates/${language}`);
  },

  generateCodeTemplates(
    problemId: string,
    data: GenerateCodeTemplatesRequest,
  ): Promise<AxiosResponse<ApiResponse<GenerateCodeTemplatesResponse>>> {
    return api.post(`/problems/${problemId}/generate-code-templates`, data);
  },

  toggleFavorite(problemId: string): Promise<AxiosResponse<ApiResponse<ToggleFavoriteResponse>>> {
    return api.post(`/problems/${problemId}/favorite`);
  },

  getFavoriteProblems(filters?: ProblemFilters): Promise<AxiosResponse<ApiResponse<ProblemBriefResponse[]>>> {
    return api.get("/problems/favorites", { params: filters });
  },
};

export const submissionApi = {
  submitCode(data: SubmitCodeRequest): Promise<AxiosResponse<ApiResponse<SubmitCodeResponse>>> {
    return api.post("/submissions", data);
  },

  getSubmissionResult(submissionId: string): Promise<AxiosResponse<ApiResponse<SubmissionResultResponse>>> {
    return api.get(`/submissions/${submissionId}`);
  },

  getUserSubmissions(filters?: SubmissionFilters): Promise<AxiosResponse<ApiResponse<SubmissionBriefResponse[]>>> {
    return api.get("/submissions", { params: filters });
  },

  getUserSubmissionStats(): Promise<AxiosResponse<ApiResponse<UserSubmissionStatsResponse>>> {
    return api.get("/submissions/stats");
  },

  exportSubmission(submissionId: string, format: "txt" | "xlsx" = "txt"): Promise<AxiosResponse<Blob>> {
    return api.get(`/submissions/${submissionId}/export`, {
      params: { format },
      responseType: "blob",
    });
  },

  runCode(data: RunCodeRequest): Promise<AxiosResponse<ApiResponse<RunCodeResponse>>> {
    return api.post("/submissions/run", data);
  },

  debugCode(data: DebugRequest): Promise<AxiosResponse<ApiResponse<DebugResponse>>> {
    return api.post("/submissions/debug", data);
  },
};

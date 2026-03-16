import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import {
  CreateProblemRequest,
  CreateProblemResponse,
  UpdateProblemRequest,
  CreateTestCaseRequest,
  CreateTestCaseResponse,
  UpdateTestCaseRequest,
  CreateCodeTemplateRequest,
  CreateCodeTemplateResponse,
  CodeTemplateResponse,
  ProblemBriefResponse,
  ProblemDetailResponse,
  ProblemStatisticsResponse,
  ToggleFavoriteResponse,
  SubmitCodeRequest,
  SubmitCodeResponse,
  SubmissionResultResponse,
  SubmissionBriefResponse,
  UserSubmissionStatsResponse,
  ProblemFilters,
  SubmissionFilters,
  Language,
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
    return api.get(`/problems/${problemId}`, {
      params: { language: language || Language.CPP },
    });
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
};

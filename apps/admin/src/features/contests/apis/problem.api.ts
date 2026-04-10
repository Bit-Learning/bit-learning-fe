import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import {
  BulkCreateTestCaseRequest,
  BulkCreateTestCaseResponse,
  CreateCodeTemplateRequest,
  CreateCodeTemplateResponse,
  CreateProblemRequest,
  CreateProblemResponse,
  CreateTestCaseRequest,
  CreateTestCaseResponse,
  GenerateCodeTemplatesRequest,
  GenerateCodeTemplatesResponse,
  ProblemBriefResponse,
  ProblemDetailResponse,
  ProblemFilters,
  TagResponse,
} from "../types/problem.type";
import { Language } from "../types/contest.type";

export const problemApi = {
  getProblems(filters?: ProblemFilters): Promise<AxiosResponse<ApiResponse<ProblemBriefResponse[]>>> {
    return api.get("/problems", { params: filters });
  },

  getProblemDetail(problemId: string, language?: Language): Promise<AxiosResponse<ApiResponse<ProblemDetailResponse>>> {
    return api.get(`/problems/${problemId}`, {
      params: { language: language || Language.PYTHON },
    });
  },
  createProblem(data: CreateProblemRequest): Promise<AxiosResponse<ApiResponse<CreateProblemResponse>>> {
    return api.post("/problems", data);
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
  createTestCase(
    problemId: string,
    data: CreateTestCaseRequest,
  ): Promise<AxiosResponse<ApiResponse<CreateTestCaseResponse>>> {
    return api.post(`/problems/${problemId}/testcases`, data);
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
};

import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { ProblemBriefResponse, ProblemDetailResponse, ProblemFilters } from "../types/problem.type";
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
};

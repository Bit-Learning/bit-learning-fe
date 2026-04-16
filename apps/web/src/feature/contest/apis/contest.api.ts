import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
  ContestListDTO,
  ContestDetailDTO,
  ContestProblemListDTO,
  RegisterResponse,
  SubmitRequest,
  SubmitResponse,
  ContestRunRequest,
  ContestRunResponse,
  ContestDebugRequest,
  ContestDebugResponse,
  SubmissionBriefDTO,
  SubmissionDetailDTO,
  LeaderboardResponse,
  CreateClarificationRequest,
  ClarificationResponse,
  ContestListParams,
  MySubmissionsParams,
} from "../types/contest.type";

const CONTEST_BASE_URL = "/contests";

export const contestApi = {
  listContests(params?: ContestListParams): Promise<AxiosResponse<ApiResponse<ContestListDTO[]>>> {
    return api.get(CONTEST_BASE_URL, { params });
  },

  getMyContests(params?: ContestListParams): Promise<AxiosResponse<ApiResponse<ContestListDTO[]>>> {
    return api.get(`${CONTEST_BASE_URL}/my-contests`, {
      params,
    });
  },

  getContestDetail(contestId: string): Promise<AxiosResponse<ApiResponse<ContestDetailDTO>>> {
    return api.get(`${CONTEST_BASE_URL}/${contestId}`);
  },

  registerForContest(contestId: string): Promise<AxiosResponse<ApiResponse<RegisterResponse>>> {
    return api.post(`${CONTEST_BASE_URL}/${contestId}/register`);
  },

  getContestProblems(contestId: string): Promise<AxiosResponse<ApiResponse<ContestProblemListDTO[]>>> {
    return api.get(`${CONTEST_BASE_URL}/${contestId}/problems`);
  },

  submitSolution(contestId: string, request: SubmitRequest): Promise<AxiosResponse<ApiResponse<SubmitResponse>>> {
    return api.post(`${CONTEST_BASE_URL}/${contestId}/submit`, request);
  },

  runCode(contestId: string, request: ContestRunRequest): Promise<AxiosResponse<ApiResponse<ContestRunResponse>>> {
    return api.post(`${CONTEST_BASE_URL}/${contestId}/run`, request);
  },

  debugCode(
    contestId: string,
    request: ContestDebugRequest,
  ): Promise<AxiosResponse<ApiResponse<ContestDebugResponse>>> {
    return api.post(`${CONTEST_BASE_URL}/${contestId}/debug`, request);
  },

  getSubmissionDetail(submissionId: string): Promise<AxiosResponse<ApiResponse<SubmissionDetailDTO>>> {
    return api.get(`${CONTEST_BASE_URL}/submissions/${submissionId}`);
  },

  getMySubmissions(params: MySubmissionsParams): Promise<AxiosResponse<ApiResponse<SubmissionBriefDTO[]>>> {
    const { contestId, ...queryParams } = params;
    return api.get(`${CONTEST_BASE_URL}/${contestId}/my-submissions`, {
      params: queryParams,
    });
  },

  getLeaderboard(contestId: string, page = 0, size = 50): Promise<AxiosResponse<ApiResponse<LeaderboardResponse>>> {
    return api.get(`${CONTEST_BASE_URL}/${contestId}/leaderboard`, {
      params: { page, size },
    });
  },

  createClarification(
    contestId: string,
    request: CreateClarificationRequest,
  ): Promise<AxiosResponse<ApiResponse<ClarificationResponse>>> {
    return api.post(`${CONTEST_BASE_URL}/${contestId}/clarifications`, request);
  },

  listClarifications(
    contestId: string,
    page = 0,
    size = 20,
  ): Promise<AxiosResponse<ApiResponse<ClarificationResponse[]>>> {
    return api.get(`${CONTEST_BASE_URL}/${contestId}/clarifications`, {
      params: { page, size },
    });
  },
};

export default contestApi;

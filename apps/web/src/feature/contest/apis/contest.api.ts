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
  listContests: async (params?: ContestListParams): Promise<ApiResponse<ContestListDTO[]>> => {
    const response: AxiosResponse<ApiResponse<ContestListDTO[]>> = await api.get(CONTEST_BASE_URL, { params });
    return response.data;
  },

  getContestDetail: async (contestId: string): Promise<ApiResponse<ContestDetailDTO>> => {
    const response: AxiosResponse<ApiResponse<ContestDetailDTO>> = await api.get(`${CONTEST_BASE_URL}/${contestId}`);
    return response.data;
  },

  registerForContest: async (contestId: string): Promise<ApiResponse<RegisterResponse>> => {
    const response: AxiosResponse<ApiResponse<RegisterResponse>> = await api.post(
      `${CONTEST_BASE_URL}/${contestId}/register`,
    );
    return response.data;
  },

  getContestProblems: async (contestId: string): Promise<ApiResponse<ContestProblemListDTO[]>> => {
    const response: AxiosResponse<ApiResponse<ContestProblemListDTO[]>> = await api.get(
      `${CONTEST_BASE_URL}/${contestId}/problems`,
    );
    return response.data;
  },

  submitSolution: async (contestId: string, request: SubmitRequest): Promise<ApiResponse<SubmitResponse>> => {
    const response: AxiosResponse<ApiResponse<SubmitResponse>> = await api.post(
      `${CONTEST_BASE_URL}/${contestId}/submit`,
      request,
    );
    return response.data;
  },

  getSubmissionDetail: async (submissionId: string): Promise<ApiResponse<SubmissionDetailDTO>> => {
    const response: AxiosResponse<ApiResponse<SubmissionDetailDTO>> = await api.get(
      `${CONTEST_BASE_URL}/submissions/${submissionId}`,
    );
    return response.data;
  },

  getMySubmissions: async (params: MySubmissionsParams): Promise<ApiResponse<SubmissionBriefDTO[]>> => {
    const { contestId, ...queryParams } = params;
    const response: AxiosResponse<ApiResponse<SubmissionBriefDTO[]>> = await api.get(
      `${CONTEST_BASE_URL}/${contestId}/my-submissions`,
      {
        params: queryParams,
      },
    );
    return response.data;
  },

  getLeaderboard: async (
    contestId: string,
    page: number = 0,
    size: number = 50,
  ): Promise<ApiResponse<LeaderboardResponse>> => {
    const response: AxiosResponse<ApiResponse<LeaderboardResponse>> = await api.get(
      `${CONTEST_BASE_URL}/${contestId}/leaderboard`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },

  createClarification: async (
    contestId: string,
    request: CreateClarificationRequest,
  ): Promise<ApiResponse<ClarificationResponse>> => {
    const response: AxiosResponse<ApiResponse<ClarificationResponse>> = await api.post(
      `${CONTEST_BASE_URL}/${contestId}/clarifications`,
      request,
    );
    return response.data;
  },

  listClarifications: async (
    contestId: string,
    page: number = 0,
    size: number = 20,
  ): Promise<ApiResponse<ClarificationResponse[]>> => {
    const response: AxiosResponse<ApiResponse<ClarificationResponse[]>> = await api.get(
      `${CONTEST_BASE_URL}/${contestId}/clarifications`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },
};

export default contestApi;

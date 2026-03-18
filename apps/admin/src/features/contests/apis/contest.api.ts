import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
  ContestUpsertDTO,
  ContestResponse,
  ContestListDTO,
  ContestDetailDTO,
  AddProblemRequest,
  ContestProblemResponse,
  ContestProblemListDTO,
  RegisterResponse,
  StatusResponse,
  SubmitRequest,
  SubmitResponse,
  SubmissionBriefDTO,
  SubmissionDetailDTO,
  RejudgeResponse,
  LeaderboardResponse,
  AdminLeaderboardEntry,
  ClarificationResponse,
  CreateClarificationRequest,
  AnswerClarificationRequest,
  ContestListParams,
  ContestSubmissionParams,
  ContestRegistrationDTO,
  PageableParams,
} from "../types/contest.type";

const CONTEST_BASE = "/contests";
const ADMIN_BASE = "/admin/contests";

export const contestApi = {
  listContests(params?: ContestListParams): Promise<AxiosResponse<ApiResponse<ContestListDTO[]>>> {
    return api.get(CONTEST_BASE, { params });
  },

  getContestDetail(contestId: string): Promise<AxiosResponse<ApiResponse<ContestDetailDTO>>> {
    return api.get(`${CONTEST_BASE}/${contestId}`);
  },

  registerForContest(contestId: string): Promise<AxiosResponse<ApiResponse<RegisterResponse>>> {
    return api.post(`${CONTEST_BASE}/${contestId}/register`);
  },

  getContestProblems(contestId: string): Promise<AxiosResponse<ApiResponse<ContestProblemListDTO[]>>> {
    return api.get(`${CONTEST_BASE}/${contestId}/problems`);
  },

  submitSolution(contestId: string, request: SubmitRequest): Promise<AxiosResponse<ApiResponse<SubmitResponse>>> {
    return api.post(`${CONTEST_BASE}/${contestId}/submit`, request);
  },

  getSubmissionDetail(submissionId: string): Promise<AxiosResponse<ApiResponse<SubmissionDetailDTO>>> {
    return api.get(`${CONTEST_BASE}/submissions/${submissionId}`);
  },

  getMySubmissions(
    contestId: string,
    params?: { contestProblemId?: string; page?: number; size?: number },
  ): Promise<AxiosResponse<ApiResponse<SubmissionBriefDTO[]>>> {
    return api.get(`${CONTEST_BASE}/${contestId}/my-submissions`, { params });
  },

  getLeaderboard(
    contestId: string,
    params?: { page?: number; size?: number },
  ): Promise<AxiosResponse<ApiResponse<LeaderboardResponse>>> {
    return api.get(`${CONTEST_BASE}/${contestId}/leaderboard`, { params });
  },

  createClarification(
    contestId: string,
    request: CreateClarificationRequest,
  ): Promise<AxiosResponse<ApiResponse<ClarificationResponse>>> {
    return api.post(`${CONTEST_BASE}/${contestId}/clarifications`, request);
  },

  listClarifications(
    contestId: string,
    params?: { page?: number; size?: number },
  ): Promise<AxiosResponse<ApiResponse<ClarificationResponse[]>>> {
    return api.get(`${CONTEST_BASE}/${contestId}/clarifications`, { params });
  },
};

export const adminContestApi = {
  createContest(data: ContestUpsertDTO): Promise<AxiosResponse<ApiResponse<ContestResponse>>> {
    return api.post(ADMIN_BASE, data);
  },

  updateContest(contestId: string, data: ContestUpsertDTO): Promise<AxiosResponse<ApiResponse<ContestResponse>>> {
    return api.put(`${ADMIN_BASE}/${contestId}`, data);
  },

  deleteContest(contestId: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`${ADMIN_BASE}/${contestId}`);
  },

  getContestRegistrations(
    contestId: string,
    params?: PageableParams,
  ): Promise<AxiosResponse<ApiResponse<ContestRegistrationDTO>>> {
    return api.get(`${ADMIN_BASE}/${contestId}/registrations`, {
      params,
    });
  },

  addProblem(
    contestId: string,
    request: AddProblemRequest,
  ): Promise<AxiosResponse<ApiResponse<ContestProblemResponse>>> {
    return api.post(`${ADMIN_BASE}/${contestId}/problems`, request);
  },

  removeProblem(contestId: string, contestProblemId: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`${ADMIN_BASE}/${contestId}/problems/${contestProblemId}`);
  },

  startContest(contestId: string): Promise<AxiosResponse<ApiResponse<StatusResponse>>> {
    return api.post(`${ADMIN_BASE}/${contestId}/start`);
  },

  endContest(contestId: string): Promise<AxiosResponse<ApiResponse<StatusResponse>>> {
    return api.post(`${ADMIN_BASE}/${contestId}/end`);
  },

  rejudgeSubmission(submissionId: string): Promise<AxiosResponse<ApiResponse<RejudgeResponse>>> {
    return api.post(`${ADMIN_BASE}/submissions/${submissionId}/rejudge`);
  },

  getContestSubmissions(
    contestId: string,
    params?: ContestSubmissionParams,
  ): Promise<AxiosResponse<ApiResponse<SubmissionBriefDTO[]>>> {
    return api.get(`${ADMIN_BASE}/${contestId}/submissions`, { params });
  },

  getDetailedLeaderboard(
    contestId: string,
    params?: { page?: number; size?: number },
  ): Promise<AxiosResponse<ApiResponse<AdminLeaderboardEntry[]>>> {
    return api.get(`${ADMIN_BASE}/${contestId}/leaderboard/detail`, { params });
  },

  answerClarification(
    contestId: string,
    clarificationId: string,
    request: AnswerClarificationRequest,
  ): Promise<AxiosResponse<ApiResponse<ClarificationResponse>>> {
    return api.put(`${ADMIN_BASE}/${contestId}/clarifications/${clarificationId}`, request);
  },
};

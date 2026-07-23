import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type {
	ContestUpsertDTO,
	ContestListDTO,
	ContestDetailDTO,
	ContestProblemListDTO,
	ContestProblemResponse,
	ContestResponse,
	ContestRegistrationDTO,
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
	AddProblemRequest,
	ContestListParams,
	ContestSubmissionParams,
	PageableParams,
} from "../types/contest.type";
import { ApiResponse } from "@/shared/api/api.type";
import { UpdateProblemRequest } from "@/features/problems/types/problem.type";

export const contestApi = {
	listContests(
		params?: ContestListParams,
	): Promise<AxiosResponse<ApiResponse<ContestListDTO[]>>> {
		return api.get("/contests", { params });
	},

	getContestDetail(
		contestId: string,
	): Promise<AxiosResponse<ApiResponse<ContestDetailDTO>>> {
		return api.get(`/contests/${contestId}`);
	},

	getContestProblems(
		contestId: string,
	): Promise<AxiosResponse<ApiResponse<ContestProblemListDTO[]>>> {
		return api.get(`/contests/${contestId}/problems`);
	},

	registerForContest(
		contestId: string,
	): Promise<AxiosResponse<ApiResponse<RegisterResponse>>> {
		return api.post(`/contests/${contestId}/register`);
	},

	submitSolution(
		contestId: string,
		request: SubmitRequest,
	): Promise<AxiosResponse<ApiResponse<SubmitResponse>>> {
		return api.post(`/contests/${contestId}/submit`, request);
	},

	getMySubmissions(
		contestId: string,
		params?: { contestProblemId?: string; page?: number; size?: number },
	): Promise<AxiosResponse<ApiResponse<SubmissionBriefDTO>>> {
		return api.get(`/contests/${contestId}/my-submissions`, { params });
	},

	getSubmissionDetail(
		submissionId: string,
	): Promise<AxiosResponse<ApiResponse<SubmissionDetailDTO>>> {
		return api.get(`/contests/submissions/${submissionId}`);
	},

	getLeaderboard(
		contestId: string,
		params?: PageableParams,
	): Promise<AxiosResponse<ApiResponse<LeaderboardResponse>>> {
		return api.get(`/contests/${contestId}/leaderboard`, { params });
	},

	createClarification(
		contestId: string,
		request: CreateClarificationRequest,
	): Promise<AxiosResponse<ApiResponse<ClarificationResponse>>> {
		return api.post(`/contests/${contestId}/clarifications`, request);
	},

	listClarifications(
		contestId: string,
		params?: PageableParams,
	): Promise<AxiosResponse<ApiResponse<ClarificationResponse[]>>> {
		return api.get(`/contests/${contestId}/clarifications`, { params });
	},
};

export const adminContestApi = {
	createContest(
		data: ContestUpsertDTO,
	): Promise<AxiosResponse<ApiResponse<ContestResponse>>> {
		return api.post("/admin/contests", data);
	},

	updateContest(
		contestId: string,
		data: ContestUpsertDTO,
	): Promise<AxiosResponse<ApiResponse<ContestResponse>>> {
		return api.put(`/admin/contests/${contestId}`, data);
	},

	deleteContest(contestId: string): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/admin/contests/${contestId}`);
	},

	addProblem(
		contestId: string,
		request: AddProblemRequest,
	): Promise<AxiosResponse<ApiResponse<ContestProblemResponse>>> {
		return api.post(`/admin/contests/${contestId}/problems`, request);
	},

	updateContestProblem(
		contestId: string,
		contestProblemId: string,
		request: UpdateProblemRequest,
	): Promise<AxiosResponse<ApiResponse<ContestProblemResponse>>> {
		return api.put(
			`/admin/contests/${contestId}/problems/${contestProblemId}/problem`,
			request,
		);
	},

	removeProblem(
		contestId: string,
		contestProblemId: string,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(
			`/admin/contests/${contestId}/problems/${contestProblemId}`,
		);
	},

	startContest(
		contestId: string,
	): Promise<AxiosResponse<ApiResponse<StatusResponse>>> {
		return api.post(`/admin/contests/${contestId}/start`);
	},

	endContest(
		contestId: string,
	): Promise<AxiosResponse<ApiResponse<StatusResponse>>> {
		return api.post(`/admin/contests/${contestId}/end`);
	},

	rejudgeSubmission(
		submissionId: string,
	): Promise<AxiosResponse<ApiResponse<RejudgeResponse>>> {
		return api.post(`/admin/contests/submissions/${submissionId}/rejudge`);
	},

	getContestSubmissions(
		contestId: string,
		params?: ContestSubmissionParams,
	): Promise<AxiosResponse<ApiResponse<SubmissionBriefDTO[]>>> {
		return api.get(`/admin/contests/${contestId}/submissions`, { params });
	},

	getContestRegistrations(
		contestId: string,
		params?: PageableParams,
	): Promise<AxiosResponse<ApiResponse<ContestRegistrationDTO>>> {
		return api.get(`/admin/contests/${contestId}/registrations`, { params });
	},

	getDetailedLeaderboard(
		contestId: string,
		params?: PageableParams,
	): Promise<AxiosResponse<ApiResponse<AdminLeaderboardEntry[]>>> {
		return api.get(`/admin/contests/${contestId}/leaderboard/detail`, {
			params,
		});
	},

	answerClarification(
		contestId: string,
		clarificationId: string,
		request: AnswerClarificationRequest,
	): Promise<AxiosResponse<ApiResponse<ClarificationResponse>>> {
		return api.put(
			`/admin/contests/${contestId}/clarifications/${clarificationId}`,
			request,
		);
	},
	getSubmissionDetail(
		submissionId: string,
	): Promise<AxiosResponse<ApiResponse<SubmissionDetailDTO>>> {
		return api.get(`/contests/submissions/${submissionId}`);
	},
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import contestApi from "../apis/contest.api";
import {
	type SubmitRequest,
	type ContestRunRequest,
	type ContestDebugRequest,
	type CreateClarificationRequest,
	type MySubmissionsParams,
	ContestSubmissionStatus,
	ContestListParams,
} from "../types/contest.type";

export const contestKeys = {
	all: ["contests"] as const,
	lists: () => [...contestKeys.all, "list"] as const,
	list: (params?: any) => [...contestKeys.lists(), params] as const,
	details: () => [...contestKeys.all, "detail"] as const,
	detail: (contestId: string) => [...contestKeys.details(), contestId] as const,
	problems: (contestId: string) =>
		[...contestKeys.detail(contestId), "problems"] as const,
	submissions: (contestId: string) =>
		[...contestKeys.detail(contestId), "submissions"] as const,
	mySubmissions: (params: MySubmissionsParams) =>
		[...contestKeys.submissions(params.contestId), params] as const,
	submission: (submissionId: string) => ["submission", submissionId] as const,
	leaderboard: (contestId: string, page?: number, size?: number) =>
		[...contestKeys.detail(contestId), "leaderboard", page, size] as const,
	clarifications: (contestId: string, page?: number, size?: number) =>
		[...contestKeys.detail(contestId), "clarifications", page, size] as const,
	myContests: (params?: ContestListParams) =>
		[...contestKeys.all, "my-contests", params] as const,
};

export const useContestList = ({
	status,
	search,
	page,
	size,
}: ContestListParams) => {
	return useQuery({
		queryKey: ["contests", { status, search, page, size }],
		queryFn: async () => {
			const response = await contestApi.listContests({
				status,
				search,
				page,
				size,
			});
			return response.data;
		},
	});
};

export const useMyContests = ({
	status,
	search,
	page,
	size,
}: ContestListParams) => {
	return useQuery({
		queryKey: contestKeys.myContests({ status, search, page, size }),
		queryFn: async () => {
			const response = await contestApi.getMyContests({
				status,
				search,
				page,
				size,
			});
			return response.data;
		},
	});
};
export const useContestDetail = (contestId: string) => {
	return useQuery({
		queryKey: contestKeys.detail(contestId),
		queryFn: async () => {
			const response = await contestApi.getContestDetail(contestId);
			return response.data;
		},
		enabled: !!contestId,
	});
};

export const useRegisterContest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (contestId: string) => contestApi.registerForContest(contestId),
		onSuccess: (response, contestId) => {
			queryClient.invalidateQueries({
				queryKey: contestKeys.detail(contestId),
			});
			queryClient.invalidateQueries({ queryKey: contestKeys.lists() });
			toast.success({
				title: "Đăng ký thành công!",
				description:
					response.data.message || "Bạn đã đăng ký tham gia cuộc thi.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Đăng ký thất bại!",
				description:
					error?.response?.data?.message ||
					"Đã xảy ra lỗi khi đăng ký cuộc thi.",
			});
		},
	});
};

export const useContestProblems = (contestId: string) => {
	return useQuery({
		queryKey: contestKeys.problems(contestId),
		queryFn: async () => {
			const response = await contestApi.getContestProblems(contestId);
			return response.data;
		},
		enabled: !!contestId,
	});
};

export const useSubmitSolution = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			contestId,
			request,
		}: {
			contestId: string;
			request: SubmitRequest;
		}) => contestApi.submitSolution(contestId, request),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: contestKeys.mySubmissions({ contestId: variables.contestId }),
			});
			queryClient.invalidateQueries({
				queryKey: contestKeys.problems(variables.contestId),
			});
			toast.success({
				title: "Nộp bài thành công!",
				description: response.data.message || "Bài làm của bạn đang được chấm.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Nộp bài thất bại!",
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi nộp bài.",
			});
		},
	});
};

export const useContestRunCode = () => {
	return useMutation({
		mutationFn: ({
			contestId,
			request,
		}: {
			contestId: string;
			request: ContestRunRequest;
		}) => contestApi.runCode(contestId, request),
		onError: (error: any) => {
			toast.error({
				title: "Chạy thử thất bại!",
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi chạy thử.",
			});
		},
	});
};

export const useContestDebugCode = () => {
	return useMutation({
		mutationFn: ({
			contestId,
			request,
		}: {
			contestId: string;
			request: ContestDebugRequest;
		}) => contestApi.debugCode(contestId, request),
		onError: (error: any) => {
			toast.error({
				title: "Debug thất bại!",
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi debug.",
			});
		},
	});
};

export const useMySubmissions = (params: MySubmissionsParams) => {
	return useQuery({
		queryKey: contestKeys.mySubmissions(params),
		queryFn: async () => {
			const response = await contestApi.getMySubmissions(params);
			return response.data;
		},
		enabled: !!params.contestId,
	});
};

export const useSubmissionDetail = (submissionId: string) => {
	return useQuery({
		queryKey: contestKeys.submission(submissionId),
		queryFn: async () => {
			const response = await contestApi.getSubmissionDetail(submissionId);
			return response.data;
		},
		enabled: !!submissionId,
	});
};

export const useSubmissionPolling = (submissionId: string, enabled = true) => {
	return useQuery({
		queryKey: contestKeys.submission(submissionId),
		queryFn: async () => {
			const response = await contestApi.getSubmissionDetail(submissionId);
			return response.data.data;
		},
		enabled: enabled && !!submissionId,
		refetchInterval: (query) => {
			const submission = query.state.data;
			const status = submission?.status;

			return status === ContestSubmissionStatus.PENDING ||
				status === ContestSubmissionStatus.RUNNING
				? 2000
				: false;
		},
	});
};

export const useLeaderboard = (contestId: string, page = 0, size: number) => {
	return useQuery({
		queryKey: contestKeys.leaderboard(contestId, page, size),
		queryFn: async () => {
			const response = await contestApi.getLeaderboard(contestId, page, size);
			return response.data;
		},
		enabled: !!contestId,
	});
};

export const useCreateClarification = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			contestId,
			request,
		}: {
			contestId: string;
			request: CreateClarificationRequest;
		}) => contestApi.createClarification(contestId, request),
		onSuccess: (response, variables) => {
			queryClient.invalidateQueries({
				queryKey: contestKeys.clarifications(variables.contestId),
			});
			toast.success({
				title: "Gửi câu hỏi thành công!",
				description:
					response.data.message ||
					"Câu hỏi của bạn đã được gửi đến ban tổ chức.",
			});
		},
		onError: (error: any) => {
			toast.error({
				title: "Gửi câu hỏi thất bại!",
				description:
					error?.response?.data?.message || "Đã xảy ra lỗi khi gửi câu hỏi.",
			});
		},
	});
};

export const useClarifications = (contestId: string, page = 0, size = 20) => {
	return useQuery({
		queryKey: contestKeys.clarifications(contestId, page, size),
		queryFn: async () => {
			const response = await contestApi.listClarifications(
				contestId,
				page,
				size,
			);
			return response.data;
		},
		enabled: !!contestId,
	});
};

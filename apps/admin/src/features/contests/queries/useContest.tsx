import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contestApi, adminContestApi } from "../apis/contest.api";
import type {
  ContestUpsertDTO,
  AddProblemRequest,
  ContestListParams,
  ContestSubmissionParams,
  SubmitRequest,
  CreateClarificationRequest,
  AnswerClarificationRequest,
  PageableParams,
} from "../types/contest.type";
import { UpdateProblemRequest } from "@/features/problems/types/problem.type";

export const contestKeys = {
  all: ["contests"] as const,
  lists: () => [...contestKeys.all, "list"] as const,
  list: (params?: ContestListParams) => [...contestKeys.lists(), params] as const,
  detail: (contestId: string) => [...contestKeys.all, "detail", contestId] as const,
  problems: (contestId: string) => [...contestKeys.detail(contestId), "problems"] as const,
  submissions: (contestId: string, params?: unknown) =>
    [...contestKeys.detail(contestId), "submissions", params] as const,
  mySubmissions: (contestId: string, params?: unknown) =>
    [...contestKeys.detail(contestId), "my-submissions", params] as const,
  leaderboard: (contestId: string) => [...contestKeys.detail(contestId), "leaderboard"] as const,
  clarifications: (contestId: string) => [...contestKeys.detail(contestId), "clarifications"] as const,

  admin: {
    all: ["admin", "contests"] as const,
    lists: () => [...contestKeys.admin.all, "list"] as const,
    list: (params?: ContestListParams) => [...contestKeys.admin.lists(), params] as const,
    submissions: (contestId: string, params?: ContestSubmissionParams) =>
      [...contestKeys.admin.all, contestId, "submissions", params] as const,
    leaderboard: (contestId: string) => [...contestKeys.admin.all, contestId, "leaderboard"] as const,
    registrations: (contestId: string, params?: PageableParams) =>
      [...contestKeys.admin.all, contestId, "registrations", params] as const,
  },
};

export const useContestList = (params?: ContestListParams) =>
  useQuery({
    queryKey: contestKeys.list(params),
    queryFn: async () => {
      const res = await contestApi.listContests(params);
      return res.data;
    },
  });

export const useContestDetail = (contestId: string) =>
  useQuery({
    queryKey: contestKeys.detail(contestId),
    queryFn: async () => {
      const res = await contestApi.getContestDetail(contestId);
      return res.data.data;
    },
    enabled: !!contestId,
  });

export const useContestProblems = (contestId: string) =>
  useQuery({
    queryKey: contestKeys.problems(contestId),
    queryFn: async () => {
      const res = await contestApi.getContestProblems(contestId);
      return res.data.data;
    },
    enabled: !!contestId,
  });

export const useMySubmissions = (
  contestId: string,
  params?: { contestProblemId?: string; page?: number; size?: number },
) =>
  useQuery({
    queryKey: contestKeys.mySubmissions(contestId, params),
    queryFn: async () => {
      const res = await contestApi.getMySubmissions(contestId, params);
      return res.data.data;
    },
    enabled: !!contestId,
  });

export const useLeaderboard = (contestId: string) =>
  useQuery({
    queryKey: contestKeys.leaderboard(contestId),
    queryFn: async () => {
      const res = await contestApi.getLeaderboard(contestId);
      return res.data.data;
    },
    enabled: !!contestId,
  });

export const useClarifications = (contestId: string) =>
  useQuery({
    queryKey: contestKeys.clarifications(contestId),
    queryFn: async () => {
      const res = await contestApi.listClarifications(contestId);
      return res.data.data;
    },
    enabled: !!contestId,
  });

export const useContestSubmissions = (contestId: string, params?: ContestSubmissionParams) =>
  useQuery({
    queryKey: contestKeys.admin.submissions(contestId, params),
    queryFn: async () => {
      const res = await adminContestApi.getContestSubmissions(contestId, params);
      return res.data.data;
    },
    enabled: !!contestId,
  });

export const useAdminLeaderboard = (contestId: string) =>
  useQuery({
    queryKey: contestKeys.admin.leaderboard(contestId),
    queryFn: async () => {
      const res = await adminContestApi.getDetailedLeaderboard(contestId);
      return res.data.data;
    },
    enabled: !!contestId,
  });

export const useAdminContestRegistrations = (contestId: string, params?: PageableParams) =>
  useQuery({
    queryKey: contestKeys.admin.registrations(contestId, params),
    queryFn: async () => {
      const res = await adminContestApi.getContestRegistrations(contestId, params);
      return res.data;
    },
    enabled: !!contestId,
  });

export const useRegisterContest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contestId: string) => contestApi.registerForContest(contestId),
    onSuccess: (res, contestId) => {
      qc.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
      qc.invalidateQueries({ queryKey: contestKeys.lists() });
      toast.success("Đăng ký thành công!", {
        description: res.data.message || "Bạn đã đăng ký tham gia cuộc thi.",
      });
    },
    onError: (err: any) => {
      toast.error("Đăng ký thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi khi đăng ký cuộc thi.",
      });
    },
  });
};

export const useSubmitSolution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contestId, request }: { contestId: string; request: SubmitRequest }) =>
      contestApi.submitSolution(contestId, request),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: contestKeys.mySubmissions(vars.contestId) });
      toast.success("Nộp bài thành công!", {
        description: res.data.message || "Bài làm của bạn đang được chấm.",
      });
    },
    onError: (err: any) => {
      toast.error("Nộp bài thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi khi nộp bài.",
      });
    },
  });
};

export const useCreateClarification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contestId, request }: { contestId: string; request: CreateClarificationRequest }) =>
      contestApi.createClarification(contestId, request),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: contestKeys.clarifications(vars.contestId) });
      toast.success("Gửi câu hỏi thành công!", {
        description: res.data.message || "Câu hỏi đã được gửi.",
      });
    },
    onError: (err: any) => {
      toast.error("Gửi câu hỏi thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi khi gửi câu hỏi.",
      });
    },
  });
};

export const useCreateContest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContestUpsertDTO) => adminContestApi.createContest(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      toast.success("Tạo cuộc thi thành công!", {
        description: res.data.message || "Cuộc thi đã được tạo.",
      });
    },
    onError: (err: any) => {
      toast.error("Tạo cuộc thi thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi khi tạo cuộc thi.",
      });
    },
  });
};

export const useUpdateContest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contestId, data }: { contestId: string; data: ContestUpsertDTO }) =>
      adminContestApi.updateContest(contestId, data),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      qc.invalidateQueries({ queryKey: contestKeys.detail(vars.contestId) });
      toast.success("Cập nhật cuộc thi thành công!", {
        description: res.data.message || "Thông tin cuộc thi đã được cập nhật.",
      });
    },
    onError: (err: any) => {
      toast.error("Cập nhật cuộc thi thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useDeleteContest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contestId: string) => adminContestApi.deleteContest(contestId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      toast.success("Xóa cuộc thi thành công!", {
        description: res.data.message || "Cuộc thi đã được xóa.",
      });
    },
    onError: (err: any) => {
      toast.error("Xóa cuộc thi thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useAddProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contestId, request }: { contestId: string; request: AddProblemRequest }) =>
      adminContestApi.addProblem(contestId, request),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: contestKeys.detail(vars.contestId) });
      qc.invalidateQueries({ queryKey: contestKeys.problems(vars.contestId) });
      toast.success("Thêm bài tập thành công!", {
        description: res.data.message || "Bài tập đã được thêm vào cuộc thi.",
      });
    },
    onError: (err: any) => {
      toast.error("Thêm bài tập thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useRemoveProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contestId, contestProblemId }: { contestId: string; contestProblemId: string }) =>
      adminContestApi.removeProblem(contestId, contestProblemId),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: contestKeys.detail(vars.contestId) });
      qc.invalidateQueries({ queryKey: contestKeys.problems(vars.contestId) });
      toast.success("Xóa bài tập thành công!", {
        description: res.data.message || "Bài tập đã được xóa khỏi cuộc thi.",
      });
    },
    onError: (err: any) => {
      toast.error("Xóa bài tập thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useUpdateContestProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contestId,
      contestProblemId,
      request,
    }: {
      contestId: string;
      contestProblemId: string;
      request: UpdateProblemRequest;
    }) => adminContestApi.updateContestProblem(contestId, contestProblemId, request),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: contestKeys.problems(vars.contestId) });
      qc.invalidateQueries({ queryKey: contestKeys.detail(vars.contestId) });
      toast.success("Cập nhật bài toán thành công!", {
        description: res.data.message || "Thông tin bài toán đã được cập nhật.",
      });
    },
    onError: (err: any) => {
      toast.error("Cập nhật bài toán thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useStartContest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contestId: string) => adminContestApi.startContest(contestId),
    onSuccess: (res, contestId) => {
      qc.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      qc.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
      toast.success("Bắt đầu cuộc thi thành công!", {
        description: res.data.message || "Cuộc thi đã được kích hoạt.",
      });
    },
    onError: (err: any) => {
      toast.error("Bắt đầu cuộc thi thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useEndContest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contestId: string) => adminContestApi.endContest(contestId),
    onSuccess: (res, contestId) => {
      qc.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      qc.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
      toast.success("Kết thúc cuộc thi thành công!", {
        description: res.data.message || "Cuộc thi đã kết thúc.",
      });
    },
    onError: (err: any) => {
      toast.error("Kết thúc cuộc thi thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useRejudgeSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) => adminContestApi.rejudgeSubmission(submissionId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: contestKeys.admin.all });
      toast.success("Chấm lại thành công!", {
        description: res.data.message || "Bài nộp đang được chấm lại.",
      });
    },
    onError: (err: any) => {
      toast.error("Chấm lại thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

export const useAnswerClarification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contestId,
      clarificationId,
      request,
    }: {
      contestId: string;
      clarificationId: string;
      request: AnswerClarificationRequest;
    }) => adminContestApi.answerClarification(contestId, clarificationId, request),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: contestKeys.clarifications(vars.contestId) });
      toast.success("Trả lời thành công!", {
        description: res.data.message || "Câu trả lời đã được gửi.",
      });
    },
    onError: (err: any) => {
      toast.error("Trả lời thất bại!", {
        description: err?.response?.data?.message || "Đã xảy ra lỗi.",
      });
    },
  });
};

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
} from "../types/contest.type";

export const contestKeys = {
  all: ["contests"] as const,
  lists: () => [...contestKeys.all, "list"] as const,
  list: (params?: ContestListParams) => [...contestKeys.lists(), params] as const,
  detail: (contestId: string) => [...contestKeys.all, "detail", contestId] as const,
  problems: (contestId: string) => [...contestKeys.detail(contestId), "problems"] as const,
  submissions: (contestId: string, params?: any) => [...contestKeys.detail(contestId), "submissions", params] as const,
  mySubmissions: (contestId: string, params?: any) =>
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
  },
};

export const useContestList = (params?: ContestListParams) => {
  return useQuery({
    queryKey: contestKeys.list(params),
    queryFn: async () => {
      const response = await contestApi.listContests(params);
      return response.data;
    },
  });
};

export const useContestDetail = (contestId: string) => {
  return useQuery({
    queryKey: contestKeys.detail(contestId),
    queryFn: async () => {
      const response = await contestApi.getContestDetail(contestId);
      return response.data.data;
    },
    enabled: !!contestId,
  });
};

export const useContestProblems = (contestId: string) => {
  return useQuery({
    queryKey: contestKeys.problems(contestId),
    queryFn: async () => {
      const response = await contestApi.getContestProblems(contestId);
      return response.data.data;
    },
    enabled: !!contestId,
  });
};

export const useMySubmissions = (
  contestId: string,
  params?: { contestProblemId?: string; page?: number; size?: number },
) => {
  return useQuery({
    queryKey: contestKeys.mySubmissions(contestId, params),
    queryFn: async () => {
      const response = await contestApi.getMySubmissions(contestId, params);
      return response.data.data;
    },
    enabled: !!contestId,
  });
};

export const useLeaderboard = (contestId: string) => {
  return useQuery({
    queryKey: contestKeys.leaderboard(contestId),
    queryFn: async () => {
      const response = await contestApi.getLeaderboard(contestId);
      return response.data.data;
    },
    enabled: !!contestId,
  });
};

export const useClarifications = (contestId: string) => {
  return useQuery({
    queryKey: contestKeys.clarifications(contestId),
    queryFn: async () => {
      const response = await contestApi.listClarifications(contestId);
      return response.data.data;
    },
    enabled: !!contestId,
  });
};

export const useRegisterContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestId: string) => contestApi.registerForContest(contestId),
    onSuccess: (response, contestId) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
      queryClient.invalidateQueries({ queryKey: contestKeys.lists() });
      toast.success("Đăng ký thành công!", {
        description: response.data.message || "Bạn đã đăng ký tham gia cuộc thi.",
      });
    },
    onError: (error: any) => {
      toast.error("Đăng ký thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi đăng ký cuộc thi.",
      });
    },
  });
};

export const useSubmitSolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contestId, request }: { contestId: string; request: SubmitRequest }) =>
      contestApi.submitSolution(contestId, request),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.mySubmissions(variables.contestId) });
      toast.success("Nộp bài thành công!", {
        description: response.data.message || "Bài làm của bạn đang được chấm.",
      });
    },
    onError: (error: any) => {
      toast.error("Nộp bài thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi nộp bài.",
      });
    },
  });
};

export const useCreateClarification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contestId, request }: { contestId: string; request: CreateClarificationRequest }) =>
      contestApi.createClarification(contestId, request),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.clarifications(variables.contestId) });
      toast.success("Gửi câu hỏi thành công!", {
        description: response.data.message || "Câu hỏi của bạn đã được gửi đến ban tổ chức.",
      });
    },
    onError: (error: any) => {
      toast.error("Gửi câu hỏi thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi gửi câu hỏi.",
      });
    },
  });
};

export const useCreateContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContestUpsertDTO) => adminContestApi.createContest(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      toast.success("Tạo cuộc thi thành công!", {
        description: response.data.message || "Cuộc thi đã được tạo và sẵn sàng sử dụng.",
      });
    },
    onError: (error: any) => {
      toast.error("Tạo cuộc thi thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi tạo cuộc thi.",
      });
    },
  });
};

export const useUpdateContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contestId, data }: { contestId: string; data: ContestUpsertDTO }) =>
      adminContestApi.updateContest(contestId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(variables.contestId) });
      toast.success("Cập nhật cuộc thi thành công!", {
        description: response.data.message || "Thông tin cuộc thi đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      toast.error("Cập nhật cuộc thi thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật cuộc thi.",
      });
    },
  });
};

export const useDeleteContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestId: string) => adminContestApi.deleteContest(contestId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      toast.success("Xóa cuộc thi thành công!", {
        description: response.data.message || "Cuộc thi đã được xóa khỏi hệ thống.",
      });
    },
    onError: (error: any) => {
      toast.error("Xóa cuộc thi thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi xóa cuộc thi.",
      });
    },
  });
};

export const useAddProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contestId, request }: { contestId: string; request: AddProblemRequest }) =>
      adminContestApi.addProblem(contestId, request),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(variables.contestId) });
      queryClient.invalidateQueries({ queryKey: contestKeys.problems(variables.contestId) });
      toast.success("Thêm bài tập thành công!", {
        description: response.data.message || "Bài tập đã được thêm vào cuộc thi.",
      });
    },
    onError: (error: any) => {
      toast.error("Thêm bài tập thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi thêm bài tập.",
      });
    },
  });
};

export const useRemoveProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contestId, contestProblemId }: { contestId: string; contestProblemId: string }) =>
      adminContestApi.removeProblem(contestId, contestProblemId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(variables.contestId) });
      queryClient.invalidateQueries({ queryKey: contestKeys.problems(variables.contestId) });
      toast.success("Xóa bài tập thành công!", {
        description: response.data.message || "Bài tập đã được xóa khỏi cuộc thi.",
      });
    },
    onError: (error: any) => {
      toast.error("Xóa bài tập thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi xóa bài tập.",
      });
    },
  });
};

export const useStartContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestId: string) => adminContestApi.startContest(contestId),
    onSuccess: (response, contestId) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
      toast.success("Bắt đầu cuộc thi thành công!", {
        description: response.data.message || "Cuộc thi đã được kích hoạt.",
      });
    },
    onError: (error: any) => {
      toast.error("Bắt đầu cuộc thi thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi bắt đầu cuộc thi.",
      });
    },
  });
};

export const useEndContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestId: string) => adminContestApi.endContest(contestId),
    onSuccess: (response, contestId) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.admin.lists() });
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
      toast.success("Kết thúc cuộc thi thành công!", {
        description: response.data.message || "Cuộc thi đã được kết thúc.",
      });
    },
    onError: (error: any) => {
      toast.error("Kết thúc cuộc thi thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi kết thúc cuộc thi.",
      });
    },
  });
};

export const useRejudgeSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) => adminContestApi.rejudgeSubmission(submissionId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.admin.all });
      toast.success("Chấm lại bài nộp thành công!", {
        description: response.data.message || "Bài nộp đang được chấm lại.",
      });
    },
    onError: (error: any) => {
      toast.error("Chấm lại bài nộp thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi chấm lại bài nộp.",
      });
    },
  });
};

export const useContestSubmissions = (contestId: string, params?: ContestSubmissionParams) => {
  return useQuery({
    queryKey: contestKeys.admin.submissions(contestId, params),
    queryFn: async () => {
      const response = await adminContestApi.getContestSubmissions(contestId, params);
      return response.data.data;
    },
    enabled: !!contestId,
  });
};

export const useAdminLeaderboard = (contestId: string) => {
  return useQuery({
    queryKey: contestKeys.admin.leaderboard(contestId),
    queryFn: async () => {
      const response = await adminContestApi.getDetailedLeaderboard(contestId);
      return response.data.data;
    },
    enabled: !!contestId,
  });
};

export const useAnswerClarification = () => {
  const queryClient = useQueryClient();

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
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.clarifications(variables.contestId) });
      toast.success("Trả lời câu hỏi thành công!", {
        description: response.data.message || "Câu trả lời đã được gửi.",
      });
    },
    onError: (error: any) => {
      toast.error("Trả lời câu hỏi thất bại!", {
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi trả lời câu hỏi.",
      });
    },
  });
};

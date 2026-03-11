// features/coding/hooks/useCoding.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@/shared/components/Sonner";
import type { ApiResponse } from "@/shared/api/api.type";
import { problemApi, submissionApi } from "../apis/coding.api";
import type {
  CreateProblemRequest,
  UpdateProblemRequest,
  CreateTestCaseRequest,
  UpdateTestCaseRequest,
  CreateCodeTemplateRequest,
  SubmitCodeRequest,
  ProblemFilters,
  SubmissionFilters,
  Language,
} from "../types/coding.type";

export const problemKeys = {
  all: ["problems"] as const,
  lists: () => [...problemKeys.all, "list"] as const,
  list: (filters?: ProblemFilters) => [...problemKeys.lists(), filters] as const,
  details: () => [...problemKeys.all, "detail"] as const,
  detail: (id: string, language?: Language) => [...problemKeys.details(), id, language] as const,
  statistics: (id: string) => [...problemKeys.all, "statistics", id] as const,
  submissions: (id: string, filters?: ProblemFilters) => [...problemKeys.all, "submissions", id, filters] as const,
  favorites: (filters?: ProblemFilters) => [...problemKeys.all, "favorites", filters] as const,
  templates: (id: string) => [...problemKeys.all, "templates", id] as const,
};

export const submissionKeys = {
  all: ["submissions"] as const,
  lists: () => [...submissionKeys.all, "list"] as const,
  list: (filters?: SubmissionFilters) => [...submissionKeys.lists(), filters] as const,
  details: () => [...submissionKeys.all, "detail"] as const,
  detail: (id: string) => [...submissionKeys.details(), id] as const,
  stats: () => [...submissionKeys.all, "stats"] as const,
};

export const useProblems = (filters?: ProblemFilters) => {
  return useQuery({
    queryKey: problemKeys.list(filters),
    queryFn: async () => {
      const response = await problemApi.getProblems(filters);
      return response.data;
    },
  });
};

export const useProblemDetail = (problemId: string, language?: Language, _p0?: { enabled: boolean }) => {
  return useQuery({
    queryKey: problemKeys.detail(problemId, language),
    queryFn: async () => {
      const response = await problemApi.getProblemDetail(problemId, language);
      return response.data.data;
    },
    enabled: !!problemId,
  });
};

export const useProblemStatistics = (problemId: string) => {
  return useQuery({
    queryKey: problemKeys.statistics(problemId),
    queryFn: async () => {
      const response = await problemApi.getProblemStatistics(problemId);
      return response.data.data;
    },
    enabled: !!problemId,
  });
};

export const useProblemSubmissions = (problemId: string, filters?: ProblemFilters) => {
  return useQuery({
    queryKey: problemKeys.submissions(problemId, filters),
    queryFn: async () => {
      const response = await problemApi.getProblemSubmissions(problemId, filters);
      return response.data;
    },
    enabled: !!problemId,
  });
};

export const useFavoriteProblems = (filters?: ProblemFilters) => {
  return useQuery({
    queryKey: problemKeys.favorites(filters),
    queryFn: async () => {
      const response = await problemApi.getFavoriteProblems(filters);
      return response.data.data;
    },
  });
};

export const useCodeTemplates = (problemId: string) => {
  return useQuery({
    queryKey: problemKeys.templates(problemId),
    queryFn: async () => {
      const response = await problemApi.getCodeTemplates(problemId);
      return response.data.data;
    },
    enabled: !!problemId,
  });
};

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProblemRequest) => problemApi.createProblem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
      toast.success({ title: "Thành công", description: "Tạo problem thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể tạo problem" });
    },
  });
};

export const useUpdateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, data }: { problemId: string; data: UpdateProblemRequest }) =>
      problemApi.updateProblem(problemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
      toast.success({ title: "Thành công", description: "Cập nhật problem thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật problem" });
    },
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => problemApi.deleteProblem(problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
      toast.success({ title: "Thành công", description: "Đã xóa problem" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể xóa problem" });
    },
  });
};

export const useCreateTestCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, data }: { problemId: string; data: CreateTestCaseRequest }) =>
      problemApi.createTestCase(problemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(variables.problemId) });
      toast.success({ title: "Thành công", description: "Thêm test case thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể thêm test case" });
    },
  });
};

export const useUpdateTestCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      problemId,
      testCaseId,
      data,
    }: {
      problemId: string;
      testCaseId: string;
      data: UpdateTestCaseRequest;
    }) => problemApi.updateTestCase(problemId, testCaseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(variables.problemId) });
      toast.success({ title: "Thành công", description: "Cập nhật test case thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật test case" });
    },
  });
};

export const useDeleteTestCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, testCaseId }: { problemId: string; testCaseId: string }) =>
      problemApi.deleteTestCase(problemId, testCaseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(variables.problemId) });
      toast.success({ title: "Thành công", description: "Đã xóa test case" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể xóa test case" });
    },
  });
};

export const useCreateCodeTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, data }: { problemId: string; data: CreateCodeTemplateRequest }) =>
      problemApi.createCodeTemplate(problemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.templates(variables.problemId) });
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(variables.problemId) });
      toast.success({ title: "Thành công", description: "Thêm code template thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể thêm code template" });
    },
  });
};

export const useDeleteCodeTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, language }: { problemId: string; language: Language }) =>
      problemApi.deleteCodeTemplate(problemId, language),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.templates(variables.problemId) });
      toast.success({ title: "Thành công", description: "Đã xóa code template" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể xóa code template" });
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => problemApi.toggleFavorite(problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật favorite" });
    },
  });
};

// ==================== Submission Hooks ====================

export const useSubmitCode = () => {
  return useMutation({
    mutationFn: (data: SubmitCodeRequest) => submissionApi.submitCode(data),
    onSuccess: () => {
      toast.success({ title: "Đã submit", description: "Code của bạn đang được chấm..." });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể submit code" });
    },
  });
};

export const useSubmissionResult = (
  submissionId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) => {
  return useQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: async () => {
      const response = await submissionApi.getSubmissionResult(submissionId);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!submissionId,
    refetchInterval: options?.refetchInterval,
  });
};

export const useUserSubmissions = (filters?: SubmissionFilters) => {
  return useQuery({
    queryKey: submissionKeys.list(filters),
    queryFn: async () => {
      const response = await submissionApi.getUserSubmissions(filters);
      return response.data.data;
    },
  });
};

export const useUserSubmissionStats = () => {
  return useQuery({
    queryKey: submissionKeys.stats(),
    queryFn: async () => {
      const response = await submissionApi.getUserSubmissionStats();
      return response.data.data;
    },
  });
};

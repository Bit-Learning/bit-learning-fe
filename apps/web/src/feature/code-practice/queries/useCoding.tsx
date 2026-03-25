import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@/shared/components/Sonner";
import type { ApiResponse } from "@/shared/api/api.type";
import { problemApi, submissionApi } from "../apis/coding.api";
import {
  type CreateProblemRequest,
  type UpdateProblemRequest,
  type CreateTestCaseRequest,
  type UpdateTestCaseRequest,
  type CreateCodeTemplateRequest,
  type SubmitCodeRequest,
  type RunCodeRequest,
  type DebugRequest,
  type ProblemFilters,
  type SubmissionFilters,
  type Language,
  type BulkCreateTestCaseRequest,
  type GenerateCodeTemplatesRequest,
  SubmissionStatus,
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
  testcases: (id: string) => [...problemKeys.all, "testcases", id] as const,
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

export const useProblemDetail = (problemId: string, language?: Language, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: problemKeys.detail(problemId, language),
    queryFn: async () => {
      const response = await problemApi.getProblemDetail(problemId, language);
      return response.data.data;
    },
    enabled: (options?.enabled ?? true) && !!problemId,
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
      return {
        content: response.data.data || [],
        page: response.data.page,
      };
    },
    enabled: !!problemId,
  });
};

export const useFavoriteProblems = (filters?: ProblemFilters) => {
  return useQuery({
    queryKey: problemKeys.favorites(filters),
    queryFn: async () => {
      const response = await problemApi.getFavoriteProblems(filters);
      return {
        content: response.data.data || [],
        page: response.data.page,
      };
    },
  });
};

export const useCodeTemplates = (problemId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: problemKeys.templates(problemId),
    queryFn: async () => {
      const response = await problemApi.getCodeTemplates(problemId);
      return response.data.data;
    },
    enabled: (options?.enabled ?? true) && !!problemId,
  });
};

export const useAllTestCases = (problemId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: problemKeys.testcases(problemId),
    queryFn: async () => {
      const response = await problemApi.getAllTestCases(problemId);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!problemId,
  });
};

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProblemRequest) => problemApi.createProblem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
      toast.success({ title: "Thành công", description: "Tạo bài toán thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể tạo bài toán" });
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
      toast.success({ title: "Thành công", description: "Cập nhật bài toán thành công" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật bài toán" });
    },
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => problemApi.deleteProblem(problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
      toast.success({ title: "Thành công", description: "Đã xóa bài toán" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể xóa bài toán" });
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
      queryClient.invalidateQueries({ queryKey: problemKeys.testcases(variables.problemId) });
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
      queryClient.invalidateQueries({ queryKey: problemKeys.testcases(variables.problemId) });
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
      queryClient.invalidateQueries({ queryKey: problemKeys.testcases(variables.problemId) });
      toast.success({ title: "Thành công", description: "Đã xóa test case" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể xóa test case" });
    },
  });
};

export const useBulkCreateTestCases = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, data }: { problemId: string; data: BulkCreateTestCaseRequest }) =>
      problemApi.bulkCreateTestCases(problemId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(variables.problemId) });
      queryClient.invalidateQueries({ queryKey: problemKeys.testcases(variables.problemId) });
      toast.success({ title: "Thành công", description: `Đã tạo ${response.data.data?.createdCount || 0} test cases` });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể tạo test cases hàng loạt" });
    },
  });
};

export const useDeleteAllTestCases = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => problemApi.deleteAllTestCases(problemId),
    onSuccess: (_, problemId) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(problemId) });
      queryClient.invalidateQueries({ queryKey: problemKeys.testcases(problemId) });
      toast.success({ title: "Thành công", description: "Đã xóa tất cả test cases" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể xóa test cases" });
    },
  });
};

export const useImportTestCasesFromFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, file, replaceExisting }: { problemId: string; file: File; replaceExisting?: boolean }) =>
      problemApi.importTestCasesFromFile(problemId, file, replaceExisting),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(variables.problemId) });
      queryClient.invalidateQueries({ queryKey: problemKeys.testcases(variables.problemId) });
      toast.success({
        title: "Thành công",
        description: `Đã import ${response.data.data?.createdCount || 0} test cases`,
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể import test cases" });
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

export const useGenerateCodeTemplates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ problemId, data }: { problemId: string; data: GenerateCodeTemplatesRequest }) =>
      problemApi.generateCodeTemplates(problemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.templates(variables.problemId) });
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(variables.problemId) });
      toast.success({ title: "Thành công", description: "Đã tạo code templates cho tất cả ngôn ngữ" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể tạo code templates" });
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
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật yêu thích" });
    },
  });
};

export const useSubmitCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitCodeRequest) => submissionApi.submitCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });
      toast.success({ title: "Đã nộp bài", description: "Code của bạn đang được chấm..." });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể nộp bài" });
    },
  });
};

export const useSubmissionResult = (submissionId: string) => {
  return useQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: async () => {
      const response = await submissionApi.getSubmissionResult(submissionId);
      return response.data.data;
    },
    enabled: !!submissionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const finalStatuses = [
        SubmissionStatus.ACCEPTED,
        SubmissionStatus.WRONG_ANSWER,
        SubmissionStatus.COMPILE_ERROR,
        SubmissionStatus.RUNTIME_ERROR,
        SubmissionStatus.TIME_LIMIT_EXCEEDED,
      ];
      return finalStatuses.includes(data.status) ? false : 1000;
    },
  });
};

export const useUserSubmissions = (filters?: SubmissionFilters) => {
  return useQuery({
    queryKey: submissionKeys.list(filters),
    queryFn: async () => {
      const response = await submissionApi.getUserSubmissions(filters);
      return {
        content: response.data.data || [],
        page: response.data.page,
      };
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

export const useRunCode = () => {
  return useMutation({
    mutationFn: (data: RunCodeRequest) => submissionApi.runCode(data),
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể chạy code" });
    },
  });
};

export const useDebugCode = () => {
  return useMutation({
    mutationFn: (data: DebugRequest) => submissionApi.debugCode(data),
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({ title: "Lỗi", description: error.response?.data?.message || "Không thể debug code" });
    },
  });
};

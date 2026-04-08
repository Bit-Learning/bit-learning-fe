import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@/components/Sonner";
import type { ApiResponse } from "@/shared/api/api.type";
import { problemApi } from "../apis/problem.api";
import {
  type CreateProblemRequest,
  type CreateTestCaseRequest,
  type CreateCodeTemplateRequest,
  type ProblemFilters,
  type SubmissionFilters,
  type Language,
  type BulkCreateTestCaseRequest,
  type GenerateCodeTemplatesRequest,
} from "../types/problem.type";

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

export const useProblems = (filters?: ProblemFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: problemKeys.list(filters),
    queryFn: async () => {
      const response = await problemApi.getProblems(filters);
      return response.data;
    },
    enabled: options?.enabled ?? true,
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

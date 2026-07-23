import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { problemApi } from "../apis/problem.api";
import type {
	CreateProblemRequest,
	UpdateProblemRequest,
	CreateTestCaseRequest,
	UpdateTestCaseRequest,
	CreateCodeTemplateRequest,
	GenerateCodeTemplatesRequest,
	BulkCreateTestCaseRequest,
	ProblemFilters,
	Language,
} from "../types/problem.type";
import { ApiResponse } from "@/shared/api/api.type";

export const problemKeys = {
	all: ["problems"] as const,
	lists: () => [...problemKeys.all, "list"] as const,
	list: (filters?: ProblemFilters) =>
		[...problemKeys.lists(), filters] as const,
	details: () => [...problemKeys.all, "detail"] as const,
	detail: (id: string, language?: Language) =>
		[...problemKeys.details(), id, language] as const,
	statistics: (id: string) => [...problemKeys.all, "statistics", id] as const,
	testcases: (id: string) => [...problemKeys.all, "testcases", id] as const,
	templates: (id: string) => [...problemKeys.all, "templates", id] as const,
	pendingApproval: (filters?: ProblemFilters) =>
		[...problemKeys.all, "pending-approval", filters] as const,
	tags: ["coding-tags"] as const,
};

export const useProblems = (
	filters?: ProblemFilters,
	options?: { enabled?: boolean },
) =>
	useQuery({
		queryKey: problemKeys.list(filters),
		queryFn: async () => {
			const res = await problemApi.getProblems({
				...filters,
				size: filters?.size ?? 20,
			});
			return res.data;
		},
		enabled: options?.enabled ?? true,
	});

export const useProblemDetail = (
	problemId: string,
	language?: Language,
	options?: { enabled?: boolean },
) =>
	useQuery({
		queryKey: problemKeys.detail(problemId, language),
		queryFn: async () => {
			const res = await problemApi.getProblemDetail(problemId, language);
			return res.data.data;
		},
		enabled: (options?.enabled ?? true) && !!problemId,
	});

export const useProblemStatistics = (problemId: string) =>
	useQuery({
		queryKey: problemKeys.statistics(problemId),
		queryFn: async () => {
			const res = await problemApi.getProblemStatistics(problemId);
			return res.data.data;
		},
		enabled: !!problemId,
	});

export const useAllTestCases = (problemId: string) =>
	useQuery({
		queryKey: problemKeys.testcases(problemId),
		queryFn: async () => {
			const res = await problemApi.getAllTestCases(problemId);
			return res.data.data;
		},
		enabled: !!problemId,
	});

export const useCodeTemplates = (problemId: string) =>
	useQuery({
		queryKey: problemKeys.templates(problemId),
		queryFn: async () => {
			const res = await problemApi.getCodeTemplates(problemId);
			return res.data.data;
		},
		enabled: !!problemId,
	});

export const useGetAllTags = () =>
	useQuery({
		queryKey: problemKeys.tags,
		queryFn: async () => {
			const res = await problemApi.getAllTags();
			return res.data.data;
		},
		staleTime: 5 * 60 * 1000,
	});

export const useGetPendingProblems = (filters?: ProblemFilters) =>
	useQuery({
		queryKey: problemKeys.pendingApproval(filters),
		queryFn: async () => {
			const res = await problemApi.getPendingProblems(filters);
			return res.data;
		},
	});

export const useCreateProblem = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateProblemRequest) => problemApi.createProblem(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: problemKeys.all });
			toast.success("Tạo bài toán thành công");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể tạo bài toán");
		},
	});
};

export const useUpdateProblem = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemId,
			data,
		}: {
			problemId: string;
			data: UpdateProblemRequest;
		}) => problemApi.updateProblem(problemId, data),
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.lists() });
			toast.success("Cập nhật bài toán thành công");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể cập nhật bài toán");
		},
	});
};

export const useDeleteProblem = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (problemId: string) => problemApi.deleteProblem(problemId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: problemKeys.lists() });
			toast.success("Đã xóa bài toán");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể xóa bài toán");
		},
	});
};

export const useCreateTestCase = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemId,
			data,
		}: {
			problemId: string;
			data: CreateTestCaseRequest;
		}) => problemApi.createTestCase(problemId, data),
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.testcases(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			toast.success("Thêm test case thành công");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể thêm test case");
		},
	});
};

export const useUpdateTestCase = () => {
	const qc = useQueryClient();
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
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.testcases(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			toast.success("Cập nhật test case thành công");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(
				err.response?.data?.message || "Không thể cập nhật test case",
			);
		},
	});
};

export const useDeleteTestCase = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemId,
			testCaseId,
		}: {
			problemId: string;
			testCaseId: string;
		}) => problemApi.deleteTestCase(problemId, testCaseId),
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.testcases(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			toast.success("Đã xóa test case");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể xóa test case");
		},
	});
};

export const useDeleteAllTestCases = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (problemId: string) => problemApi.deleteAllTestCases(problemId),
		onSuccess: (_, problemId) => {
			qc.invalidateQueries({ queryKey: problemKeys.testcases(problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(problemId) });
			toast.success("Đã xóa tất cả test cases");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể xóa test cases");
		},
	});
};

export const useBulkCreateTestCases = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemId,
			data,
		}: {
			problemId: string;
			data: BulkCreateTestCaseRequest;
		}) => problemApi.bulkCreateTestCases(problemId, data),
		onSuccess: (res, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.testcases(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			toast.success(`Đã tạo ${res.data.data?.createdCount || 0} test cases`);
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể tạo test cases");
		},
	});
};

export const useImportTestCasesFromFile = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemId,
			file,
			replaceExisting,
		}: {
			problemId: string;
			file: File;
			replaceExisting?: boolean;
		}) => problemApi.importTestCasesFromFile(problemId, file, replaceExisting),
		onSuccess: (res, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.testcases(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			toast.success(`Đã import ${res.data.data?.createdCount || 0} test cases`);
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể import test cases");
		},
	});
};

export const useCreateCodeTemplate = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemId,
			data,
		}: {
			problemId: string;
			data: CreateCodeTemplateRequest;
		}) => problemApi.createCodeTemplate(problemId, data),
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.templates(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			toast.success("Thêm code template thành công");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(
				err.response?.data?.message || "Không thể thêm code template",
			);
		},
	});
};

export const useDeleteCodeTemplate = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemId,
			language,
		}: {
			problemId: string;
			language: Language;
		}) => problemApi.deleteCodeTemplate(problemId, language),
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.templates(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			toast.success("Đã xóa code template");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể xóa code template");
		},
	});
};

export const useGenerateCodeTemplates = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemId,
			data,
		}: {
			problemId: string;
			data: GenerateCodeTemplatesRequest;
		}) => problemApi.generateCodeTemplates(problemId, data),
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.templates(vars.problemId) });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.problemId) });
			toast.success("Đã tạo code templates cho tất cả ngôn ngữ");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(
				err.response?.data?.message || "Không thể tạo code templates",
			);
		},
	});
};

export const usePublishProblem = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
			problemApi.publishProblem(id, isPublic),
		onSuccess: (_, vars) => {
			qc.invalidateQueries({ queryKey: problemKeys.lists() });
			qc.invalidateQueries({ queryKey: problemKeys.detail(vars.id) });
			toast.success(vars.isPublic ? "Đã công bố bài tập" : "Đã ẩn bài tập");
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(
				err.response?.data?.message || "Không thể cập nhật trạng thái",
			);
		},
	});
};

export const useApproveProblem = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (problemIds: string[]) => problemApi.approve({ problemIds }),
		onSuccess: (_, problemIds) => {
			qc.invalidateQueries({ queryKey: problemKeys.all });
			toast.success(`${problemIds.length} bài tập đã được phê duyệt`);
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể phê duyệt bài tập");
		},
	});
};

export const useRejectProblem = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			problemIds,
			rejectReason,
		}: {
			problemIds: string[];
			rejectReason: string;
		}) => problemApi.reject({ problemIds, rejectReason }),
		onSuccess: (_, { problemIds }) => {
			qc.invalidateQueries({ queryKey: problemKeys.all });
			toast.success(`${problemIds.length} bài tập đã bị từ chối`);
		},
		onError: (err: AxiosError<ApiResponse<null>>) => {
			toast.error(err.response?.data?.message || "Không thể từ chối bài tập");
		},
	});
};

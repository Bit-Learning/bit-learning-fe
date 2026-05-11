import { useMutation, useQuery } from "@tanstack/react-query";
import { kidsBlocklyApi } from "../apis/kids-blockly.api";
import type { SubmitKidsBlocklyRunRequest } from "../types/kid-blockly.types";

export const kidsBlocklyQueryKeys = {
	all: ["kids-blockly"] as const,
	bootstrap: () => [...kidsBlocklyQueryKeys.all, "bootstrap"] as const,
	progress: () => [...kidsBlocklyQueryKeys.all, "progress"] as const,
	levels: () => [...kidsBlocklyQueryKeys.all, "levels"] as const,
	run: (runId: string) => [...kidsBlocklyQueryKeys.all, "runs", runId] as const,
	leaderboard: (page: number, size: number) =>
		[...kidsBlocklyQueryKeys.all, "leaderboard", { page, size }] as const,
};

export function useKidsBlocklyBootstrap() {
	return useQuery({
		queryKey: kidsBlocklyQueryKeys.bootstrap(),
		queryFn: async () => {
			const response = await kidsBlocklyApi.getBootstrap();
			if (!response.data) {
				throw new Error(response.message ?? "Không tải được Kids Blockly.");
			}
			return response.data;
		},
		staleTime: 60 * 1000,
	});
}

export function useKidsBlocklyProgress() {
	return useQuery({
		queryKey: kidsBlocklyQueryKeys.progress(),
		queryFn: async () => {
			const response = await kidsBlocklyApi.getProgress();
			if (!response.data) {
				throw new Error(response.message ?? "Không tải được tiến độ.");
			}
			return response.data;
		},
		staleTime: 30 * 1000,
	});
}

export function useSubmitKidsBlocklyRun() {
	return useMutation({
		mutationFn: async ({
			levelId,
			request,
		}: {
			levelId: string;
			request: SubmitKidsBlocklyRunRequest;
		}) => {
			const response = await kidsBlocklyApi.submitRun(levelId, request);
			if (!response.data) {
				throw new Error(response.message ?? "Không chạy được chương trình.");
			}
			return response.data;
		},
	});
}

export function useKidsBlocklyRun(runId: string | null) {
	return useQuery({
		queryKey: kidsBlocklyQueryKeys.run(runId ?? ""),
		queryFn: async () => {
			if (!runId) {
				throw new Error("Thiếu mã lượt chạy.");
			}
			const response = await kidsBlocklyApi.getRun(runId);
			if (!response.data) {
				throw new Error(response.message ?? "Không tải được lượt chạy.");
			}
			return response.data;
		},
		enabled: !!runId,
		staleTime: 60 * 1000,
	});
}

export function useKidsBlocklyLeaderboard(page = 0, size = 20) {
	return useQuery({
		queryKey: kidsBlocklyQueryKeys.leaderboard(page, size),
		queryFn: async () => {
			const response = await kidsBlocklyApi.getLeaderboard(page, size);
			if (!response.data) {
				throw new Error(response.message ?? "Không tải được bảng xếp hạng.");
			}
			return {
				items: response.data,
				pagination: response.page,
			};
		},
		staleTime: 60 * 1000,
	});
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGamesApi, type AdminGameDto } from "../api/admin-games.api";
import type { ApiResponse } from "@/shared/api/api.type";
import api from "@/shared/api/api";

export const ADMIN_GAMES_CRUD_KEYS = {
	all: ["admin-games", "crud"] as const,
	list: () => ["admin-games", "crud", "list"] as const,
	detail: (id: number) => ["admin-games", "crud", "detail", id] as const,
	categories: () => ["admin-games", "categories"] as const,
};

export const useAdminGamesList = () => {
	return useQuery({
		queryKey: ADMIN_GAMES_CRUD_KEYS.list(),
		queryFn: async () => {
			const res = await adminGamesApi.listGames();
			return (res.data.data ?? []) as AdminGameDto[];
		},
	});
};

export interface GameCategoryOption {
	id: number;
	name: string;
}

export const useGameCategories = () => {
	return useQuery({
		queryKey: ADMIN_GAMES_CRUD_KEYS.categories(),
		queryFn: async () => {
			const res = await api.get<ApiResponse<any[]>>("/games-categories");
			const list = (res.data.data ?? []) as any[];
			return list.map((c) => ({
				id: c.id as number,
				name: c.name as string,
			})) as GameCategoryOption[];
		},
	});
};

export interface UpsertGamePayload {
	id?: number;
	file?: File;
	title: string;
	desc: string;
	gameType?: "QUIZ" | "TYPING" | "MATCHING" | "OTHER";
	scoringModel?: "FINITE_SCORE" | "HIGH_SCORE" | "NO_SCORE";
	isScored?: boolean;
	trackingConfig?: string;
	difficulty?: string;
	baseScoreMax?: number;
	difficultyMultiplier?: number;
	passingThreshold?: number;
	featuredViewWeight?: number;
	featuredLikeWeight?: number;
	featuredManualBoost?: number;
	categoryId?: number;
	thumbnailUrl?: string;
	thumbnail?: File;
}

export const useUpsertGame = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: UpsertGamePayload) => {
			let res: { data: ApiResponse<AdminGameDto> };
			if (payload.id) {
				res = await adminGamesApi.updateGame(payload.id, payload);
			} else {
				if (!payload.file) {
					throw new Error("File is required when creating a new game");
				}
				res = await adminGamesApi.createGame(
					payload as Required<UpsertGamePayload>,
				);
			}
			return res.data.data as AdminGameDto;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ADMIN_GAMES_CRUD_KEYS.list(),
			});
		},
	});
};

export const useDeleteGame = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const res = await adminGamesApi.deleteGame(id);
			return res.data as ApiResponse<void>;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ADMIN_GAMES_CRUD_KEYS.list(),
			});
		},
	});
};

export const useApproveGame = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const res = await adminGamesApi.approveGame(id);
			return res.data.data as AdminGameDto;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ADMIN_GAMES_CRUD_KEYS.list(),
			});
		},
	});
};

export const useRejectGame = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const res = await adminGamesApi.rejectGame(id);
			return res.data.data as AdminGameDto;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ADMIN_GAMES_CRUD_KEYS.list(),
			});
		},
	});
};

export const useBulkUpdateGameStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			ids,
			status,
		}: {
			ids: number[];
			status: "PUBLISHED" | "DRAFT";
		}) => {
			const res = await adminGamesApi.bulkUpdateStatus(ids, status);
			return res.data.data as AdminGameDto[];
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ADMIN_GAMES_CRUD_KEYS.list(),
			});
			void queryClient.invalidateQueries({
				queryKey: ["matching-game"],
			});
		},
	});
};

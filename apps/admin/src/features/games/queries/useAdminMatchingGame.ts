import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	adminMatchingGameApi,
	type CurriculumMappingDto,
	type MatchingGameFullDto,
	type MatchingUpsertRequest,
} from "../api/admin-matching-game.api";

export const MATCHING_GAME_KEYS = {
	mappings: () => ["matching-game", "mappings"] as const,
	detail: ({
		gameId,
		grade,
		topicCode,
	}: {
		gameId?: number;
		grade?: number;
		topicCode?: string;
	}) =>
		[
			"matching-game",
			"detail",
			gameId ?? null,
			grade ?? null,
			topicCode ?? null,
		] as const,
};

export const useMatchingGameMappings = () =>
	useQuery({
		queryKey: MATCHING_GAME_KEYS.mappings(),
		queryFn: async () => {
			const res = await adminMatchingGameApi.listMappings();
			return (res.data.data ?? []) as CurriculumMappingDto[];
		},
	});

export const useMatchingGameDetail = (
	{
		gameId,
		grade,
		topicCode,
	}: {
		gameId?: number;
		grade?: number;
		topicCode?: string;
	},
	enabled = true,
) =>
	useQuery({
		queryKey: MATCHING_GAME_KEYS.detail({ gameId, grade, topicCode }),
		queryFn: async () => {
			const res = await adminMatchingGameApi.getGame({
				gameId,
				grade,
				topicCode,
			});
			return res.data.data as MatchingGameFullDto;
		},
		enabled,
	});

export const useUpsertMatchingGame = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (request: MatchingUpsertRequest) => {
			const res = await adminMatchingGameApi.upsertGame(request);
			return res.data.data as MatchingGameFullDto;
		},
		onSuccess: () => {
			void Promise.all([
				queryClient.invalidateQueries({
					queryKey: MATCHING_GAME_KEYS.mappings(),
				}),
				queryClient.invalidateQueries({
					queryKey: ["matching-game", "detail"],
				}),
			]);
		},
	});
};

export const useDeleteMatchingGame = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ gameId }: { gameId: number }) => {
			await adminMatchingGameApi.deleteGame(gameId);
		},
		onSuccess: () => {
			void Promise.all([
				queryClient.invalidateQueries({
					queryKey: MATCHING_GAME_KEYS.mappings(),
				}),
				queryClient.invalidateQueries({
					queryKey: ["matching-game", "detail"],
				}),
			]);
		},
	});
};

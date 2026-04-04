import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	adminMatchingGameApi,
	type CurriculumMappingDto,
	type MatchingGameFullDto,
	type MatchingUpsertRequest,
} from "../api/admin-matching-game.api";

export const MATCHING_GAME_KEYS = {
	mappings: () => ["matching-game", "mappings"] as const,
	detail: (grade: number, topicCode: string) =>
		["matching-game", "detail", grade, topicCode] as const,
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
	grade: number,
	topicCode: string,
	enabled = true,
) =>
	useQuery({
		queryKey: MATCHING_GAME_KEYS.detail(grade, topicCode),
		queryFn: async () => {
			const res = await adminMatchingGameApi.getGame(grade, topicCode);
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
			void queryClient.invalidateQueries({
				queryKey: MATCHING_GAME_KEYS.mappings(),
			});
		},
	});
};

export const useDeleteMatchingGame = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			grade,
			topicCode,
		}: {
			grade: number;
			topicCode: string;
		}) => {
			await adminMatchingGameApi.deleteGame(grade, topicCode);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: MATCHING_GAME_KEYS.mappings(),
			});
		},
	});
};

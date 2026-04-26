import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	curriculumLinkApi,
	type CreateCurriculumLinkRequest,
	type CurriculumLinkResponse,
} from "../api/curriculum-link.api";

export const CURRICULUM_LINK_KEYS = {
	all: (gameId: number) => ["curriculum-links", gameId] as const,
	list: (gameId: number) => ["curriculum-links", gameId, "list"] as const,
};

export const useCurriculumLinks = (gameId: number) => {
	return useQuery({
		queryKey: CURRICULUM_LINK_KEYS.list(gameId),
		queryFn: async () => {
			const res = await curriculumLinkApi.getLinks(gameId);
			return (res.data.data ?? []) as CurriculumLinkResponse[];
		},
		enabled: gameId > 0,
		staleTime: 2 * 60 * 1000,
	});
};

export const useCreateCurriculumLink = (gameId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: CreateCurriculumLinkRequest) => {
			const res = await curriculumLinkApi.createLink(gameId, payload);
			return res.data.data as CurriculumLinkResponse;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: CURRICULUM_LINK_KEYS.list(gameId),
			});
		},
	});
};

export const useDeleteCurriculumLink = (gameId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (linkId: number) => {
			await curriculumLinkApi.deleteLink(gameId, linkId);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: CURRICULUM_LINK_KEYS.list(gameId),
			});
		},
	});
};

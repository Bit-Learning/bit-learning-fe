import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	kidsBlocklyApi,
	type KidsBlocklyLevel,
	type CreateKidsBlocklyLevelRequest,
	type UpdateKidsBlocklyLevelRequest,
} from "../api/kids-blockly.api";

export const KIDS_BLOCKLY_KEYS = {
	all: ["kids-blockly"] as const,
	list: (page: number, pageSize: number, isPublished?: boolean) =>
		["kids-blockly", "list", page, pageSize, isPublished] as const,
	detail: (id: string) => ["kids-blockly", "detail", id] as const,
};

export interface UseKidsBlocklyLevelsParams {
	page?: number;
	pageSize?: number;
	isPublished?: boolean;
}

export const useKidsBlocklyLevels = ({
	page = 0,
	pageSize = 10,
	isPublished,
}: UseKidsBlocklyLevelsParams = {}) => {
	return useQuery({
		queryKey: KIDS_BLOCKLY_KEYS.list(page, pageSize, isPublished),
		queryFn: async () => {
			const res = await kidsBlocklyApi.getLevels({
				page,
				size: pageSize,
				isPublished,
			});
			return res.data;
		},
	});
};

export const useCreateKidsBlocklyLevel = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: CreateKidsBlocklyLevelRequest) => {
			const res = await kidsBlocklyApi.createLevel(payload);
			return res.data.data as KidsBlocklyLevel;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ["kids-blockly", "list"],
			});
		},
	});
};

export const useUpdateKidsBlocklyLevel = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			levelId,
			payload,
		}: {
			levelId: string;
			payload: UpdateKidsBlocklyLevelRequest;
		}) => {
			const res = await kidsBlocklyApi.updateLevel(levelId, payload);
			return res.data.data as KidsBlocklyLevel;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ["kids-blockly", "list"],
			});
		},
	});
};

export const usePublishKidsBlocklyLevel = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			levelId,
			isPublished,
		}: {
			levelId: string;
			isPublished: boolean;
		}) => {
			const res = await kidsBlocklyApi.publishLevel(levelId, { isPublished });
			return res.data.data as KidsBlocklyLevel;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ["kids-blockly", "list"],
			});
		},
	});
};

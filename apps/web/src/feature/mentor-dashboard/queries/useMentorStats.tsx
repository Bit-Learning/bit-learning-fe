import { useQuery } from "@tanstack/react-query";
import { mentorStatsApi } from "../apis/mentor.api";
import type {
	MentorWithViewsResponse,
	MentorWithReactionsResponse,
	TransformedMentorStats,
} from "../types/mentor.type";
import { transformMentorStats } from "../types/mentor.type";

export const mentorKeys = {
	all: ["mentor-stats"] as const,
	topByViews: (limit: number) => ["mentor-top-views", limit] as const,
	topByReactions: (limit: number) => ["mentor-top-reactions", limit] as const,
};

export const useGetMentorStats = () => {
	return useQuery<TransformedMentorStats>({
		queryKey: mentorKeys.all,
		queryFn: async () => {
			const response = await mentorStatsApi.getMentorStats();
			return transformMentorStats(response.data.data!);
		},
	});
};

export const useGetTopMentorsByViews = (limit = 5) => {
	return useQuery<MentorWithViewsResponse[]>({
		queryKey: mentorKeys.topByViews(limit),
		queryFn: async () => {
			const response = await mentorStatsApi.getTopMentorsByViews(limit);
			return response.data.data!;
		},
	});
};

export const useGetTopMentorsByReactions = (limit = 5) => {
	return useQuery<MentorWithReactionsResponse[]>({
		queryKey: mentorKeys.topByReactions(limit),
		queryFn: async () => {
			const response = await mentorStatsApi.getTopMentorsByReactions(limit);
			return response.data.data!;
		},
	});
};

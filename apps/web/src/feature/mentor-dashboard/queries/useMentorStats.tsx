import { useQuery } from "@tanstack/react-query";
import { mentorStatsApi } from "../apis/mentor.api";
import { TransformedMentorStats, transformMentorStats } from "../types/mentor.type";

export const mentorKeys = {
  all: ["mentor-stats"] as const,
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

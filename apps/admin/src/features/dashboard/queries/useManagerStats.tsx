import { useQuery } from "@tanstack/react-query";
import { managerStatsApi } from "../api/manager-stats.api";

export const managerKeys = {
  all: ["manager-stats"] as const,
};

export const useGetManagerStats = () => {
  return useQuery({
    queryKey: managerKeys.all,
    queryFn: async () => {
      const response = await managerStatsApi.getManagerStats();
      return response.data.data;
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import { tagApi } from "../apis/tag.api";

export const tagKeys = {
  all: ["coding-tags"] as const,
};

export const useGetAllTags = () => {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: async () => {
      const response = await tagApi.getAllTags();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

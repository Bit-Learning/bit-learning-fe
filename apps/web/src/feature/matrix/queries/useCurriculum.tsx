import { useQuery } from "@tanstack/react-query";
import { curriculumApi } from "../apis/curriculum.api";

export const curriculumKeys = {
  all: ["curriculums"] as const,
  list: () => [...curriculumKeys.all, "list"] as const,
  detail: (id: number) => [...curriculumKeys.all, "detail", id] as const,
};

export const useCurriculumsList = () => {
  return useQuery({
    queryKey: curriculumKeys.list(),
    queryFn: async () => {
      const response = await curriculumApi.getAllList();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCurriculumDetail = (id?: number) => {
  return useQuery({
    queryKey: curriculumKeys.detail(id ?? 0),
    queryFn: async () => {
      const response = await curriculumApi.getById(id!);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

import { useQuery } from "@tanstack/react-query";
import { subjectApi } from "../api/subject.api";

export const useSubjectsList = () => {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await subjectApi.getAllList();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

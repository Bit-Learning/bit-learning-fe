import { useQuery } from "@tanstack/react-query";
import { subjectApi } from "../apis/subject.api";

export const subjectKeys = {
  all: ["subjects"] as const,
  list: () => [...subjectKeys.all, "list"] as const,
};

export const useSubjectsList = () => {
  return useQuery({
    queryKey: subjectKeys.list(),
    queryFn: async () => {
      const response = await subjectApi.getAllList();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSubjectsByCurriculum = (curriculumId?: number) => {
  const query = useSubjectsList();
  return {
    ...query,
    data: curriculumId ? query.data?.filter((s) => s.curriculum?.id === curriculumId) : query.data,
  };
};

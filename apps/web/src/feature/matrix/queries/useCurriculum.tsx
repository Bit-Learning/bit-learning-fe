import { useQuery } from "@tanstack/react-query";
import { curriculumApi } from "../apis/curriculum.api";

export const useCurriculumsList = () => {
	return useQuery({
		queryKey: ["curriculums"],
		queryFn: async () => {
			const response = await curriculumApi.getAllList();
			return response.data.data;
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

import { useQuery } from "@tanstack/react-query";
import { sectionApi } from "../api/section.api";

export const useSectionsByCourse = (courseId: number) => {
	return useQuery({
		queryKey: ["sections"],
		queryFn: async () => {
			const response = await sectionApi.getAllSectionsByCourseId(courseId);
			return response.data.data;
		},
		enabled: !!courseId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

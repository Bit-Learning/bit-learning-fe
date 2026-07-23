import { useQuery } from "@tanstack/react-query";
import { sectionApi } from "../api/section.api";

export const sectionKeys = {
	all: ["sections"] as const,
	byCourse: (courseId: number) =>
		[...sectionKeys.all, "course", courseId] as const,
};

export const useSectionsByCourse = (courseId: number) => {
	return useQuery({
		queryKey: sectionKeys.byCourse(courseId),
		queryFn: async () => {
			const response = await sectionApi.getAllSectionsByCourseId(courseId);
			return response.data.data;
		},
		enabled: !!courseId,
		staleTime: 30 * 1000,
		gcTime: 60 * 1000,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
	});
};

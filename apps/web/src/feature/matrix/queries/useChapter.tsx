import { useQuery } from "@tanstack/react-query";
import { chapterApi } from "../apis/chapter.api";

export const chapterKeys = {
	all: ["chapters"] as const,
	list: (page: number, size: number) =>
		["chapters", "list", page, size] as const,
	bySubject: (subjectId: number) => ["chapters", "subject", subjectId] as const,
	detail: (id: number) => ["chapters", "detail", id] as const,
};

export const useChapters = (page = 0, size = 10) => {
	return useQuery({
		queryKey: chapterKeys.list(page, size),
		queryFn: async () => {
			const response = await chapterApi.getAll({ page, size });
			return response.data;
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useChaptersBySubject = (subjectId?: number) => {
	return useQuery({
		queryKey: chapterKeys.bySubject(subjectId ?? 0),
		queryFn: async () => {
			if (!subjectId) return null;
			const response = await chapterApi.getBySubject(subjectId);
			return response.data.data;
		},
		enabled: !!subjectId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useChapterDetail = (id?: number) => {
	return useQuery({
		queryKey: chapterKeys.detail(id ?? 0),
		queryFn: async () => {
			if (!id) return null;
			const response = await chapterApi.getById(id);
			return response.data.data;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

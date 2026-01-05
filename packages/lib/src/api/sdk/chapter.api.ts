import { queryOptions } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type {
	ApiResponse,
	ChapterRequest,
	ChapterResponse,
} from "./chapter.type";

export class ChapterApi {
	constructor(private readonly client: AxiosInstance) {}

	// Get chapters by subject
	getChaptersBySubject(subjectId: number) {
		return queryOptions({
			queryKey: ["chapters", "subject", subjectId],
			queryFn: async () => {
				const response = await this.client.get<ApiResponse<ChapterResponse[]>>(
					"/matrices/chapters",
					{
						params: { subjectId },
					},
				);
				return response.data.data;
			},
		});
	}

	// Get chapter by ID
	getChapterById(id: number) {
		return queryOptions({
			queryKey: ["chapter", id],
			queryFn: async () => {
				const response = await this.client.get<ApiResponse<ChapterResponse>>(
					`/matrices/chapters/${id}`,
				);
				return response.data.data;
			},
		});
	}

	// Create chapter
	createChapter() {
		return {
			mutationFn: async (data: ChapterRequest) => {
				const response = await this.client.post<ApiResponse<ChapterResponse>>(
					"/matrices/chapters",
					data,
				);
				return response.data.data;
			},
		};
	}

	// Update chapter
	updateChapter() {
		return {
			mutationFn: async ({
				id,
				data,
			}: {
				id: number;
				data: ChapterRequest;
			}) => {
				const response = await this.client.put<ApiResponse<ChapterResponse>>(
					`/matrices/chapters/${id}`,
					data,
				);
				return response.data.data;
			},
		};
	}

	// Delete chapter
	deleteChapter() {
		return {
			mutationFn: async (id: number) => {
				const response = await this.client.delete<ApiResponse<object>>(
					`/matrices/chapters/${id}`,
				);
				return response.data.data;
			},
		};
	}
}

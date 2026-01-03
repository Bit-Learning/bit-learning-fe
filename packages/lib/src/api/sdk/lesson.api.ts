import { queryOptions } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { ApiResponse, LessonRequest, LessonResponse } from "./lesson.type";

export class LessonApi {
	constructor(private readonly client: AxiosInstance) {}

	// Get lessons by chapter
	getLessonsByChapter(chapterId: number) {
		return queryOptions({
			queryKey: ["lessons", "chapter", chapterId],
			queryFn: async () => {
				const response = await this.client.get<ApiResponse<LessonResponse[]>>(
					"/matrices/lessons",
					{
						params: { chapterId },
					},
				);
				return response.data.data;
			},
		});
	}

	// Get lesson by ID
	getLessonById(id: number) {
		return queryOptions({
			queryKey: ["lesson", id],
			queryFn: async () => {
				const response = await this.client.get<ApiResponse<LessonResponse>>(
					`/matrices/lessons/${id}`,
				);
				return response.data.data;
			},
		});
	}

	// Create lesson
	createLesson() {
		return {
			mutationFn: async (data: LessonRequest) => {
				const response = await this.client.post<ApiResponse<LessonResponse>>(
					"/matrices/lessons",
					data,
				);
				return response.data.data;
			},
		};
	}

	// Update lesson
	updateLesson() {
		return {
			mutationFn: async ({ id, data }: { id: number; data: LessonRequest }) => {
				const response = await this.client.put<ApiResponse<LessonResponse>>(
					`/matrices/lessons/${id}`,
					data,
				);
				return response.data.data;
			},
		};
	}

	// Delete lesson
	deleteLesson() {
		return {
			mutationFn: async (id: number) => {
				const response = await this.client.delete<ApiResponse<object>>(
					`/matrices/lessons/${id}`,
				);
				return response.data.data;
			},
		};
	}
}

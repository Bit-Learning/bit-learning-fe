import { queryOptions } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { ApiResponse, Pageable } from "./matrix.type";
import type {
	OptionRequest,
	OptionResponse,
	PageQuestionResponse,
	QuestionFilter,
	QuestionRequest,
	QuestionResponse,
} from "./question.type";

export class QuestionApi {
	constructor(private readonly client: AxiosInstance) {}

	// Get question by ID
	getQuestionById(id: number) {
		return queryOptions({
			queryKey: ["question", id],
			queryFn: async () => {
				const response = await this.client.get<ApiResponse<QuestionResponse>>(
					`/matrices/questions/${id}`,
				);
				return response.data.data;
			},
		});
	}

	// Search questions with filter
	searchQuestions(filter: QuestionFilter, pageable: Pageable) {
		return queryOptions({
			queryKey: ["questions", "search", filter, pageable],
			queryFn: async () => {
				const response = await this.client.post<
					ApiResponse<PageQuestionResponse>
				>("/matrices/questions/search", filter, { params: pageable });
				return response.data.data;
			},
		});
	}

	// Get my questions (requires X-User-Id header)
	getMyQuestions(userId: number, pageable: Pageable) {
		return queryOptions({
			queryKey: ["questions", "my", userId, pageable],
			queryFn: async () => {
				const response = await this.client.get<
					ApiResponse<PageQuestionResponse>
				>("/matrices/questions/my-question", {
					headers: { "X-User-Id": userId },
					params: pageable,
				});
				return response.data.data;
			},
		});
	}

	// Create question
	createQuestion() {
		return {
			mutationFn: async (data: QuestionRequest) => {
				const response = await this.client.post<ApiResponse<QuestionResponse>>(
					"/matrices/questions",
					data,
				);
				return response.data.data;
			},
		};
	}

	// Update question
	updateQuestion() {
		return {
			mutationFn: async ({
				id,
				data,
			}: {
				id: number;
				data: QuestionRequest;
			}) => {
				const response = await this.client.put<ApiResponse<QuestionResponse>>(
					`/matrices/questions/${id}`,
					data,
				);
				return response.data.data;
			},
		};
	}

	// Delete question
	deleteQuestion() {
		return {
			mutationFn: async (id: number) => {
				const response = await this.client.delete<ApiResponse<object>>(
					`/matrices/questions/${id}`,
				);
				return response.data.data;
			},
		};
	}

	// Import questions from file
	importQuestions() {
		return {
			mutationFn: async (file: File) => {
				const formData = new FormData();
				formData.append("file", file);

				const response = await this.client.post<ApiResponse<object>>(
					"/matrices/questions/import",
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					},
				);
				return response.data.data;
			},
		};
	}

	// Get options by question
	getOptionsByQuestion(questionId: number) {
		return queryOptions({
			queryKey: ["question-options", questionId],
			queryFn: async () => {
				const response = await this.client.get<ApiResponse<OptionResponse[]>>(
					"/matrices/question-options",
					{
						params: { questionId },
					},
				);
				return response.data.data;
			},
		});
	}

	// Set options for question
	setOptionsForQuestion() {
		return {
			mutationFn: async ({
				questionId,
				options,
			}: {
				questionId: number;
				options: OptionRequest[];
			}) => {
				const response = await this.client.post<ApiResponse<OptionResponse[]>>(
					`/matrices/question-options/set-for-question/${questionId}`,
					options,
				);
				return response.data.data;
			},
		};
	}

	// Update option
	updateOption() {
		return {
			mutationFn: async ({
				optionId,
				data,
			}: {
				optionId: number;
				data: OptionRequest;
			}) => {
				const response = await this.client.put<ApiResponse<OptionResponse>>(
					`/matrices/question-options/${optionId}`,
					data,
				);
				return response.data.data;
			},
		};
	}

	// Delete option
	deleteOption() {
		return {
			mutationFn: async (optionId: number) => {
				const response = await this.client.delete<ApiResponse<object>>(
					`/matrices/question-options/${optionId}`,
				);
				return response.data.data;
			},
		};
	}
}

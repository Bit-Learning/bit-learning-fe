import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { endpoints } from "@/shared/constants/endpoints";
import type {
	CreateLectureQuizRequest,
	CreateLectureTextRequest,
	QuizUpdateRequest,
	UpdateLectureRequest,
	UpdateLectureTextRequest,
} from "../types/mlecture.api";

export const mlectureApi = {
	updateLecture(
		id: number,
		data: UpdateLectureRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.patch(`${endpoints.LECTURES}/${id}`, data);
	},

	deleteLecture(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`${endpoints.LECTURES}/${id}/force`);
	},

	hideOrShowLecture(
		id: number,
		isHidden: boolean,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`${endpoints.LECTURES}/${id}`, {
			params: { isHidden },
		});
	},

	createLectureVideo(
		request: string,
		video: File,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		const formData = new FormData();
		formData.append("request", request);
		formData.append("video", video);

		return api.post(`${endpoints.LECTURES}/lecture-videos`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},

	updateLectureVideo(
		id: number,
		video: File,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		const formData = new FormData();
		formData.append("video", video);

		return api.patch(`${endpoints.LECTURES}/lecture-videos/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},

	createLectureQuiz(
		data: CreateLectureQuizRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`${endpoints.LECTURES}/lecture-quizzes`, data);
	},

	updateLectureQuiz(
		id: number,
		quizzes: QuizUpdateRequest[],
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.patch(`${endpoints.LECTURES}/lecture-quizzes/${id}`, quizzes);
	},

	createLectureText(
		data: CreateLectureTextRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`${endpoints.LECTURES}/lecture-texts`, data);
	},

	updateLectureText(
		id: number,
		data: UpdateLectureTextRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.patch(`${endpoints.LECTURES}/lecture-texts/${id}`, data);
	},
};

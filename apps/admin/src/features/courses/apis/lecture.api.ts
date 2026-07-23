import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
	CreateLectureQuizRequest,
	CreateLectureRequest,
	CreateLectureTextRequest,
	LectureQuizDetail,
	LectureTextDetail,
	UpdateLectureQuizRequest,
	UpdateLectureRequest,
	UpdateLectureTextRequest,
} from "../types/lecture.type";

export const lectureApi = {
	fetchVideoM3u8(id: number): Promise<AxiosResponse<string>> {
		return api.get(`/lectures/lecture-videos/${id}/m3u8`, {
			responseType: "text",
			headers: { Accept: "application/vnd.apple.mpegurl" },
		});
	},

	fetchVideoSegment(id: number, segment: string): Promise<AxiosResponse<Blob>> {
		return api.get(`/lectures/lecture-videos/${id}/${segment}`, {
			responseType: "blob",
			headers: { Accept: "video/MP2T" },
		});
	},

	getLectureQuizById(
		id: number,
	): Promise<AxiosResponse<ApiResponse<LectureQuizDetail>>> {
		return api.get(`/lectures/lecture-quizzes/${id}`);
	},

	getLectureTextById(
		id: number,
	): Promise<AxiosResponse<ApiResponse<LectureTextDetail>>> {
		return api.get(`/lectures/lecture-texts/${id}`);
	},

	updateLecture(
		id: number,
		data: UpdateLectureRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.patch(`/lectures/${id}`, data);
	},

	deleteLecture(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/lectures/${id}/force`);
	},

	hideOrShowLecture(
		id: number,
		isHidden: boolean,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`/lectures/${id}`, { params: { isHidden } });
	},

	createLectureVideo(
		request: CreateLectureRequest,
		video: File,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		const formData = new FormData();
		const blob = new Blob([JSON.stringify(request)], {
			type: "application/json",
		});
		formData.append("request", blob);
		formData.append("video", video);
		return api.post(`/lectures/lecture-videos`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	updateLectureVideo(
		id: number,
		video: File,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		const formData = new FormData();
		formData.append("video", video);
		return api.patch(`/lectures/lecture-videos/${id}`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	createLectureQuiz(
		data: CreateLectureQuizRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/lectures/lecture-quizzes`, data);
	},

	updateLectureQuiz(
		id: number,
		data: UpdateLectureQuizRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.patch(`/lectures/lecture-quizzes/${id}`, data);
	},

	createLectureText(
		data: CreateLectureTextRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/lectures/lecture-texts`, data);
	},

	updateLectureText(
		id: number,
		data: UpdateLectureTextRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.patch(`/lectures/lecture-texts/${id}`, data);
	},
};

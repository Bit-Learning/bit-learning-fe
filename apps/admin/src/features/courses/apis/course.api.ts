import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import {
	CourseDetail,
	CourseLevel,
	CoursePreview,
	CourseStatus,
	CreateCourseRequest,
	UpdateCourseRequest,
} from "../types/course.type";
import { SectionDetail } from "../types/section.type";

export interface GetAllCoursesParams {
	page?: number;
	size?: number;
	title?: string;
	levels?: CourseLevel[];
	grades?: number[];
	statuses?: CourseStatus[];
}

export const courseApi = {
	getAllCourses(
		params: GetAllCoursesParams = {},
	): Promise<AxiosResponse<ApiResponse<CoursePreview[]>>> {
		const { page = 0, size = 10, title, levels, grades, statuses } = params;
		return api.get("/courses", {
			params: {
				page,
				size,
				...(title ? { title } : {}),
				...(levels?.length ? { levels } : {}),
				...(grades?.length ? { grades } : {}),
				...(statuses?.length ? { statuses } : {}),
			},
		});
	},

	getCourseById(id: number): Promise<AxiosResponse<ApiResponse<CourseDetail>>> {
		return api.get(`/courses/${id}`);
	},

	getSectionsByCourseId(
		courseId: number,
	): Promise<AxiosResponse<ApiResponse<SectionDetail[]>>> {
		return api.get("/sections", {
			params: { courseId },
		});
	},

	validateCourse(
		id: number,
		isAccepted: boolean,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/courses/validate/${id}`, null, {
			params: { isAccepted },
		});
	},
	createCourse(
		data: CreateCourseRequest,
		thumbnail: File,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		const formData = new FormData();
		const requestBlob = new Blob([JSON.stringify(data)], {
			type: "application/json",
		});
		formData.append("request", requestBlob);
		formData.append("thumbnail", thumbnail);

		return api.post("courses", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},

	getCoursesByInstructor(
		instructorId: number,
		page = 0,
		size = 10,
	): Promise<AxiosResponse<ApiResponse<any>>> {
		return api.get(`courses/instructor/${instructorId}`, {
			params: { page, size },
		});
	},

	updateCourse(
		id: number,
		data: UpdateCourseRequest,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.patch(`courses/${id}`, data);
	},

	deleteCourse(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`courses/${id}/force`);
	},

	hideOrShowCourse(
		id: number,
		isHidden: boolean,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.delete(`courses/${id}`, {
			params: { isHidden },
		});
	},

	updateCourseThumbnail(
		id: number,
		thumbnail: File,
	): Promise<AxiosResponse<ApiResponse<void>>> {
		const formData = new FormData();
		formData.append("thumbnail", thumbnail);

		return api.patch(`courses/${id}/thumbnail`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},
};

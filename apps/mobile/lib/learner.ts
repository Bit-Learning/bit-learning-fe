import { api } from "./api";
import type { Course, Lecture, Quiz, Section, User } from "./types";
export const learner = {
	profile: () => api.get<User>("/users/profile"),
	updateProfile: (body: Partial<User>) => api.put<User>("/users/profile", body),
	courses: (query = "") =>
		api.post<Course[]>(
			"/courses/search?page=0&size=100",
			query ? { title: query } : {},
		),
	course: (id: number) => api.get<Course>(`/courses/${id}`),
	myCourses: () => api.get<Course[]>("/courses/my-courses?page=0&size=100"),
	enroll: (id: number) => api.post<void>(`/enrollments/enroll/${id}`),
	access: (id: number) => api.get<boolean>(`/enrollments/courses/${id}/access`),
	sections: (id: number) => api.get<Section[]>(`/sections?courseId=${id}`),
	text: (id: number) =>
		api.get<{ lecture: Lecture; content: string }>(
			`/lectures/lecture-texts/${id}`,
		),
	quiz: (id: number) =>
		api.get<{ quizzes: Quiz[] }>(`/lectures/lecture-quizzes/${id}`),
	progress: (id: number) =>
		api.get<number>(`/learning/progress/lectures/${id}`),
	sync: (data: {
		lectureId: number;
		watchedDuration: number;
		totalDuration: number;
	}) => api.post<void>("/learning/progress/sync", data),
	complete: (id: number) =>
		api.post<void>(`/learning/progress/lectures/${id}/complete`),
};
export const videoUrl = (lectureId: number) =>
	`/lectures/lecture-videos/${lectureId}/m3u8`;
export const isCompleteAt = (position: number, duration: number) =>
	duration > 0 && position / duration >= 0.9;

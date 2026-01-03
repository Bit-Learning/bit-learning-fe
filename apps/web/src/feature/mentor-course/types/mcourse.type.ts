import type { CourseLevel } from "@/feature/course/types/course.type";

export enum Language {
	ENGLISH = "ENGLISH",
	VIETNAMESE = "VIETNAMESE",
}

export interface CreateCourseRequest {
	title: string;
	subtitle: string;
	description: string;
	price: number;
	language: Language;
	outcome: string;
	requirement: string;
	audience: string;
	level: CourseLevel;
	grade: number;
}

export interface UpdateCourseRequest {
	title: string;
	subtitle: string;
	description: string;
	price: number;
	language: Language;
	outcome: string;
	requirement: string;
	audience: string;
	level: CourseLevel;
	grade: number;
}

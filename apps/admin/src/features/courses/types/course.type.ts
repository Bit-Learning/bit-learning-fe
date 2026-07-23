import { SectionDetail } from "./section.type";

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
	categories?: string[];
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
	categories?: string[];
}

export interface CoursePreview {
	id: number;
	code: string;
	title: string;
	description: string;
	thumbnailUrl: string;
	instructorId: number;
	instructorName: string;
	ratingStar: number;
	ratingCount: number;
	level: CourseLevel;
	grade: number;
	price: number;
	isDeleted: boolean;
	status: CourseStatus;
	categories?: string[];
}

export interface CourseDetail {
	id: number;
	code: string;
	title: string;
	instructorId: number;
	instructorName: string;
	subtitle: string;
	thumbnailUrl: string;
	language: Language;
	outcome: string;
	requirement: string;
	audience: string;
	level: CourseLevel;
	description: string;
	ratingStar: number;
	ratingCount: number;
	totalSections: number;
	totalLectures: number;
	totalDuration: number;
	grade: number;
	price: number;
	sections: SectionDetail[];
	isDeleted: boolean;
	status: CourseStatus;
	progressPercentage: number;
	categories?: string[];
}

export interface MyCourse {
	id: number;
	code: string;
	title: string;
	description: string;
	thumbnailUrl: string;
	instructorId: number;
	instructorName: string;
	ratingStar: number;
	ratingCount: number;
	level: CourseLevel;
	grade: number;
	price: number;
	isDeleted: boolean;
	status: CourseStatus;
	progressPercentage: number;
	categories?: string[];
}

export enum CourseLevel {
	BEGINNING = "BEGINNING",
	INTERMEDIATE = "INTERMEDIATE",
	ADVANCED = "ADVANCED",
}

export enum Language {
	VIETNAMESE = "VIETNAMESE",
	ENGLISH = "ENGLISH",
}

export enum LectureType {
	VIDEO = "VIDEO",
	TEXT = "TEXT",
	QUIZ = "QUIZ",
	EMPTY = "EMPTY",
}

export enum CourseStatus {
	PENDING = "PENDING",
	PUBLISHED = "PUBLISHED",
	REJECTED = "REJECTED",
}

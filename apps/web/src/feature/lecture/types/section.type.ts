import type { LectureDetail } from "./lecture.type";

export interface SectionDetail {
	id: number;
	title: string;
	description: string;
	isPublished: boolean;
	orderIndex: number;
	totalLectures: number;
	totalDuration: number;
	isDeleted: boolean;
	lectures: LectureDetail[];
}

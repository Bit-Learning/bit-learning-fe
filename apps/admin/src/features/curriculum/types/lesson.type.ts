export type TLessonRequest = {
	name: string;
	description?: string;
	lessonNo: number;
	chapterId: number;
};

export type TLessonResponse = {
	id: number;
	name: string;
	description?: string;
	lessonNo: number;
	chapterId: number;
	createdAt: string;
	updatedAt: string;
};

export type TLessonBriefResponse = {
	id: number;
	name: string;
	lessonNo: number;
};

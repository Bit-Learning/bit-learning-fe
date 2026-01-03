// Brief response types
export interface CurriculumBriefResponse {
	id: number;
	name: string;
	code: string;
}

export interface ChapterBriefResponse {
	id: number;
	name: string;
	chapterNo: number;
}

export interface SubjectResponse {
	id: number;
	name: string;
	code: string;
	description: string;
	classLevel: number;
	curriculum: CurriculumBriefResponse;
	createdAt: string;
	updatedAt: string;
	chapters: ChapterBriefResponse[];
}

export interface SubjectRequest {
	name: string;
	code: string;
	description?: string;
	classLevel: number;
	curriculumId: number;
}

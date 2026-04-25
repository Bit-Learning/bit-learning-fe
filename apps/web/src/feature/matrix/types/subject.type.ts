import type { TCurriculumBriefResponse } from "./curriculum.type";

export type TChapterBriefResponse = {
	id: number;
	name: string;
	chapterNo: number;
};

export type TSubjectResponse = {
	id: number;
	name: string;
	code: string;
	description?: string;
	classLevel: number;
	curriculum?: TCurriculumBriefResponse;
	createdAt: string;
	updatedAt: string;
	chapters?: TChapterBriefResponse[];
};

export type TSubjectBriefResponse = {
	id: number;
	name: string;
	code: string;
};

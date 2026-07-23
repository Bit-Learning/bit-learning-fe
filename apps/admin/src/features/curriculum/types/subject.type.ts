import { TChapterBriefResponse } from "./chapter.type";
import { TCurriculumBriefResponse } from "./curriculum.type";

export type TSubjectRequest = {
	name: string;
	code: string;
	description?: string;
	classLevel: number;
	curriculumId: number;
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

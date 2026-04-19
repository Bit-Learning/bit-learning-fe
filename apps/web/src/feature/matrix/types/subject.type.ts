import type { TCurriculumBriefResponse } from "./curriculum.type";

export type TSubjectResponse = {
	id: number;
	name: string;
	code: string;
	description?: string;
	classLevel: number;
	curriculum?: TCurriculumBriefResponse;
	createdAt: string;
	updatedAt: string;
};

export type TSubjectBriefResponse = {
	id: number;
	name: string;
	code: string;
};

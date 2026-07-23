import { TSubjectBriefResponse } from "./subject.type";

export type TCurriculumRequest = {
	name: string;
	code: string;
	description?: string;
};

export type TCurriculumResponse = {
	id: number;
	name: string;
	code: string;
	description?: string;
	subjects?: TSubjectBriefResponse[];
	createdAt: string;
	updatedAt: string;
};

export type TCurriculumBriefResponse = {
	id: number;
	name: string;
	code: string;
};

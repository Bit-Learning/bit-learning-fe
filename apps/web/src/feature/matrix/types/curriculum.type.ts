export type TCurriculumResponse = {
	id: number;
	name: string;
	code: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
};

export type TCurriculumBriefResponse = Pick<
	TCurriculumResponse,
	"id" | "name" | "code"
>;

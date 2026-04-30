import { TChapterBriefResponse } from "./chapter.type";
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
  chapters?: TChapterBriefResponse[];
};

export type TSubjectBriefResponse = {
  id: number;
  name: string;
  code: string;
  classLevel: number;
};

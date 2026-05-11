import { TLessonBriefResponse } from "./lesson.type";

export type TChapterResponse = {
  id: number;
  name: string;
  description?: string;
  chapterNo: number;
  subjectId: number;
  createdAt: string;
  updatedAt: string;
  lessons?: TLessonBriefResponse[];
};

export type TChapterBriefResponse = {
  id: number;
  name: string;
  chapterNo: number;
};

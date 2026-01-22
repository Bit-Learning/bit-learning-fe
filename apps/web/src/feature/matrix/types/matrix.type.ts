import { TLessonBriefResponse } from "./lesson.type";
import { TSubjectBriefResponse } from "./subject.type";

export type TMatrixRequest = {
  name: string;
  code: string;
  description?: string;
  duration: number;
  totalScore: number;
  subjectId: number;
};

export type TMatrixResponse = {
  id: number;
  name: string;
  code: string;
  description?: string;
  duration: number;
  totalScore: number;
  isActive: boolean;
  subject: TSubjectBriefResponse;
  versions?: TMatrixVersionBriefResponse[];
  createdAt: string;
  updatedAt: string;
};

export type TMatrixBriefResponse = {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
};

export type TMatrixVersionRequest = {
  matrixId: number;
  name?: string;
  notes?: string;
  matrixDetails?: TMatrixDetailRequest[];
};

export type TMatrixVersionResponse = {
  id: number;
  versionNo: number;
  name?: string;
  notes?: string;
  matrix?: TMatrixBriefResponse;
  matrixDetails?: TMatrixDetailResponse[];
  createdAt: string;
  updatedAt: string;
};

export type TMatrixVersionBriefResponse = {
  id: number;
  versionNo: number;
  name?: string;
  createdAt: string;
};

export type TMatrixDetailRequest = {
  lessonId: number;
  easyMCQ: number;
  mediumMCQ: number;
  hardMCQ: number;
  easyEssay: number;
  mediumEssay: number;
  hardEssay: number;
  easyMCQScore: number;
  mediumMCQScore: number;
  hardMCQScore: number;
  easyEssayScore: number;
  mediumEssayScore: number;
  hardEssayScore: number;
};

export type TMatrixDetailResponse = {
  id: number;
  matrixVersionId: number;
  lesson: TLessonBriefResponse;
  easyMCQ: number;
  mediumMCQ: number;
  hardMCQ: number;
  easyEssay: number;
  mediumEssay: number;
  hardEssay: number;
  easyMCQScore: number;
  mediumMCQScore: number;
  hardMCQScore: number;
  easyEssayScore: number;
  mediumEssayScore: number;
  hardEssayScore: number;
  createdAt: string;
  updatedAt: string;
};

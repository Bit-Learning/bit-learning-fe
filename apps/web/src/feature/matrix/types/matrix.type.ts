import { TChapterBriefResponse } from "./chapter.type";
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
  chaper: TChapterBriefResponse;
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

export type TLessonWeight = {
  lessonId: number;
  weight: number;
};

export type TDistribution = {
  difficulty: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
  type: {
    MCQ: number;
    ESSAY: number;
  };
};

export type TScoring = {
  mode: "UNIFORM" | "WEIGHTED";
  weights?: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
};

export type TGenerateRequest = {
  matrixId: number;
  name?: string;
  notes?: string;
  totalQuestionCount: number;
  lessons: TLessonWeight[];
  distribution: TDistribution;
  scoring?: TScoring;
};

export type TBucketRequirement = {
  type: string;
  difficulty: string;
  required: number;
  available: number;
};

export type TLessonRequirement = {
  lessonId: number;
  lessonName: string;
  isValid: boolean;
  requirements: TBucketRequirement[];
};

export type TCheckRequirementsResponse = {
  allValid: boolean;
  lessons: TLessonRequirement[];
};

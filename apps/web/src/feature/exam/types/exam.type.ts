import { QuestionResponse } from "@/feature/question/types/question.type";

export interface ExamGenerateRequest {
  matrixVersionId: number;
  name: string;
  code: string;
  shuffleOptions?: boolean;
  durationInMinutes?: number;
  totalScore?: number;
}

export interface ExamGenerateFromUserQuestionsRequest {
  matrixVersionId: number;
  createdBy: number;
  name: string;
  code: string;
  shuffleOptions?: boolean;
  durationInMinutes?: number;
  totalScore?: number;
}

export interface ExamGenerateFromQuestionsRequest {
  questionIds: number[];
  name: string;
  code: string;
  shuffleOptions?: boolean;
  durationInMinutes: number;
  totalScore: number;
}

export interface MatrixVersionBriefResponse {
  id: number;
  versionNo: number;
  name: string;
}

export interface SubjectBriefResponse {
  id: number;
  name: string;
  code: string;
}

export interface ExamQuestionResponse {
  id: number;
  questionNo: number;
  score: number;
  optionsShuffled: boolean;
  question: QuestionResponse;
}

export interface ExamResponse {
  id: number;
  name: string;
  code: string;
  durationInMinutes: number;
  totalScore: number;
  publishedAt?: string;
  isPublished: boolean;
  matrixVersion?: MatrixVersionBriefResponse;
  subject?: SubjectBriefResponse;
  examQuestions: ExamQuestionResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamBriefResponse {
  id: number;
  name: string;
  code: string;
  durationInMinutes: number;
  totalScore: number;
  totalQuestions: number;
  isPublished: boolean;
  createdAt: string;
}

import { QuestionResponse } from "@/feature/question/types/question.type";

export type ExamType = "EXAM" | "PRACTICE";

export type ResultVisibilityPolicy = "IMMEDIATE" | "AFTER_EXAM_CLOSE" | "MANUAL_RELEASE";

export type ApprovalStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
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

export interface ExamGenerateRequest {
  matrixVersionId: number;
  name: string;
  code: string;
  shuffleOptions?: boolean;
  durationInMinutes?: number;
  totalScore?: number;
  enrollKey?: string;
  type: ExamType;
}

export interface ExamGenerateFromUserQuestionsRequest {
  matrixVersionId: number;
  createdBy: number;
  name: string;
  code: string;
  shuffleOptions?: boolean;
  durationInMinutes?: number;
  totalScore?: number;
  enrollKey?: string;
  type: ExamType;
}

export interface ExamGenerateFromQuestionsRequest {
  questionIds: number[];
  name: string;
  code: string;
  shuffleOptions?: boolean;
  durationInMinutes: number;
  totalScore: number;
  enrollKey?: string;
  type: ExamType;
}

export interface ExamUpdateRequest {
  name?: string;
  code?: string;
  type?: ExamType;
  durationInMinutes?: number;
  totalScore?: number;
  enrollKey?: string;
  openTime?: string;
  closeTime?: string;
  resultVisibilityPolicy?: ResultVisibilityPolicy;
}

export interface ExamResponse {
  id: number;
  name: string;
  code: string;
  type?: ExamType;
  durationInMinutes: number;
  totalScore: number;
  enrollKey?: string;
  openTime?: string;
  closeTime?: string;
  resultVisibilityPolicy?: ResultVisibilityPolicy;
  publishedAt?: string;
  isPublished: boolean;
  matrixVersion?: MatrixVersionBriefResponse;
  subject?: SubjectBriefResponse;
  examQuestions: ExamQuestionResponse[];
  createdBy?: UserSummary;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExamBriefResponse {
  id: number;
  name: string;
  code: string;
  type: ExamType;
  durationInMinutes: number;
  totalScore: number;
  enrollKey: string;
  subject?: SubjectBriefResponse;
  totalQuestions: number;
  isPublished: boolean;
  createdBy?: UserSummary;
  approvalStatus: ApprovalStatus;
  createdAt: string;
}

export interface ExamSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export interface ExamApprovalFilters {
  status?: ApprovalStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface RequestPublishExamRequest {
  examIds: number[];
}

export interface ApproveRejectExamRequest {
  examIds: number[];
  rejectReason?: string;
}

import { TChapterBriefResponse } from "@/feature/matrix/types/chapter.type";
import { TLessonBriefResponse } from "@/feature/matrix/types/lesson.type";
import { TSubjectBriefResponse } from "@/feature/matrix/types/subject.type";

export enum QuestionType {
  MCQ = "MCQ",
  ESSAY = "ESSAY",
}

export enum QuestionLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum ApprovalStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum QuestionMediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface OptionRequest {
  label?: string;
  content: string;
  isCorrect: boolean;
  orderNo: number;
}

export interface OptionResponse {
  id: number;
  label?: string;
  content: string;
  isCorrect: boolean;
  orderNo: number;
}

export interface TagResponse {
  id: number;
  name: string;
  color?: string;
}

export interface QuestionRequest {
  content: string;
  canonicalAnswer?: string;
  questionType: QuestionType;
  questionLevel: QuestionLevel;
  subjectId?: number;
  lessonId?: number;
  tagIds?: number[];
  options?: OptionRequest[];
}

export interface QuestionImportRequest {
  subjectCode: string;
  classLevel: number;
  curriculumCode: string;
  lessonCode: string;
  content: string;
  lessonId: number;
  canonicalAnswer?: string;
  questionType: QuestionType;
  questionLevel: QuestionLevel;
  tagIds?: number[];
  options?: OptionRequest[];
}

export interface QuestionResponse {
  id: number;
  content: string;
  canonicalAnswer?: string;
  questionType: QuestionType;
  questionLevel: QuestionLevel;
  subject?: TSubjectBriefResponse;
  chapter?: TChapterBriefResponse;
  lesson?: TLessonBriefResponse;
  tags?: TagResponse[];
  options?: OptionResponse[];
  isActive: boolean;
  isPublic: boolean;
  approvalStatus: ApprovalStatus;
  mediaUrl: string | null;
  mediaType: QuestionMediaType | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBriefResponse {
  id: number;
  content: string;
  questionType: QuestionType;
  questionLevel: QuestionLevel;
  lesson?: TLessonBriefResponse;
}

export interface RequestPublishDTO {
  questionIds: number[];
}

export interface ApproveRejectDTO {
  questionIds: number[];
  rejectReason?: string;
}

export interface QuestionSearchParams {
  keyword?: string;
  subjectId?: number;
  lessonId?: number;
  questionType?: QuestionType;
  questionLevel?: QuestionLevel;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface QuestionApprovalParams {
  status?: ApprovalStatus;
  page?: number;
  size?: number;
  sort?: string;
}

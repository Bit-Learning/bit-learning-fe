import { UserSummary } from "@/features/problems/types/problem.type";

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

export interface SubjectBriefResponse {
  id: number;
  name: string;
  code: string;
}

export interface ChapterBriefResponse {
  id: number;
  name: string;
  code: string;
}

export interface LessonBriefResponse {
  id: number;
  name: string;
  code: string;
}

export interface TagResponse {
  id: number;
  name: string;
  color?: string;
}

export interface OptionResponse {
  id: number;
  label?: string;
  content: string;
  isCorrect: boolean;
  orderNo: number;
}

export interface QuestionResponse {
  id: number;
  content: string;
  canonicalAnswer?: string;
  questionType: QuestionType;
  questionLevel: QuestionLevel;
  subject?: SubjectBriefResponse;
  chapter?: ChapterBriefResponse;
  lesson?: LessonBriefResponse;
  tags?: TagResponse[];
  options?: OptionResponse[];
  requestedBy: UserSummary;
  isActive: boolean;
  isPublic: boolean;
  approvalStatus: ApprovalStatus;
  mediaUrl: string | null;
  mediaType: QuestionMediaType | null;
  createdAt: string;
  updatedAt: string;
}

export enum QuestionMediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}
export interface ApproveRejectDTO {
  questionIds: number[];
  rejectReason?: string;
}

export interface QuestionSearchParams {
  keyword?: string;
  subjectId?: number;
  chapterId?: number;
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

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
  subject?: SubjectBriefResponse;
  chapter?: ChapterBriefResponse;
  lesson?: LessonBriefResponse;
  tags?: TagResponse[];
  options?: OptionResponse[];
  isActive: boolean;
  isPublic: boolean;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBriefResponse {
  id: number;
  content: string;
  questionType: QuestionType;
  questionLevel: QuestionLevel;
  lesson?: LessonBriefResponse;
}

export interface RequestPublishDTO {
  questionIds: number[];
}

export interface ApproveRejectDTO {
  questionIds: number[];
  rejectReason?: string;
}

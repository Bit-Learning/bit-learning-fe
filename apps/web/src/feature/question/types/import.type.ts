import { QuestionLevel, QuestionType } from "./question.type";

export enum ImportStatus {
  PREVIEW = "PREVIEW",
  CONFIRMED = "CONFIRMED",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  FAILED = "FAILED",
}

export enum PreviewQuestionStatus {
  KEEP = "KEEP",
  DELETE = "DELETE",
}

export interface PreviewQuestionResponse {
  id: number;
  originalContent: string;
  editedContent: string | null;
  questionType: QuestionType;
  questionLevel: QuestionLevel;
  canonicalAnswer?: string;
  subjectCode: string;
  classLevel: number;
  curriculumCode: string;
  lessonCode: string;
  status: PreviewQuestionStatus;
  duplicated: boolean;
  reused: boolean;
  existingQuestionId: number | null;
  options?: Array<{
    label?: string;
    content: string;
    isCorrect: boolean;
    orderNo: number;
  }>;
  errorMessage?: string;
  hasError: boolean;
}

export interface PreviewResponse {
  importJobId: number;
  questions: PreviewQuestionResponse[];
  totalQuestions: number;
  duplicatedCount: number;
  errorCount: number;
  hasErrors: boolean;
}

export interface ImportJobResponse {
  id: number;
  userId: number;
  type: string;
  fileUrl: string;
  status: ImportStatus;
  errorMessage?: string;
  totalQuestions: number;
  importedQuestions: number;
  failedQuestions: number;
  keepQuestionsCount: number;
}

export interface UpdatePreviewQuestionRequest {
  editedContent?: string;
  status: PreviewQuestionStatus;
}

export interface ConfirmImportRequest {
  importJobId: number;
}

export interface ImportResultResponse {
  importJobId: number;
  total: number;
  newQuestions: number;
  reusedQuestions: number;
  addedToMyQuestions: number;
}

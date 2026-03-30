export interface CreateLectureRequest {
  sectionId: number;
  title: string;
  description?: string;
  isPreviewable?: boolean;
  orderIndex: number;
}

export interface UpdateLectureRequest {
  sectionId: number;
  title: string;
  description?: string;
  isPreviewable?: boolean;
  orderIndex: number;
}

export interface AnswerCreateRequest {
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizCreateRequest {
  questionText: string;
  orderIndex: number;
  answers: AnswerCreateRequest[];
}

export interface CreateLectureQuizRequest {
  lecture: CreateLectureRequest;
  quizzes: QuizCreateRequest[];
  passPercent: number;
  maxAttempts: number;
  duration?: number;
}

export interface AnswerUpdateRequest {
  id?: number;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizUpdateRequest {
  id?: number;
  questionText: string;
  orderIndex: number;
  answers: AnswerUpdateRequest[];
}
export interface UpdateLectureQuizRequest {
  passPercent?: number;
  maxAttempts?: number;
  duration?: number;
  quizzes: QuizUpdateRequest[];
}

export interface CreateLectureTextRequest {
  lecture: CreateLectureRequest;
  content: string;
  duration?: number;
}

export interface UpdateLectureTextRequest {
  content: string;
  duration?: number;
}

export enum LectureType {
  VIDEO = "VIDEO",
  TEXT = "TEXT",
  QUIZ = "QUIZ",
  EMPTY = "EMPTY",
}

export interface LectureDetail {
  id: number;
  sectionId: number;
  title: string;
  description: string;
  type: LectureType;
  isPreviewable: boolean;
  orderIndex: number;
  isDeleted: boolean;
  isCompleted: boolean;
}

export interface LectureTextDetail {
  lecture: LectureDetail;
  content: string;
}

export interface AnswerDetail {
  id: number;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizDetail {
  id: number;
  questionText: string;
  orderIndex: number;
  answers: AnswerDetail[];
}

export interface LectureQuizDetail {
  lecture: LectureDetail;
  passPercent: number;
  maxAttempts: number;
  quizzes: QuizDetail[];
}

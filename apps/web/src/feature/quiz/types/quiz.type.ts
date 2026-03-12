import { QuestionBriefResponse } from "@/feature/question/types/question.type";

// Quiz Attempt Types
export interface QuizAttemptRequest {
  examId: number;
}

export interface QuizAttemptAnswerRequest {
  questionId: number;
  answerText?: string;
  selectedOptionIds?: number[];
  questionNo?: number;
  navigationState?: QuestionNavigationState;
}

export interface SubmitQuizAttemptRequest {
  answers: QuizAttemptAnswerRequest[];
  confirmSubmit?: boolean;
}

export interface QuizHeartbeatRequest {
  currentTime: string;
  batteryLevel?: number;
  networkStatus?: string;
  timeRemaining?: number;
}

export interface QuizAttemptAnswerResponse {
  id: number;
  question: QuestionBriefResponse;
  answerText?: string;
  selectedOptionIds?: number[];
  correct: boolean;
  score: number;
  questionNo: number;
  navigationState: QuestionNavigationState;
}

export interface QuizAttemptResponse {
  id: number;
  user: UserSummaryResponse;
  exam: ExamBriefResponse;
  status: QuizAttemptStatus;
  startTime: string;
  submittedAt?: string;
  score?: number;
  timeRemaining?: number;
  answers: QuizAttemptAnswerResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptBriefResponse {
  id: number;
  exam: ExamBriefResponse;
  status: QuizAttemptStatus;
  startTime: string;
  submittedAt?: string;
  score?: number;
}

export interface SubmitQuizAttemptResponse {
  attempt: QuizAttemptResponse;
  unansweredQuestionIds: number[];
  requiresConfirmation: boolean;
}

export interface QuizHeartbeatResponse {
  attemptId: number;
  status: string;
  timeRemaining: number;
  lastActiveAt: string;
  isInterrupted: boolean;
}

export interface QuizSessionRequest {
  examId: number;
  type?: QuizSessionType;
}

export interface QuizSessionAnswerRequest {
  questionId: number;
  answerText?: string;
  selectedOptionIds?: number[];
  isMarked?: boolean;
  questionNo?: number;
}

export interface UpdateCurrentIndexRequest {
  currentIndex: number;
}

export interface SubmitQuizSessionRequest {
  answers: QuizSessionAnswerRequest[];
}

export interface QuizSessionAnswerResponse {
  id: number;
  question: QuestionBriefResponse;
  answerText?: string;
  selectedOptionIds?: number[];
  isMarked: boolean;
  questionNo: number;
}

export interface QuizSessionResponse {
  id: number;
  user: UserSummaryResponse;
  exam: ExamBriefResponse;
  status: QuizSessionStatus;
  type: QuizSessionType;
  currentIndex: number;
  autoSubmitted: boolean;
  startTime: string;
  endTime?: string;
  timeRemaining?: number;
  answers: QuizSessionAnswerResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizSessionBriefResponse {
  id: number;
  exam: ExamBriefResponse;
  status: QuizSessionStatus;
  type: QuizSessionType;
  currentIndex: number;
  startTime: string;
}

export enum QuizAttemptStatus {
  DOING = "DOING",
  SUBMITTED = "SUBMITTED",
  INTERRUPTED = "INTERRUPTED",
}

export enum QuizSessionStatus {
  DOING = "DOING",
  SUBMITTED = "SUBMITTED",
  EXPIRED = "EXPIRED",
}

export enum QuizSessionType {
  PRACTICE = "PRACTICE",
  EXAM = "EXAM",
}

export enum QuestionNavigationState {
  UNANSWERED = "UNANSWERED",
  ANSWERED = "ANSWERED",
  MARKED_FOR_REVIEW = "MARKED_FOR_REVIEW",
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

export interface UserSummaryResponse {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

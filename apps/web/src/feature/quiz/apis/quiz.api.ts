import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type {
  QuizAttemptRequest,
  QuizAttemptResponse,
  QuizAttemptBriefResponse,
  QuizAttemptAnswerRequest,
  QuizAttemptAnswerResponse,
  SubmitQuizAttemptRequest,
  SubmitQuizAttemptResponse,
  QuizHeartbeatRequest,
  QuizHeartbeatResponse,
  QuizSessionRequest,
  QuizSessionResponse,
  QuizSessionBriefResponse,
  QuizSessionAnswerRequest,
  QuizSessionAnswerResponse,
  UpdateCurrentIndexRequest,
  SubmitQuizSessionRequest,
  QuestionNavigationState,
  PaginationParams,
} from "../types/quiz.type";

export const quizAttemptApi = {
  startAttempt(data: QuizAttemptRequest): Promise<AxiosResponse<ApiResponse<QuizAttemptResponse>>> {
    return api.post("/quiz-attempts", data);
  },

  getAttemptById(attemptId: number): Promise<AxiosResponse<ApiResponse<QuizAttemptResponse>>> {
    return api.get(`/quiz-attempts/${attemptId}`);
  },

  resumeAttempt(examId: number): Promise<AxiosResponse<ApiResponse<QuizAttemptResponse>>> {
    return api.get(`/quiz-attempts/resume/exam/${examId}`);
  },

  saveOrUpdateAnswer(
    attemptId: number,
    data: QuizAttemptAnswerRequest,
  ): Promise<AxiosResponse<ApiResponse<QuizAttemptAnswerResponse>>> {
    return api.post(`/quiz-attempts/${attemptId}/answers`, data);
  },

  updateNavigationState(
    attemptId: number,
    questionId: number,
    navigationState: QuestionNavigationState,
  ): Promise<AxiosResponse<ApiResponse<QuizAttemptAnswerResponse>>> {
    return api.put(`/quiz-attempts/${attemptId}/questions/${questionId}/navigation-state`, null, {
      params: { navigationState },
    });
  },

  submitAttempt(
    attemptId: number,
    data: SubmitQuizAttemptRequest,
  ): Promise<AxiosResponse<ApiResponse<SubmitQuizAttemptResponse>>> {
    return api.post(`/quiz-attempts/${attemptId}/submit`, data);
  },

  getMyAttempts(params?: PaginationParams): Promise<AxiosResponse<ApiResponse<QuizAttemptBriefResponse[]>>> {
    return api.get("/quiz-attempts/my-attempts", { params });
  },

  getAttemptsByExam(
    examId: number,
    params?: PaginationParams,
  ): Promise<AxiosResponse<ApiResponse<QuizAttemptBriefResponse[]>>> {
    return api.get(`/quiz-attempts/exam/${examId}`, { params });
  },

  deleteAttempt(attemptId: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/quiz-attempts/${attemptId}`);
  },

  sendHeartbeat(
    attemptId: number,
    data: QuizHeartbeatRequest,
  ): Promise<AxiosResponse<ApiResponse<QuizHeartbeatResponse>>> {
    return api.post(`/quiz-attempts/${attemptId}/heartbeat`, data);
  },
};

export const quizSessionApi = {
  startSession(data: QuizSessionRequest): Promise<AxiosResponse<ApiResponse<QuizSessionResponse>>> {
    return api.post("/quiz-sessions", data);
  },

  getSessionById(sessionId: number): Promise<AxiosResponse<ApiResponse<QuizSessionResponse>>> {
    return api.get(`/quiz-sessions/${sessionId}`);
  },

  resumeSession(examId: number): Promise<AxiosResponse<ApiResponse<QuizSessionResponse>>> {
    return api.get(`/quiz-sessions/resume/exam/${examId}`);
  },

  updateCurrentIndex(
    sessionId: number,
    data: UpdateCurrentIndexRequest,
  ): Promise<AxiosResponse<ApiResponse<QuizSessionResponse>>> {
    return api.put(`/quiz-sessions/${sessionId}/current-index`, data);
  },

  submitSession(
    sessionId: number,
    data: SubmitQuizSessionRequest,
  ): Promise<AxiosResponse<ApiResponse<QuizSessionResponse>>> {
    return api.post(`/quiz-sessions/${sessionId}/submit`, data);
  },

  getMySessions(params?: PaginationParams): Promise<AxiosResponse<ApiResponse<QuizSessionBriefResponse>>> {
    return api.get("/quiz-sessions/my-sessions", { params });
  },

  getSessionsByExam(
    examId: number,
    params?: PaginationParams,
  ): Promise<AxiosResponse<ApiResponse<QuizSessionBriefResponse>>> {
    return api.get(`/quiz-sessions/exam/${examId}`, { params });
  },

  deleteSession(sessionId: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/quiz-sessions/${sessionId}`);
  },
};

export const quizSessionAnswerApi = {
  saveOrUpdateAnswer(
    sessionId: number,
    data: QuizSessionAnswerRequest,
  ): Promise<AxiosResponse<ApiResponse<QuizSessionAnswerResponse>>> {
    return api.post(`/quiz-sessions/${sessionId}/answers`, data);
  },

  deleteAnswerByQuestion(sessionId: number, questionId: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/quiz-sessions/${sessionId}/answers/question/${questionId}`);
  },

  getAnswerById(sessionId: number, answerId: number): Promise<AxiosResponse<ApiResponse<QuizSessionAnswerResponse>>> {
    return api.get(`/quiz-sessions/${sessionId}/answers/${answerId}`);
  },

  getAnswersBySession(sessionId: number): Promise<AxiosResponse<ApiResponse<QuizSessionAnswerResponse[]>>> {
    return api.get(`/quiz-sessions/${sessionId}/answers`);
  },

  deleteAnswer(sessionId: number, answerId: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`/quiz-sessions/${sessionId}/answers/${answerId}`);
  },
};

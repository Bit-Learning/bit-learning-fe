import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "@/shared/components/Sonner";
import { setQuizAttemptAction, setQuizSessionAction, updateAnswerAction, toggleMarkAction } from "../stores/quiz.store";
import type { ApiResponse } from "@/shared/api/api.type";
import { quizAttemptApi, quizSessionApi, quizSessionAnswerApi } from "../apis/quiz.api";
import type {
  QuizAttemptRequest,
  QuizAttemptAnswerRequest,
  SubmitQuizAttemptRequest,
  QuizHeartbeatRequest,
  QuestionNavigationState,
  QuizSessionRequest,
  QuizSessionAnswerRequest,
  UpdateCurrentIndexRequest,
  SubmitQuizSessionRequest,
  PaginationParams,
} from "../types/quiz.type";
import { useAppDispatch } from "@/shared/redux/store";

export const quizKeys = {
  attempts: {
    all: ["quiz-attempts"] as const,
    detail: (id: number) => [...quizKeys.attempts.all, "detail", id] as const,
    myAttempts: (params?: PaginationParams) => [...quizKeys.attempts.all, "my-attempts", params] as const,
    examAttempts: (examId: number, params?: PaginationParams) =>
      [...quizKeys.attempts.all, "exam", examId, params] as const,
  },
  sessions: {
    all: ["quiz-sessions"] as const,
    detail: (id: number) => [...quizKeys.sessions.all, "detail", id] as const,
    mySessions: (params?: PaginationParams) => [...quizKeys.sessions.all, "my-sessions", params] as const,
    examSessions: (examId: number, params?: PaginationParams) =>
      [...quizKeys.sessions.all, "exam", examId, params] as const,
  },
};

export const useQuizAttempt = (attemptId: number, enabled = true) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: quizKeys.attempts.detail(attemptId),
    queryFn: async () => {
      const response = await quizAttemptApi.getAttemptById(attemptId);
      const data = response.data.data!;

      dispatch(setQuizAttemptAction(data));

      return data;
    },
    enabled: !!attemptId && enabled,
    staleTime: 0,
  });
};

export const useMyQuizAttempts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: quizKeys.attempts.myAttempts(params),
    queryFn: async () => {
      const response = await quizAttemptApi.getMyAttempts(params);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch attempts by exam
 */
export const useQuizAttemptsByExam = (examId: number, params?: PaginationParams) => {
  return useQuery({
    queryKey: quizKeys.attempts.examAttempts(examId, params),
    queryFn: async () => {
      const response = await quizAttemptApi.getAttemptsByExam(examId, params);
      return response.data.data;
    },
    enabled: !!examId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Start new quiz attempt
 */
export const useStartQuizAttempt = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: QuizAttemptRequest) => quizAttemptApi.startAttempt(data),
    onSuccess: (response) => {
      const data = response.data.data!;
      dispatch(setQuizAttemptAction(data));
      queryClient.invalidateQueries({ queryKey: quizKeys.attempts.all });

      toast.success({
        title: "Thành công",
        description: "Đã bắt đầu làm bài kiểm tra",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể bắt đầu bài kiểm tra",
      });
    },
  });
};

/**
 * Save/update answer for attempt
 */
export const useSaveQuizAnswer = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: number; data: QuizAttemptAnswerRequest }) =>
      quizAttemptApi.saveOrUpdateAnswer(attemptId, data),
    onSuccess: (response) => {
      dispatch(updateAnswerAction(response.data.data!));
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể lưu câu trả lời",
      });
    },
  });
};

/**
 * Update navigation state (mark for review)
 */
export const useUpdateNavigationState = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({
      attemptId,
      questionId,
      navigationState,
    }: {
      attemptId: number;
      questionId: number;
      navigationState: QuestionNavigationState;
    }) => quizAttemptApi.updateNavigationState(attemptId, questionId, navigationState),
    onSuccess: (response) => {
      dispatch(updateAnswerAction(response.data.data!));
    },
  });
};

/**
 * Submit quiz attempt
 */
export const useSubmitQuizAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: number; data: SubmitQuizAttemptRequest }) =>
      quizAttemptApi.submitAttempt(attemptId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.attempts.all });

      const submitResponse = response.data.data;
      if (submitResponse && !submitResponse.requiresConfirmation) {
        toast.success({
          title: "Thành công",
          description: "Đã nộp bài thành công",
        });
      }

      return submitResponse;
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể nộp bài",
      });
    },
  });
};

/**
 * Send heartbeat
 */
export const useSendHeartbeat = () => {
  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: number; data: QuizHeartbeatRequest }) =>
      quizAttemptApi.sendHeartbeat(attemptId, data),
    retry: 3,
    retryDelay: 1000,
  });
};

// ==========================================
// QUIZ SESSION HOOKS
// ==========================================

/**
 * Fetch quiz session & sync to Redux
 */
export const useQuizSession = (sessionId: number, enabled = true) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: quizKeys.sessions.detail(sessionId),
    queryFn: async () => {
      const response = await quizSessionApi.getSessionById(sessionId);
      const data = response.data.data;

      // Sync to Redux
      dispatch(setQuizSessionAction(data!));

      return data;
    },
    enabled: !!sessionId && enabled,
    staleTime: 0,
  });
};

/**
 * Fetch user's sessions
 */
export const useMyQuizSessions = (params?: PaginationParams) => {
  return useQuery({
    queryKey: quizKeys.sessions.mySessions(params),
    queryFn: async () => {
      const response = await quizSessionApi.getMySessions(params);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch sessions by exam
 */
export const useQuizSessionsByExam = (examId: number, params?: PaginationParams) => {
  return useQuery({
    queryKey: quizKeys.sessions.examSessions(examId, params),
    queryFn: async () => {
      const response = await quizSessionApi.getSessionsByExam(examId, params);
      return response.data.data;
    },
    enabled: !!examId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Start new quiz session
 */
export const useStartQuizSession = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: QuizSessionRequest) => quizSessionApi.startSession(data),
    onSuccess: (response) => {
      const data = response.data.data;
      dispatch(setQuizSessionAction(data!));
      queryClient.invalidateQueries({ queryKey: quizKeys.sessions.all });

      toast.success({
        title: "Thành công",
        description: "Đã bắt đầu phiên làm bài",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể bắt đầu phiên làm bài",
      });
    },
  });
};

/**
 * Save/update answer for session
 */
export const useSaveSessionAnswer = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: QuizSessionAnswerRequest }) =>
      quizSessionAnswerApi.saveOrUpdateAnswer(sessionId, data),
    onSuccess: (response) => {
      dispatch(updateAnswerAction(response.data.data!));
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể lưu câu trả lời",
      });
    },
  });
};

/**
 * Toggle mark answer for session
 */
export const useToggleMarkAnswer = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({
      sessionId,
      questionId,
      data,
    }: {
      sessionId: number;
      questionId: number;
      data: QuizSessionAnswerRequest;
    }) => {
      // Optimistic update
      dispatch(toggleMarkAction(questionId));

      // Call API
      return quizSessionAnswerApi.saveOrUpdateAnswer(sessionId, data);
    },
    onSuccess: (response) => {
      // Update with server response
      dispatch(updateAnswerAction(response.data.data!));
    },
  });
};

/**
 * Update current index
 */
export const useUpdateCurrentIndex = () => {
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: UpdateCurrentIndexRequest }) =>
      quizSessionApi.updateCurrentIndex(sessionId, data),
  });
};

/**
 * Submit quiz session
 */
export const useSubmitQuizSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: SubmitQuizSessionRequest }) =>
      quizSessionApi.submitSession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.sessions.all });

      toast.success({
        title: "Thành công",
        description: "Đã nộp bài thành công",
      });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể nộp bài",
      });
    },
  });
};

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
  return useQuery({
    queryKey: quizKeys.attempts.detail(attemptId),
    queryFn: async () => {
      const response = await quizAttemptApi.getAttemptById(attemptId);
      return response.data.data!;
    },
    enabled: !!attemptId && enabled,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

export const useSaveQuizAnswer = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: number; data: QuizAttemptAnswerRequest }) =>
      quizAttemptApi.saveOrUpdateAnswer(attemptId, data),
    onSuccess: (response) => {
      dispatch(updateAnswerAction(response.data.data!));
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      console.error("Failed to save answer:", error);
    },
  });
};

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

export const useSendHeartbeat = () => {
  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: number; data: QuizHeartbeatRequest }) =>
      quizAttemptApi.sendHeartbeat(attemptId, data),
    retry: 3,
    retryDelay: 1000,
  });
};

export const useQuizSession = (sessionId: number, enabled = true) => {
  return useQuery({
    queryKey: quizKeys.sessions.detail(sessionId),
    queryFn: async () => {
      const response = await quizSessionApi.getSessionById(sessionId);
      return response.data.data;
    },
    enabled: !!sessionId && enabled,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

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

export const useSaveSessionAnswer = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: QuizSessionAnswerRequest }) =>
      quizSessionAnswerApi.saveOrUpdateAnswer(sessionId, data),
    onSuccess: (response) => {
      dispatch(updateAnswerAction(response.data.data!));
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      console.error("Failed to save answer:", error);
    },
  });
};

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
      dispatch(toggleMarkAction(questionId));

      return quizSessionAnswerApi.saveOrUpdateAnswer(sessionId, data);
    },
    onSuccess: (response) => {
      dispatch(updateAnswerAction(response.data.data!));
    },
  });
};

export const useUpdateCurrentIndex = () => {
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: UpdateCurrentIndexRequest }) =>
      quizSessionApi.updateCurrentIndex(sessionId, data),
  });
};

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

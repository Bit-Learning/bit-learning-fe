import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";
import type {
  QuizAttemptResponse,
  QuizAttemptAnswerResponse,
  QuizSessionResponse,
  QuizSessionAnswerResponse,
  QuestionNavigationState,
} from "../types/quiz.type";

// ===== UNIFIED TYPES =====
type QuizType = "attempt" | "session";

type QuizData = QuizAttemptResponse | QuizSessionResponse;

type QuizAnswer = QuizAttemptAnswerResponse | QuizSessionAnswerResponse;

// ===== STATE TYPE =====
export type TQuizState = {
  // Loại quiz đang active (attempt hoặc session)
  activeType: QuizType | null;

  // Current quiz đang làm
  currentQuiz: QuizData | null;

  // Timer
  timeRemaining: number | null; // seconds
  isTimerRunning: boolean;

  // Answers map by questionId
  answersMap: Record<number, QuizAnswer>;

  // Navigation
  currentQuestionIndex: number;

  // UI states
  isSubmitting: boolean;
};

// ===== INITIAL STATE =====
const quizInitialState: TQuizState = {
  activeType: null,
  currentQuiz: null,
  timeRemaining: null,
  isTimerRunning: false,
  answersMap: {},
  currentQuestionIndex: 0,
  isSubmitting: false,
};

// ===== HELPER FUNCTIONS =====

// Build answers map từ quiz data
const buildAnswersMap = (quiz: QuizData): Record<number, QuizAnswer> => {
  const answersMap: Record<number, QuizAnswer> = {};
  quiz.answers.forEach((answer) => {
    answersMap[answer.question.id] = answer;
  });
  return answersMap;
};

// Get current index từ quiz data
const getCurrentIndex = (quiz: QuizData, type: QuizType): number => {
  if (type === "session") {
    return (quiz as QuizSessionResponse).currentIndex || 0;
  }
  return 0; // Attempt mặc định bắt đầu từ 0
};

// ===== REDUCER FUNCTIONS =====

// Set quiz attempt
const setQuizAttempt = (state: TQuizState, action: PayloadAction<QuizAttemptResponse>) => {
  state.activeType = "attempt";
  state.currentQuiz = action.payload;
  state.timeRemaining = action.payload.timeRemaining ?? null;
  state.answersMap = buildAnswersMap(action.payload);
  state.currentQuestionIndex = 0;
  state.isSubmitting = false;
};

// Set quiz session
const setQuizSession = (state: TQuizState, action: PayloadAction<QuizSessionResponse>) => {
  state.activeType = "session";
  state.currentQuiz = action.payload;
  state.timeRemaining = action.payload.timeRemaining ?? null;
  state.answersMap = buildAnswersMap(action.payload);
  state.currentQuestionIndex = getCurrentIndex(action.payload, "session");
  state.isSubmitting = false;
};

// Clear quiz
const clearQuiz = () => quizInitialState;

// Update answer (works for both attempt & session)
const updateAnswer = (state: TQuizState, action: PayloadAction<QuizAnswer>) => {
  const questionId = action.payload.question.id;
  state.answersMap[questionId] = action.payload;
};

// Update navigation state (only for attempt)
const updateNavigationState = (
  state: TQuizState,
  action: PayloadAction<{ questionId: number; navigationState: QuestionNavigationState }>,
) => {
  const { questionId, navigationState } = action.payload;
  if (state.answersMap[questionId]) {
    (state.answersMap[questionId] as QuizAttemptAnswerResponse).navigationState = navigationState;
  }
};

// Toggle mark (only for session)
const toggleMark = (state: TQuizState, action: PayloadAction<number>) => {
  const questionId = action.payload;
  if (state.answersMap[questionId]) {
    const answer = state.answersMap[questionId] as QuizSessionAnswerResponse;
    answer.isMarked = !answer.isMarked;
  }
};

// Timer controls
const setTimeRemaining = (state: TQuizState, action: PayloadAction<number>) => {
  state.timeRemaining = action.payload;
};

const decrementTime = (state: TQuizState) => {
  if (state.timeRemaining !== null && state.timeRemaining > 0) {
    state.timeRemaining -= 1;
  }
};

const startTimer = (state: TQuizState) => {
  state.isTimerRunning = true;
};

const stopTimer = (state: TQuizState) => {
  state.isTimerRunning = false;
};

// Question navigation
const setCurrentQuestionIndex = (state: TQuizState, action: PayloadAction<number>) => {
  state.currentQuestionIndex = action.payload;
};

const nextQuestion = (state: TQuizState) => {
  if (!state.currentQuiz) return;
  const totalQuestions = state.currentQuiz.exam.totalQuestions;
  if (state.currentQuestionIndex < totalQuestions - 1) {
    state.currentQuestionIndex += 1;
  }
};

const previousQuestion = (state: TQuizState) => {
  if (state.currentQuestionIndex > 0) {
    state.currentQuestionIndex -= 1;
  }
};

const goToQuestion = (state: TQuizState, action: PayloadAction<number>) => {
  if (!state.currentQuiz) return;
  const totalQuestions = state.currentQuiz.exam.totalQuestions;
  if (action.payload >= 0 && action.payload < totalQuestions) {
    state.currentQuestionIndex = action.payload;
  }
};

// Submit state
const setSubmitting = (state: TQuizState, action: PayloadAction<boolean>) => {
  state.isSubmitting = action.payload;
};

// ===== SLICE =====
export const quiz = createSlice({
  name: "quiz",
  initialState: quizInitialState,
  reducers: {
    setQuizAttemptAction: setQuizAttempt,
    setQuizSessionAction: setQuizSession,
    clearQuizAction: clearQuiz,
    updateAnswerAction: updateAnswer,
    updateNavigationStateAction: updateNavigationState,
    toggleMarkAction: toggleMark,
    setTimeRemainingAction: setTimeRemaining,
    decrementTimeAction: decrementTime,
    startTimerAction: startTimer,
    stopTimerAction: stopTimer,
    setCurrentQuestionIndexAction: setCurrentQuestionIndex,
    nextQuestionAction: nextQuestion,
    previousQuestionAction: previousQuestion,
    goToQuestionAction: goToQuestion,
    setSubmittingAction: setSubmitting,
  },
});

// ===== ACTIONS =====
export const {
  setQuizAttemptAction,
  setQuizSessionAction,
  clearQuizAction,
  updateAnswerAction,
  updateNavigationStateAction,
  toggleMarkAction,
  setTimeRemainingAction,
  decrementTimeAction,
  startTimerAction,
  stopTimerAction,
  setCurrentQuestionIndexAction,
  nextQuestionAction,
  previousQuestionAction,
  goToQuestionAction,
  setSubmittingAction,
} = quiz.actions;

// ===== SELECTORS =====

// Basic selectors
export const selectQuizState = (state: RootState) => state.quiz;
export const selectActiveType = (state: RootState) => state.quiz.activeType;
export const selectCurrentQuiz = (state: RootState) => state.quiz.currentQuiz;
export const selectAnswersMap = (state: RootState) => state.quiz.answersMap;
export const selectTimeRemaining = (state: RootState) => state.quiz.timeRemaining;
export const selectIsTimerRunning = (state: RootState) => state.quiz.isTimerRunning;
export const selectCurrentQuestionIndex = (state: RootState) => state.quiz.currentQuestionIndex;
export const selectIsSubmitting = (state: RootState) => state.quiz.isSubmitting;

// Type-safe selectors
export const selectCurrentAttempt = (state: RootState): QuizAttemptResponse | null => {
  if (state.quiz.activeType === "attempt") {
    return state.quiz.currentQuiz as QuizAttemptResponse;
  }
  return null;
};

export const selectCurrentSession = (state: RootState): QuizSessionResponse | null => {
  if (state.quiz.activeType === "session") {
    return state.quiz.currentQuiz as QuizSessionResponse;
  }
  return null;
};

// Get current answer
export const selectCurrentAnswer = (state: RootState) => {
  const quiz = state.quiz.currentQuiz;
  const index = state.quiz.currentQuestionIndex;
  if (!quiz || !quiz.answers[index]) return null;

  const questionId = quiz.answers[index].question.id;
  return state.quiz.answersMap[questionId] || null;
};

// Get answer by questionId
export const selectAnswerByQuestionId = (questionId: number) => (state: RootState) =>
  state.quiz.answersMap[questionId] || null;

// Stats - works for both attempt & session
export const selectQuestionStats = (state: RootState) => {
  const answers = Object.values(state.quiz.answersMap);
  const total = state.quiz.currentQuiz?.exam.totalQuestions || 0;
  const activeType = state.quiz.activeType;

  if (activeType === "attempt") {
    const attemptAnswers = answers as QuizAttemptAnswerResponse[];
    const answered = attemptAnswers.filter((a) => a.navigationState === "ANSWERED").length;
    const marked = attemptAnswers.filter((a) => a.navigationState === "MARKED_FOR_REVIEW").length;
    const unanswered = attemptAnswers.filter((a) => a.navigationState === "UNANSWERED").length;
    return { total, answered, marked, unanswered };
  } else {
    const sessionAnswers = answers as QuizSessionAnswerResponse[];
    const answered = sessionAnswers.filter((a) => a.selectedOptionIds?.length || a.answerText).length;
    const marked = sessionAnswers.filter((a) => a.isMarked).length;
    const unanswered = total - answered;
    return { total, answered, marked, unanswered };
  }
};

// Check helpers
export const selectIsTimeUp = (state: RootState) => state.quiz.timeRemaining !== null && state.quiz.timeRemaining <= 0;

export const selectIsFirstQuestion = (state: RootState) => state.quiz.currentQuestionIndex === 0;

export const selectIsLastQuestion = (state: RootState) => {
  const quiz = state.quiz.currentQuiz;
  if (!quiz) return false;
  return state.quiz.currentQuestionIndex === quiz.exam.totalQuestions - 1;
};

// Check if is attempt or session
export const selectIsAttempt = (state: RootState) => state.quiz.activeType === "attempt";
export const selectIsSession = (state: RootState) => state.quiz.activeType === "session";

export default quiz.reducer;

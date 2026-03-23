import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  Smile,
  BookOpen,
  Save,
  Flag,
  Clock,
  Target,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAnswersMap,
  selectCurrentQuestionIndex,
  goToQuestionAction,
  nextQuestionAction,
  previousQuestionAction,
  updateAnswerAction,
  setQuizSessionAction,
} from "../stores/quiz.store";
import { useQuizSession, useSaveSessionAnswer, useSubmitQuizSession } from "../queries/useQuiz";
import { useExam } from "@/feature/exam/queries/useExam";

const QuizSessionContent: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams({ from: "/_layout/quiz-sessions/$sessionId/" });

  const dispatch = useDispatch();
  const answersMap = useSelector(selectAnswersMap);
  const currentIndex = useSelector(selectCurrentQuestionIndex);

  const { data: sessionData, isLoading: sessionLoading } = useQuizSession(Number(sessionId));
  const { data: examData, isLoading: examLoading } = useExam(sessionData?.exam?.id || 0, {
    enabled: !!sessionData?.exam?.id,
  });

  const saveMutation = useSaveSessionAnswer();
  const submitMutation = useSubmitQuizSession();

  const [isStoreInitialized, setIsStoreInitialized] = useState(false);
  const [answeredResults, setAnsweredResults] = useState<Record<number, boolean>>({});
  const [essayDraft, setEssayDraft] = useState<Record<number, string>>({});
  const [essaySaved, setEssaySaved] = useState<Record<number, boolean>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
  const [filterMode, setFilterMode] = useState<"all" | "marked" | "unanswered">("all");

  useEffect(() => {
    if (sessionData && !isStoreInitialized) {
      dispatch(setQuizSessionAction(sessionData));
      setIsStoreInitialized(true);

      const draft: Record<number, string> = {};
      const saved: Record<number, boolean> = {};
      const marked = new Set<number>();

      sessionData.answers.forEach((a) => {
        if (a.answerText?.trim()) {
          draft[a.question.id] = a.answerText;
          saved[a.question.id] = true;
        }
        if (a.isMarked) marked.add(a.question.id);
      });

      setEssayDraft(draft);
      setEssaySaved(saved);
      setMarkedQuestions(marked);
    }
  }, [sessionData, isStoreInitialized, dispatch]);

  const questions = examData?.examQuestions?.map((eq) => eq.question) || [];
  const currentQuestion = questions[currentIndex];

  const getIsCorrect = (questionId: number, selectedIds?: number[]): boolean => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.options?.length || !selectedIds?.length) return false;
    const correctIds = new Set(question.options.filter((o) => o.isCorrect).map((o) => o.id));
    const selectedSet = new Set(selectedIds);
    return [...correctIds].every((id) => selectedSet.has(id)) && [...selectedSet].every((id) => correctIds.has(id));
  };

  const isEssay = (type: string) => type?.toUpperCase() === "ESSAY";
  const isMCQ = (type: string) => type?.toUpperCase() === "MCQ";
  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] : undefined;
  const currentDraft = currentQuestion ? (essayDraft[currentQuestion.id] ?? currentAnswer?.answerText ?? "") : "";
  const isDraftDirty = currentQuestion ? currentDraft !== (currentAnswer?.answerText ?? "") : false;
  const isCurrentMarked = currentQuestion ? markedQuestions.has(currentQuestion.id) : false;

  const hasAnsweredCurrent = isMCQ(currentQuestion?.questionType ?? "")
    ? (currentAnswer?.selectedOptionIds?.length ?? 0) > 0
    : !!currentAnswer?.answerText?.trim();

  const showFeedback =
    hasAnsweredCurrent && currentQuestion?.id !== undefined && answeredResults[currentQuestion.id] !== undefined;

  const isCorrectCurrent = currentQuestion ? getIsCorrect(currentQuestion.id, currentAnswer?.selectedOptionIds) : false;
  const correctOption = currentQuestion?.options?.find((o) => o.isCorrect);

  const correctCount = Object.values(answeredResults).filter(Boolean).length;
  const totalAnswered = Object.keys(answeredResults).length;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const markedCount = markedQuestions.size;
  const unansweredCount =
    questions.length -
    Object.keys(answersMap).filter((key) => {
      const ans = answersMap[Number(key)];
      return (ans?.selectedOptionIds?.length ?? 0) > 0 || !!ans?.answerText?.trim();
    }).length;

  const handleToggleMark = useCallback(() => {
    if (!currentQuestion) return;

    const newMarkStatus = !markedQuestions.has(currentQuestion.id);
    setMarkedQuestions((prev) => {
      const next = new Set(prev);
      newMarkStatus ? next.add(currentQuestion.id) : next.delete(currentQuestion.id);
      return next;
    });

    saveMutation.mutate({
      sessionId: Number(sessionId),
      data: {
        questionId: currentQuestion.id,
        answerText: currentAnswer?.answerText || "",
        selectedOptionIds: currentAnswer?.selectedOptionIds || [],
        isMarked: newMarkStatus,
        questionNo: currentIndex + 1,
      },
    });
  }, [currentQuestion, currentAnswer, currentIndex, markedQuestions, saveMutation, sessionId]);

  const saveEssay = useCallback(
    (questionId: number, text: string) => {
      if (!text.trim()) return;

      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      dispatch(
        updateAnswerAction({
          id: Date.now(),
          question: {
            id: question.id,
            content: question.content,
            questionType: question.questionType,
            questionLevel: question.questionLevel,
          },
          answerText: text,
          selectedOptionIds: [],
          isMarked: markedQuestions.has(questionId),
          questionNo: questions.indexOf(question) + 1,
        }),
      );

      saveMutation.mutate(
        {
          sessionId: Number(sessionId),
          data: {
            questionId,
            answerText: text,
            isMarked: markedQuestions.has(questionId),
            questionNo: questions.indexOf(question) + 1,
          },
        },
        {
          onSuccess: () => {
            setEssaySaved((prev) => ({ ...prev, [questionId]: true }));

            if (question.canonicalAnswer) {
              const normalize = (s: string) => s.trim().toLowerCase();
              const isCorrect = normalize(text) === normalize(question.canonicalAnswer);
              setAnsweredResults((prev) => ({ ...prev, [questionId]: isCorrect }));
            }
          },
          onError: () => {
            setEssaySaved((prev) => ({ ...prev, [questionId]: false }));
          },
        },
      );
    },
    [dispatch, questions, saveMutation, sessionId, markedQuestions],
  );

  const handleSelectAnswer = (optionId: number) => {
    if (!currentQuestion) return;

    dispatch(
      updateAnswerAction({
        id: Date.now(),
        question: {
          id: currentQuestion.id,
          content: currentQuestion.content,
          questionType: currentQuestion.questionType,
          questionLevel: currentQuestion.questionLevel,
        },
        selectedOptionIds: [optionId],
        answerText: "",
        isMarked: markedQuestions.has(currentQuestion.id),
        questionNo: currentIndex + 1,
      }),
    );

    saveMutation.mutate(
      {
        sessionId: Number(sessionId),
        data: {
          questionId: currentQuestion.id,
          answerText: "",
          selectedOptionIds: [optionId],
          isMarked: markedQuestions.has(currentQuestion.id),
          questionNo: currentIndex + 1,
        },
      },
      {
        onSuccess: () => {
          const isCorrect = getIsCorrect(currentQuestion.id, [optionId]);
          setAnsweredResults((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
        },
      },
    );
  };

  const handleEssayChange = (text: string) => {
    if (!currentQuestion) return;
    setEssayDraft((prev) => ({ ...prev, [currentQuestion.id]: text }));
    setEssaySaved((prev) => ({ ...prev, [currentQuestion.id]: false }));
  };

  const handleEssayBlur = () => {
    if (!currentQuestion) return;
    const draft = essayDraft[currentQuestion.id] ?? "";
    if (draft !== (currentAnswer?.answerText ?? "")) {
      saveEssay(currentQuestion.id, draft);
    }
  };

  const handleEssaySave = () => {
    if (!currentQuestion) return;
    saveEssay(currentQuestion.id, essayDraft[currentQuestion.id] ?? "");
  };

  const flushCurrentEssay = useCallback(() => {
    if (!currentQuestion || !isEssay(currentQuestion.questionType)) return;
    const draft = essayDraft[currentQuestion.id] ?? "";
    if (draft !== (currentAnswer?.answerText ?? "") && draft.trim()) {
      saveEssay(currentQuestion.id, draft);
    }
  }, [currentQuestion, essayDraft, currentAnswer, saveEssay]);

  const handleNextQuestion = () => {
    flushCurrentEssay();
    if (currentIndex === questions.length - 1) {
      handleSubmit();
    } else {
      dispatch(nextQuestionAction());
    }
  };

  const handlePrevQuestion = () => {
    flushCurrentEssay();
    dispatch(previousQuestionAction());
  };

  const handleJumpToQuestion = (index: number) => {
    flushCurrentEssay();
    dispatch(goToQuestionAction(index));
  };

  const handleSubmit = async () => {
    flushCurrentEssay();
    try {
      await submitMutation.mutateAsync({
        sessionId: Number(sessionId),
        data: {
          answers: Object.values(answersMap).map((a) => ({
            questionId: a.question.id,
            selectedOptionIds: a.selectedOptionIds,
            answerText: a.answerText ?? undefined,
            isMarked: markedQuestions.has(a.question.id),
            questionNo: a.questionNo,
          })),
        },
      });
      navigate({
        to: "/quiz-sessions/$sessionId/result",
        params: { sessionId: String(sessionId) },
      });
    } catch (e) {
      console.error("Submit session failed:", e);
    }
  };

  const getFilteredQuestions = () => {
    if (filterMode === "marked") return questions.filter((q) => markedQuestions.has(q.id));
    if (filterMode === "unanswered") {
      return questions.filter((q) => {
        const ans = answersMap[q.id];
        return !ans || ((ans.selectedOptionIds?.length ?? 0) === 0 && !ans.answerText?.trim());
      });
    }
    return questions;
  };

  if (sessionLoading || examLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải đề luyện tập...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Không có câu hỏi nào.</p>
      </div>
    );
  }

  const isSavingEssay = saveMutation.isPending;
  const currentEssaySaved = currentQuestion ? essaySaved[currentQuestion.id] : false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-350 mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chế độ Luyện tập</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{sessionData?.exam.name}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{accuracy}% chính xác</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    CÂU HỎI {currentIndex + 1} / {questions.length}
                  </span>
                  <button
                    onClick={handleToggleMark}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm",
                      isCurrentMarked
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600",
                    )}
                  >
                    <Flag className={cn("w-4 h-4", isCurrentMarked && "fill-current")} />
                    {isCurrentMarked ? "Đã đánh dấu" : "Đánh dấu"}
                  </button>
                </div>
                <h2 className="text-2xl font-bold leading-snug text-slate-900 dark:text-slate-100">
                  {currentQuestion?.content}
                </h2>
              </div>

              {currentQuestion && isMCQ(currentQuestion.questionType) && currentQuestion.options && (
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = currentAnswer?.selectedOptionIds?.includes(option.id);
                    const isCorrectOption = option.isCorrect;
                    const showCorrect = showFeedback && isCorrectOption;
                    const showWrong = showFeedback && isSelected && !isCorrectOption;

                    return (
                      <button
                        key={option.id}
                        onClick={() => !showFeedback && handleSelectAnswer(option.id)}
                        disabled={showFeedback}
                        className={cn(
                          "w-full flex items-center p-4 rounded-xl border-2 text-left group transition-all",
                          showCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                          showWrong && "border-red-500 bg-red-50 dark:bg-red-900/20",
                          !showFeedback && isSelected && "border-primary bg-primary/5",
                          !showFeedback &&
                            !isSelected &&
                            "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/40 cursor-pointer",
                          showFeedback &&
                            !showCorrect &&
                            !showWrong &&
                            "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800",
                          showFeedback && "cursor-not-allowed",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0 transition-all",
                            showCorrect && "bg-green-500 text-white",
                            showWrong && "bg-red-500 text-white",
                            !showFeedback && isSelected && "bg-primary text-white",
                            !showFeedback && !isSelected && "bg-primary/10 text-primary group-hover:bg-primary/20",
                            showFeedback && !showCorrect && !showWrong && "bg-primary/10 text-primary",
                          )}
                        >
                          {getOptionLabel(index)}
                        </div>
                        <span
                          className={cn(
                            "flex-1 font-medium",
                            showCorrect && "text-green-900 dark:text-green-200 font-semibold",
                            showWrong && "text-red-900 dark:text-red-200",
                            !showFeedback && "text-slate-700 dark:text-slate-300",
                          )}
                        >
                          {option.content}
                        </span>
                        {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
                        {showWrong && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion && isEssay(currentQuestion.questionType) && (
                <div className="space-y-3">
                  <textarea
                    value={currentDraft}
                    onChange={(e) => handleEssayChange(e.target.value)}
                    onBlur={handleEssayBlur}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full min-h-40 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-y transition-colors"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{currentDraft.length} ký tự</span>
                    <div className="flex items-center gap-3">
                      {isSavingEssay && (
                        <span className="text-sm text-amber-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          Đang lưu...
                        </span>
                      )}
                      {!isSavingEssay && currentEssaySaved && !isDraftDirty && (
                        <span className="text-sm text-emerald-500 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Đã lưu
                        </span>
                      )}
                      {!isSavingEssay && isDraftDirty && <span className="text-sm text-slate-400">Chưa lưu</span>}
                      <button
                        onClick={handleEssaySave}
                        disabled={isSavingEssay || !currentDraft.trim() || !isDraftDirty}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" /> Lưu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showFeedback && (
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <div
                    className={cn(
                      "flex items-center gap-3 mb-4",
                      isCorrectCurrent ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                    )}
                  >
                    <Smile className="w-8 h-8" />
                    <span className="text-xl font-bold">{isCorrectCurrent ? "Chính xác! 🎉" : "Sai rồi!"}</span>
                  </div>

                  {!isCorrectCurrent && correctOption && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Đáp án đúng:{" "}
                      <span className="font-semibold text-green-700 dark:text-green-400">{correctOption.content}</span>
                    </p>
                  )}

                  {currentQuestion?.canonicalAnswer && (
                    <div className="bg-primary/5 p-6 rounded-xl">
                      <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Giải thích chi tiết:
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {currentQuestion.canonicalAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
              <button
                onClick={handlePrevQuestion}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" /> Câu trước
              </button>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                >
                  Kết thúc luyện tập
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  {currentIndex === questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-6">
              <div className="flex gap-2 mb-6">
                {(["all", "marked", "unanswered"] as const).map((mode) => {
                  const labels = {
                    all: `Tất cả (${questions.length})`,
                    marked: `Đánh dấu (${markedCount})`,
                    unanswered: `Chưa trả lời (${unansweredCount})`,
                  };
                  const activeColors = {
                    all: "bg-primary text-white",
                    marked: "bg-amber-500 text-white",
                    unanswered: "bg-slate-500 text-white",
                  };
                  return (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={cn(
                        "cursor-pointer flex-1 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                        filterMode === mode
                          ? activeColors[mode]
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600",
                      )}
                    >
                      {labels[mode]}
                    </button>
                  );
                })}
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <span className="text-xl">📋</span> Danh sách câu hỏi
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {getFilteredQuestions().map((q) => {
                    const index = questions.indexOf(q);
                    const isCurrent = index === currentIndex;
                    const result = answeredResults[q.id];
                    const isAnswered = result !== undefined;
                    const isMarkedQ = markedQuestions.has(q.id);
                    const essayHasDraft =
                      isEssay(q.questionType) && !!(essayDraft[q.id]?.trim() || answersMap[q.id]?.answerText?.trim());

                    return (
                      <button
                        key={q.id}
                        onClick={() => handleJumpToQuestion(index)}
                        className={cn(
                          "aspect-square flex items-center justify-center rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform relative",
                          isCurrent && "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800",
                          isAnswered && result && "bg-green-500 text-white",
                          isAnswered && !result && "bg-red-500 text-white",
                          !isAnswered && essayHasDraft && "bg-blue-400 text-white",
                          !isAnswered &&
                            !essayHasDraft &&
                            "bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400",
                        )}
                      >
                        {index + 1}
                        {isMarkedQ && (
                          <Flag className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-500 fill-amber-500 drop-shadow-lg" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {filterMode !== "all" && getFilteredQuestions().length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    {filterMode === "marked" && "Chưa có câu hỏi nào được đánh dấu"}
                    {filterMode === "unanswered" && "Đã trả lời tất cả các câu hỏi"}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="space-y-2 mb-6">
                {[
                  { color: "bg-green-500", label: "Trả lời đúng" },
                  { color: "bg-red-500", label: "Trả lời sai" },
                  { color: "bg-blue-400", label: "Tự luận (đã nhập)" },
                  { color: "bg-slate-100 dark:bg-slate-700 border-2 border-slate-300", label: "Chưa trả lời" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded ${item.color}`} />
                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm">
                  <Flag className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300">Đã đánh dấu</span>
                </div>
              </div>

              {/* Stats */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="bg-primary/10 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">Tỉ lệ chính xác</p>
                      <p className="text-3xl font-black text-primary mt-1">{accuracy}%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {correctCount}/{totalAnswered} câu
                      </p>
                    </div>
                    <span className="text-5xl opacity-50">📊</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-primary/20">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Đã trả lời</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalAnswered}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Còn lại</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {questions.length - totalAnswered}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizSessionContent;

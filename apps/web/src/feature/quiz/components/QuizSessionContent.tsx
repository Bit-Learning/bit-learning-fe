import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Info, Smile, BookOpen, Save } from "lucide-react";
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

  useEffect(() => {
    if (sessionData && !isStoreInitialized) {
      dispatch(setQuizSessionAction(sessionData));
      setIsStoreInitialized(true);

      const draft: Record<number, string> = {};
      const saved: Record<number, boolean> = {};
      sessionData.answers.forEach((a) => {
        if (a.answerText?.trim()) {
          draft[a.question.id] = a.answerText;
          saved[a.question.id] = true;
        }
      });
      setEssayDraft(draft);
      setEssaySaved(saved);
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

  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] : undefined;
  const currentDraft = currentQuestion ? (essayDraft[currentQuestion.id] ?? currentAnswer?.answerText ?? "") : "";
  const isDraftDirty = currentQuestion ? currentDraft !== (currentAnswer?.answerText ?? "") : false;

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

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

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
          isMarked: false,
          questionNo: questions.indexOf(question) + 1,
        }),
      );

      const normalize = (s: string) => s.trim().toLowerCase();
      if (question.canonicalAnswer) {
        const isCorrect = normalize(text) === normalize(question.canonicalAnswer);
        setAnsweredResults((prev) => ({ ...prev, [questionId]: isCorrect }));
      }

      saveMutation.mutate(
        {
          sessionId: Number(sessionId),
          data: {
            questionId,
            answerText: text,
            questionNo: questions.indexOf(question) + 1,
          },
        },
        {
          onSuccess: () => {
            setEssaySaved((prev) => ({ ...prev, [questionId]: true }));
          },
          onError: () => {
            setEssaySaved((prev) => ({ ...prev, [questionId]: false }));
          },
        },
      );
    },
    [dispatch, questions, saveMutation, sessionId],
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
        answerText: undefined,
        isMarked: false,
        questionNo: currentIndex + 1,
      }),
    );

    const isCorrect = getIsCorrect(currentQuestion.id, [optionId]);
    setAnsweredResults((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));

    saveMutation.mutate({
      sessionId: Number(sessionId),
      data: {
        questionId: currentQuestion.id,
        selectedOptionIds: [optionId],
        questionNo: currentIndex + 1,
      },
    });
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

  if (sessionLoading || examLoading) {
    return (
      <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải đề luyện tập...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex items-center justify-center">
        <p className="text-slate-500">Không có câu hỏi nào.</p>
      </div>
    );
  }

  const isSavingEssay = saveMutation.isPending;
  const currentEssaySaved = currentQuestion ? essaySaved[currentQuestion.id] : false;

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex flex-col">
      <main className="max-w-360 mx-auto px-4 py-6 md:py-10 w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chế độ Luyện tập</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{sessionData?.exam.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl border border-primary/10 shadow-sm">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
                  CÂU HỎI {currentIndex + 1} / {questions.length}
                </span>
                <h2 className="text-2xl font-bold leading-snug">{currentQuestion?.content}</h2>
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
                        className={cn(
                          "w-full flex items-center p-4 rounded-xl border-2 text-left group transition-all",
                          showCorrect && "border-green-500 bg-green-50 dark:bg-green-900/10",
                          showWrong && "border-red-500 bg-red-50 dark:bg-red-900/10",
                          !showFeedback && isSelected && "border-primary bg-primary/5",
                          !showFeedback &&
                            !isSelected &&
                            "border-primary/10 bg-[#f8f6f6] dark:bg-slate-800/50 hover:border-primary/40",
                          showFeedback &&
                            !showCorrect &&
                            !showWrong &&
                            "border-primary/10 bg-[#f8f6f6] dark:bg-slate-800/50",
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0",
                            showCorrect && "bg-green-500 text-white",
                            showWrong && "bg-red-500 text-white",
                            !showFeedback && isSelected && "bg-primary text-white",
                            !showFeedback && !isSelected && "bg-primary/10 text-primary",
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
                            !showFeedback && !isSelected && "text-slate-600 dark:text-slate-300",
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
                    className="w-full min-h-40 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-y transition-colors font-sans"
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
                          <CheckCircle2 className="w-4 h-4" />
                          Đã lưu
                        </span>
                      )}
                      {!isSavingEssay && isDraftDirty && <span className="text-sm text-slate-400">Chưa lưu</span>}

                      <button
                        onClick={handleEssaySave}
                        disabled={isSavingEssay || !currentDraft.trim() || !isDraftDirty}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showFeedback && (
                <div className="mt-8 pt-8 border-t border-primary/10">
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
                        <Info className="w-4 h-4" />
                        Giải thích chi tiết:
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
                className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 font-bold hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                Câu trước
              </button>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-red-500/20 text-red-500 font-bold hover:bg-red-500/5 transition-all disabled:opacity-50"
                >
                  Kết thúc luyện tập
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  {currentIndex === questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-primary/10 shadow-sm sticky top-28">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Danh sách câu hỏi
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {questions.map((q, index) => {
                  const isCurrent = index === currentIndex;
                  const result = answeredResults[q.id];
                  const isAnswered = result !== undefined;
                  const isCorrectQ = isAnswered && result;
                  const isWrongQ = isAnswered && !result;

                  const essayHasDraft =
                    isEssay(q.questionType) && !!(essayDraft[q.id]?.trim() || answersMap[q.id]?.answerText?.trim());

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(index)}
                      className={cn(
                        "aspect-square flex items-center justify-center rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform",
                        isCurrent && "ring-2 ring-primary ring-offset-1",
                        isCorrectQ && "bg-green-500 text-white",
                        isWrongQ && "bg-red-500 text-white",
                        !isAnswered && essayHasDraft && "bg-blue-400 text-white",
                        !isAnswered && !essayHasDraft && "bg-primary/5 border border-primary/20 text-slate-400",
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="dark:text-slate-300">Trả lời đúng</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="dark:text-slate-300">Trả lời sai</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded bg-blue-400" />
                  <span className="dark:text-slate-300">Tự luận (đã nhập)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded border border-primary/30" />
                  <span className="dark:text-slate-300">Chưa trả lời</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-primary/10">
                <div className="bg-primary/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Tỉ lệ chính xác</p>
                    <p className="text-2xl font-black text-primary">{accuracy}%</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {correctCount}/{totalAnswered} câu
                    </p>
                  </div>
                  <span className="text-4xl opacity-50">📊</span>
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

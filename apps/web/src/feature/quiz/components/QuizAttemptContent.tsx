import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Timer, Send, AlertCircle, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAnswersMap,
  selectCurrentQuestionIndex,
  selectTimeRemaining,
  selectQuestionStats,
  nextQuestionAction,
  previousQuestionAction,
  goToQuestionAction,
  updateAnswerAction,
  setQuizAttemptAction,
  stopTimerAction,
} from "../stores/quiz.store";
import { useQuizAttempt, useSaveQuizAnswer, useSubmitQuizAttempt } from "../queries/useQuiz";
import { useExam } from "@/feature/exam/queries/useExam";
import { useExamTimer } from "../queries/useExamTimer";
import { QuestionNavigationState } from "../types/quiz.type";

const QuizAttemptContent: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams({ from: "/_layout/quiz-attempts/$attemptId/" });

  const dispatch = useDispatch();
  const answersMap = useSelector(selectAnswersMap);
  const currentIndex = useSelector(selectCurrentQuestionIndex);
  const timeRemaining = useSelector(selectTimeRemaining);
  const stats = useSelector(selectQuestionStats);

  const { data: attemptData, isLoading: attemptLoading } = useQuizAttempt(Number(attemptId));
  const { data: examData, isLoading: examLoading } = useExam(attemptData?.exam?.id || 0, {
    enabled: !!attemptData?.exam?.id,
  });

  const saveMutation = useSaveQuizAnswer();
  const submitMutation = useSubmitQuizAttempt();

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [essayDebounceTimer, setEssayDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<Set<number>>(new Set());
  const [isTimerInitialized, setIsTimerInitialized] = useState(false);
  const [isStoreInitialized, setIsStoreInitialized] = useState(false);

  useEffect(() => {
    if (attemptData && !isStoreInitialized) {
      dispatch(setQuizAttemptAction(attemptData));
      setIsStoreInitialized(true);

      const savedIds = new Set(
        attemptData.answers
          .filter((answer) => {
            const type = answer.question.questionType?.toUpperCase();
            if (type === "ESSAY") return !!answer.answerText?.trim();
            return (answer.selectedOptionIds?.length ?? 0) > 0;
          })
          .map((answer) => answer.question.id),
      );
      setSavedQuestions(savedIds);
    }
  }, [attemptData, isStoreInitialized, dispatch]);

  const timer = useExamTimer({
    attemptId: Number(attemptId),
    onTick: (seconds: number) => {
      if (seconds === 300) {
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000);
      }
    },
    onExpire: async () => {
      console.log("⏰ Hết giờ - tự động nộp bài...");
      await handleAutoSubmit();
    },
    warningThresholds: [300, 600],
  });

  useEffect(() => {
    if (attemptData && !isTimerInitialized) {
      timer.start();
      setIsTimerInitialized(true);
    }
  }, [attemptData, timer, isTimerInitialized]);

  useEffect(() => {
    return () => {
      timer.stop();
      dispatch(stopTimerAction());
      if (essayDebounceTimer) clearTimeout(essayDebounceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const questions = examData?.examQuestions?.map((eq) => eq.question) || [];
  const currentQuestion = questions[currentIndex];

  const answeredCount = Object.values(answersMap).filter((answer) => {
    const type = answer.question.questionType?.toUpperCase();
    if (type === "ESSAY") return !!answer.answerText?.trim();
    return (answer.selectedOptionIds?.length ?? 0) > 0;
  }).length;

  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const getQuestionStatus = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question) return "unanswered";
    if (questionIndex === currentIndex) return "current";

    const answer = answersMap[question.id];
    const hasSaved = savedQuestions.has(question.id);
    if (!answer || !hasSaved) return "unanswered";

    const type = question.questionType?.toUpperCase();
    const hasContent = type === "ESSAY" ? !!answer.answerText?.trim() : (answer.selectedOptionIds?.length ?? 0) > 0;

    return hasContent ? "answered" : "unanswered";
  };

  const getTimerColor = () => {
    if (!timeRemaining) return "text-slate-900 dark:text-slate-100";
    if (timeRemaining <= 300) return "text-red-600 dark:text-red-400";
    if (timeRemaining <= 600) return "text-orange-600 dark:text-orange-400";
    return "text-slate-900 dark:text-slate-100";
  };

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
        navigationState: QuestionNavigationState.ANSWERED,
        correct: false,
        score: 0,
        questionNo: currentIndex + 1,
      }),
    );

    saveMutation.mutate(
      {
        attemptId: Number(attemptId),
        data: {
          questionId: currentQuestion.id,
          selectedOptionIds: [optionId],
          questionNo: currentIndex + 1,
          navigationState: QuestionNavigationState.ANSWERED,
        },
      },
      {
        onSuccess: () => {
          setSavedQuestions((prev) => new Set(prev).add(currentQuestion.id));
        },
      },
    );
  };

  const handleEssayAnswer = (text: string) => {
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
        answerText: text,
        selectedOptionIds: [],
        navigationState: text.trim() ? QuestionNavigationState.ANSWERED : QuestionNavigationState.UNANSWERED,
        correct: false,
        score: 0,
        questionNo: currentIndex + 1,
      }),
    );

    if (essayDebounceTimer) clearTimeout(essayDebounceTimer);

    const newTimer = setTimeout(() => {
      saveMutation.mutate(
        {
          attemptId: Number(attemptId),
          data: {
            questionId: currentQuestion.id,
            answerText: text,
            questionNo: currentIndex + 1,
            navigationState: text.trim() ? QuestionNavigationState.ANSWERED : QuestionNavigationState.UNANSWERED,
          },
        },
        {
          onSuccess: () => {
            if (text.trim()) {
              setSavedQuestions((prev) => new Set(prev).add(currentQuestion.id));
            } else {
              setSavedQuestions((prev) => {
                const next = new Set(prev);
                next.delete(currentQuestion.id);
                return next;
              });
            }
          },
        },
      );
    }, 1000);

    setEssayDebounceTimer(newTimer);
  };

  const handleNextQuestion = () => {
    if (currentIndex === questions.length - 1) {
      setShowSubmitConfirm(true);
    } else {
      dispatch(nextQuestionAction());
    }
  };

  const handlePreviousQuestion = () => {
    dispatch(previousQuestionAction());
  };

  const handleGoToQuestion = (index: number) => {
    dispatch(goToQuestionAction(index));
  };

  const handleAutoSubmit = async () => {
    timer.stop();
    try {
      await submitMutation.mutateAsync({
        attemptId: Number(attemptId),
        data: {
          answers: Object.values(answersMap).map((answer) => ({
            questionId: answer.question.id,
            selectedOptionIds: answer.selectedOptionIds,
            answerText: answer.answerText ?? undefined,
            navigationState: QuestionNavigationState.ANSWERED,
          })),
        },
      });
    } catch (error) {
      console.error("Auto-submit failed:", error);
    } finally {
      navigate({
        to: "/quiz-attempts/$attemptId/result",
        params: { attemptId: String(attemptId) },
      });
    }
  };

  const handleSubmitExam = async () => {
    timer.stop();

    try {
      await submitMutation.mutateAsync({
        attemptId: Number(attemptId),
        data: {
          answers: Object.values(answersMap).map((answer) => ({
            questionId: answer.question.id,
            selectedOptionIds: answer.selectedOptionIds,
            answerText: answer.answerText ?? undefined,
            navigationState:
              "navigationState" in answer ? (answer as any).navigationState : QuestionNavigationState.ANSWERED,
          })),
        },
      });

      navigate({
        to: "/quiz-attempts/$attemptId/result",
        params: { attemptId: String(attemptId) },
      });
    } catch (error: any) {
      if (error.response?.data?.message?.includes("unanswered")) {
        const confirmSubmit = window.confirm(
          `Bạn còn ${stats.unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài không?`,
        );
        if (confirmSubmit) {
          await handleSubmitExam();
        } else {
          timer.start();
        }
      } else {
        timer.start();
      }
    }

    setShowSubmitConfirm(false);
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  const isEssay = (type: string) => type?.toUpperCase() === "ESSAY";
  const isMCQ = (type: string) => type?.toUpperCase() === "MCQ";

  if (attemptLoading || examLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <Card className="max-w-md shadow-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Không có câu hỏi</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Đề thi này chưa có câu hỏi nào.</p>
            <Button onClick={() => navigate({ to: "/exams" })}>Quay lại danh sách</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bài thi {attemptData?.exam.name}</h1>
          </div>
        </div>
        {showTimeWarning && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl animate-pulse shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <p className="text-sm font-bold text-orange-900 dark:text-orange-300">
                ⚠️ Còn 5 phút! Vui lòng kiểm tra lại đáp án.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-bold">
                    CÂU HỎI {currentIndex + 1} / {questions.length}
                  </Badge>
                  <h2 className="text-2xl font-bold leading-snug whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                    {currentQuestion?.content}
                  </h2>
                </div>

                {currentQuestion && isMCQ(currentQuestion.questionType) && currentQuestion?.options && (
                  <div className="space-y-3 mb-8">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answersMap[currentQuestion.id]?.selectedOptionIds?.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelectAnswer(option.id)}
                          className={cn(
                            "w-full flex items-center p-4 rounded-xl border-2 text-left group transition-all hover:shadow-md",
                            isSelected && "border-primary bg-primary/5 shadow-sm",
                            !isSelected &&
                              "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/40",
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0 transition-colors",
                              isSelected && "bg-primary text-white",
                              !isSelected && "bg-primary/10 text-primary group-hover:bg-primary/20",
                            )}
                          >
                            {getOptionLabel(index)}
                          </div>
                          <span
                            className={cn(
                              "flex-1 font-medium transition-colors",
                              isSelected && "text-slate-900 dark:text-slate-100",
                              !isSelected && "text-slate-600 dark:text-slate-400",
                            )}
                          >
                            {option.content}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion && isEssay(currentQuestion.questionType) && (
                  <div className="space-y-4 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Câu hỏi tự luận</p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            Trình bày câu trả lời của bạn vào ô bên dưới. Câu trả lời sẽ được tự động lưu.
                          </p>
                        </div>
                      </div>
                    </div>

                    <textarea
                      value={answersMap[currentQuestion.id]?.answerText || ""}
                      onChange={(e) => handleEssayAnswer(e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full min-h-75 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-y transition-colors font-sans"
                      disabled={saveMutation.isPending}
                    />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        {answersMap[currentQuestion.id]?.answerText?.length || 0} ký tự
                      </span>
                      {saveMutation.isPending && (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></span>
                          Đang lưu...
                        </span>
                      )}
                      {!saveMutation.isPending &&
                        savedQuestions.has(currentQuestion.id) &&
                        answersMap[currentQuestion.id]?.answerText?.trim() && (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                            Đã lưu
                          </span>
                        )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePreviousQuestion}
                    isDisabled={currentIndex === 0}
                    className="w-full sm:w-auto gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Câu trước
                  </Button>

                  <Button
                    size="lg"
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20"
                  >
                    {currentIndex === questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Timer
                      className={cn(
                        "w-6 h-6",
                        timeRemaining && timeRemaining <= 300 ? "text-red-600 animate-pulse" : "text-primary",
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        Thời gian còn lại
                      </span>
                      <span className={cn("text-2xl font-black", getTimerColor())}>{timer.formatTime()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="xl"
                  className="w-full gap-2 shadow-lg shadow-primary/20"
                  onClick={() => setShowSubmitConfirm(true)}
                >
                  <Send className="w-5 h-5" />
                  Nộp bài thi
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Danh sách câu hỏi</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Đang làm</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-6">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleGoToQuestion(index)}
                        className={cn(
                          "aspect-square flex items-center justify-center rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform",
                          status === "current" && "border-2 border-primary bg-primary/10 text-primary",
                          status === "answered" && "bg-emerald-500 text-white",
                          status === "unanswered" &&
                            "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Đã trả lời:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {answeredCount}/{questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-emerald-500 to-green-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Tiến độ:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">{progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Ghi chú quan trọng</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      Hệ thống sẽ tự động nộp bài khi hết thời gian. Vui lòng không tải lại trang để tránh mất dữ liệu.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Xác nhận nộp bài</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Bạn đã trả lời <span className="font-bold text-emerald-600">{answeredCount}</span>/
                  <span className="font-bold">{questions.length}</span> câu hỏi.
                </p>
                {answeredCount < questions.length && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mt-2 font-medium">
                    ⚠️ Bạn còn {questions.length - answeredCount} câu chưa trả lời
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleSubmitExam}
                  isDisabled={submitMutation.isPending}
                >
                  <Send className="w-5 h-5" />
                  {submitMutation.isPending ? "Đang nộp bài..." : "Xác nhận nộp bài"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowSubmitConfirm(false)}
                  isDisabled={submitMutation.isPending}
                >
                  Tiếp tục làm bài
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuizAttemptContent;

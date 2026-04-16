import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Timer, Send, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Save } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAnswersMap,
  selectCurrentQuestionIndex,
  selectTimeRemaining,
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
import { useTabLock } from "../queries/useTabLock";

const QuizAttemptContent: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams({
    from: "/_layout/quiz-attempts/$attemptId/",
  });
  const numericAttemptId = Number(attemptId);

  const { status: lockStatus, releaseLock } = useTabLock(numericAttemptId);

  const dispatch = useDispatch();
  const answersMap = useSelector(selectAnswersMap);
  const currentIndex = useSelector(selectCurrentQuestionIndex);
  const timeRemaining = useSelector(selectTimeRemaining);

  const storedDeviceToken = React.useMemo(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("quiz_device_token_")) {
        return localStorage.getItem(key) ?? undefined;
      }
    }
    return undefined;
  }, []);

  const { data: attemptData, isLoading: attemptLoading } = useQuizAttempt(numericAttemptId, {
    deviceToken: storedDeviceToken,
  });
  const { data: examData, isLoading: examLoading } = useExam(attemptData?.exam?.id || 0, {
    enabled: !!attemptData?.exam?.id,
  });

  const deviceToken = attemptData?.deviceToken ?? "";

  const saveMutation = useSaveQuizAnswer();
  const submitMutation = useSubmitQuizAttempt();

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [isTimerInitialized, setIsTimerInitialized] = useState(false);
  const [isStoreInitialized, setIsStoreInitialized] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  const lastSaveTimeRef = useRef(lastSaveTime);
  const answersMapRef = useRef(answersMap);
  const deviceTokenRef = useRef(deviceToken);

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);
  useEffect(() => {
    lastSaveTimeRef.current = lastSaveTime;
  }, [lastSaveTime]);
  useEffect(() => {
    answersMapRef.current = answersMap;
  }, [answersMap]);
  useEffect(() => {
    deviceTokenRef.current = deviceToken;
  }, [deviceToken]);

  useEffect(() => {
    if (lockStatus === "denied") {
      timer.stop();
      dispatch(stopTimerAction());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockStatus, dispatch]);

  useEffect(() => {
    if (attemptData && !isStoreInitialized) {
      dispatch(setQuizAttemptAction(attemptData));
      setIsStoreInitialized(true);
    }
  }, [attemptData, isStoreInitialized, dispatch]);

  const handleSaveAll = useCallback(async () => {
    const token = deviceTokenRef.current;
    if (!token) return;

    const currentAnswersMap = answersMapRef.current;
    const answeredQuestions = Object.values(currentAnswersMap).filter((answer) => {
      const type = answer.question.questionType?.toUpperCase();
      if (type === "ESSAY") return !!answer.answerText?.trim();
      return (answer.selectedOptionIds?.length ?? 0) > 0;
    });

    if (answeredQuestions.length === 0) return;

    setIsSavingAll(true);

    const savePromises = answeredQuestions.map((answer) =>
      saveMutation.mutateAsync({
        attemptId: numericAttemptId,
        deviceToken: token,
        data: {
          questionId: answer.question.id,
          answerText: answer.answerText,
          selectedOptionIds: answer.selectedOptionIds,
          questionNo: answer.questionNo,
          navigationState:
            answer.answerText?.trim() || (answer.selectedOptionIds?.length ?? 0) > 0
              ? QuestionNavigationState.ANSWERED
              : QuestionNavigationState.UNANSWERED,
        },
      }),
    );

    try {
      await Promise.all(savePromises);
      setHasUnsavedChanges(false);
      setLastSaveTime(Date.now());
    } catch (error) {
      console.error("Failed to save all:", error);
    } finally {
      setIsSavingAll(false);
    }
  }, [saveMutation, numericAttemptId]);

  const handleAutoSubmit = useCallback(async () => {
    const token = deviceTokenRef.current;
    console.log("Hết giờ - tự động lưu và nộp bài...");
    releaseLock();

    try {
      if (hasUnsavedChangesRef.current) {
        await handleSaveAll();
      }

      if (token) {
        await submitMutation.mutateAsync({
          attemptId: numericAttemptId,
          deviceToken: token,
          data: {
            answers: Object.values(answersMapRef.current).map((answer) => ({
              questionId: answer.question.id,
              selectedOptionIds: answer.selectedOptionIds,
              answerText: answer.answerText ?? undefined,
              navigationState:
                "navigationState" in answer ? (answer as any).navigationState : QuestionNavigationState.ANSWERED,
            })),
          },
        });
      }
    } catch (error) {
      console.error("Auto-submit failed:", error);
    } finally {
      navigate({
        to: "/quiz-attempts/$attemptId/result",
        params: { attemptId: String(attemptId) },
      });
    }
  }, [handleSaveAll, submitMutation, numericAttemptId, navigate, releaseLock]);

  const timer = useExamTimer({
    attemptId: numericAttemptId,
    onTick: (seconds: number) => {
      if (seconds === 300) {
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000);
      }
    },
    onExpire: handleAutoSubmit,
    warningThresholds: [300, 600],
  });

  useEffect(() => {
    if (attemptData && !isTimerInitialized) {
      timer.start();
      setIsTimerInitialized(true);
    }
  }, [attemptData, timer, isTimerInitialized]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const now = Date.now();
      if (hasUnsavedChangesRef.current && now - lastSaveTimeRef.current >= 120_000) {
        console.log("Auto-save triggered (2 minutes elapsed)");
        handleSaveAll();
      }
    }, 10_000);

    return () => {
      clearInterval(autoSaveInterval);
      timer.stop();
      dispatch(stopTimerAction());
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
    if (!answer) return "unanswered";

    const type = question.questionType?.toUpperCase();
    const hasContent = type === "ESSAY" ? !!answer.answerText?.trim() : (answer.selectedOptionIds?.length ?? 0) > 0;

    return hasContent ? "answered" : "unanswered";
  };

  const getTimerColor = () => {
    if (!timeRemaining) return "text-slate-900 dark:text-slate-100";
    if (timeRemaining <= 300) return "text-red-600 dark:text-red-400";
    if (timeRemaining <= 600) return "text-amber-600 dark:text-amber-400";
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

    setHasUnsavedChanges(true);
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

    setHasUnsavedChanges(true);
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

  const handleSubmitExam = async () => {
    const token = deviceTokenRef.current;
    if (!token) return;

    timer.stop();
    releaseLock();

    try {
      await handleSaveAll();

      const buildAnswers = () =>
        Object.values(answersMap).map((answer) => ({
          questionId: answer.question.id,
          selectedOptionIds: answer.selectedOptionIds,
          answerText: answer.answerText ?? undefined,
          navigationState:
            "navigationState" in answer ? (answer as any).navigationState : QuestionNavigationState.ANSWERED,
        }));

      await submitMutation.mutateAsync({
        attemptId: numericAttemptId,
        deviceToken: token,
        data: { confirmSubmit: true, answers: buildAnswers() },
      });

      navigate({
        to: "/quiz-attempts/$attemptId/result",
        params: { attemptId: String(attemptId) },
      });
    } catch {
      timer.start();
    }

    setShowSubmitConfirm(false);
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);
  const isEssay = (type: string) => type?.toUpperCase() === "ESSAY";
  const isMCQ = (type: string) => type?.toUpperCase() === "MCQ";

  if (lockStatus === "acquiring") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  if (lockStatus === "denied") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md shadow-xl border-2 border-amber-200 dark:border-amber-800">
          <CardContent className="p-10 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">Bài thi đang mở ở tab khác</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Bạn chỉ được làm bài thi trên một tab hoặc trình duyệt tại một thời điểm. Vui lòng đóng tab này và quay
              lại tab đang làm bài.
            </p>
            <Button variant="outline" onClick={() => window.close()} className="border-slate-200 dark:border-slate-700">
              Đóng tab này
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (attemptLoading || examLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-350 mx-auto p-4 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{attemptData?.exam.name}</h1>
          </div>
        </div>

        {showTimeWarning && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Còn 5 phút! Vui lòng kiểm tra lại đáp án.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-2 border-slate-200 dark:border-blue-800 rounded-md">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Badge className="mb-4 text-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-slate-200 dark:border-blue-800 font-bold">
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
                            "w-full flex items-center p-4 rounded-xl border-2 text-left group transition-all",
                            isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm",
                            !isSelected &&
                              "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700",
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0 transition-colors",
                              isSelected && "bg-blue-600 text-white",
                              !isSelected &&
                                "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50",
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
                    <textarea
                      value={answersMap[currentQuestion.id]?.answerText || ""}
                      onChange={(e) => handleEssayAnswer(e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full min-h-50 p-4 rounded-md border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-y transition-colors"
                    />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        {answersMap[currentQuestion.id]?.answerText?.length || 0} ký tự
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePreviousQuestion}
                    isDisabled={currentIndex === 0}
                    className="cursor-pointer text-md py-5 w-full sm:w-auto gap-2 text-blue-600 border-blue-600 dark:border-slate-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Câu trước
                  </Button>

                  <Button
                    size="lg"
                    onClick={handleNextQuestion}
                    className="cursor-pointer w-full text-md py-5 sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-lg"
                  >
                    {currentIndex === questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <Card className="border-2 border-slate-200 dark:border-blue-800 top-6 rounded-md">
              <CardContent className="px-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Timer
                      className={cn(
                        "w-6 h-6",
                        timeRemaining && timeRemaining <= 300
                          ? "text-red-600 animate-pulse"
                          : "text-blue-600 dark:text-blue-400",
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        Thời gian còn lại
                      </span>
                      <span className={cn("text-2xl font-black", getTimerColor())}>{timer.formatTime()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-3 border-slate-200 dark:border-slate-700">
                  <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 mb-3">Danh sách câu hỏi</h3>

                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {questions.map((_, index) => {
                      const status = getQuestionStatus(index);
                      return (
                        <button
                          key={index}
                          onClick={() => handleGoToQuestion(index)}
                          className={cn(
                            "cursor-pointer aspect-square flex items-center justify-center rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform",
                            status === "current" &&
                              "border-2 border-blue-600 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                            status === "answered" && "bg-emerald-500 text-white",
                            status === "unanswered" &&
                              "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400",
                          )}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Đã trả lời:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {answeredCount}/{questions.length}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-4 border-t-3 border-slate-200">
                    <Button
                      size="lg"
                      className="w-full gap-2 text-md py-5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 shadow-lg"
                      onClick={handleSaveAll}
                      isDisabled={isSavingAll || answeredCount === 0}
                    >
                      <Save className="w-5 h-5" />
                      {isSavingAll ? "Đang lưu..." : `Lưu tất cả`}
                    </Button>

                    <Button
                      size="lg"
                      className="w-full gap-2 text-md py-5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-lg"
                      onClick={() => setShowSubmitConfirm(true)}
                    >
                      <Send className="w-5 h-5" />
                      Nộp bài thi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className=" dark:bg-blue-900/20 border-2 border-slate-200 dark:border-blue-800 rounded-md">
              <CardContent className="px-5">
                <div className="flex gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-1">Lưu ý quan trọng</h4>
                    <ul className="text-sm font-medium text-blue-700 dark:text-blue-400 leading-relaxed space-y-1">
                      <li>• Tự động lưu mỗi 2 phút</li>
                      <li>• Nhấn "Lưu tất cả" để lưu ngay</li>
                      <li>• Tự động nộp bài khi hết giờ</li>
                      <li>• Không tải lại trang</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl border-2 border-slate-200 dark:border-slate-700">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Xác nhận nộp bài</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Bạn đã trả lời <span className="font-bold text-emerald-600">{answeredCount}</span>/
                  <span className="font-bold">{questions.length}</span> câu hỏi.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                  onClick={handleSubmitExam}
                  isDisabled={submitMutation.isPending}
                >
                  {submitMutation.isPending || isSavingAll ? "Đang nộp bài..." : "Xác nhận nộp bài"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-slate-200 dark:border-slate-700"
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

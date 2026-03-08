import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronRight,
  ChevronLeft,
  Timer,
  Send,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentAttempt,
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
import {
  useQuizAttempt,
  useSaveQuizAnswer,
  useUpdateNavigationState,
  useSubmitQuizAttempt,
  useSendHeartbeat,
} from "../queries/useQuiz";
import { useExamTimer } from "../queries/useExamTimer";
import { useTimerSync } from "../queries/useTimerSync";
import type { QuizAttemptResponse, QuestionNavigationState, QuizAttemptStatus } from "../types/quiz.type";
import {
  ApprovalStatus,
  QuestionLevel,
  QuestionType,
  type QuestionResponse,
} from "@/feature/question/types/question.type";

const mockQuizAttempt: QuizAttemptResponse = {
  id: 1,
  user: {
    id: 1,
    username: "student01",
    email: "student01@example.com",
    fullName: "Lê Minh Khoa",
  },
  exam: {
    id: 1,
    name: "Kiểm tra Giữa kỳ 1 - Tin học 12",
    code: "TIN12-GK1",
    durationInMinutes: 45,
    totalScore: 10,
    totalQuestions: 30,
    isPublished: true,
    createdAt: "2023-09-15T08:00:00Z",
  },
  status: "DOING" as QuizAttemptStatus,
  startTime: new Date().toISOString(),
  submittedAt: undefined,
  score: undefined,
  timeRemaining: 45 * 60 - 3 * 60 - 8,
  answers: Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    question: {
      id: i + 1,
      questionText: `Câu hỏi số ${i + 1}`,
      questionType: "MCQ",
    },
    selectedOptionIds: [i * 4 + 2],
    isCorrect: true,
    score: 0.33,
    questionNo: i + 1,
    navigationState: "ANSWERED" as QuestionNavigationState,
  })),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockQuestions: QuestionResponse[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  content:
    i === 14
      ? "Kết quả của đoạn mã sau là gì?\n\nx = [1, 2, 3]\nfor i in x:\n    print(i * 2)"
      : `Câu hỏi số ${i + 1}: Nội dung câu hỏi mẫu về lập trình và tin học?`,
  canonicalAnswer: undefined,
  questionType: "MCQ" as QuestionType,
  questionLevel: i % 3 === 0 ? QuestionLevel.EASY : i % 3 === 1 ? QuestionLevel.MEDIUM : QuestionLevel.HARD,
  subject: { id: 1, name: "Tin học", code: "TIN" },
  chapter: undefined,
  lesson: { id: 1, name: "Bài 1", code: "L1" },
  tags: [],
  options: [
    { id: i * 4 + 1, content: i === 14 ? "A. 1 2 3" : `Đáp án A cho câu ${i + 1}`, isCorrect: false, orderNo: 1 },
    {
      id: i * 4 + 2,
      content: i === 14 ? "B. 2 4 6 (Hiển thị trên từng dòng)" : `Đáp án B cho câu ${i + 1}`,
      isCorrect: true,
      orderNo: 2,
    },
    {
      id: i * 4 + 3,
      content: i === 14 ? "C. [2, 4, 6]" : `Đáp án C cho câu ${i + 1}`,
      isCorrect: false,
      orderNo: 3,
    },
    {
      id: i * 4 + 4,
      content: i === 14 ? "D. Lỗi cú pháp" : `Đáp án D cho câu ${i + 1}`,
      isCorrect: false,
      orderNo: 4,
    },
  ],
  isActive: true,
  isPublic: true,
  approvalStatus: "APPROVED" as ApprovalStatus,
  createdAt: "2023-09-15T08:00:00Z",
  updatedAt: "2023-09-15T08:00:00Z",
}));

const QuizAttemptContent: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams({ from: "/_layout/quiz-attempts/$attemptId" });

  const dispatch = useDispatch();
  const attempt = useSelector(selectCurrentAttempt);
  const answersMap = useSelector(selectAnswersMap);
  const currentIndex = useSelector(selectCurrentQuestionIndex);
  const timeRemaining = useSelector(selectTimeRemaining);
  const stats = useSelector(selectQuestionStats);

  // const { data, isLoading } = useQuizAttempt(Number(attemptId));
  // const saveMutation = useSaveQuizAnswer();
  // const updateStateMutation = useUpdateNavigationState();
  // const submitMutation = useSubmitQuizAttempt();

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  useEffect(() => {
    dispatch(setQuizAttemptAction(mockQuizAttempt));
  }, [dispatch]);

  const timer = useExamTimer({
    attemptId: Number(attemptId),
    onTick: (seconds: number) => {
      // Hiển thị warning ở 5 phút
      if (seconds === 300) {
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000);
      }
    },
    onExpire: async () => {
      // Auto-submit khi hết giờ
      console.log("⏰ Hết giờ - tự động nộp bài...");
      await handleAutoSubmit();
    },
    warningThresholds: [300, 600],
  });

  // useTimerSync({
  //   attemptId: Number(attemptId),
  //   enabled: timer.isRunning,
  //   intervalMs: 30000, // Sync mỗi 30 giây
  // });

  useEffect(() => {
    timer.start();
    return () => {
      timer.stop();
      dispatch(stopTimerAction());
    };
  }, []);

  const questions = mockQuestions;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answersMap).filter(
    (id) => answersMap[Number(id)]?.selectedOptionIds?.length,
  ).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const getQuestionStatus = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question) return "unanswered";
    const questionId = question.id;
    if (questionIndex === currentIndex) return "current";
    if (answersMap[questionId]?.selectedOptionIds?.length) return "answered";
    return "unanswered";
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
          questionText: currentQuestion.content,
          questionType: currentQuestion.questionType,
        },
        selectedOptionIds: [optionId],
        navigationState: "ANSWERED" as QuestionNavigationState,
        isCorrect: false,
        score: 0,
        questionNo: currentIndex + 1,
      }),
    );

    // saveMutation.mutate({
    //   attemptId: Number(attemptId),
    //   data: {
    //     questionId: currentQuestion.id,
    //     selectedOptionIds: [optionId],
    //     questionNo: currentIndex + 1,
    //     navigationState: 'ANSWERED',
    //   },
    // });
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

    // try {
    //   await submitMutation.mutateAsync({
    //     attemptId: Number(attemptId),
    //     data: {
    //       answers: Object.values(answersMap).map(answer => ({
    //         questionId: answer.question.id,
    //         selectedOptionIds: answer.selectedOptionIds,
    //         navigationState: 'ANSWERED',
    //       })),
    //     },
    //   });
    //   navigate({
    //     to: "/quiz-attempts/$attemptId/result",
    //     params: { attemptId: String(attemptId) },
    //   });
    // } catch (error) {
    //   console.error('Auto-submit failed:', error);
    //   navigate({
    //     to: "/quiz-attempts/$attemptId/result",
    //     params: { attemptId: String(attemptId) },
    //   });
    // }

    alert("⏰ Hết giờ! Bài thi đã được nộp tự động.");
  };

  const handleSubmitExam = async () => {
    timer.stop();

    // try {
    //   const result = await submitMutation.mutateAsync({
    //     attemptId: Number(attemptId),
    //     data: {
    //       answers: Object.values(answersMap).map(answer => ({
    //         questionId: answer.question.id,
    //         selectedOptionIds: answer.selectedOptionIds,
    //         navigationState: answer.navigationState || 'ANSWERED',
    //       })),
    //     },
    //   });
    //   navigate({
    //     to: "/quiz-attempts/$attemptId/result",
    //     params: { attemptId: String(attemptId) },
    //   });
    // } catch (error: any) {
    //   if (error.response?.data?.message?.includes('unanswered')) {
    //     const confirmSubmit = window.confirm(
    //       `Bạn còn ${stats.unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài không?`
    //     );
    //     if (confirmSubmit) {
    //       await handleSubmitExam();
    //     } else {
    //       timer.start();
    //     }
    //   } else {
    //     timer.start();
    //   }
    // }

    alert("✅ Bài thi đã được nộp thành công!");
    setShowSubmitConfirm(false);
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="max-w-360 mx-auto p-4 md:p-8">
        {showTimeWarning && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg animate-pulse">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                ⚠️ Còn 5 phút! Vui lòng kiểm tra lại đáp án.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-white dark:bg-slate-800/50 p-8 rounded-xl border border-primary/10 shadow-sm">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
                  CÂU HỎI {currentIndex + 1}
                </span>
                <h2 className="text-2xl font-bold leading-snug whitespace-pre-wrap">{currentQuestion?.content}</h2>
              </div>

              {currentIndex === 14 && (
                <div className="bg-slate-950 rounded-xl p-6 mb-8 font-mono text-sm leading-relaxed overflow-x-auto border border-slate-800">
                  <div className="flex gap-4">
                    <span className="text-slate-600 select-none">
                      1<br />2<br />3
                    </span>
                    <code className="text-slate-300">
                      <span className="text-primary">x</span> = [1, 2, 3]
                      <br />
                      <span className="text-blue-400">for</span> i <span className="text-blue-400">in</span>{" "}
                      <span className="text-primary">x</span>:<br />
                      {"    "}
                      <span className="text-green-400">print</span>(i * 2)
                    </code>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {currentQuestion?.options?.map((option, index) => {
                  const isSelected = answersMap[currentQuestion.id]?.selectedOptionIds?.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      className={cn(
                        "w-full flex items-center p-4 rounded-xl border-2 text-left group transition-all",
                        isSelected && "border-primary bg-primary/5",
                        !isSelected && "border-primary/10 bg-[#f8f6f6] dark:bg-slate-800/50 hover:border-primary/40",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4",
                          isSelected && "bg-primary text-white",
                          !isSelected && "bg-primary/10 text-primary",
                        )}
                      >
                        {getOptionLabel(index)}
                      </div>
                      <span
                        className={cn(
                          "flex-1 font-medium",
                          isSelected && "text-slate-900 dark:text-slate-100",
                          !isSelected && "text-slate-600 dark:text-slate-300",
                        )}
                      >
                        {option.content}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentIndex === 0}
                  className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 font-bold hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Câu trước
                </button>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button
                    onClick={handleNextQuestion}
                    className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    {currentIndex === questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Timer
                      className={`w-6 h-6 ${
                        timeRemaining && timeRemaining <= 300 ? "text-red-600 animate-pulse" : "text-primary"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Thời gian còn lại
                      </span>
                      <span className={`text-xl font-black ${getTimerColor()}`}>{timer.formatTime()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="cursor-pointer w-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20 p-5"
                  onClick={() => setShowSubmitConfirm(true)}
                >
                  <Send className="w-5 h-5" />
                  Nộp bài thi ngay
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Danh sách câu hỏi</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-xs text-slate-500">Đang làm</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 mb-8">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleGoToQuestion(index)}
                        className={cn(
                          "cursor-pointer aspect-square flex items-center justify-center rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform",
                          status === "current" && "border-2 border-primary bg-primary/10 text-primary",
                          status === "answered" && "bg-green-500 text-white",
                          status === "unanswered" &&
                            "bg-primary/5 border border-primary/20 text-slate-400 hover:bg-primary/10",
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Đã trả lời:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {answeredCount}/{questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tiến độ:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">{progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Ghi chú quan trọng</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                      Hệ thống sẽ tự động nộp bài khi hết thời gian. Vui lòng không tải lại trang để tránh mất dữ liệu
                      tạm thời.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Xác nhận nộp bài</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Bạn đã trả lời {answeredCount}/{questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài không?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowSubmitConfirm(false)}>
                  Hủy
                </Button>
                <Button className="flex-1" onClick={handleSubmitExam}>
                  Nộp bài
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

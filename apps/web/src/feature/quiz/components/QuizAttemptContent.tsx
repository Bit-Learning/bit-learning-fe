import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft, Timer, Send, AlertCircle, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   selectCurrentAttempt,
//   selectAnswersMap,
//   selectCurrentQuestionIndex,
//   selectTimeRemaining,
//   selectQuestionStats,
//   nextQuestionAction,
//   previousQuestionAction,
//   goToQuestionAction,
//   updateAnswerAction,
//   decrementTimeAction,
//   startTimerAction,
//   stopTimerAction,
// } from "../stores/quiz.store";
// import {
//   useQuizAttempt,
//   useSaveQuizAnswer,
//   useUpdateNavigationState,
//   useSubmitQuizAttempt,
//   useSendHeartbeat,
// } from "../hooks/useQuiz";
import type { QuizAttemptResponse, QuestionNavigationState, QuizAttemptStatus } from "../types/quiz.type";
import {
  ApprovalStatus,
  QuestionLevel,
  QuestionType,
  type QuestionResponse,
} from "@/feature/question/types/question.type";

// ==================== MOCK DATA ====================
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
  timeRemaining: 45 * 60 - 3 * 60 - 8, // 41:52
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

// Mock questions from exam
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

// ==================== COMPONENT ====================
const QuizAttemptContent: React.FC = () => {
  // ===== ROUTER =====
  const navigate = useNavigate();
  const { attemptId } = useParams({ from: "/_layout/quiz-attempts/$attemptId" });

  // ===== REDUX (Commented - Ready for production) =====
  // const dispatch = useDispatch();
  // const attempt = useSelector(selectCurrentAttempt);
  // const answersMap = useSelector(selectAnswersMap);
  // const currentIndex = useSelector(selectCurrentQuestionIndex);
  // const timeRemaining = useSelector(selectTimeRemaining);
  // const stats = useSelector(selectQuestionStats);

  // ===== QUERIES (Commented - Ready for production) =====
  // Fetch attempt data & sync to Redux on mount
  // const { data, isLoading } = useQuizAttempt(Number(attemptId));

  // Mutations
  // const saveMutation = useSaveQuizAnswer();
  // const updateStateMutation = useUpdateNavigationState();
  // const submitMutation = useSubmitQuizAttempt();
  // const heartbeatMutation = useSendHeartbeat();

  // ===== LOCAL STATE (Mock for UI testing) =====
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(14); // Start at question 15
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({
    1: 6,
    2: 10,
    3: 14,
    4: 18,
    5: 22,
    6: 26,
    7: 30,
    8: 34,
    9: 38,
    10: 42,
    11: 46,
    12: 50,
    13: 54,
    14: 58,
    15: 62,
  });
  const [timeRemaining, setTimeRemaining] = useState(45 * 60 - 3 * 60 - 8); // 41:52
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const attempt = mockQuizAttempt;
  const questions = mockQuestions;

  // ===== DERIVED DATA =====
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const difficultyLabel = {
    EASY: "Dễ",
    MEDIUM: "Trung bình",
    HARD: "Khó",
  };

  // ===== TIMER EFFECT =====
  useEffect(() => {
    // Production: dispatch(startTimerAction());
    const timer = setInterval(() => {
      // Production: dispatch(decrementTimeAction());
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      // Production: dispatch(stopTimerAction());
    };
  }, []);

  // ===== HEARTBEAT EFFECT (Commented - Ready for production) =====
  // useEffect(() => {
  //   const heartbeat = setInterval(() => {
  //     heartbeatMutation.mutate({
  //       attemptId: Number(attemptId),
  //       data: {
  //         currentTime: new Date().toISOString(),
  //         timeRemaining,
  //       },
  //     });
  //   }, 30000); // Every 30 seconds
  //
  //   return () => clearInterval(heartbeat);
  // }, [attemptId, timeRemaining]);

  // ===== UTILITY FUNCTIONS =====
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionStatus = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question) return "unanswered";
    const questionId = question.id;
    if (questionIndex === currentQuestionIndex) return "current";
    if (selectedAnswers[questionId]) return "answered";
    return "unanswered";
  };

  // ===== HANDLERS =====
  const handleSelectAnswer = (optionId: number) => {
    // Local state update (optimistic)
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));

    // Production: Redux update + API call
    // dispatch(updateAnswerAction({
    //   id: Date.now(),
    //   question: { id: currentQuestion.id, questionText: currentQuestion.content, questionType: currentQuestion.questionType },
    //   selectedOptionIds: [optionId],
    //   navigationState: 'ANSWERED',
    //   isCorrect: false,
    //   score: 0,
    //   questionNo: currentQuestionIndex + 1,
    // }));
    //
    // saveMutation.mutate({
    //   attemptId: Number(attemptId),
    //   data: {
    //     questionId: currentQuestion.id,
    //     selectedOptionIds: [optionId],
    //     questionNo: currentQuestionIndex + 1,
    //     navigationState: 'ANSWERED',
    //   },
    // });
  };

  const handleNextQuestion = () => {
    // Production: dispatch(nextQuestionAction());
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    // Production: dispatch(previousQuestionAction());
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    // Production: dispatch(goToQuestionAction(index));
    setCurrentQuestionIndex(index);
  };

  const handleSubmitExam = async () => {
    // Production: Submit via API
    // try {
    //   const result = await submitMutation.mutateAsync({
    //     attemptId: Number(attemptId),
    //     data: {
    //       answers: Object.entries(selectedAnswers).map(([qId, optId]) => ({
    //         questionId: Number(qId),
    //         selectedOptionIds: [optId],
    //         navigationState: 'ANSWERED',
    //       })),
    //     },
    //   });
    //
    //   if (result.data.data.requiresConfirmation) {
    //     // Show confirmation dialog
    //     setShowSubmitConfirm(true);
    //   } else {
    //     // Navigate to result
    //     navigate({
    //       to: "/quiz-attempts/$attemptId/result",
    //       params: { attemptId: String(attemptId) },
    //     });
    //   }
    // } catch (error) {
    //   console.error("Failed to submit:", error);
    // }

    // Mock: Direct navigation
    navigate({
      to: "/quiz-attempts/$attemptId/result",
      params: { attemptId: String(attemptId) },
    });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="max-w-360 mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <Badge className="bg-primary text-white text-xs font-bold uppercase">
                    Câu hỏi {currentQuestionIndex + 1}/{questions.length}
                  </Badge>
                  {currentQuestion && (
                    <span className="text-slate-400 text-sm italic">
                      Độ khó: {difficultyLabel[currentQuestion.questionLevel]}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-snug whitespace-pre-wrap">
                  {currentQuestion?.content}
                </h1>

                {currentQuestionIndex === 14 && (
                  <div className="bg-slate-950 rounded-xl p-6 mb-8 font-mono text-sm leading-relaxed overflow-x-auto border border-slate-800">
                    <div className="flex gap-4">
                      <span className="text-slate-600 select-none">
                        1<br />
                        2<br />3
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
                  {currentQuestion?.options?.map((option) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          "group flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50",
                        )}
                      >
                        <input
                          type="radio"
                          name="answer"
                          checked={isSelected}
                          onChange={() => handleSelectAnswer(option.id)}
                          className="w-5 h-5 text-primary border-slate-300 focus:ring-primary"
                        />
                        <div className="ml-4">
                          <span
                            className={cn(
                              "font-medium",
                              isSelected
                                ? "text-slate-900 dark:text-slate-100 font-bold"
                                : "text-slate-700 dark:text-slate-200",
                            )}
                          >
                            {option.content}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardContent>

              <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  isDisabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Câu trước
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  isDisabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center gap-2"
                >
                  Câu tiếp theo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Timer className="w-6 h-6 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Thời gian còn lại
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  onClick={() => setShowSubmitConfirm(true)}
                >
                  <Send className="w-5 h-5" />
                  Nộp bài thi ngay
                </Button>
              </CardContent>
            </Card>

            {/* Question Grid */}
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
                          "flex items-center justify-center w-10 h-10 rounded-lg font-bold cursor-pointer transition-all",
                          status === "current" && "bg-primary text-white ring-4 ring-primary/20",
                          status === "answered" &&
                            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                          status === "unanswered" &&
                            "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700",
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

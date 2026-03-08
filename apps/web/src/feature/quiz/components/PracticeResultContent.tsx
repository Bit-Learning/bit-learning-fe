import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  XCircle,
  EyeOff,
  LayoutGrid,
  BookOpen,
  RefreshCw,
  Home,
  Terminal,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
// import { useQuizSession } from "../hooks/useQuiz";
import type { QuizSessionResponse, QuizSessionStatus, QuizSessionType } from "../types/quiz.type";
import {
  ApprovalStatus,
  QuestionLevel,
  QuestionType,
  type QuestionResponse,
} from "@/feature/question/types/question.type";

// ==================== MOCK FULL QUESTIONS ====================
const mockFullQuestions: QuestionResponse[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  content: i === 0 ? "Đâu là thiết bị đầu vào của máy tính?" : `Câu hỏi số ${i + 1} về Tin học 12?`,
  canonicalAnswer:
    i === 0
      ? "Thiết bị đầu vào (Input devices) là các thiết bị dùng để cung cấp dữ liệu cho máy tính. Chuột và bàn phím là hai thiết bị đầu vào cơ bản nhất. Màn hình, máy in và loa là các thiết bị đầu ra (Output devices)."
      : `Giải thích chi tiết cho câu hỏi số ${i + 1}`,
  questionType: "MCQ" as QuestionType,
  questionLevel: "MEDIUM" as QuestionLevel,
  subject: { id: 1, name: "Tin học", code: "TIN" },
  chapter: undefined,
  lesson: { id: 1, name: "Bài 1", code: "L1" },
  tags: [],
  options: [
    { id: i * 4 + 1, content: i === 0 ? "Chuột và Bàn phím" : `Đáp án A`, isCorrect: true, orderNo: 1 },
    { id: i * 4 + 2, content: i === 0 ? "Màn hình và Máy in" : `Đáp án B`, isCorrect: false, orderNo: 2 },
    { id: i * 4 + 3, content: i === 0 ? "Loa và Tai nghe" : `Đáp án C`, isCorrect: false, orderNo: 3 },
    { id: i * 4 + 4, content: i === 0 ? "Ổ cứng và RAM" : `Đáp án D`, isCorrect: false, orderNo: 4 },
  ],
  isActive: true,
  isPublic: true,
  approvalStatus: "APPROVED" as ApprovalStatus,
  createdAt: "2023-09-15T08:00:00Z",
  updatedAt: "2023-09-15T08:00:00Z",
}));

// ==================== MOCK DATA ====================
const mockPracticeResult: QuizSessionResponse = {
  id: 1,
  user: {
    id: 1,
    username: "student01",
    email: "student01@example.com",
    fullName: "Nguyễn Văn A",
  },
  exam: {
    id: 1,
    name: "Luyện tập Tin học 12 - Hệ điều hành",
    code: "TIN12-GK1",
    durationInMinutes: 60,
    totalScore: 10,
    totalQuestions: 20,
    isPublished: true,
    createdAt: "2023-09-15T08:00:00Z",
  },
  status: "SUBMITTED" as QuizSessionStatus,
  type: "PRACTICE" as QuizSessionType,
  currentIndex: 20,
  autoSubmitted: false,
  startTime: "2023-10-15T10:00:00Z",
  endTime: "2023-10-15T10:25:30Z",
  timeRemaining: undefined,
  answers: Array.from({ length: 20 }, (_, i) => {
    const isCorrect = ![2, 7, 10].includes(i); // 3 câu sai
    return {
      id: i + 1,
      question: {
        id: i + 1,
        questionText: i === 0 ? "Đâu là thiết bị đầu vào của máy tính?" : `Câu hỏi số ${i + 1}`,
        questionType: "MCQ" as QuestionType,
      },
      selectedOptionIds: isCorrect ? [i * 4 + 1] : [i * 4 + 2],
      isMarked: false,
      questionNo: i + 1,
    };
  }),
  createdAt: "2023-10-15T10:00:00Z",
  updatedAt: "2023-10-15T10:25:30Z",
};

// ==================== COMPONENT ====================
const PracticeResultContent = () => {
  const navigate = useNavigate();
  // const { sessionId } = useParams({ from: "/_layout/quiz-sessions/$sessionId/summary" });

  // const { data: result, isLoading } = useQuizSession(Number(sessionId));
  // const { data: examData } = useExam(result?.exam.id);
  // const fullQuestions = examData?.examQuestions.map(eq => eq.question) || [];

  const result = mockPracticeResult;
  const fullQuestions = mockFullQuestions;

  const correctAnswers = result.answers.filter((answer) => {
    const question = fullQuestions.find((q) => q.id === answer.question.id);
    const correctOption = question?.options?.find((opt) => opt.isCorrect);
    return answer.selectedOptionIds?.includes(correctOption?.id || 0);
  }).length;

  const wrongAnswers = result.answers.filter((answer) => {
    const question = fullQuestions.find((q) => q.id === answer.question.id);
    const correctOption = question?.options?.find((opt) => opt.isCorrect);
    return (
      answer.selectedOptionIds &&
      answer.selectedOptionIds.length > 0 &&
      !answer.selectedOptionIds.includes(correctOption?.id || 0)
    );
  }).length;

  const skippedAnswers = result.answers.filter((a) => !a.selectedOptionIds || a.selectedOptionIds.length === 0).length;

  const accuracy = Math.round((correctAnswers / result.answers.length) * 100);
  const score = ((correctAnswers / result.answers.length) * result.exam.totalScore).toFixed(1);

  const rank =
    Number(score) >= 9
      ? "Xuất sắc"
      : Number(score) >= 8
        ? "Giỏi"
        : Number(score) >= 6.5
          ? "Khá"
          : Number(score) >= 5
            ? "Trung bình"
            : "Yếu";

  const handleRetake = () => {
    navigate({
      to: "/exams/$examId/mode",
      params: { examId: String(result.exam.id) },
    });
  };

  const handleGoHome = () => {
    navigate({ to: "/exams" });
  };

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex flex-col">
      <main className="max-w-300 mx-auto px-4 py-6 md:py-10 w-full flex-1">
        {/* Hero Score Section */}
        <div className="flex flex-col items-center justify-center text-center py-10 bg-white dark:bg-slate-900/50 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
          <div className="mb-2 text-primary font-semibold uppercase tracking-widest text-sm">Kết quả luyện tập</div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-2">
            {score} <span className="text-2xl text-slate-400 font-medium">/ {result.exam.totalScore.toFixed(1)}</span>
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold">
            <Award className="w-4 h-4" />
            {accuracy}% chính xác - {rank}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-1">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-semibold uppercase">Đúng</p>
              </div>
              <p className="text-3xl font-bold">
                {correctAnswers} <span className="text-base font-normal text-slate-500">câu</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-500 mb-1">
                <XCircle className="w-5 h-5" />
                <p className="text-sm font-semibold uppercase">Sai</p>
              </div>
              <p className="text-3xl font-bold">
                {wrongAnswers} <span className="text-base font-normal text-slate-500">câu</span>
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <EyeOff className="w-5 h-5" />
                <p className="text-sm font-semibold uppercase">Bỏ qua</p>
              </div>
              <p className="text-3xl font-bold">
                {skippedAnswers} <span className="text-base font-normal text-slate-500">câu</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Answer Review Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Bảng rà soát đáp án
          </h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {result.answers.map((answer, index) => {
              const question = fullQuestions.find((q) => q.id === answer.question.id);
              const correctOption = question?.options?.find((opt) => opt.isCorrect);
              const isCorrect = answer.selectedOptionIds?.includes(correctOption?.id || 0);

              return (
                <button
                  key={answer.id}
                  className={cn(
                    "flex aspect-square p-2 items-center justify-center rounded-xl font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer",
                    isCorrect ? "bg-green-500 dark:bg-green-600 text-white" : "bg-red-500 dark:bg-red-600 text-white",
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Explanation Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Chi tiết giải thích
          </h2>
          <div className="space-y-6">
            {result.answers.slice(0, 3).map((answer) => {
              const fullQuestion = fullQuestions.find((q) => q.id === answer.question.id);
              if (!fullQuestion) return null;

              const correctOption = fullQuestion.options?.find((opt) => opt.isCorrect);
              const userSelectedOption = fullQuestion.options?.find((opt) =>
                answer.selectedOptionIds?.includes(opt.id),
              );
              const isCorrect = userSelectedOption?.id === correctOption?.id;

              return (
                <Card key={answer.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={cn("text-white text-sm font-bold", isCorrect ? "bg-green-600" : "bg-red-600")}>
                        Câu {answer.questionNo}
                      </Badge>
                      <span
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          isCorrect ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Chính xác
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> Sai rồi
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-lg font-semibold mb-4 leading-relaxed">{fullQuestion.content}</p>

                    <div className="space-y-2 mb-6">
                      {fullQuestion.options?.map((option) => {
                        const isUserAnswer = userSelectedOption?.id === option.id;
                        const isCorrectAnswer = correctOption?.id === option.id;

                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "p-3 rounded-xl border flex justify-between items-center",
                              isUserAnswer &&
                                !isCorrectAnswer &&
                                "border-2 border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/10",
                              isCorrectAnswer &&
                                "border-2 border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/10",
                              !isUserAnswer &&
                                !isCorrectAnswer &&
                                "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50",
                            )}
                          >
                            <span className={cn("font-medium", (isUserAnswer || isCorrectAnswer) && "font-bold")}>
                              {option.content}
                            </span>
                            {isCorrectAnswer && (
                              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                Đáp án đúng
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600" />}
                            {isCorrectAnswer && isUserAnswer && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </div>
                        );
                      })}
                    </div>

                    {fullQuestion.canonicalAnswer && (
                      <div className="p-4 rounded-xl bg-primary/5 border-l-4 border-primary">
                        <p className="text-primary font-bold text-sm uppercase mb-2">Lời giải chi tiết</p>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {fullQuestion.canonicalAnswer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pb-10">
          <Button
            className="flex-1 flex items-center justify-center gap-2 h-14 shadow-lg shadow-primary/25"
            onClick={handleRetake}
          >
            <RefreshCw className="w-5 h-5" />
            Luyện tập lại
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 h-14"
            onClick={handleGoHome}
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PracticeResultContent;

import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Share2,
  MoreHorizontal,
  Award,
  CheckCircle2,
  XCircle,
  EyeOff,
  LayoutGrid,
  BookOpen,
  RefreshCw,
  Home,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
// import { useQuizAttempt } from "../hooks/useQuiz";
import type {
  QuizAttemptResponse,
  QuizAttemptAnswerResponse,
  QuizAttemptStatus,
  QuestionNavigationState,
} from "../types/quiz.type";
import type {
  QuestionResponse,
  OptionResponse,
  QuestionLevel,
  QuestionType,
  ApprovalStatus,
} from "@/feature/question/types/question.type";

// ==================== MOCK FULL QUESTIONS (for result display) ====================
const mockFullQuestions: QuestionResponse[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  content:
    i === 0
      ? "Đâu là thủ đô của Việt Nam?"
      : i === 2
        ? "Dãy núi cao nhất Việt Nam là dãy núi nào?"
        : `Câu hỏi số ${i + 1}`,
  canonicalAnswer:
    i === 0
      ? "Hà Nội là thủ đô của nước Cộng hòa xã hội chủ nghĩa Việt Nam, đồng thời cũng là kinh đô của hầu hết các vương triều phong kiến Việt Nam trước đây."
      : i === 2
        ? "Hoàng Liên Sơn là dãy núi cao nhất Việt Nam, trong đó có đỉnh Fansipan cao 3.143m được mệnh danh là 'Nóc nhà Đông Dương'. Bạn đã chọn Trường Sơn là chưa chính xác."
        : `Giải thích chi tiết cho câu hỏi số ${i + 1}`,
  questionType: "MCQ" as QuestionType,
  questionLevel: "MEDIUM" as QuestionLevel,
  subject: { id: 1, name: "Tin học", code: "TIN" },
  chapter: undefined,
  lesson: { id: 1, name: "Bài 1", code: "L1" },
  tags: [],
  options: [
    {
      id: i * 4 + 1,
      content: i === 0 ? "A. TP. Hồ Chí Minh" : i === 2 ? "A. Trường Sơn" : `Đáp án A`,
      isCorrect: false,
      orderNo: 1,
    },
    {
      id: i * 4 + 2,
      content: i === 0 ? "B. Hà Nội" : i === 2 ? "B. Hoàng Liên Sơn" : `Đáp án B`,
      isCorrect: true,
      orderNo: 2,
    },
    {
      id: i * 4 + 3,
      content: i === 0 ? "C. Đà Nẵng" : i === 2 ? "C. Bạch Mã" : `Đáp án C`,
      isCorrect: false,
      orderNo: 3,
    },
    {
      id: i * 4 + 4,
      content: i === 0 ? "D. Hải Phòng" : i === 2 ? "D. Ngũ Hành Sơn" : `Đáp án D`,
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

// ==================== MOCK DATA ====================
const mockQuizResult: QuizAttemptResponse = {
  id: 1,
  user: {
    id: 1,
    username: "student01",
    email: "student01@example.com",
    fullName: "Nguyễn Văn A",
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
  status: "SUBMITTED" as QuizAttemptStatus,
  startTime: "2023-10-15T09:00:00Z",
  submittedAt: "2023-10-15T09:45:00Z",
  score: 9.0,
  timeRemaining: 0,
  answers: Array.from({ length: 30 }, (_, i) => {
    const isCorrect = ![2, 11, 22].includes(i);
    return {
      id: i + 1,
      question: {
        id: i + 1,
        questionText:
          i === 0
            ? "Đâu là thủ đô của Việt Nam?"
            : i === 2
              ? "Dãy núi cao nhất Việt Nam là dãy núi nào?"
              : `Câu hỏi số ${i + 1}`,
        questionType: "MCQ" as QuestionType,
      },
      selectedOptionIds: isCorrect ? [i * 4 + 2] : [i * 4 + 1],
      isCorrect,
      score: isCorrect ? 0.33 : 0,
      questionNo: i + 1,
      navigationState: "ANSWERED" as QuestionNavigationState,
    };
  }),
  createdAt: "2023-10-15T09:00:00Z",
  updatedAt: "2023-10-15T09:45:00Z",
};

// ==================== COMPONENT ====================
const AttemptResultContent = () => {
  // ===== ROUTER =====
  const navigate = useNavigate();
  // const { attemptId } = useParams({ from: "/_layout/quiz-attempts/$attemptId/result" });

  // ===== QUERIES (Commented - Ready for production) =====
  // Fetch both attempt result and full exam questions
  // const { data: result, isLoading } = useQuizAttempt(Number(attemptId));
  // const { data: examData } = useExam(result?.exam.id);
  // const fullQuestions = examData?.examQuestions.map(eq => eq.question) || [];

  // ===== MOCK DATA (Keep for UI testing) =====
  const result = mockQuizResult;
  const fullQuestions = mockFullQuestions;

  // ===== DERIVED DATA =====
  const correctAnswers = result.answers.filter((a) => a.isCorrect).length;
  const wrongAnswers = result.answers.filter(
    (a) => !a.isCorrect && a.selectedOptionIds && a.selectedOptionIds.length > 0,
  ).length;
  const skippedAnswers = result.answers.filter((a) => !a.selectedOptionIds || a.selectedOptionIds.length === 0).length;

  // Calculate rank based on score
  const rank =
    (result.score ?? 0) >= 9
      ? "Xuất sắc"
      : (result.score ?? 0) >= 8
        ? "Giỏi"
        : (result.score ?? 0) >= 6.5
          ? "Khá"
          : (result.score ?? 0) >= 5
            ? "Trung bình"
            : "Yếu";

  // ===== HANDLERS =====
  const handleRetake = () => {
    // Navigate back to exam detail to start new attempt
    navigate({
      to: "/exams/$examId",
      params: { examId: String(result.exam.id) },
    });
  };

  const handleGoHome = () => {
    // Navigate to home or exam list
    navigate({ to: "/exams" });
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="mx-auto flex w-full max-w-240 flex-1 flex-col px-4 py-8 md:px-10">
        {/* Hero Score Section */}
        <div className="flex flex-col items-center justify-center text-center py-10 bg-white dark:bg-slate-900/50 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
          <div className="mb-2 text-primary font-semibold uppercase tracking-widest text-sm">Điểm số của bạn</div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-2">
            {result.score?.toFixed(1) || "0.0"}{" "}
            <span className="text-2xl text-slate-400 font-medium">/ {result.exam.totalScore.toFixed(1)}</span>
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold">
            <Award className="w-4 h-4" />
            Xếp hạng: {rank}
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
            {result.answers.map((answer, index) => (
              <button
                key={answer.id}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-xl font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer",
                  answer.isCorrect
                    ? "bg-green-500 dark:bg-green-600 text-white"
                    : "bg-red-500 dark:bg-red-600 text-white",
                )}
              >
                {index + 1}
              </button>
            ))}
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

              return (
                <Card key={answer.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        className={cn("text-white text-sm font-bold", answer.isCorrect ? "bg-green-600" : "bg-red-600")}
                      >
                        Câu {answer.questionNo}
                      </Badge>
                      <span
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          answer.isCorrect ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {answer.isCorrect ? (
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
            Làm lại bài thi
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

export default AttemptResultContent;

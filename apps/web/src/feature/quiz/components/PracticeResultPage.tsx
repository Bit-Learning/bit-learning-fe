import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Trophy,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  List,
  Home,
  Award,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
// import { useQuizSession } from "../hooks/useQuiz";
import type {
  QuizSessionResponse,
  QuizSessionAnswerResponse,
  QuizSessionStatus,
  QuizSessionType,
} from "../types/quiz.type";
import {
  ApprovalStatus,
  QuestionLevel,
  QuestionType,
  type QuestionResponse,
} from "@/feature/question/types/question.type";

const mockFullQuestions: QuestionResponse[] = [
  {
    id: 1,
    content: "Tìm x biết x + 15 = 40.",
    canonicalAnswer: "Ta có: x + 15 = 40, suy ra x = 40 - 15 = 25. Vậy x = 25.",
    questionType: "MCQ" as QuestionType,
    questionLevel: "EASY" as QuestionLevel,
    subject: { id: 2, name: "Toán", code: "MATH" },
    lesson: { id: 2, name: "Đại số", code: "ALG" },
    tags: [],
    options: [
      { id: 1, content: "x = 20", isCorrect: false, orderNo: 1 },
      { id: 2, content: "x = 25", isCorrect: true, orderNo: 2 },
      { id: 3, content: "x = 30", isCorrect: false, orderNo: 3 },
      { id: 4, content: "x = 35", isCorrect: false, orderNo: 4 },
    ],
    isActive: true,
    isPublic: true,
    approvalStatus: "APPROVED" as ApprovalStatus,
    createdAt: "2023-09-15T08:00:00Z",
    updatedAt: "2023-09-15T08:00:00Z",
  },
  {
    id: 2,
    content: "Diện tích hình tròn có bán kính r = 3cm là bao nhiêu?",
    canonicalAnswer:
      "Công thức tính diện tích hình tròn là S = π.r². Với r=3, S = 3.14 × 3 × 3 = 28.26 cm². Hãy chú ý không nhầm lẫn với chu vi C = 2.π.r",
    questionType: "MCQ" as QuestionType,
    questionLevel: "MEDIUM" as QuestionLevel,
    subject: { id: 2, name: "Toán", code: "MATH" },
    lesson: { id: 3, name: "Hình học", code: "GEO" },
    tags: [],
    options: [
      { id: 5, content: "18.84 cm²", isCorrect: false, orderNo: 1 },
      { id: 6, content: "28.26 cm²", isCorrect: true, orderNo: 2 },
      { id: 7, content: "38.48 cm²", isCorrect: false, orderNo: 3 },
      { id: 8, content: "56.52 cm²", isCorrect: false, orderNo: 4 },
    ],
    isActive: true,
    isPublic: true,
    approvalStatus: "APPROVED" as ApprovalStatus,
    createdAt: "2023-09-15T08:00:00Z",
    updatedAt: "2023-09-15T08:00:00Z",
  },
  {
    id: 3,
    content: "Xác suất gieo xúc xắc xuất hiện mặt 6 chấm là bao nhiêu?",
    canonicalAnswer:
      "Xúc xắc có 6 mặt, mỗi mặt có xác suất xuất hiện như nhau. Xác suất xuất hiện mặt 6 chấm là 1/6 ≈ 0.167 hay 16.7%.",
    questionType: "MCQ" as QuestionType,
    questionLevel: "EASY" as QuestionLevel,
    subject: { id: 2, name: "Toán", code: "MATH" },
    lesson: { id: 4, name: "Xác suất", code: "PROB" },
    tags: [],
    options: [
      { id: 9, content: "1/12", isCorrect: false, orderNo: 1 },
      { id: 10, content: "1/6", isCorrect: true, orderNo: 2 },
      { id: 11, content: "1/4", isCorrect: false, orderNo: 3 },
      { id: 12, content: "1/2", isCorrect: false, orderNo: 4 },
    ],
    isActive: true,
    isPublic: true,
    approvalStatus: "APPROVED" as ApprovalStatus,
    createdAt: "2023-09-15T08:00:00Z",
    updatedAt: "2023-09-15T08:00:00Z",
  },
];

const mockPracticeResult: QuizSessionResponse = {
  id: 1,
  user: {
    id: 1,
    username: "student01",
    email: "student01@example.com",
    fullName: "Nguyễn Văn B",
  },
  exam: {
    id: 1,
    name: "Luyện tập Đại số - Lớp 9",
    code: "MATH-ALG-9",
    durationInMinutes: 30,
    totalScore: 10,
    totalQuestions: 3,
    isPublished: true,
    createdAt: "2023-09-15T08:00:00Z",
  },
  status: "SUBMITTED" as QuizSessionStatus,
  type: "PRACTICE" as QuizSessionType,
  currentIndex: 3,
  autoSubmitted: false,
  startTime: "2023-10-15T10:00:00Z",
  endTime: "2023-10-15T10:12:45Z",
  timeRemaining: undefined,
  answers: [
    {
      id: 1,
      question: {
        id: 1,
        questionText: "Tìm x biết x + 15 = 40.",
        questionType: "MCQ",
      },
      selectedOptionIds: [2],
      isMarked: false,
      questionNo: 1,
    },
    {
      id: 2,
      question: {
        id: 2,
        questionText: "Diện tích hình tròn có bán kính r = 3cm là bao nhiêu?",
        questionType: "MCQ",
      },
      selectedOptionIds: [5],
      isMarked: false,
      questionNo: 2,
    },
    {
      id: 3,
      question: {
        id: 3,
        questionText: "Xác suất gieo xúc xắc xuất hiện mặt 6 chấm là bao nhiêu?",
        questionType: "MCQ",
      },
      selectedOptionIds: [10],
      isMarked: false,
      questionNo: 3,
    },
  ],
  createdAt: "2023-10-15T10:00:00Z",
  updatedAt: "2023-10-15T10:12:45Z",
};

const PracticeResultContent: React.FC = () => {
  const navigate = useNavigate();
  // const { sessionId } = useParams({ from: "/_layout/quiz-sessions/$sessionId/result" });

  // Fetch both session result and full exam questions
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

  const wrongAnswers = result.answers.length - correctAnswers;
  const accuracy = Math.round((correctAnswers / result.answers.length) * 100);
  const score = Math.round(accuracy * 0.85);

  const startTime = new Date(result.startTime).getTime();
  const endTime = new Date(result.endTime || result.startTime).getTime();
  const timeTakenMs = endTime - startTime;
  const timeTaken = `${Math.floor(timeTakenMs / 60000)}:${String(Math.floor((timeTakenMs % 60000) / 1000)).padStart(2, "0")}`;

  const recentScores = [40, 55, 45, 75, score];
  const progress = 15;

  const handleRetry = () => {
    // Navigate back to start new practice session
    navigate({
      to: "/exams/$examId",
      params: { examId: String(result.exam.id) },
    });
  };

  const handleBackToList = () => {
    navigate({ to: "/exams" });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="max-w-240 mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Tuyệt vời! Bạn đã hoàn thành!</h1>
          <p className="text-slate-500 dark:text-slate-400">Bạn đang tiến bộ rất nhanh qua từng bài tập.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Điểm số</p>
                <Award className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{score}/100</p>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>+5% so với TB</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Độ chính xác</p>
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold">{accuracy}%</p>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>+2% mục tiêu</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Thời gian</p>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold">{timeTaken}</p>
              <div className="flex items-center gap-1 text-rose-500 text-sm font-semibold">
                <Zap className="w-4 h-4" />
                <span>Nhanh hơn 30s</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tiến bộ 5 bài gần nhất</p>
                <p className="text-4xl font-bold text-primary mt-1">+{progress}%</p>
              </div>
              <div className="flex gap-2 text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                PHONG ĐỘ CAO
              </div>
            </div>
            <div className="grid grid-flow-col gap-4 h-50 items-end border-b border-slate-100 dark:border-slate-700 pb-2">
              {recentScores.map((scoreValue, index) => {
                const isCurrent = index === recentScores.length - 1;
                const height = scoreValue;
                const days = ["T2", "T3", "T4", "T5", "Nay"];

                return (
                  <div key={index} className="flex flex-col items-center gap-2 group w-full">
                    <div
                      className={cn(
                        "rounded-t-lg transition-all w-full",
                        isCurrent ? "bg-primary" : "bg-primary/20 hover:bg-primary/40",
                      )}
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className={cn("text-[10px] font-bold", isCurrent ? "text-primary" : "text-slate-400")}>
                      {days[index]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Phân tích chi tiết
          </h2>
          <div className="space-y-4">
            {result.answers.map((answer) => {
              const fullQuestion = fullQuestions.find((q) => q.id === answer.question.id);
              if (!fullQuestion) return null;

              const correctOption = fullQuestion.options?.find((opt) => opt.isCorrect);
              const userSelectedOption = fullQuestion.options?.find((opt) =>
                answer.selectedOptionIds?.includes(opt.id),
              );
              const isCorrect = userSelectedOption?.id === correctOption?.id;

              return (
                <Card
                  key={answer.id}
                  className={cn(
                    "shadow-sm",
                    isCorrect ? "border-l-4 border-emerald-500" : "border-l-4 border-rose-500",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={cn(
                              "text-xs font-bold uppercase tracking-wider",
                              isCorrect ? "text-emerald-600" : "text-rose-600",
                            )}
                          >
                            Câu {answer.questionNo.toString().padStart(2, "0")} - {isCorrect ? "Đúng" : "Sai"}
                          </span>
                          <span className="text-xs text-slate-400">
                            Chủ đề: {fullQuestion.lesson?.name || "Tổng hợp"}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-2">{fullQuestion.content}</p>
                        {!isCorrect && (
                          <>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                              Đáp án của bạn: <span className="line-through">{userSelectedOption?.content}</span> | Đáp
                              án đúng: <span className="font-bold text-emerald-600">{correctOption?.content}</span>
                            </p>
                            {fullQuestion.canonicalAnswer && (
                              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-xs leading-relaxed">
                                <span className="font-bold text-primary">Giải thích:</span>{" "}
                                {fullQuestion.canonicalAnswer}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-12">
          <Button className="h-14 flex items-center justify-center gap-2" onClick={handleRetry}>
            <RefreshCw className="w-5 h-5" />
            Làm lại bài
          </Button>
          <Button variant="outline" className="h-14 flex items-center justify-center gap-2" onClick={handleBackToList}>
            <List className="w-5 h-5" />
            Về danh sách
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PracticeResultContent;

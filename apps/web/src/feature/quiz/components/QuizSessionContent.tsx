import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, XCircle, ArrowRight, Flag, Lightbulb } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
// import { useDispatch, useSelector } from "react-redux";
// import { useQuizSession, useSaveSessionAnswer } from "../hooks/useQuiz";
import type { QuizSessionResponse, QuizSessionStatus, QuizSessionType } from "../types/quiz.type";
import type {
  ApprovalStatus,
  QuestionLevel,
  QuestionResponse,
  QuestionType,
} from "@/feature/question/types/question.type";

// ==================== MOCK DATA ====================
const mockPracticeSession: QuizSessionResponse = {
  id: 1,
  user: {
    id: 1,
    username: "student01",
    email: "student01@example.com",
    fullName: "Quốc Anh",
  },
  exam: {
    id: 1,
    name: "Luyện tập Tin học 12 - Hệ điều hành",
    code: "TIN12-GK1",
    durationInMinutes: 60,
    totalScore: 10,
    totalQuestions: 25,
    isPublished: true,
    createdAt: "2023-09-15T08:00:00Z",
  },
  status: "DOING" as QuizSessionStatus,
  type: "PRACTICE" as QuizSessionType,
  currentIndex: 11,
  autoSubmitted: false,
  startTime: new Date().toISOString(),
  endTime: undefined,
  timeRemaining: undefined,
  answers: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    question: {
      id: i + 1,
      questionText: `Câu hỏi số ${i + 1}`,
      questionType: "MCQ",
    },
    selectedOptionIds: [i * 4 + 2],
    isMarked: false,
    questionNo: i + 1,
  })),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock questions
const mockQuestions: QuestionResponse[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  content:
    i === 11
      ? "Trong các thành phần sau, thành phần nào KHÔNG phải là một phần của hệ điều hành?"
      : `Câu hỏi số ${i + 1} về Tin học 12?`,
  canonicalAnswer: undefined,
  questionType: "MCQ" as QuestionType,
  questionLevel: "MEDIUM" as QuestionLevel,
  subject: { id: 1, name: "Tin học", code: "TIN" },
  chapter: undefined,
  lesson: { id: 1, name: "Bài 1", code: "L1" },
  tags: [],
  options: [
    {
      id: i * 4 + 1,
      content: i === 11 ? "Quản lý bộ nhớ" : `Đáp án A`,
      isCorrect: false,
      orderNo: 1,
    },
    {
      id: i * 4 + 2,
      content: i === 11 ? "Trình duyệt web" : `Đáp án B`,
      isCorrect: true,
      orderNo: 2,
    },
    {
      id: i * 4 + 3,
      content: i === 11 ? "Quản lý file hệ thống" : `Đáp án C`,
      isCorrect: false,
      orderNo: 3,
    },
    {
      id: i * 4 + 4,
      content: i === 11 ? "Quản lý tiến trình" : `Đáp án D`,
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

// Add explanation to question 12
if (mockQuestions[11]) {
  mockQuestions[11].canonicalAnswer =
    "Trình duyệt web là một ứng dụng phần mềm chạy trên hệ điều hành, không phải là một thành phần của hệ điều hành. Các thành phần cốt lõi của hệ điều hành bao gồm: quản lý bộ nhớ, quản lý tiến trình, quản lý file hệ thống, và quản lý thiết bị ngoại vi.";
}

// ==================== COMPONENT ====================
const QuizSessionContent = () => {
  // ===== ROUTER =====
  const navigate = useNavigate();
  // const { sessionId } = useParams({ from: "/_layout/quiz-sessions/$sessionId" });

  // ===== REDUX (Commented - Ready for production) =====
  // const dispatch = useDispatch();
  // const session = useSelector(selectCurrentSession);
  // const { data, isLoading } = useQuizSession(Number(sessionId));

  // ===== LOCAL STATE (Mock for UI testing) =====
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(11);
  const [selectedAnswer, setSelectedAnswer] = useState<number>(50); // optionId for question 12
  const [showFeedback, setShowFeedback] = useState(true);
  const [answeredQuestions] = useState(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));

  const session = mockPracticeSession;
  const questions = mockQuestions;

  // ===== DERIVED DATA =====
  const currentQuestion = questions[currentQuestionIndex];
  const correctOption = currentQuestion?.options?.find((opt) => opt.isCorrect);
  const isCorrect = selectedAnswer === correctOption?.id;
  const progress = Math.round((answeredQuestions.size / questions.length) * 100);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // ===== HANDLERS =====
  const handleSelectAnswer = (optionId: number) => {
    setSelectedAnswer(optionId);
    setShowFeedback(true);

    // Production: Redux update + API call
    // dispatch(updateAnswerAction({ ... }));
    // saveMutation.mutate({ sessionId, data: { questionId, selectedOptionIds: [optionId] } });
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(0);
      setShowFeedback(false);
    } else {
      // Đã hết câu hỏi, chuyển sang trang summary/result
      // Production: Call submit API first, then navigate
      // submitMutation.mutate({ sessionId });
      navigate({
        to: "/quiz-sessions/$sessionId",
        params: { sessionId: "1" },
      });
    }

    // Production: Save current index to server
    // updateIndexMutation.mutate({ sessionId, data: { currentIndex: nextIndex } });
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex flex-col">
      {/* Progress Section */}
      <div className="flex flex-col gap-3 p-6 max-w-240 mx-auto w-full">
        <div className="flex gap-6 justify-between items-end">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tiến độ hiện tại</span>
            <p className="text-slate-900 dark:text-slate-100 text-base font-bold">
              Câu hỏi {currentQuestionIndex + 1}{" "}
              <span className="text-slate-400 font-normal">/ {questions.length}</span>
            </p>
          </div>
          <p className="text-primary text-sm font-bold">{progress}% hoàn thành</p>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <main className="flex-1 px-6 pb-20 max-w-240 mx-auto w-full">
        {/* Question Box */}
        <div className="py-6">
          <h3 className="text-slate-900 dark:text-slate-100 tracking-tight text-2xl font-bold leading-snug">
            {currentQuestion?.content}
          </h3>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4 py-2">
          {currentQuestion?.options?.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrectOption = option.id === correctOption?.id;
            const showCorrect = showFeedback && isCorrectOption;

            return (
              <label
                key={option.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all",
                  showCorrect && "border-primary bg-primary/5",
                  !showCorrect && isSelected && "border-primary bg-primary/5",
                  !showCorrect && !isSelected && "border-slate-200 dark:border-primary/20 hover:border-primary/50",
                )}
              >
                <input
                  type="radio"
                  name="quiz-option"
                  checked={isSelected}
                  onChange={() => handleSelectAnswer(option.id)}
                  className="h-5 w-5 border-2 border-slate-300 dark:border-primary/30 text-primary focus:ring-primary"
                />
                <div className="flex grow flex-col">
                  <p
                    className={cn(
                      "text-base font-medium",
                      showCorrect && "font-bold text-slate-900 dark:text-slate-100",
                      !showCorrect && "text-slate-700 dark:text-slate-200",
                    )}
                  >
                    {option.content}
                  </p>
                </div>
                {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </label>
            );
          })}
        </div>

        {/* Feedback Box */}
        {showFeedback && selectedAnswer > 0 && (
          <div className="mt-8">
            <div
              className={cn(
                "flex flex-col gap-4 rounded-2xl border-2 p-6 shadow-sm",
                isCorrect
                  ? "border-green-500/30 bg-green-50 dark:bg-green-900/10"
                  : "border-red-500/30 bg-red-50 dark:bg-red-900/10",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-full p-1 flex items-center justify-center text-white",
                    isCorrect ? "bg-green-500" : "bg-red-500",
                  )}
                >
                  {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <p
                  className={cn(
                    "text-lg font-bold",
                    isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400",
                  )}
                >
                  {isCorrect ? "Chính xác!" : "Sai rồi!"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-slate-800 dark:text-slate-200 text-base font-medium">Giải thích:</p>
                <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                  {currentQuestion?.canonicalAnswer || "Giải thích chi tiết cho câu hỏi này."}
                </p>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  className={cn(
                    "rounded-xl bg-primary px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20",
                    isLastQuestion && "bg-green-600 hover:bg-green-700 shadow-green-600/20",
                  )}
                  onClick={handleNextQuestion}
                >
                  <span>{isLastQuestion ? "Hoàn thành" : "Câu tiếp theo"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-slate-200 dark:border-primary/10 flex justify-between items-center bg-white dark:bg-slate-900">
        <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium px-4 py-2 hover:bg-slate-100 dark:hover:bg-primary/5 rounded-lg transition-colors">
          <Flag className="w-5 h-5" />
          <span>Báo lỗi câu hỏi</span>
        </button>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-primary font-bold px-4 py-2 hover:bg-primary/10 rounded-lg transition-colors">
            <Lightbulb className="w-5 h-5" />
            <span>Gợi ý</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default QuizSessionContent;

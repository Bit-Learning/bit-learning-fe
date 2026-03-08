import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Bell,
  Terminal,
  Info,
  Smile,
  BookOpen,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
// import { useDispatch, useSelector } from "react-redux";
// import { useQuizSession, useSaveSessionAnswer } from "../queries/useQuiz";
import type { QuizSessionResponse, QuizSessionStatus, QuizSessionType } from "../types/quiz.type";
import type {
  ApprovalStatus,
  QuestionLevel,
  QuestionResponse,
  QuestionType,
} from "@/feature/question/types/question.type";

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
    totalQuestions: 20,
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
  answers: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockQuestions: QuestionResponse[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  content:
    i === 11
      ? "Đâu là thiết bị đầu vào của máy tính trong các lựa chọn sau đây?"
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
      content: i === 11 ? "Chuột và Bàn phím" : `Đáp án A`,
      isCorrect: true,
      orderNo: 1,
    },
    {
      id: i * 4 + 2,
      content: i === 11 ? "Màn hình và Máy in" : `Đáp án B`,
      isCorrect: false,
      orderNo: 2,
    },
    {
      id: i * 4 + 3,
      content: i === 11 ? "Loa và Tai nghe" : `Đáp án C`,
      isCorrect: false,
      orderNo: 3,
    },
    {
      id: i * 4 + 4,
      content: i === 11 ? "Ổ cứng và RAM" : `Đáp án D`,
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

if (mockQuestions[11]) {
  mockQuestions[11].canonicalAnswer =
    "Thiết bị đầu vào (Input devices) là các thiết bị dùng để cung cấp dữ liệu và tín hiệu điều khiển cho một hệ thống xử lý thông tin như máy tính. Chuột và bàn phím là hai thiết bị đầu vào cơ bản nhất, cho phép người dùng tương tác và nhập dữ liệu vào máy tính. Trong khi đó, màn hình, máy in và loa là các thiết bị đầu ra (Output devices).";
}

const mockAnswerResults = [true, true, true, true, true, true, false, true, true, false, false, true];

const QuizSessionContent = () => {
  const navigate = useNavigate();
  // const { sessionId } = useParams({ from: "/_layout/quiz-sessions/$sessionId" });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(11);
  const [selectedAnswer, setSelectedAnswer] = useState<number>(45); // optionId for question 12
  const [showFeedback, setShowFeedback] = useState(true);
  const [answeredQuestions] = useState(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));

  const session = mockPracticeSession;
  const questions = mockQuestions;

  const currentQuestion = questions[currentQuestionIndex];
  const correctOption = currentQuestion?.options?.find((opt) => opt.isCorrect);
  const isCorrect = selectedAnswer === correctOption?.id;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const correctCount = mockAnswerResults.filter(Boolean).length;
  const accuracy = Math.round((correctCount / mockAnswerResults.length) * 100);

  const handleSelectAnswer = (optionId: number) => {
    setSelectedAnswer(optionId);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(0);
      setShowFeedback(false);
    } else {
      // navigate({
      //   to: "/quiz-sessions/$sessionId/result",
      //   params: { sessionId: "1" },
      // });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(0);
      setShowFeedback(false);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswer(0);
    setShowFeedback(false);
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex flex-col">
      <main className="max-w-360 mx-auto px-4 py-6 md:py-10 w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chế độ Luyện tập</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Quiz Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Question Card */}
            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl border border-primary/10 shadow-sm">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
                  CÂU HỎI {currentQuestionIndex + 1}
                </span>
                <h2 className="text-2xl font-bold leading-snug">{currentQuestion?.content}</h2>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {currentQuestion?.options?.map((option, index) => {
                  const isSelected = selectedAnswer === option.id;
                  const isCorrectOption = option.id === correctOption?.id;
                  const showAsCorrect = showFeedback && isCorrectOption;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      className={cn(
                        "w-full flex items-center p-4 rounded-xl border-2 text-left group transition-all",
                        showAsCorrect && "border-green-500 bg-green-50 dark:bg-green-900/10",
                        !showAsCorrect && isSelected && "border-primary bg-primary/5",
                        !showAsCorrect &&
                          !isSelected &&
                          "border-primary/10 bg-[#f8f6f6] dark:bg-slate-800/50 hover:border-primary/40",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4",
                          showAsCorrect && "bg-green-500 text-white",
                          !showAsCorrect && isSelected && "bg-primary text-white",
                          !showAsCorrect && !isSelected && "bg-primary/10 text-primary",
                        )}
                      >
                        {getOptionLabel(index)}
                      </div>
                      <span
                        className={cn(
                          "flex-1 font-medium",
                          showAsCorrect && "text-slate-900 dark:text-slate-100",
                          !showAsCorrect && !isSelected && "text-slate-600 dark:text-slate-300",
                        )}
                      >
                        {option.content}
                      </span>
                      {showAsCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Area */}
              {showFeedback && selectedAnswer > 0 && (
                <div className="mt-8 pt-8 border-t border-primary/10">
                  <div
                    className={cn(
                      "flex items-center gap-3 mb-4",
                      isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                    )}
                  >
                    <Smile className="w-8 h-8" />
                    <span className="text-xl font-bold">{isCorrect ? "Chính xác! 🎉" : "Sai rồi!"}</span>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-xl">
                    <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Giải thích chi tiết:
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {currentQuestion?.canonicalAnswer || "Giải thích chi tiết cho câu hỏi này."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/20 font-bold hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                Câu trước
              </button>
              <div className="flex gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-red-500/20 text-red-500 font-bold hover:bg-red-500/5 transition-all">
                  Kết thúc luyện tập
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  {isLastQuestion ? "Hoàn thành" : "Câu tiếp theo"}
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
                {questions.map((_, index) => {
                  const isAnswered = answeredQuestions.has(index);
                  const isCurrent = index === currentQuestionIndex;
                  const isCorrectAnswer = isAnswered && mockAnswerResults[index];
                  const isWrongAnswer = isAnswered && !mockAnswerResults[index];

                  return (
                    <button
                      key={index}
                      onClick={() => handleJumpToQuestion(index)}
                      className={cn(
                        "aspect-square flex items-center justify-center rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform",
                        isCorrectAnswer && "bg-green-500 text-white",
                        isWrongAnswer && "bg-red-500 text-white",
                        isCurrent && !isAnswered && "border-2 border-primary bg-primary/10 text-primary",
                        !isCurrent &&
                          !isAnswered &&
                          "bg-primary/5 border border-primary/20 text-slate-400 hover:bg-primary/10",
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="dark:text-slate-300">Đã trả lời đúng</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="dark:text-slate-300">Đã trả lời sai</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded border border-primary/30"></div>
                  <span className="dark:text-slate-300">Chưa trả lời</span>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="mt-8 pt-6 border-t border-primary/10">
                <div className="bg-primary/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Tỉ lệ chính xác</p>
                    <p className="text-2xl font-black text-primary">{accuracy}%</p>
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

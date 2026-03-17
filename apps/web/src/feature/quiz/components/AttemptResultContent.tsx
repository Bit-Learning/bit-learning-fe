import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, Trophy, FileText, ChevronDown, ChevronUp, Home, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
import { useQuizAttempt } from "../queries/useQuiz";
import { useExam } from "@/feature/exam/queries/useExam";

const QuizAttemptResultContent: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams({ from: "/_layout/quiz-attempts/$attemptId/result" });

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const { data: attemptData, isLoading: attemptLoading } = useQuizAttempt(Number(attemptId));
  const { data: examData, isLoading: examLoading } = useExam(attemptData?.exam?.id || 0, {
    enabled: !!attemptData?.exam?.id,
  });

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);
  const isEssay = (type: string) => type?.toUpperCase() === "ESSAY";
  const isMCQ = (type: string) => type?.toUpperCase() === "MCQ";

  if (attemptLoading || examLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!attemptData || !examData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md shadow-xl">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Không tìm thấy kết quả</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Kết quả bài thi không tồn tại.</p>
            <Button onClick={() => navigate({ to: "/exams" })}>Quay lại danh sách</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const examQuestionsMap = new Map((examData.examQuestions || []).map((eq) => [eq.question.id, eq.question]));

  const hasAnswered = (answer: (typeof attemptData.answers)[number]): boolean => {
    if (isEssay(answer.question.questionType)) return !!answer.answerText?.trim();
    return (answer.selectedOptionIds?.length ?? 0) > 0;
  };

  const totalQuestions = attemptData.answers.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  for (const answer of attemptData.answers) {
    if (!hasAnswered(answer)) {
      unansweredCount++;
    } else if (answer.correct) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  }

  const score = attemptData.score ?? 0;
  const totalScore = examData.totalScore;
  const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
  const isPassed = percentage >= 50;

  const sortedAnswers = [...attemptData.answers].sort((a, b) => (a.questionNo ?? 9999) - (b.questionNo ?? 9999));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <Card
          className={cn(
            "mb-6 border-2 shadow-2xl",
            isPassed
              ? "border-emerald-400 dark:border-emerald-800  dark:bg-emerald-900/20"
              : "border-red-600 dark:border-amber-800  dark:bg-amber-900/20",
          )}
        >
          <CardContent className="px-8">
            <div className="text-center mb-6">
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg",
                  isPassed ? "bg-emerald-500" : "bg-red-600",
                )}
              >
                {isPassed ? <Trophy className="w-6 h-7 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
              </div>
              <h1 className="text-2xl font-black mb-2 text-slate-900 dark:text-slate-100">
                {isPassed ? "🎉 Chúc mừng! Bạn đã đạt" : "Chưa đạt yêu cầu"}
              </h1>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div
                  className={cn(
                    "text-4xl font-black mb-2",
                    isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {score.toFixed(1)} / {totalScore} điểm
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border-2 border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalQuestions}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Tổng số câu</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border-2 border-emerald-200 dark:border-emerald-800">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400">Trả lời đúng</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border-2 border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{incorrectCount}</div>
                <div className="text-xs text-red-700 dark:text-red-400">Trả lời sai</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center border-2 border-amber-200 dark:border-amber-800">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{unansweredCount}</div>
                <div className="text-xs text-amber-700 dark:text-amber-400">Chưa trả lời</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                size="lg"
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick={() => navigate({ to: "/exams" })}
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => navigate({ to: "/exams/$examId", params: { examId: String(attemptData.exam.id) } })}
              >
                <RotateCcw className="w-5 h-5" />
                Làm lại
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Chi tiết câu trả lời</h2>

            <div className="space-y-3">
              {sortedAnswers.map((answer, index) => {
                const fullQuestion = examQuestionsMap.get(answer.question.id);
                const isExpanded = expandedQuestions.has(answer.question.id);
                const answered = hasAnswered(answer);
                const isCorrect = answered && answer.correct;

                return (
                  <div
                    key={answer.question.id}
                    className={cn(
                      "border-2 rounded-xl transition-all",
                      !answered && "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10",
                      answered &&
                        isCorrect &&
                        "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10",
                      answered && !isCorrect && "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10",
                    )}
                  >
                    <button
                      onClick={() => toggleQuestion(answer.question.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-t-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                            !answered && "bg-amber-500 text-white",
                            answered && isCorrect && "bg-emerald-500 text-white",
                            answered && !isCorrect && "bg-red-500 text-white",
                          )}
                        >
                          {answer.questionNo ?? index + 1}
                        </div>

                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-left truncate">
                          {answer.question.content}
                        </span>

                        <div className="shrink-0">
                          {!answered && (
                            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                              Chưa trả lời
                            </Badge>
                          )}
                          {answered && isCorrect && (
                            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700">
                              Đúng (+{answer.score} điểm)
                            </Badge>
                          )}
                          {answered && !isCorrect && (
                            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700">
                              Sai (0 điểm)
                            </Badge>
                          )}
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {isMCQ(answer.question.questionType) && fullQuestion?.options && (
                          <div className="space-y-2">
                            {fullQuestion.options.map((option, optIndex) => {
                              const isSelected = answer.selectedOptionIds?.includes(option.id);
                              const isCorrectOption = option.isCorrect;

                              return (
                                <div
                                  key={option.id}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2",
                                    isCorrectOption &&
                                      "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20",
                                    !isCorrectOption &&
                                      isSelected &&
                                      "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20",
                                    !isCorrectOption &&
                                      !isSelected &&
                                      "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                                      isCorrectOption && "bg-emerald-500 text-white",
                                      !isCorrectOption && isSelected && "bg-red-500 text-white",
                                      !isCorrectOption &&
                                        !isSelected &&
                                        "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
                                    )}
                                  >
                                    {getOptionLabel(optIndex)}
                                  </div>
                                  <span
                                    className={cn(
                                      "flex-1",
                                      isCorrectOption && "font-semibold text-emerald-900 dark:text-emerald-300",
                                      !isCorrectOption && isSelected && "text-red-900 dark:text-red-300",
                                      !isCorrectOption && !isSelected && "text-slate-600 dark:text-slate-400",
                                    )}
                                  >
                                    {option.content}
                                  </span>
                                  {isCorrectOption && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  )}
                                  {!isCorrectOption && isSelected && (
                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {isEssay(answer.question.questionType) && (
                          <div className="space-y-3">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Câu trả lời của bạn:
                              </p>
                              {answer.answerText?.trim() ? (
                                <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                                  {answer.answerText}
                                </p>
                              ) : (
                                <p className="text-slate-400 italic">Chưa trả lời</p>
                              )}
                            </div>
                            {fullQuestion?.canonicalAnswer && (
                              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                                  Đáp án tham khảo:
                                </p>
                                <p className="text-emerald-900 dark:text-emerald-100 whitespace-pre-wrap">
                                  {fullQuestion.canonicalAnswer}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QuizAttemptResultContent;

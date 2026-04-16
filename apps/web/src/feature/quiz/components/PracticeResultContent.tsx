import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Award, BookOpen, RefreshCw, Home, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
import { useQuizSession } from "../queries/useQuiz";
import { useExam } from "@/feature/exam/queries/useExam";

const PracticeResultContent: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams({
    from: "/_layout/quiz-sessions/$sessionId/result",
  });

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const { data: result, isLoading: sessionLoading } = useQuizSession(Number(sessionId));
  const { data: examData, isLoading: examLoading } = useExam(result?.exam?.id || 0, {
    enabled: !!result?.exam?.id,
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

  if (sessionLoading || examLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Không tìm thấy kết quả.</p>
      </div>
    );
  }

  const fullQuestionsMap = new Map((examData?.examQuestions || []).map((eq) => [eq.question.id, eq.question]));

  const hasAnswered = (answer: (typeof result.answers)[number]): boolean => {
    if (isEssay(answer.question.questionType)) return !!answer.answerText?.trim();
    return (answer.selectedOptionIds?.length ?? 0) > 0;
  };

  const sortedAnswers = [...result.answers].sort((a, b) => (a.questionNo ?? 9999) - (b.questionNo ?? 9999));

  const totalQuestions = result.answers.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  for (const answer of result.answers) {
    if (!hasAnswered(answer)) {
      unansweredCount++;
    } else if (answer.isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  }

  const mcqTotal = result.answers.filter((a) => !isEssay(a.question.questionType)).length;
  const accuracy = mcqTotal > 0 ? Math.round((correctCount / mcqTotal) * 100) : 0;
  const score = ((correctCount / (result.exam.totalQuestions || 1)) * 10).toFixed(1);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <Card className="mb-6 border-2 border-slate-200 dark:border-slate-700 rounded-md shadow-sm py-0">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-widest text-sm mb-2">
                Kết quả luyện tập
              </div>
              <div className="text-7xl md:text-8xl font-black text-slate-900 dark:text-white mb-3">
                {score} <span className="text-3xl text-slate-400 font-medium">/ 10</span>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                <Award className="w-5 h-5" />
                {accuracy}% chính xác — {rank}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="border rounded-md p-4 text-center">
                <div className="font-black text-3xl text-emerald-600">{correctCount}</div>
                <div className="text-xs text-slate-500 mt-1">Đúng</div>
              </div>
              <div className="border rounded-md p-4 text-center">
                <div className="font-black text-3xl text-red-600">{incorrectCount}</div>
                <div className="text-xs text-slate-500 mt-1">Sai</div>
              </div>
              <div className="border rounded-md p-4 text-center">
                <div className="font-black text-3xl text-amber-500">{unansweredCount}</div>
                <div className="text-xs text-slate-500 mt-1">Bỏ qua</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 text-md p-5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick={() =>
                  navigate({
                    to: "/exams/$examId",
                    params: { examId: String(result.exam.id) },
                  })
                }
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Luyện tập lại
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-md p-5 border-2 border-slate-200 dark:border-slate-700"
                onClick={() => navigate({ to: "/exams" })}
              >
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-md border border-slate-200 dark:border-slate-700 py-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Chi tiết câu trả lời
            </h2>

            <div className="space-y-3">
              {sortedAnswers.map((answer, index) => {
                const fullQuestion = fullQuestionsMap.get(answer.question.id);
                const isExpanded = expandedQuestions.has(answer.question.id);
                const answered = hasAnswered(answer);
                const essay = isEssay(answer.question.questionType);
                const isCorrect = answered && answer.isCorrect;

                return (
                  <div
                    key={answer.question.id}
                    className={cn(
                      "border-2 rounded-xl transition-all",
                      !answered && "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10",
                      answered && essay && "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10",
                      answered &&
                        !essay &&
                        isCorrect &&
                        "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10",
                      answered &&
                        !essay &&
                        !isCorrect &&
                        "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10",
                    )}
                  >
                    <button
                      onClick={() => toggleQuestion(answer.question.id)}
                      className="cursor-pointer w-full p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-t-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
                            !answered && "bg-amber-500 text-white",
                            answered && essay && "bg-blue-500 text-white",
                            answered && !essay && isCorrect && "bg-emerald-500 text-white",
                            answered && !essay && !isCorrect && "bg-red-500 text-white",
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
                              Bỏ qua
                            </Badge>
                          )}
                          {answered && essay && (
                            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                              Tự luận
                            </Badge>
                          )}
                          {answered && !essay && isCorrect && (
                            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700">
                              Đúng
                            </Badge>
                          )}
                          {answered && !essay && !isCorrect && (
                            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700">
                              Sai
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
                      <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700 mt-0 ">
                        {isMCQ(answer.question.questionType) && fullQuestion?.options && (
                          <div className="space-y-2 mb-4">
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
                                      "flex-1 text-sm",
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

                        {essay && (
                          <div className="space-y-3 mb-4">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                Câu trả lời của bạn:
                              </p>
                              {answer.answerText?.trim() ? (
                                <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap text-sm">
                                  {answer.answerText}
                                </p>
                              ) : (
                                <p className="text-slate-400 italic text-sm">Chưa trả lời</p>
                              )}
                            </div>
                          </div>
                        )}

                        {fullQuestion?.canonicalAnswer && (
                          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600">
                            <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase mb-2 flex items-center gap-1.5">
                              <Info className="w-4 h-4" />
                              Lời giải chi tiết
                            </p>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                              {fullQuestion.canonicalAnswer}
                            </p>
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

export default PracticeResultContent;

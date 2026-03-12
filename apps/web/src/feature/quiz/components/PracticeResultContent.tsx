import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Award, CheckCircle2, XCircle, EyeOff, LayoutGrid, BookOpen, RefreshCw, Home, Info } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
import { useQuizSession } from "../queries/useQuiz";
import { useExam } from "@/feature/exam/queries/useExam";

const PracticeResultContent: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams({ from: "/_layout/quiz-sessions/$sessionId/result" });

  const { data: result, isLoading: sessionLoading } = useQuizSession(Number(sessionId));
  const { data: examData, isLoading: examLoading } = useExam(result?.exam?.id || 0, {
    enabled: !!result?.exam?.id,
  });

  const fullQuestionsMap = new Map((examData?.examQuestions || []).map((eq) => [eq.question.id, eq.question]));

  const getIsCorrect = (questionId: number, selectedIds?: number[]): boolean => {
    const question = fullQuestionsMap.get(questionId);
    if (!question?.options?.length || !selectedIds?.length) return false;
    const correctIds = new Set(question.options.filter((o) => o.isCorrect).map((o) => o.id));
    const selectedSet = new Set(selectedIds);
    return [...correctIds].every((id) => selectedSet.has(id)) && [...selectedSet].every((id) => correctIds.has(id));
  };

  const isEssay = (type: string) => type?.toUpperCase() === "ESSAY";

  if (sessionLoading || examLoading) {
    return (
      <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex items-center justify-center">
        <p className="text-slate-500">Không tìm thấy kết quả.</p>
      </div>
    );
  }

  const correctAnswers = result.answers.filter((a) => {
    if (isEssay(a.question.questionType)) return false;
    return getIsCorrect(a.question.id, a.selectedOptionIds);
  }).length;

  const wrongAnswers = result.answers.filter((a) => {
    if (isEssay(a.question.questionType)) return false;
    const hasAnswer = (a.selectedOptionIds?.length ?? 0) > 0;
    return hasAnswer && !getIsCorrect(a.question.id, a.selectedOptionIds);
  }).length;

  const skippedAnswers = result.answers.filter((a) => {
    if (isEssay(a.question.questionType)) return !!a.answerText?.trim() === false;
    return (a.selectedOptionIds?.length ?? 0) === 0;
  }).length;

  const mcqTotal = result.answers.filter((a) => !isEssay(a.question.questionType)).length;
  const accuracy = mcqTotal > 0 ? Math.round((correctAnswers / mcqTotal) * 100) : 0;
  const score = ((correctAnswers / (result.exam.totalQuestions || 1)) * result.exam.totalScore).toFixed(1);

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

  const sortedAnswers = [...result.answers].sort((a, b) => (a.questionNo ?? 9999) - (b.questionNo ?? 9999));

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] flex flex-col">
      <main className="max-w-300 mx-auto px-4 py-6 md:py-10 w-full flex-1">
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

        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Bảng rà soát đáp án
          </h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {sortedAnswers.map((answer, index) => {
              const essay = isEssay(answer.question.questionType);
              const hasAnswer = essay ? !!answer.answerText?.trim() : (answer.selectedOptionIds?.length ?? 0) > 0;
              const correct = !essay && getIsCorrect(answer.question.id, answer.selectedOptionIds);

              return (
                <div
                  key={answer.id}
                  className={cn(
                    "flex aspect-square p-2 items-center justify-center rounded-xl font-bold shadow-sm",
                    essay && hasAnswer && "bg-blue-400 text-white", // essay có trả lời
                    essay && !hasAnswer && "bg-slate-300 dark:bg-slate-700 text-slate-500",
                    !essay && correct && "bg-green-500 text-white",
                    !essay && !correct && hasAnswer && "bg-red-500 text-white",
                    !essay && !hasAnswer && "bg-slate-300 dark:bg-slate-700 text-slate-500",
                  )}
                >
                  {answer.questionNo ?? index + 1}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-slate-600 dark:text-slate-300">Đúng</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-slate-600 dark:text-slate-300">Sai</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-blue-400" />
              <span className="text-slate-600 dark:text-slate-300">Tự luận (có trả lời)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700" />
              <span className="text-slate-600 dark:text-slate-300">Bỏ qua</span>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Chi tiết giải thích
          </h2>
          <div className="space-y-6">
            {sortedAnswers.map((answer) => {
              const fullQuestion = fullQuestionsMap.get(answer.question.id);
              const questionContent = fullQuestion?.content ?? answer.question.content;
              const options = fullQuestion?.options;

              const essay = isEssay(answer.question.questionType);
              const correctOption = options?.find((o) => o.isCorrect);
              const userOption = options?.find((o) => answer.selectedOptionIds?.includes(o.id));
              const correct = !essay && getIsCorrect(answer.question.id, answer.selectedOptionIds);
              const hasAnswer = essay ? !!answer.answerText?.trim() : (answer.selectedOptionIds?.length ?? 0) > 0;

              return (
                <Card key={answer.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        className={cn(
                          "text-white text-sm font-bold",
                          essay ? "bg-blue-500" : correct ? "bg-green-600" : hasAnswer ? "bg-red-600" : "bg-slate-400",
                        )}
                      >
                        Câu {answer.questionNo}
                      </Badge>
                      <span
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          essay
                            ? "text-blue-500"
                            : correct
                              ? "text-green-600"
                              : hasAnswer
                                ? "text-red-600"
                                : "text-slate-400",
                        )}
                      >
                        {essay ? (
                          "Tự luận"
                        ) : correct ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Chính xác
                          </>
                        ) : hasAnswer ? (
                          <>
                            <XCircle className="w-4 h-4" /> Sai rồi
                          </>
                        ) : (
                          "Bỏ qua"
                        )}
                      </span>
                    </div>

                    <p className="text-lg font-semibold mb-4 leading-relaxed">{questionContent}</p>

                    {!essay && options && (
                      <div className="space-y-2 mb-6">
                        {options.map((option) => {
                          const isUserAnswer = userOption?.id === option.id;
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
                    )}

                    {essay && (
                      <div className="mb-6 space-y-3">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
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
                      <div className="p-4 rounded-xl bg-primary/5 border-l-4 border-primary">
                        <p className="text-primary font-bold text-sm uppercase mb-2 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          Lời giải chi tiết
                        </p>
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

        <div className="flex flex-col sm:flex-row gap-4 pb-10">
          <Button
            className="flex-1 flex items-center justify-center gap-2 h-14 shadow-lg shadow-primary/25"
            onClick={() => navigate({ to: "/exams/$examId", params: { examId: String(result.exam.id) } })}
          >
            <RefreshCw className="w-5 h-5" />
            Luyện tập lại
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 h-14"
            onClick={() => navigate({ to: "/exams" })}
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

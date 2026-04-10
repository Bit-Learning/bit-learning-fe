import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Clock,
  Award,
  Check,
  Share2,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Loader2,
  Search,
  Eye,
  Lock,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useExam, useDownloadExam, usePublishExam, useDownloadExamAnswerKey } from "../queries/useExam";
import type { ExamType } from "../types/exam.type";
import { QuestionLevel, QuestionType } from "@/feature/question/types/question.type";
import { useQuizAttemptsByExam } from "@/feature/quiz/queries/useQuiz";
import { QuizAttemptStatus } from "@/feature/quiz/types/quiz.type";
import { Pagination } from "@/shared/components/Pagination";

const QUESTIONS_PER_PAGE = 10;
const ATTEMPTS_PER_PAGE = 10;

const ExamDetailContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const examId = (params as any).id ? Number((params as any).id) : undefined;

  const [activeTab, setActiveTab] = useState<"questions" | "stats">("questions");
  const [questionPage, setQuestionPage] = useState(0);
  const [attemptsPage, setAttemptsPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: exam, isLoading } = useExam(examId!, { enabled: !!examId });
  const downloadExam = useDownloadExam();
  const downloadExamAnswerKey = useDownloadExamAnswerKey();

  const { mutate: publishExam, isPending: isPublishing } = usePublishExam();

  const { data: attempts, isLoading: isLoadingAttempts } = useQuizAttemptsByExam(
    examId!,
    activeTab === "stats" ? { page: attemptsPage, size: ATTEMPTS_PER_PAGE } : undefined,
  );

  const getLevelLabel = (level: QuestionLevel) => {
    const labels = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };
    return labels[level];
  };

  const getLevelColor = (level: QuestionLevel) => {
    const colors = {
      EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      MEDIUM: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[level];
  };

  const handleDownload = (format: "pdf" | "docx") => {
    if (!exam) return;
    downloadExam.mutate({ id: exam.id, format, name: exam.name });
  };

  const handleDownloadWithAnswer = (format: "pdf" | "docx") => {
    if (!exam) return;
    downloadExamAnswerKey.mutate({ id: exam.id, format, name: exam.name });
  };

  const handleTogglePublish = () => {
    if (!exam) return;
    publishExam({ id: exam.id, isPublished: !exam.isPublished });
  };

  const totalQuestions = exam?.examQuestions.length ?? 0;
  const totalQuestionPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const paginatedQuestions =
    exam?.examQuestions.slice(questionPage * QUESTIONS_PER_PAGE, (questionPage + 1) * QUESTIONS_PER_PAGE) ?? [];

  const allAttempts = attempts?.data ?? [];
  const submittedAttempts = allAttempts.filter((a) => a.status === QuizAttemptStatus.SUBMITTED);
  const scores = submittedAttempts.map((a) => a.score ?? 0);
  const avgScore = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const passRate = scores.length ? Math.round((scores.filter((s) => s >= 5).length / scores.length) * 100) : 0;

  const buckets = [
    { label: "0-2", min: 0, max: 2 },
    { label: "2-4", min: 2, max: 4 },
    { label: "4-6", min: 4, max: 6 },
    { label: "6-8", min: 6, max: 8 },
    { label: "8-10", min: 8, max: 10.1 },
  ];
  const bucketCounts = buckets.map((b) => scores.filter((s) => s >= b.min && s < b.max).length);
  const maxBucketCount = Math.max(...bucketCounts, 1);

  const durations = submittedAttempts
    .filter((a) => a.submittedAt && a.startTime)
    .map((a) => (new Date(a.submittedAt!).getTime() - new Date(a.startTime).getTime()) / 60000);
  const avgDuration = durations.length ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length) : 0;

  const filteredAttempts = allAttempts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.user.firstName?.toLowerCase().includes(q) || a.user.lastName.toLowerCase().includes(q);
  });
  const totalAttemptPages = Math.ceil(filteredAttempts.length / ATTEMPTS_PER_PAGE);
  const paginatedAttempts = filteredAttempts.slice(
    attemptsPage * ATTEMPTS_PER_PAGE,
    (attemptsPage + 1) * ATTEMPTS_PER_PAGE,
  );

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} - ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear().toString().slice(2)}`;
  };

  const calcDuration = (start: string, end?: string) => {
    if (!end) return "—";
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    return `${mins} phút`;
  };

  if (isLoading) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="flex gap-6">
            <Skeleton className="h-96 w-80" />
            <Skeleton className="h-96 flex-1" />
          </div>
        </div>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-lg text-muted-foreground">Không tìm thấy đề thi</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950">
      <div className="mb-6 bg-white">
        <div className="flex items-center justify-between border-b px-6 border-slate-400">
          <div className="flex items-center gap-4 py-4">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              onClick={() => navigate({ to: "/mentor/exam/my" })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{exam.name}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {exam.isPublished ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  Đã xuất bản
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <AlertCircle className="h-3 w-3" />
                  Chưa xuất bản
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 bg-slate-50">
        <div className="flex gap-4">
          <div className="w-75 space-y-4 shrink-0">
            {exam.isPublished ? (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-400 dark:border-green-900/30 rounded-md p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  Đề thi đã được xuất bản thành công. Học sinh hiện có thể vào thi.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-400 dark:border-amber-900/30 rounded-md p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Đề thi chưa được công bố. Nhấn "Xuất bản" để học sinh có thể làm bài.
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 space-y-2">
              <button
                onClick={() => handleDownload("pdf")}
                disabled={downloadExam.isPending}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                {downloadExam.isPending ? (
                  <Loader2 className="h-5 w-5 text-slate-600 dark:text-slate-400 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                )}
                <span className="font-medium text-slate-900 dark:text-white">Tải đề (.PDF)</span>
              </button>

              <button
                onClick={() => handleDownload("docx")}
                disabled={downloadExam.isPending}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                {downloadExam.isPending ? (
                  <Loader2 className="h-5 w-5 text-slate-600 dark:text-slate-400 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                )}
                <span className="font-medium text-slate-900 dark:text-white">Tải đề (.Docx)</span>
              </button>

              <button
                onClick={() => handleDownloadWithAnswer("pdf")}
                disabled={downloadExamAnswerKey.isPending}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-600 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                {downloadExamAnswerKey.isPending ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
                <span className="font-medium text-blue-600 dark:text-white">Tải đề + đáp án (.PDF)</span>
              </button>

              <button
                onClick={() => handleDownloadWithAnswer("docx")}
                disabled={downloadExamAnswerKey.isPending}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-600 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                {downloadExamAnswerKey.isPending ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
                <span className="font-medium text-blue-600 dark:text-white">Tải đề + đáp án (.Docx)</span>
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4">
              <button
                onClick={handleTogglePublish}
                disabled={isPublishing}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-medium ${
                  exam.isPublished
                    ? "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPublishing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : exam.isPublished ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span>{exam.isPublished ? "Ngưng xuất bản" : "Xuất bản đề thi"}</span>
              </button>
            </div>

            {exam.isPublished && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-400 dark:border-amber-900/30 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <Lock className="text-amber-600 dark:text-amber-400 text-lg" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Đang khóa (không thể chỉnh sửa khi đã xuất bản)
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">THÔNG SỐ ĐỀ THI</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Tổng số câu hỏi
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{exam.examQuestions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Tổng điểm
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{exam.totalScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Thời gian
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {exam.durationInMinutes} phút
                  </span>
                </div>
                {exam.type && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Loại đề</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        exam.type === "EXAM"
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                      }`}
                    >
                      {exam.type === "EXAM" ? "Chính thức" : "Luyện tập"}
                    </span>
                  </div>
                )}
                {exam.enrollKey && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Mật khẩu
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {exam.enrollKey}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
              <div className="border-b border-slate-200 dark:border-slate-800 flex">
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`cursor-pointer px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "questions"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Câu hỏi
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`cursor-pointer px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "stats"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Thống kê chi tiết
                </button>
              </div>

              {activeTab === "questions" && (
                <div className="overflow-y-hidden">
                  <div className="p-6 space-y-6">
                    {paginatedQuestions.map((examQuestion, index) => {
                      const globalIndex = questionPage * QUESTIONS_PER_PAGE + index;
                      return (
                        <div
                          key={examQuestion.id}
                          className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                                {String(globalIndex + 1).padStart(2, "0")}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getLevelColor(examQuestion.question.questionLevel)}`}
                                  >
                                    {getLevelLabel(examQuestion.question.questionLevel)}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {examQuestion.score} điểm
                                  </span>
                                </div>
                                <p className="text-slate-900 dark:text-white font-medium">
                                  {examQuestion.question.content}
                                </p>
                              </div>
                            </div>
                          </div>

                          {examQuestion.question.questionType === QuestionType.MCQ &&
                            examQuestion.question.options &&
                            examQuestion.question.options.length > 0 && (
                              <div className="ml-14 space-y-2">
                                {examQuestion.question.options.map((option) => (
                                  <div
                                    key={option.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg ${
                                      option.isCorrect
                                        ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                    }`}
                                  >
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        option.isCorrect
                                          ? "bg-blue-600 text-white"
                                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                      }`}
                                    >
                                      {option.label}
                                    </div>
                                    <span
                                      className={
                                        option.isCorrect
                                          ? "font-medium text-slate-900 dark:text-white"
                                          : "text-slate-700 dark:text-slate-300"
                                      }
                                    >
                                      {option.content}
                                    </span>
                                    {option.isCorrect && (
                                      <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 ml-auto" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                          {examQuestion.question.canonicalAnswer && (
                            <div className="ml-14 mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                              <p className="text-sm">
                                <span className="font-semibold text-blue-700 dark:text-blue-300">Đáp án: </span>
                                <span className="text-slate-900 dark:text-white">
                                  {examQuestion.question.canonicalAnswer}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {totalQuestionPages > 1 && (
                    <div className="border-t border-slate-100 dark:border-slate-800">
                      <Pagination
                        currentPage={questionPage}
                        totalPages={totalQuestionPages}
                        onPageChange={setQuestionPage}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "stats" && (
                <div className="overflow-y-auto p-6 space-y-6">
                  {isLoadingAttempts ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex items-center gap-10">
                          <div className="flex flex-col items-center">
                            <div className="relative w-36 h-36 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  className="text-slate-200 dark:text-slate-700"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  strokeDasharray={`${2 * Math.PI * 40}`}
                                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - avgScore / 10)}`}
                                  strokeLinecap="round"
                                  className="text-blue-600"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white leading-none">
                                  {avgScore.toFixed(1)}
                                </span>
                                <span className="text-[11px] text-slate-500 uppercase font-bold mt-1">Điểm TB</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-5">
                            <div className="space-y-1">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                Tỷ lệ đạt (&gt;= 5.0)
                              </p>
                              <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-green-600">{passRate}%</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                  Điểm cao nhất
                                </p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                  {scores.length ? maxScore.toFixed(1) : "—"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                  Thời gian TB
                                </p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                  {avgDuration ? `${avgDuration} phút` : "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                              Phân bổ điểm số
                            </h3>
                          </div>
                          <div className="h-48 flex items-end justify-between gap-6 px-4">
                            {buckets.map((bucket, idx) => {
                              const BAR_MAX_PX = 160;
                              const count = bucketCounts[idx]!;
                              const barHeightPx =
                                count === 0 ? 4 : Math.max(4, Math.round((count / maxBucketCount) * BAR_MAX_PX));
                              return (
                                <div key={bucket.label} className="flex-1 flex flex-col items-center gap-3">
                                  <div className="relative flex-1 w-full flex items-end">
                                    <div
                                      className={`w-full bg-blue-600 rounded-t-md relative group transition-all hover:opacity-80`}
                                      style={{ height: `${barHeightPx}px` }}
                                    >
                                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {count} sv
                                      </div>
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[11px] font-bold ${
                                      idx === 4
                                        ? "text-slate-900 dark:text-white"
                                        : "text-slate-500 dark:text-slate-400"
                                    }`}
                                  >
                                    {bucket.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              Danh sách học sinh tham gia
                            </h3>
                            <p className="text-sm text-slate-500">Tổng số {filteredAttempts.length} lượt thi</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 w-64 outline-none"
                                placeholder="Tìm kiếm học sinh..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                  setSearchQuery(e.target.value);
                                  setAttemptsPage(0);
                                }}
                              />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                              <FileText className="h-4 w-4" />
                              Xuất báo cáo (Excel)
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                              <tr>
                                <th className="px-8 py-4">Học sinh</th>
                                <th className="px-6 py-4">Thời gian bắt đầu</th>
                                <th className="px-6 py-4">Thời gian nộp</th>
                                <th className="px-6 py-4 text-center">Thời gian làm</th>
                                <th className="px-6 py-4 text-center">Điểm số</th>
                                <th className="px-6 py-4">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {paginatedAttempts.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="px-8 py-12 text-center text-slate-400 text-sm">
                                    Chưa có học sinh tham gia
                                  </td>
                                </tr>
                              ) : (
                                paginatedAttempts.map((attempt, idx) => {
                                  const isDone = attempt.status === QuizAttemptStatus.SUBMITTED;
                                  const score = attempt.score ?? null;
                                  const duration = calcDuration(attempt.startTime, attempt.submittedAt);
                                  const displayName = attempt.user.firstName + " " + attempt.user.lastName;

                                  return (
                                    <tr
                                      key={idx}
                                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                      <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                          <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                              {displayName}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-slate-500">{formatDateTime(attempt.startTime)}</td>
                                      <td
                                        className={`px-6 py-4 ${!attempt.submittedAt ? "text-slate-400" : "text-slate-500"}`}
                                      >
                                        {attempt.submittedAt ? formatDateTime(attempt.submittedAt) : "—"}
                                      </td>
                                      <td
                                        className={`px-6 py-4 text-center font-medium ${
                                          duration === "—" ? "text-slate-400" : "text-slate-500"
                                        }`}
                                      >
                                        {duration}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        {score !== null ? (
                                          <span
                                            className={`px-2.5 py-1 rounded-md font-bold ${
                                              score >= 8
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                                : score >= 5
                                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                  : score >= 4
                                                    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                                                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                            }`}
                                          >
                                            {score.toFixed(1)}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">—</span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4">
                                        {isDone ? (
                                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                                            Đã nộp
                                          </span>
                                        ) : attempt.status === QuizAttemptStatus.INTERRUPTED ? (
                                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                                            Gián đoạn
                                          </span>
                                        ) : (
                                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold animate-pulse">
                                            Đang làm
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {totalAttemptPages > 1 && (
                          <div className="border-t border-slate-100 dark:border-slate-800">
                            <Pagination
                              currentPage={attemptsPage}
                              totalPages={totalAttemptPages}
                              onPageChange={setAttemptsPage}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ExamDetailContent;

import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  Award,
  BookOpen,
  Check,
  Share2,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Users,
  Loader2,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useExam, useDownloadExam, usePublishExam } from "../queries/useExam";
import { QuestionLevel, QuestionType } from "@/feature/question/types/question.type";

const ExamDetailContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const examId = (params as any).id ? Number((params as any).id) : undefined;

  const [activeTab, setActiveTab] = useState<"questions" | "stats" | "settings">("questions");

  const { data: exam, isLoading } = useExam(examId!, { enabled: !!examId });
  const downloadExam = useDownloadExam();
  const { mutate: publishExam, isPending: isPublishing } = usePublishExam();

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

  const handleTogglePublish = () => {
    if (!exam) return;
    publishExam({ id: exam.id, isPublished: !exam.isPublished });
  };

  if (isLoading) {
    return (
      <main className="ml-64 flex-1 p-8">
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
      <main className="ml-64 flex-1 p-8">
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

  const mcqQuestions = exam.examQuestions.filter((q) => q.question.questionType === QuestionType.MCQ);
  const essayQuestions = exam.examQuestions.filter((q) => q.question.questionType === QuestionType.ESSAY);

  return (
    <main className="flex-1 dark:bg-slate-950">
      <div className="mb-4 bg-white px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/mentor/exam/my" })}
              className="flex items-center gap-2 pt-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-8 w-8" />
            </button>
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
              <Share2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto p-8 bg-slate-50">
        <div className="flex gap-6">
          <div className="w-80 space-y-4 shrink-0">
            {exam.isPublished ? (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  Đề thi đã được xuất bản thành công. Học sinh hiện có thể vào thi.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Đề thi chưa được công bố. Nhấn "Xuất bản" để học sinh có thể làm bài.
                </p>
              </div>
            )}

            {/* Download Buttons */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
              <button
                onClick={() => handleDownload("pdf")}
                disabled={downloadExam.isPending}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left disabled:opacity-50"
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
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                {downloadExam.isPending ? (
                  <Loader2 className="h-5 w-5 text-slate-600 dark:text-slate-400 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                )}
                <span className="font-medium text-slate-900 dark:text-white">Tải đề (.Docx)</span>
              </button>
            </div>

            {/* Publish/Unpublish Button */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <button
                onClick={handleTogglePublish}
                disabled={isPublishing}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-medium ${
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

            {/* Warning - Only show when published */}
            {exam.isPublished && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 text-lg">🔒</span>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Đang khóa (không thể chỉnh sửa khi đã xuất bản)
                  </p>
                </div>
              </div>
            )}

            {/* Exam Stats */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
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
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="border-b border-slate-200 dark:border-slate-800 flex">
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "questions"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Câu hỏi
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "stats"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Thống kê chi tiết
                </button>
              </div>

              {/* Questions Tab */}
              {activeTab === "questions" && (
                <div className="p-6 space-y-6">
                  {exam.examQuestions.map((examQuestion, index) => (
                    <div
                      key={examQuestion.id}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                            {String(index + 1).padStart(2, "0")}
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
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Settings Tab */}
                {activeTab === "stats" && (
                  <div className="p-6 mx-auto space-y-6">
                    {/* Score Overview Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Circular Progress Card */}
                      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex items-center gap-10">
                        {/* Circular Progress */}
                        <div className="flex flex-col items-center">
                          <div className="relative w-36 h-36 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              {/* Background circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-slate-200 dark:text-slate-700"
                              />
                              {/* Progress circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.82)}`}
                                strokeLinecap="round"
                                className="text-blue-600"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-4xl font-bold text-slate-900 dark:text-white leading-none">
                                8.2
                              </span>
                              <span className="text-[11px] text-slate-500 uppercase font-bold mt-1">Điểm TB</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex-1 space-y-5">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                              Tỷ lệ đạt (&gt;= 5.0)
                            </p>
                            <div className="flex items-end gap-2">
                              <span className="text-3xl font-bold text-green-600">92%</span>
                              <span className="text-xs text-green-500 mb-1 font-bold flex items-center gap-0.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                +5%
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                Điểm cao nhất
                              </p>
                              <p className="text-xl font-bold text-slate-900 dark:text-white">10.0</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                Thời gian TB
                              </p>
                              <p className="text-xl font-bold text-slate-900 dark:text-white">32 phút</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chart Card */}
                      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Phân bổ điểm số
                          </h3>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                              <span className="text-[11px] font-medium text-slate-500">Giỏi/Xuất sắc</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm"></div>
                              <span className="text-[11px] font-medium text-slate-500">Khác</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-40 flex items-end justify-between gap-6 px-4">
                          {[
                            { height: "15%", count: 1, label: "0-2", color: "bg-slate-100 dark:bg-slate-800" },
                            { height: "5%", count: 0, label: "2-4", color: "bg-slate-100 dark:bg-slate-800" },
                            { height: "40%", count: 4, label: "4-6", color: "bg-slate-200 dark:bg-slate-700" },
                            { height: "80%", count: 12, label: "6-8", color: "bg-blue-400" },
                            { height: "100%", count: 18, label: "8-10", color: "bg-blue-600" },
                          ].map((bar, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                              <div
                                className={`w-full ${bar.color} rounded-t-lg relative group transition-all hover:opacity-80`}
                                style={{ height: bar.height }}
                              >
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {bar.count} sv
                                </div>
                              </div>
                              <span
                                className={`text-[11px] font-bold ${
                                  idx === 4 ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {bar.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Student List */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Danh sách học sinh tham gia
                          </h3>
                          <p className="text-sm text-slate-500">Hiển thị 10 trong tổng số 45 học sinh</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 w-64 outline-none"
                              placeholder="Tìm kiếm học sinh..."
                              type="text"
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
                              <th className="px-8 py-4 text-right">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                              {
                                name: "Nguyễn Văn Lộc",
                                initials: "NL",
                                color: "bg-blue-100 text-blue-600",
                                start: "08:00",
                                end: "08:42",
                                duration: "42 phút",
                                score: 9.5,
                                status: "done",
                              },
                              {
                                name: "Trần Thị Hoa",
                                initials: "TH",
                                color: "bg-purple-100 text-purple-600",
                                start: "08:05",
                                end: "08:35",
                                duration: "30 phút",
                                score: 8.0,
                                status: "done",
                              },
                              {
                                name: "Lê Minh",
                                initials: "LM",
                                color: "bg-slate-100 text-slate-600",
                                start: "08:15",
                                end: "—",
                                duration: "—",
                                score: null,
                                status: "doing",
                              },
                              {
                                name: "Phạm Anh Khoa",
                                initials: "PK",
                                color: "bg-orange-100 text-orange-600",
                                start: "08:02",
                                end: "08:47",
                                duration: "45 phút",
                                score: 6.5,
                                status: "done",
                              },
                              {
                                name: "Bùi Thu Thảo",
                                initials: "BT",
                                color: "bg-pink-100 text-pink-600",
                                start: "08:10",
                                end: "08:50",
                                duration: "40 phút",
                                score: 10.0,
                                status: "done",
                              },
                              {
                                name: "Quách Đại",
                                initials: "QD",
                                color: "bg-emerald-100 text-emerald-600",
                                start: "08:20",
                                end: "—",
                                duration: "—",
                                score: null,
                                status: "doing",
                              },
                              {
                                name: "Hoàng Phan",
                                initials: "HP",
                                color: "bg-indigo-100 text-indigo-600",
                                start: "08:08",
                                end: "08:38",
                                duration: "30 phút",
                                score: 4.5,
                                status: "done",
                              },
                              {
                                name: "Đặng Văn",
                                initials: "DV",
                                color: "bg-teal-100 text-teal-600",
                                start: "08:12",
                                end: "08:52",
                                duration: "40 phút",
                                score: 7.2,
                                status: "done",
                              },
                              {
                                name: "Mai Ngọc",
                                initials: "MN",
                                color: "bg-rose-100 text-rose-600",
                                start: "08:14",
                                end: "08:44",
                                duration: "30 phút",
                                score: 8.8,
                                status: "done",
                              },
                              {
                                name: "Võ Thành",
                                initials: "VT",
                                color: "bg-cyan-100 text-cyan-600",
                                start: "08:18",
                                end: "08:58",
                                duration: "40 phút",
                                score: 7.5,
                                status: "done",
                              },
                            ].map((student, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                              >
                                <td className="px-8 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${student.color}`}
                                    >
                                      {student.initials}
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">{student.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{student.start} - 15/10/23</td>
                                <td
                                  className={`px-6 py-4 ${student.end === "—" ? "text-slate-400" : "text-slate-500"}`}
                                >
                                  {student.end !== "—" ? `${student.end} - 15/10/23` : student.end}
                                </td>
                                <td
                                  className={`px-6 py-4 text-center font-medium ${
                                    student.duration === "—" ? "text-slate-400" : "text-slate-500"
                                  }`}
                                >
                                  {student.duration}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {student.score !== null ? (
                                    <span
                                      className={`px-2.5 py-1 rounded-md font-bold ${
                                        student.score >= 8
                                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                          : student.score >= 5
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                            : student.score >= 4
                                              ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                                              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                      }`}
                                    >
                                      {student.score}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {student.status === "done" ? (
                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                                      Đã nộp
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold animate-pulse">
                                      Đang làm
                                    </span>
                                  )}
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <button
                                    className={`text-xs font-bold inline-flex items-center gap-1 ${
                                      student.status === "done"
                                        ? "text-blue-600 hover:underline"
                                        : "text-slate-300 cursor-not-allowed"
                                    }`}
                                    disabled={student.status !== "done"}
                                  >
                                    Xem bài làm <Eye className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-10">
                        <button
                          disabled
                          className="flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Trước
                        </button>
                        <div className="flex items-center gap-2">
                          <button className="w-9 h-9 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20">
                            1
                          </button>
                          <button className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors">
                            2
                          </button>
                          <button className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors">
                            3
                          </button>
                          <span className="text-slate-400 px-1">...</span>
                          <button className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors">
                            5
                          </button>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group">
                          Tiếp theo
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ExamDetailContent;

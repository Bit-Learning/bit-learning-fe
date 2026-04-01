import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronRight,
  Timer,
  Lock,
  PlayCircle,
  HelpCircle,
  BarChart3,
  Clock,
  BookOpen,
  Star,
  FileText,
  CheckCircle2,
  Eye,
  Rocket,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { Badge } from "@workspace/ui/components/Badge";
import {
	useMyQuizAttempts,
	useMyQuizSessions,
	useStartQuizAttempt,
	useResumeQuizAttempt,
	useStartQuizSession,
} from "../queries/useQuiz";
import { useExam } from "@/feature/exam/queries/useExam";
import { toast } from "@/shared/components/Sonner";
import { QuizSessionType } from "../types/quiz.type";

const ExamDetailContent: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams({ from: "/_layout/exams/$examId" });
  const [resumingAttemptId, setResumingAttemptId] = useState<number | null>(null);

  const [enrollKeyInput, setEnrollKeyInput] = useState("");
  const [enrollKeyError, setEnrollKeyError] = useState("");

  const { data: exam, isLoading: examLoading } = useExam(Number(examId), { enabled: !!examId });
  const { data: allAttemptsResponse } = useMyQuizAttempts({ page: 0, size: 100 });
  const { data: allSessionsResponse } = useMyQuizSessions({ page: 0, size: 100 });

  const startAttemptMutation = useStartQuizAttempt();
  const resumeAttemptMutation = useResumeQuizAttempt();
  const startSessionMutation = useStartQuizSession();

  const attempts = Array.isArray(allAttemptsResponse)
    ? allAttemptsResponse.filter((a) => a.exam.id === Number(examId))
    : [];

  const sessions = Array.isArray(allSessionsResponse)
    ? allSessionsResponse.filter((s) => s.exam.id === Number(examId))
    : [];

  const canStartExam = exam?.isPublished;
  const hasHistory = attempts.length > 0 || sessions.length > 0;

  // Đề chính thức có enrollKey bắt buộc nhập
  const requiresEnrollKey = exam?.type === "EXAM";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return "Đang làm";
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes} phút ${seconds} giây`;
  };

  const handleStartExam = async () => {
    if (!canStartExam) return;

    // Validate enrollKey nếu cần
    if (requiresEnrollKey && !enrollKeyInput.trim()) {
      setEnrollKeyError("Vui lòng nhập mật khẩu để vào thi");
      return;
    }
    setEnrollKeyError("");

    try {
      const response = await startAttemptMutation.mutateAsync({
        examId: Number(examId),
        enrollKey: requiresEnrollKey ? enrollKeyInput.trim() : undefined,
      });

      toast.success({ title: "Bắt đầu làm bài thi", description: "Chúc bạn làm bài tốt!" });
      navigate({
        to: "/quiz-attempts/$attemptId",
        params: { attemptId: String(response.data.data!.id) },
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      if (
        msg?.toLowerCase().includes("enroll") ||
        msg?.toLowerCase().includes("key") ||
        msg?.toLowerCase().includes("password")
      ) {
        setEnrollKeyError("Mật khẩu không đúng. Vui lòng thử lại.");
      } else {
        toast.error({ title: "Lỗi", description: "Không thể bắt đầu bài thi. Vui lòng thử lại." });
      }
    }
  };

  const handleResumeAttempt = async (attemptId: number) => {
    setResumingAttemptId(attemptId);
    try {
      await resumeAttemptMutation.mutateAsync({ examId: Number(examId), deviceToken: undefined });
      navigate({ to: "/quiz-attempts/$attemptId", params: { attemptId: String(attemptId) } });
    } catch {
      toast.error({ title: "Lỗi", description: "Không thể tiếp tục bài thi." });
    } finally {
      setResumingAttemptId(null);
    }
  };

  const handleStartPractice = async () => {
    if (!exam) return;
    try {
      const response = await startSessionMutation.mutateAsync({
        examId: Number(examId),
        type: "PRACTICE" as QuizSessionType,
      });
      toast.success({ title: "Bắt đầu luyện tập", description: "Bạn có thể học tập thoải mái!" });
      navigate({
        to: "/quiz-sessions/$sessionId",
        params: { sessionId: String(response.data.data!.id) },
      });
    } catch {
      toast.error({ title: "Lỗi", description: "Không thể bắt đầu phiên luyện tập." });
    }
  };

  if (examLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Không tìm thấy đề thi</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Đề thi này không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => navigate({ to: "/exams" })}>Quay lại danh sách</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPractice = exam.type === "PRACTICE";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-500 dark:text-slate-400">
          <button onClick={() => navigate({ to: "/exams" })} className="hover:text-primary transition-colors">
            Danh sách đề thi
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Chi tiết đề thi</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: info + history */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 p-0 border-blue-200 dark:border-blue-800 overflow-hidden">
              <div className="px-8 py-6 border-b border-blue-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      isPractice ? "bg-blue-600" : "bg-amber-600"
                    }`}
                  >
                    {isPractice ? (
                      <BookOpen className="w-8 h-8 text-white" />
                    ) : (
                      <Rocket className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className="text-xs font-mono border-slate-200 dark:border-slate-700">{exam.code}</Badge>
                      {exam.type && (
                        <Badge
                          className={
                            isPractice
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                          }
                        >
                          {isPractice ? "Luyện tập" : "Chính thức"}
                        </Badge>
                      )}
                      {exam.isPublished ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Đang mở
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">
                          <Lock className="w-3 h-3 mr-1" />
                          Chưa mở
                        </Badge>
                      )}
                      {requiresEnrollKey && (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 gap-1">
                          <Lock className="w-3 h-3" />
                          Có mật khẩu
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {exam.name}
                    </h1>
                  </div>
                </div>
              </div>

              <CardContent className="px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                      <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100">Thời gian làm bài</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isPractice ? "Không giới hạn" : `${exam.durationInMinutes} phút không nghỉ`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100">Số câu hỏi</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {exam.examQuestions?.length || 0} câu hỏi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100">Tự động lưu</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Câu trả lời được lưu liên tục</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100">Bảo mật</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Không quay phim, chụp ảnh đề</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lịch sử */}
            <Card>
              <CardContent className="px-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Lịch sử làm bài
                </h2>

                {hasHistory ? (
                  <div className="space-y-3">
                    {attempts.map((attempt, index) => {
                      const isSubmitted = attempt.status === "SUBMITTED";
                      const isDoing = attempt.status === "DOING";
                      const isResuming = resumingAttemptId === attempt.id;
                      return (
                        <div
                          key={`attempt-${attempt.id}`}
                          className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-amber-200 dark:border-amber-800 shrink-0">
                                <span className="text-amber-600 dark:text-amber-400">#{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 text-xs">
                                    Chế độ Thi
                                  </Badge>
                                  {isSubmitted ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" /> Đã nộp
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                                      <Clock className="w-3 h-3 mr-1" /> Đang làm
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                  {formatDate(attempt.submittedAt || attempt.startTime)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {formatDuration(attempt.startTime, attempt.submittedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {isSubmitted && attempt.score !== undefined && (
                                <div className="text-right">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Điểm số</p>
                                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                    {attempt.score.toFixed(1)}
                                    <span className="text-sm text-slate-400 ml-1">/{exam?.totalScore}</span>
                                  </p>
                                </div>
                              )}
                              {isDoing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  isDisabled={isResuming}
                                  onClick={() => handleResumeAttempt(attempt.id)}
                                >
                                  {isResuming ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <PlayCircle className="w-4 h-4" />
                                  )}
                                  {isResuming ? "Đang tải..." : "Tiếp tục"}
                                </Button>
                              )}
                              {isSubmitted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate({
                                      to: "/quiz-attempts/$attemptId/result",
                                      params: { attemptId: String(attempt.id) },
                                    })
                                  }
                                >
                                  <Eye className="w-4 h-4" /> Xem kết quả
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {sessions.map((session, index) => {
                      const isSubmitted = session.status === "SUBMITTED";
                      const isExpired = session.status === "EXPIRED";
                      const isDoing = session.status === "DOING";
                      return (
                        <div
                          key={`session-${session.id}`}
                          className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-blue-200 dark:border-blue-800 shrink-0">
                                <span className="text-blue-600 dark:text-blue-400">L{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                                    Luyện tập
                                  </Badge>
                                  {isSubmitted ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành
                                    </Badge>
                                  ) : isExpired ? (
                                    <Badge className="bg-slate-100 text-slate-600 text-xs">Hết hạn</Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700 text-xs">
                                      <Clock className="w-3 h-3 mr-1" /> Đang làm
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                  {formatDate(session.startTime)}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Câu {session.currentIndex + 1} / {exam?.examQuestions?.length || 0}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isDoing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate({
                                      to: "/quiz-sessions/$sessionId",
                                      params: { sessionId: String(session.id) },
                                    })
                                  }
                                >
                                  <PlayCircle className="w-4 h-4" /> Tiếp tục
                                </Button>
                              )}
                              {isSubmitted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate({
                                      to: "/quiz-sessions/$sessionId/result",
                                      params: { sessionId: String(session.id) },
                                    })
                                  }
                                >
                                  <Eye className="w-4 h-4" /> Xem kết quả
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Bạn chưa có lịch sử làm bài</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Hãy bắt đầu làm bài ngay!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: action sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card className="border-2 p-0 border-blue-200 dark:border-blue-800 overflow-hidden">
                <div className="bg-blue-600 p-6 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Tóm tắt đề thi
                  </h3>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 text-sm">
                        <HelpCircle className="w-4 h-4" /> Số câu hỏi
                      </span>
                      <span className="font-bold">{exam.examQuestions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2  dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 text-sm">
                        <Timer className="w-4 h-4" /> Thời gian
                      </span>
                      <span className="font-bold">
                        {isPractice ? "Không giới hạn" : `${exam.durationInMinutes} phút`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" /> Số lần làm
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {attempts.length + sessions.length} lần
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    {canStartExam ? (
                      <>
                        {requiresEnrollKey && (
                          <div>
                            <label className="flex text-sm font-bold py-2 text-slate-700 dark:text-slate-300 mb-1.5 items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5" />
                              Mật khẩu vào thi <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              placeholder="Nhập mật khẩu..."
                              value={enrollKeyInput}
                              onChange={(e) => {
                                setEnrollKeyInput(e.target.value);
                                if (enrollKeyError) setEnrollKeyError("");
                              }}
                              className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                                enrollKeyError
                                  ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
                                  : "border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/30"
                              }`}
                            />
                            {enrollKeyError && (
                              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {enrollKeyError}
                              </p>
                            )}
                          </div>
                        )}

                        {isPractice ? (
                          <Button
                            size="lg"
                            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 font-bold h-12"
                            onClick={handleStartPractice}
                            isDisabled={startSessionMutation.isPending}
                          >
                            {startSessionMutation.isPending ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <BookOpen className="w-5 h-5" />
                            )}
                            {startSessionMutation.isPending ? "Đang khởi tạo..." : "Bắt đầu luyện tập"}
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="lg"
                              className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/30 font-bold h-12"
                              onClick={handleStartExam}
                              isDisabled={
                                startAttemptMutation.isPending || (requiresEnrollKey && !enrollKeyInput.trim())
                              }
                            >
                              {startAttemptMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Rocket className="w-5 h-5" />
                              )}
                              {startAttemptMutation.isPending ? "Đang khởi tạo..." : "Bắt đầu thi"}
                            </Button>
                            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                              Có giới hạn thời gian và không thể tạm dừng
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-center space-y-3 py-2">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Đề thi chưa mở</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Vui lòng chờ giáo viên mở đề</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <button
                className="w-full p-4 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                onClick={() => toast.info({ title: "Trợ giúp", description: "Liên hệ giáo viên nếu bạn cần hỗ trợ" })}
              >
                <HelpCircle className="w-5 h-5" />
                Bạn cần trợ giúp?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailContent;

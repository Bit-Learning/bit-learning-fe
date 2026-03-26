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
import ExamModeModal from "./ExamModeModal";
import { QuizSessionType } from "../types/quiz.type";

const ExamDetailContent: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams({ from: "/_layout/exams/$examId" });
  const [showModeModal, setShowModeModal] = useState(false);
  const [resumingAttemptId, setResumingAttemptId] = useState<number | null>(null);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return "Đang làm";
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes} phút ${seconds} giây`;
  };

  const handleStartExam = async () => {
    if (!canStartExam) return;

    try {
      const response = await startAttemptMutation.mutateAsync({
        examId: Number(examId),
      });

      setShowModeModal(false);

      toast.success({
        title: "Bắt đầu làm bài thi",
        description: "Chúc bạn làm bài tốt!",
      });

      navigate({
        to: "/quiz-attempts/$attemptId",
        params: { attemptId: String(response.data.data!.id) },
      });
    } catch (error) {
      toast.error({
        title: "Lỗi",
        description: "Không thể bắt đầu bài thi. Vui lòng thử lại.",
      });
      console.error("Failed to start attempt:", error);
    }
  };

  const handleResumeAttempt = async (attemptId: number) => {
    setResumingAttemptId(attemptId);

    try {
      await resumeAttemptMutation.mutateAsync({
        examId: Number(examId),
        deviceToken: undefined,
      });

      navigate({
        to: "/quiz-attempts/$attemptId",
        params: { attemptId: String(attemptId) },
      });
    } catch (error) {
      console.error("Failed to resume attempt:", error);
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

      setShowModeModal(false);

      toast.success({
        title: "Bắt đầu luyện tập",
        description: "Bạn có thể học tập thoải mái!",
      });

      navigate({
        to: "/quiz-sessions/$sessionId",
        params: { sessionId: String(response.data.data!.id) },
      });
    } catch (error) {
      toast.error({
        title: "Lỗi",
        description: "Không thể bắt đầu phiên luyện tập. Vui lòng thử lại.",
      });
      console.error("Failed to start practice session:", error);
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
              <Skeleton className="h-48 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
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
          <div className="lg:col-span-2 space-y-6">
            {/* Exam info card */}
            <Card className="border-2 p-0 border-blue-200 dark:border-blue-800 overflow-hidden">
              <div className="px-8 py-6 border-b border-blue-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="text-xs font-mono border-slate-200 dark:border-slate-700">{exam.code}</Badge>
                      {exam.isPublished ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Đang mở
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                          <Lock className="w-3 h-3 mr-1" />
                          Chưa mở
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
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Hướng dẫn và Quy định
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                          <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100">Thời gian làm bài</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {exam.durationInMinutes} phút không nghỉ
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100">Chế độ làm bài</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Thi chính thức hoặc Luyện tập</p>
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
                  </div>
                </div>
              </CardContent>
            </Card>

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
                          className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-white dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-blue-200 dark:border-blue-800 shrink-0">
                                <span className="text-blue-600 dark:text-blue-400">#{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs">
                                    Chế độ Thi
                                  </Badge>
                                  {isSubmitted ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Đã nộp
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Đang làm
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                  {formatDate(attempt.submittedAt || attempt.startTime)}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  <Timer className="w-3 h-3" />
                                  {formatDuration(attempt.startTime, attempt.submittedAt)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {isSubmitted && attempt.score !== undefined && (
                                <div className="text-right">
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Điểm số</p>
                                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                    {attempt.score.toFixed(1)}
                                    <span className="text-sm text-slate-400 ml-1">/{exam?.totalScore}</span>
                                  </p>
                                </div>
                              )}

                              {isDoing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5"
                                  isDisabled={isResuming}
                                  onClick={() => handleResumeAttempt(attempt.id)}
                                >
                                  {isResuming ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                      Đang tải...
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle className="w-4 h-4" />
                                      Tiếp tục
                                    </>
                                  )}
                                </Button>
                              )}

                              {isSubmitted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 shrink-0"
                                  onClick={() =>
                                    navigate({
                                      to: "/quiz-attempts/$attemptId/result",
                                      params: { attemptId: String(attempt.id) },
                                    })
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                  Xem kết quả
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
                          className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-white dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-emerald-200 dark:border-emerald-800 shrink-0">
                                <span className="text-emerald-600 dark:text-emerald-400">L{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
                                    Chế độ Luyện tập
                                  </Badge>
                                  {isSubmitted ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Hoàn thành
                                    </Badge>
                                  ) : isExpired ? (
                                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-xs">
                                      Hết hạn
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Đang làm
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                  {formatDate(session.startTime)}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  <BookOpen className="w-3 h-3" />
                                  Câu {session.currentIndex + 1} / {exam?.examQuestions?.length || 0}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isDoing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5"
                                  onClick={() =>
                                    navigate({
                                      to: "/quiz-sessions/$sessionId",
                                      params: { sessionId: String(session.id) },
                                    })
                                  }
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  Tiếp tục
                                </Button>
                              )}

                              {isSubmitted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5"
                                  onClick={() =>
                                    navigate({
                                      to: "/quiz-sessions/$sessionId/result",
                                      params: { sessionId: String(session.id) },
                                    })
                                  }
                                >
                                  <Eye className="w-4 h-4" />
                                  Xem kết quả
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
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      Hãy bắt đầu làm bài ngay để kiểm tra kiến thức!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card className="border-2 p-0 border-blue-200 dark:border-blue-800 overflow-hidden">
                <div className="bg-blue-600 p-6 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Tóm tắt đề thi
                  </h3>
                </div>

                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Số câu hỏi
                      </span>
                      <span className="font-bold text-lg">{exam.examQuestions?.length || 0}</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        Thời gian
                      </span>
                      <span className="font-bold text-lg">{exam.durationInMinutes} phút</span>
                    </div>

                    <div className="flex justify-between items-center py-3">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Lịch sử
                      </span>
                      <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {attempts.length + sessions.length} lần
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    {canStartExam ? (
                      <div className="space-y-3">
                        <Button
                          size="lg"
                          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold text-base h-12"
                          onClick={() => setShowModeModal(true)}
                        >
                          <PlayCircle className="w-5 h-5" />
                          Bắt đầu làm bài
                        </Button>
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                          Chọn chế độ Thi hoặc Luyện tập phù hợp với bạn
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Đề thi chưa mở</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Vui lòng chờ giáo viên mở đề thi</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <button
                className="w-full p-4 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                onClick={() => {
                  toast.info({
                    title: "Trợ giúp",
                    description: "Liên hệ giáo viên nếu bạn cần hỗ trợ",
                  });
                }}
              >
                <HelpCircle className="w-5 h-5" />
                Bạn cần trợ giúp?
              </button>
            </div>
          </div>
        </div>
      </div>

      <ExamModeModal
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        onSelectExamMode={handleStartExam}
        onSelectPracticeMode={handleStartPractice}
        isStartingExam={startAttemptMutation.isPending}
        isStartingPractice={startSessionMutation.isPending}
        examName={exam?.name}
      />
    </div>
  );
};

export default ExamDetailContent;

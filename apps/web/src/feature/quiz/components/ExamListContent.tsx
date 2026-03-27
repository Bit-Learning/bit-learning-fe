import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Terminal,
  Code,
  CheckCircle2,
  Lock,
  Timer,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { useMyQuizAttempts } from "../queries/useQuiz";
import type { ExamBriefResponse } from "../../exam/types/exam.type";
import { useAllExams } from "@/feature/exam/queries/useExam";

type ExamStatusEnum = "OPEN" | "UPCOMING" | "COMPLETED";

interface ExamWithStatus extends ExamBriefResponse {
  status: ExamStatusEnum;
  lastAttemptScore?: number;
  icon: React.ReactNode;
  iconBg: string;
}

const ExamListContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data: examsData, isLoading } = useAllExams({ page: currentPage, size: pageSize });
  const { data: attemptsData } = useMyQuizAttempts({ page: 0, size: 100 });

  const exams = examsData?.data || [];
  const pagination = examsData?.page;
  const attempts = attemptsData || [];

  const examsWithStatus: ExamWithStatus[] = exams.map((exam) => {
    const attempt = attempts.find((a) => a.exam.id === exam.id && a.status === "SUBMITTED");

    let status: ExamStatusEnum = "OPEN";
    if (!exam.isPublished) {
      status = "UPCOMING";
    } else if (attempt) {
      status = "COMPLETED";
    }

    let icon = <FileText className="w-8 h-8" />;
    let iconBg = "bg-blue-50 dark:bg-blue-900/30";

    if (status === "COMPLETED") {
      icon = <CheckCircle2 className="w-8 h-8" />;
      iconBg = "bg-emerald-50 dark:bg-emerald-900/30";
    } else if (status === "UPCOMING") {
      icon = <Lock className="w-8 h-8" />;
      iconBg = "bg-slate-100 dark:bg-slate-800";
    } else if (exam.code.includes("SCR") || exam.code.includes("CODE")) {
      icon = <Code className="w-8 h-8" />;
      iconBg = "bg-purple-50 dark:bg-purple-900/30";
    }

    return {
      ...exam,
      status,
      lastAttemptScore: attempt?.score,
      icon,
      iconBg,
    };
  });

  const statusConfig = {
    OPEN: {
      label: "Đang mở",
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800",
    },
    UPCOMING: {
      label: "Sắp diễn ra",
      color:
        "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800",
    },
    COMPLETED: {
      label: "Đã hoàn thành",
      color:
        "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800",
    },
  };

  const filteredExams = examsWithStatus.filter((exam) => {
    const matchSearch =
      exam.name.toLowerCase().includes(search.toLowerCase()) || exam.code.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleExamClick = (exam: ExamWithStatus) => {
    navigate({
      to: "/exams/$examId",
      params: { examId: String(exam.id) },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-3">Danh sách đề thi</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Chọn một đề thi để bắt đầu thử thách kiến thức của bạn
              </p>
            </div>

            <div className="relative max-w-7xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên đề thi hoặc mã đề..."
                className="pl-12 h-12 text-base shadow-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 dark:border-slate-700">
            <CardContent className="py-20">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {search ? "Không tìm thấy đề thi" : "Chưa có đề thi nào"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {search ? "Thử tìm kiếm với từ khóa khác" : "Hiện tại chưa có đề thi nào được xuất bản"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredExams.map((exam) => {
              const isCompleted = exam.status === "COMPLETED";
              const isUpcoming = exam.status === "UPCOMING";
              const isOpen = exam.status === "OPEN";

              return (
                <Card
                  key={exam.id}
                  className={cn(
                    "group transition-all duration-300 py-0 border-2 rounded-md overflow-hidden",
                    isCompleted && " border-emerald-600 dark:border-emerald-800",
                    isUpcoming && " border-amber-600 dark:border-amber-800",
                    isOpen &&
                      "border-blue-600 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer bg-white dark:bg-slate-800",
                  )}
                  onClick={() => isOpen && handleExamClick(exam)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex items-start gap-5 flex-1">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform",
                            exam.iconBg,
                            isOpen && "group-hover:scale-110",
                          )}
                        >
                          <div
                            className={cn(
                              isCompleted
                                ? "text-emerald-600 dark:text-emerald-400"
                                : isUpcoming
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-blue-600 dark:text-blue-400",
                            )}
                          >
                            {exam.icon}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className={cn("text-xs font-semibold px-3 py-1 border", statusConfig[exam.status].color)}
                            >
                              {statusConfig[exam.status].label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono font-semibold px-3 py-1 border-slate-200 dark:border-slate-700"
                            >
                              {exam.code}
                            </Badge>
                          </div>

                          <h3
                            className={cn(
                              "text-2xl font-bold text-slate-900 dark:text-slate-100",
                              isOpen && "group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
                            )}
                          >
                            {exam.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-2">
                              <Timer className="w-4 h-4" />
                              <span className="font-medium">{exam.durationInMinutes} phút</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              <span className="font-medium">{exam.totalQuestions} câu hỏi</span>
                            </span>
                            {isCompleted && exam.lastAttemptScore !== undefined && (
                              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <Trophy className="w-4 h-4" />
                                Điểm: {exam.lastAttemptScore}/{exam.totalScore}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 lg:flex-col lg:items-stretch lg:w-40">
                        {isUpcoming ? (
                          <Button
                            variant="outline"
                            isDisabled
                            className="flex-1 lg:flex-none gap-2 cursor-not-allowed opacity-60 border-amber-200 dark:border-amber-800"
                          >
                            <Lock className="w-4 h-4" />
                            Chưa mở
                          </Button>
                        ) : (
                          <Button
                            className={cn(
                              "flex-1 lg:flex-none gap-2 text-white shadow-lg group/btn",
                              isCompleted
                                ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 shadow-emerald-500/30"
                                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-blue-500/30",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExamClick(exam);
                            }}
                          >
                            Xem chi tiết
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              isDisabled={currentPage === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum = i;

                if (pagination.totalPages > 5) {
                  if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > pagination.totalPages - 4) {
                    pageNum = pagination.totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              isDisabled={currentPage >= pagination.totalPages - 1}
              className="gap-2"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExamListContent;

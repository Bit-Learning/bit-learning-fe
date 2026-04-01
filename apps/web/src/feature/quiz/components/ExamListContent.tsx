import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
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
  BookOpen,
  Rocket,
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
import type { ExamType } from "@/feature/exam/types/exam.type";

type ExamStatusEnum = "OPEN" | "UPCOMING" | "COMPLETED";
type TabType = "EXAM" | "PRACTICE";

interface ExamWithStatus extends ExamBriefResponse {
  status: ExamStatusEnum;
  lastAttemptScore?: number;
  icon: React.ReactNode;
  iconBg: string;
}

const ExamListContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("EXAM");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data: examsData, isLoading } = useAllExams({
    page: currentPage,
    size: pageSize,
  });
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

    return { ...exam, status, lastAttemptScore: attempt?.score, icon, iconBg };
  });

  const statusConfig = {
    OPEN: {
      label: "Đang mở",
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    },
    UPCOMING: {
      label: "Sắp diễn ra",
      color:
        "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    },
    COMPLETED: {
      label: "Đã hoàn thành",
      color:
        "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    },
  };

  // Tách theo type, fallback về tab hiển thị tất cả nếu exam không có type
  const filteredExams = examsWithStatus.filter((exam) => {
    const matchSearch =
      exam.name.toLowerCase().includes(search.toLowerCase()) || exam.code.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "EXAM" ? !exam.type || exam.type === "EXAM" : exam.type === "PRACTICE";
    return matchSearch && matchTab;
  });

  const handleExamClick = (exam: ExamWithStatus) => {
    navigate({ to: "/exams/$examId", params: { examId: String(exam.id) } });
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: "EXAM",
      label: "Đề thi chính thức",
      icon: <Rocket className="w-4 h-4" />,
      desc: "Có thời gian, cần mật khẩu",
    },
    {
      key: "PRACTICE",
      label: "Luyện tập",
      icon: <BookOpen className="w-4 h-4" />,
      desc: "Không giới hạn, học thoải mái",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">Danh sách đề thi</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Chọn một đề thi để bắt đầu thử thách kiến thức của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(0);
              }}
              className={cn(
                "flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 text-sm font-bold transition-all",
                activeTab === tab.key
                  ? tab.key === "EXAM"
                    ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600",
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-xs font-normal ml-1 hidden sm:block",
                  activeTab === tab.key ? "opacity-80" : "text-slate-400",
                )}
              >
                — {tab.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên đề thi hoặc mã đề..."
            className="pl-12 h-12 text-base shadow-sm border-slate-400 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* List */}
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
                  {activeTab === "EXAM" ? (
                    <Rocket className="w-10 h-10 text-slate-400" />
                  ) : (
                    <BookOpen className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {search
                    ? "Không tìm thấy đề thi"
                    : activeTab === "EXAM"
                      ? "Chưa có đề thi chính thức"
                      : "Chưa có đề luyện tập"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {search ? "Thử tìm kiếm với từ khóa khác" : "Hiện tại chưa có đề nào được xuất bản"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredExams.map((exam) => {
              const isCompleted = exam.status === "COMPLETED";
              const isUpcoming = exam.status === "UPCOMING";
              const isOpen = exam.status === "OPEN";
              const isPracticeTab = activeTab === "PRACTICE";

              return (
                <Card
                  key={exam.id}
                  className={cn(
                    "group transition-all duration-300 py-0 border-2 rounded-xl overflow-hidden",
                    isCompleted && "border-emerald-500 dark:border-emerald-700",
                    isUpcoming && "border-amber-500 dark:border-amber-700",
                    isOpen &&
                      cn(
                        "border-slate-200 dark:border-slate-700 hover:shadow-xl cursor-pointer bg-white dark:bg-slate-800",
                        isPracticeTab
                          ? "hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-blue-500/10"
                          : "hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-amber-500/10",
                      ),
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
                                  : isPracticeTab
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-amber-600 dark:text-amber-400",
                            )}
                          >
                            {exam.icon}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
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
                            {/* Hiện badge loại nếu có */}
                            {exam.type && (
                              <Badge
                                className={cn(
                                  "text-xs font-semibold px-2 py-1 border",
                                  exam.type === "EXAM"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
                                )}
                              >
                                {exam.type === "EXAM" ? "Chính thức" : "Luyện tập"}
                              </Badge>
                            )}
                            {/* Khoá nếu EXAM có enrollKey */}
                            {exam.type === "EXAM" && exam.enrollKey && (
                              <Badge className="text-xs bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 gap-1">
                                <Lock className="w-3 h-3" />
                                Có mật khẩu
                              </Badge>
                            )}
                          </div>

                          <h3
                            className={cn(
                              "text-xl font-bold text-slate-900 dark:text-slate-100",
                              isOpen &&
                                cn(
                                  "transition-colors",
                                  isPracticeTab
                                    ? "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                    : "group-hover:text-amber-600 dark:group-hover:text-amber-400",
                                ),
                            )}
                          >
                            {exam.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Timer className="w-4 h-4" />
                              <span className="font-medium">{exam.durationInMinutes} phút</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4" />
                              <span className="font-medium">{exam.totalQuestions} câu hỏi</span>
                            </span>
                            {isCompleted && exam.lastAttemptScore !== undefined && (
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
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
                            size="lg"
                            variant="outline"
                            isDisabled
                            className="flex-1 lg:flex-none gap-2 cursor-not-allowed opacity-60 border-amber-200 dark:border-amber-800"
                          >
                            <Lock className="w-4 h-4" />
                            Chưa mở
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            className={cn(
                              "flex-1 lg:flex-none gap-2 text-white shadow-lg group/btn font-bold",
                              isCompleted
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
                                : isPracticeTab
                                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-500/30",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExamClick(exam);
                            }}
                          >
                            {isCompleted ? "Xem kết quả" : isPracticeTab ? "Luyện tập ngay" : "Vào thi"}
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
          <div className="mt-10 flex items-center justify-center gap-2">
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
                  if (currentPage < 3) pageNum = i;
                  else if (currentPage > pagination.totalPages - 4) pageNum = pagination.totalPages - 5 + i;
                  else pageNum = currentPage - 2 + i;
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

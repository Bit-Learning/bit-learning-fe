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
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
// import { useAllExams } from "../hooks/useExam";
// import { useMyQuizAttempts } from "../hooks/useQuiz";
import type { ExamBriefResponse } from "../../exam/types/exam.type";
import type { QuizAttemptBriefResponse, QuizAttemptStatus } from "../types/quiz.type";

const mockExams: ExamBriefResponse[] = [
  {
    id: 1,
    name: "Kiểm tra Giữa kỳ 1 - Tin học 12",
    code: "TIN12-GK1",
    durationInMinutes: 45,
    totalScore: 10,
    totalQuestions: 30,
    isPublished: true,
    createdAt: "2023-10-15T08:00:00Z",
  },
  {
    id: 2,
    name: "Luyện tập Scratch - Lớp 5 (Cơ bản)",
    code: "SCR-L5",
    durationInMinutes: 30,
    totalScore: 10,
    totalQuestions: 20,
    isPublished: true,
    createdAt: "2023-10-10T08:00:00Z",
  },
  {
    id: 3,
    name: "Kiểm tra 15 phút - Hệ quản trị CSDL",
    code: "TIN10-15P",
    durationInMinutes: 15,
    totalScore: 10,
    totalQuestions: 10,
    isPublished: true,
    createdAt: "2023-10-05T08:00:00Z",
  },
  {
    id: 4,
    name: "Kiểm tra Học kỳ 1 - Tin học 12",
    code: "TIN12-HK1",
    durationInMinutes: 90,
    totalScore: 10,
    totalQuestions: 50,
    isPublished: false,
    createdAt: "2023-12-20T08:00:00Z",
  },
];

const mockAttempts: QuizAttemptBriefResponse[] = [
  {
    id: 1,
    exam: mockExams[2]!,
    status: "SUBMITTED" as QuizAttemptStatus,
    startTime: "2023-10-15T09:00:00Z",
    submittedAt: "2023-10-15T09:12:00Z",
    score: 9.5,
  },
];

// ==================== TYPES ====================
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
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(["all"]));

  // const { data: examsData, isLoading } = useAllExams({ page: 0, size: 20 });
  // const { data: attemptsData } = useMyQuizAttempts({ page: 0, size: 100 });
  // const exams = examsData?.data?.content || [];
  // const attempts = attemptsData?.content || [];

  const exams = mockExams;
  const attempts = mockAttempts;

  const examsWithStatus: ExamWithStatus[] = exams.map((exam) => {
    const attempt = attempts.find((a) => a.exam.id === exam.id && a.status === "SUBMITTED");

    let status: ExamStatusEnum = "OPEN";
    if (!exam.isPublished) {
      status = "UPCOMING";
    } else if (attempt) {
      status = "COMPLETED";
    }

    let icon = <Terminal className="w-8 h-8" />;
    let iconBg = "bg-blue-50 dark:bg-blue-900/30";

    if (status === "COMPLETED") {
      icon = <CheckCircle2 className="w-8 h-8" />;
      iconBg = "bg-emerald-50 dark:bg-emerald-900/30";
    } else if (status === "UPCOMING") {
      icon = <Lock className="w-8 h-8" />;
      iconBg = "bg-slate-100 dark:bg-slate-800";
    } else if (exam.code.includes("SCR")) {
      icon = <Code className="w-8 h-8" />;
      iconBg = "bg-orange-50 dark:bg-orange-900/30";
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
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    },
    UPCOMING: {
      label: "Sắp diễn ra",
      color: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
    },
    COMPLETED: {
      label: "Đã hoàn thành",
      color: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
    },
  };

  const filteredExams = examsWithStatus.filter((exam) => {
    const matchSearch =
      exam.name.toLowerCase().includes(search.toLowerCase()) || exam.code.toLowerCase().includes(search.toLowerCase());

    let matchType = selectedTypes.has("all");
    if (!matchType) {
      if (selectedTypes.has("official")) {
        matchType = exam.code.includes("TIN") || exam.code.includes("GK") || exam.code.includes("HK");
      }
      if (selectedTypes.has("practice")) {
        matchType = matchType || exam.code.includes("SCR") || exam.code.includes("LT");
      }
    }

    return matchSearch && matchType;
  });

  const handleTypeChange = (type: string): void => {
    const newTypes = new Set(selectedTypes);
    if (type === "all") {
      setSelectedTypes(new Set(["all"]));
    } else {
      newTypes.delete("all");
      if (newTypes.has(type)) {
        newTypes.delete(type);
      } else {
        newTypes.add(type);
      }
      if (newTypes.size === 0) {
        newTypes.add("all");
      }
      setSelectedTypes(newTypes);
    }
  };

  const handleExamClick = (exam: ExamWithStatus) => {
    navigate({
      to: "/exams/$examId",
      params: { examId: String(exam.id) },
    });
  };

  const handleViewResult = (examId: number) => {
    const attempt = attempts.find((a) => a.exam.id === examId);
    if (attempt) {
      navigate({
        to: "/quiz-attempts/$attemptId/result",
        params: { attemptId: String(attempt.id) },
      });
    }
  };

  return (
    <div className="bg-white">
      {" "}
      <main className="max-w-360 mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-28 space-y-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Bộ lọc
              </h2>

              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Loại bài thi</h3>
                  <div className="space-y-3">
                    {[
                      { id: "all", label: "Tất cả" },
                      { id: "official", label: "Chính thức" },
                      { id: "practice", label: "Luyện tập" },
                    ].map((type) => (
                      <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedTypes.has(type.id)}
                          onChange={() => handleTypeChange(type.id)}
                          className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5"
                        />
                        <span className="group-hover:text-primary transition-colors">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black mb-1">Informatics Exam Selection</h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Chào Binh, hãy chọn một bài thi để bắt đầu thử thách kiến thức nhé!
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm đề thi..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredExams.map((exam) => {
                const isCompleted = exam.status === "COMPLETED";
                const isUpcoming = exam.status === "UPCOMING";

                return (
                  <Card
                    key={exam.id}
                    className={cn(
                      "group hover:shadow-md transition-all cursor-pointer border-2",
                      isCompleted && "bg-slate-50 dark:bg-slate-900/50 opacity-90",
                    )}
                    onClick={() => !isCompleted && handleExamClick(exam)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div
                            className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
                              exam.iconBg,
                            )}
                          >
                            <div
                              className={cn(
                                isCompleted ? "text-emerald-500" : isUpcoming ? "text-slate-400" : "text-primary",
                              )}
                            >
                              {exam.icon}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-wide",
                                  statusConfig[exam.status].color,
                                )}
                              >
                                {statusConfig[exam.status].label}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wide">
                                {exam.code}
                              </Badge>
                            </div>
                            <h3
                              className={cn(
                                "text-xl font-bold",
                                !isCompleted && "group-hover:text-primary transition-colors",
                              )}
                            >
                              {exam.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 pt-1">
                              <span className="flex items-center gap-1.5">
                                <Timer className="w-4 h-4" />
                                {exam.durationInMinutes} phút
                              </span>
                              <span className="flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4" />
                                {exam.totalQuestions} câu hỏi
                              </span>
                              {isCompleted && exam.lastAttemptScore && (
                                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                  Kết quả: {exam.lastAttemptScore}/10
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <Button
                              variant="outline"
                              className="flex-1 lg:flex-none whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewResult(exam.id);
                              }}
                            >
                              Xem kết quả
                            </Button>
                          ) : isUpcoming ? (
                            <Button
                              variant="outline"
                              isDisabled
                              className="flex-1 lg:flex-none whitespace-nowrap cursor-not-allowed"
                            >
                              Chưa mở
                            </Button>
                          ) : (
                            <Button className="flex-1 lg:flex-none whitespace-nowrap shadow-lg shadow-primary/20">
                              Bắt đầu làm bài
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" className="w-10">
                1
              </Button>
              <Button variant="outline" size="sm" className="w-10">
                2
              </Button>
              <Button variant="outline" size="sm" className="w-10">
                3
              </Button>
              <span className="px-2 text-slate-400">...</span>
              <Button variant="outline" size="sm" className="w-10">
                10
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamListContent;

import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Timer, HelpCircle, Trophy, BookOpen as BookOpenIcon } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { useMyQuizAttempts } from "../queries/useQuiz";
import type { ExamBriefResponse } from "../../exam/types/exam.type";
import { useAllExams } from "@/feature/exam/queries/useExam";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import { Pagination } from "@/shared/components/Pagination";

type TabType = "ALL" | "EXAM" | "PRACTICE";

const TypeBadge = ({ type }: { type?: string }) => {
  if (!type) return null;
  const label = type === "EXAM" ? "Kỳ thi" : "Luyện tập";
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide",
        type === "EXAM" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-600",
      )}
    >
      {label}
    </span>
  );
};

const CodeChip = ({ code }: { code: string }) => (
  <span className="text-[11px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded tracking-wide">{code}</span>
);

const ExamListContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data: examsData, isLoading } = useAllExams({ page: currentPage, size: pageSize });
  const { data: attemptsData } = useMyQuizAttempts({ page: 0, size: 100 });
  const { data: subjects = [] } = useSubjectsList();

  const exams = examsData?.data || [];
  const pagination = examsData?.page;
  const attempts = attemptsData || [];

  const examsWithAttempt = exams
    .filter((exam) => exam.isPublished)
    .map((exam) => {
      const attempt = attempts.find((a) => a.exam.id === exam.id && a.status === "SUBMITTED");
      return { ...exam, lastAttemptScore: attempt?.score, isCompleted: !!attempt };
    });

  const filteredExams = examsWithAttempt.filter((exam) => {
    const matchSearch =
      exam.name.toLowerCase().includes(search.toLowerCase()) || exam.code.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      activeTab === "ALL" || (activeTab === "EXAM" ? !exam.type || exam.type === "EXAM" : exam.type === "PRACTICE");
    const matchSubject = selectedSubject === "all" || exam.subject?.id === selectedSubject;
    return matchSearch && matchTab && matchSubject;
  });

  const handleExamClick = (examId: number) => {
    navigate({ to: "/exams/$examId", params: { examId: String(examId) } });
  };

  const tabs = [
    { key: "ALL" as TabType, label: "Tất cả" },
    { key: "EXAM" as TabType, label: "Kỳ thi" },
    { key: "PRACTICE" as TabType, label: "Luyện tập" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-10 shadow-sm">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Danh sách Kỳ thi</h1>
            <p className="text-slate-500 text-base leading-relaxed">
              Khám phá và tham gia các kỳ thi đánh giá năng lực hoặc luyện tập kiến thức hàng ngày với kho đề thi đa
              dạng.
            </p>
          </div>
          <div className="absolute top-4 right-8 opacity-[0.07] pointer-events-none select-none">
            <svg viewBox="0 0 120 120" className="w-36 h-36 text-blue-600 fill-current">
              <path d="M60 10 L110 35 L60 60 L10 35 Z" />
              <path d="M20 42 L20 75 Q60 95 100 75 L100 42 L60 67 Z" />
              <rect x="108" y="35" width="4" height="30" rx="2" />
              <circle cx="110" cy="67" r="5" />
            </svg>
          </div>
        </div>

        <div className="flex gap-6 items-end w-full">
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Loại hình</span>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(0);
                  }}
                  className={cn(
                    "px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
                    activeTab === tab.key ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tìm kiếm</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(0);
                }}
                placeholder="Tên hoặc mã đề thi..."
                className="w-full pl-9 pr-4 h-9 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Môn học</span>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value === "all" ? "all" : Number(e.target.value));
                setCurrentPage(0);
              }}
              className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
            >
              <option value="all">Tất cả môn học</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-60 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">Không tìm thấy đề thi nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
              const isPractice = exam.type === "PRACTICE";
              const accentBorder = isPractice ? "border-l-orange-400" : "border-l-blue-500";
              const iconColor = isPractice ? "text-orange-500" : "text-blue-600";
              const hoverTitle = isPractice ? "group-hover:text-orange-500" : "group-hover:text-blue-600";

              return (
                <div
                  key={exam.id}
                  onClick={() => handleExamClick(exam.id)}
                  className={cn(
                    "group bg-white border border-slate-200 border-l-4 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200",
                    accentBorder,
                  )}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <CodeChip code={exam.code} />
                      <TypeBadge type={exam.type} />
                    </div>

                    <h3
                      className={cn(
                        "h-12 text-lg font-bold text-slate-900 mb-5 leading-snug transition-colors",
                        hoverTitle,
                      )}
                    >
                      {exam.name}
                    </h3>

                    <div className="space-y-2.5">
                      {exam.subject && (
                        <div className="flex items-center gap-2.5 text-sm text-slate-600">
                          <BookOpenIcon className={cn("w-4 h-4 shrink-0", iconColor)} />
                          <span>
                            Môn học: <span className="font-semibold text-slate-800">{exam.subject.name}</span>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Timer className={cn("w-4 h-4 shrink-0", iconColor)} />
                        <span>
                          Thời gian: <span className="font-semibold text-slate-800">{exam.durationInMinutes} phút</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-600">
                        <HelpCircle className={cn("w-4 h-4 shrink-0", iconColor)} />
                        <span>
                          Số câu: <span className="font-semibold text-slate-800">{exam.totalQuestions} câu</span>
                        </span>
                      </div>
                      {exam.isCompleted && exam.lastAttemptScore !== undefined && (
                        <div className="flex items-center gap-2.5 text-sm text-emerald-600">
                          <Trophy className="w-4 h-4 shrink-0" />
                          <span className="font-semibold">
                            Điểm: {exam.lastAttemptScore}/{exam.totalScore}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày tạo</span>
                      <span className="text-xs font-medium text-slate-700 mt-0.5">
                        {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExamClick(exam.id);
                      }}
                      className={cn(
                        "cursor-pointer px-5 py-2 rounded-lg text-sm font-bold text-white shadow transition-all active:scale-95",
                        exam.isCompleted ? "bg-emerald-500 hover:bg-emerald-600" : "bg-orange-500 hover:bg-orange-600",
                      )}
                    >
                      {exam.isCompleted ? "Xem kết quả" : "Tham gia"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-6">
            <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </main>
    </div>
  );
};

export default ExamListContent;

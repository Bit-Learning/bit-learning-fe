import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Timer, HelpCircle } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { useAllExams } from "@/feature/exam/queries/useExam";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import { Pagination } from "@/shared/components/Pagination";

type TabType = "ALL" | "EXAM" | "PRACTICE";

const TypeBadge = ({ type }: { type?: string }) => {
  if (!type) return null;
  const label = type === "EXAM" ? "Đề thi" : "Luyện tập";
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-sm font-bold tracking-wide",
        type === "EXAM" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-600",
      )}
    >
      {label}
    </span>
  );
};

const CodeChip = ({ code }: { code: string }) => (
  <span className="text-sm font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded tracking-wide">{code}</span>
);

const ExamListContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data: examsData, isLoading } = useAllExams({
    page: currentPage,
    size: pageSize,
  });
  const { data: subjects = [] } = useSubjectsList();

  const exams = examsData?.data || [];
  const pagination = examsData?.page;

  const filteredExams = exams
    .filter((exam) => exam.isPublished)
    .filter((exam) => {
      const matchSearch =
        exam.name.toLowerCase().includes(search.toLowerCase()) ||
        exam.code.toLowerCase().includes(search.toLowerCase());
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
    { key: "EXAM" as TabType, label: "Đề thi" },
    { key: "PRACTICE" as TabType, label: "Luyện tập" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="overflow-x-hidden">
        <div className="relative overflow-hidden h-60 md:h-72 flex items-end -mx-5">
          <img src="exam.png" alt="hero" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>
      <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-md text-gray-500 flex items-center">
            <span onClick={() => navigate({ to: "/" })} className="hover:text-blue-600 cursor-pointer">
              Trang chủ
            </span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-blue-600 font-medium">Danh sách đề thi</span>
          </nav>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16 space-y-8">
        <div className="flex gap-6 items-end w-full">
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Loại hình</span>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(0);
                  }}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm font-semibold rounded-md transition-all",
                    activeTab === tab.key ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Tìm kiếm</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(0);
                }}
                placeholder="Tên hoặc mã đề thi..."
                className="w-full pl-12 pr-4 py-2 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Môn học</span>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value === "all" ? "all" : Number(e.target.value));
                setCurrentPage(0);
              }}
              className="px-3 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-35"
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
              const iconColor = isPractice ? "text-orange-500" : "text-blue-600";

              return (
                <div
                  key={exam.id}
                  onClick={() => handleExamClick(exam.id)}
                  className={cn(
                    "group bg-white border-slate-200 border rounded-md p-6 flex flex-col justify-between shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200",
                  )}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <CodeChip code={exam.code} />
                      <TypeBadge type={exam.type} />
                    </div>

                    <h3 className={cn("h-12 text-lg font-bold text-slate-900 mb-5 leading-snug transition-colors")}>
                      {exam.name}
                    </h3>

                    <div className="space-y-2.5">
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
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Ngày tạo</span>
                      <span className="text-sm font-medium text-slate-700 mt-0.5">
                        {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExamClick(exam.id);
                      }}
                      className={cn(
                        "cursor-pointer px-5 border py-2 rounded-lg text-sm font-bold shadow transition-all active:scale-95 border-blue-500 hover:bg-blue-100 text-blue-600 ",
                      )}
                    >
                      Làm bài
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

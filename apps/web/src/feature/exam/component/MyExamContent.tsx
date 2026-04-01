import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Eye, Edit, Trash2, Clock, FileText, Filter } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyExams, useDeleteExam } from "../queries/useExam";
import { Button } from "@workspace/ui/components/Button";
import { Pagination } from "@/shared/components/Pagination";
import type { ExamType } from "../types/exam.type";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";

const TYPE_LABELS: Record<ExamType, string> = {
  EXAM: "Chính thức",
  PRACTICE: "Luyện tập",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const MyExamsContent: React.FC = () => {
  const navigate = useNavigate();

  // UI state
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState<ExamType | "">("");
  const [filterSubjectId, setFilterSubjectId] = useState<number | "">("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // Debounce search 400ms trước khi gửi lên server
  const debouncedSearch = useDebounce(searchInput, 400);

  // Reset về page 0 khi search thay đổi
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const { data: response, isLoading } = useMyExams({
    page,
    size,
    search: debouncedSearch || undefined,
  });
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();
  const { data: subjects } = useSubjectsList();

  const allExams = response?.data || [];
  const pagination = response?.page;

  // Type và subject filter client-side trên trang hiện tại
  const exams = useMemo(() => {
    return allExams.filter((e) => {
      if (filterType && e.type !== filterType) return false;
      if (filterSubjectId && e.subject?.id !== filterSubjectId) return false;
      return true;
    });
  }, [allExams, filterType, filterSubjectId]);

  const hasActiveFilter = !!searchInput || !!filterType || !!filterSubjectId;

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn xóa đề thi này không?")) return;
    deleteExam(id);
  };

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Đã xuất bản
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Nháp
      </span>
    );
  };

  const getTypeBadge = (type?: ExamType) => {
    if (!type) return null;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
          type === "EXAM"
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50"
            : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50"
        }`}
      >
        {TYPE_LABELS[type]}
      </span>
    );
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen dark:bg-slate-950">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Đề thi của tôi</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Quản lý các đề thi bạn đã tạo cho học sinh của mình.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/mentor/question/generate-from-questions" })}
          className="cursor-pointer bg-blue-700 hover:bg-blue-500 text-white px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
        >
          <Plus className="h-5 w-5" />
          Tạo đề thi mới
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
            placeholder="Tìm kiếm theo tên hoặc mã đề..."
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {subjects && subjects.length > 0 && (
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value ? Number(e.target.value) : "")}
              className="px-3 py-3.5 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-37.5"
            >
              <option value="">Tất cả môn</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ExamType | "")}
            className="px-3 py-3.5 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-35"
          >
            <option value="">Tất cả loại</option>
            <option value="EXAM">Chính thức</option>
            <option value="PRACTICE">Luyện tập</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={() => {
                setSearchInput("");
                setFilterType("");
                setFilterSubjectId("");
              }}
              className="text-xs text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      <div className="bg-white my-6 rounded-md border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : !exams.length ? (
          <div className="p-16 text-center">
            <div className="flex flex-col items-center">
              <FileText className="h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                {hasActiveFilter ? "Không tìm thấy đề thi" : "Chưa có đề thi nào"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {hasActiveFilter ? "Thử thay đổi bộ lọc" : "Bắt đầu bằng cách tạo đề thi đầu tiên"}
              </p>
              {!hasActiveFilter && (
                <Button
                  onClick={() => navigate({ to: "/mentor/question/generate-from-questions" })}
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-5 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Tạo đề thi mới
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Thông tin đề thi
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Mã đề
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-center">
                      Thang điểm
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-center">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => navigate({ to: `/mentor/exam/${exam.id}` })}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{exam.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTypeBadge(exam.type)}
                          {exam.subject && (
                            <span className="text-xs text-slate-400 dark:text-slate-500">{exam.subject.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-slate-300 rounded-md text-xs font-semibold">
                          {exam.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-4 w-4 opacity-70" />
                          {exam.durationInMinutes} ph
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">
                        {exam.totalScore}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(exam.isPublished)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({ to: `/mentor/exam/${exam.id}` });
                            }}
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
                            title="Xem"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: mở modal edit exam
                            }}
                            className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
                            title="Sửa"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, exam.id)}
                            disabled={isDeleting}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyExamsContent;

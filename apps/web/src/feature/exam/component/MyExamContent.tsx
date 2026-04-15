import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Eye, Edit, Trash2, Clock, FileText, X, Loader2 } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyExams, useDeleteExam, useUpdateExam } from "../queries/useExam";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import { Button } from "@workspace/ui/components/Button";
import { Pagination } from "@/shared/components/Pagination";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";
import type { ExamType, ExamBriefResponse, ExamUpdateRequest } from "../types/exam.type";

const TYPE_LABELS: Record<ExamType, string> = {
  EXAM: "Đề thi",
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

interface EditExamModalProps {
  exam: ExamBriefResponse;
  onClose: () => void;
}

const EditExamModal: React.FC<EditExamModalProps> = ({ exam, onClose }) => {
  const { mutate: updateExam, isPending } = useUpdateExam();

  const [name, setName] = useState(exam.name);
  const [code, setCode] = useState(exam.code);
  const [type, setType] = useState<ExamType>(exam.type ?? "EXAM");
  const [durationInMinutes, setDurationInMinutes] = useState(exam.durationInMinutes);
  const [totalScore, setTotalScore] = useState(exam.totalScore);
  const [enrollKey, setEnrollKey] = useState(exam.enrollKey ?? "");

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) return;

    const data: ExamUpdateRequest = {
      name: name.trim(),
      code: code.trim(),
      type,
      durationInMinutes,
      totalScore,
      enrollKey: enrollKey.trim() || undefined,
    };

    updateExam({ id: exam.id, data }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chỉnh sửa đề thi</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tên đề thi <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên đề thi"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mã đề <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm uppercase outline-none focus:ring-2 focus:ring-primary transition-all"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Mã đề"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Loại đề thi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ExamType)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="EXAM">Chính thức</option>
                <option value="PRACTICE">Luyện tập</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Thời gian (phút)
              </label>
              <input
                type="number"
                min={1}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                value={durationInMinutes}
                onChange={(e) => setDurationInMinutes(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tổng điểm</label>
              <input
                type="number"
                min={0}
                step={0.5}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                value={totalScore}
                onChange={(e) => setTotalScore(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mật khẩu vào thi
              {type === "EXAM" ? (
                <span className="text-red-500 ml-1">*</span>
              ) : (
                <span className="text-slate-400 text-sm font-normal ml-1">(tuỳ chọn)</span>
              )}
            </label>
            <input
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              value={enrollKey}
              onChange={(e) => setEnrollKey(e.target.value)}
              placeholder={type === "EXAM" ? "Bắt buộc với đề chính thức" : "Để trống nếu không cần mật khẩu"}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <Button
            onClick={handleSubmit}
            isDisabled={isPending || !name.trim() || !code.trim() || (type === "EXAM" && !enrollKey.trim())}
            className="gap-2 bg-primary hover:bg-blue-700 text-white"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MyExamsContent: React.FC = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState<ExamType | "">("");
  const [filterSubjectId, setFilterSubjectId] = useState<number | "">("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [editingExam, setEditingExam] = useState<ExamBriefResponse | null>(null);
  const [deletingExam, setDeletingExam] = useState<ExamBriefResponse | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const { data: response, isLoading } = useMyExams({ page, size, search: debouncedSearch || undefined });
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();
  const { data: subjects } = useSubjectsList();

  const allExams = response?.data || [];
  const pagination = response?.page;

  const exams = useMemo(() => {
    return allExams.filter((e) => {
      if (filterType && e.type !== filterType) return false;
      if (filterSubjectId && e.subject?.id !== filterSubjectId) return false;
      return true;
    });
  }, [allExams, filterType, filterSubjectId]);

  const hasActiveFilter = !!searchInput || !!filterType || !!filterSubjectId;

  const handleConfirmDelete = () => {
    if (!deletingExam) return;
    deleteExam(deletingExam.id, { onSuccess: () => setDeletingExam(null) });
  };

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Đã xuất bản
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Nháp
      </span>
    );
  };

  const getTypeBadge = (type?: ExamType) => {
    if (!type) return null;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-bold ${
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
          <h1 className="text-3xl font-bold dark:text-white">Danh sách đề thi của tôi</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">
            Quản lý các đề thi bạn đã tạo cho học sinh của mình.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/mentor/exam/generate-from-questions" })}
          className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
        >
          <Plus className="h-5 w-5" />
          Tạo đề thi mới
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
            <option value="EXAM">Đề thi</option>
            <option value="PRACTICE">Luyện tập</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={() => {
                setSearchInput("");
                setFilterType("");
                setFilterSubjectId("");
              }}
              className="text-sm text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      <div className="bg-white my-6 rounded-md border border-slate-300 overflow-hidden">
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
                  onClick={() => navigate({ to: "/mentor/exam/generate-from-questions" })}
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
                    <th className="px-6 py-4 text-md font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Thông tin đề thi
                    </th>
                    <th className="px-6 py-4 text-md font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Mã đề
                    </th>
                    <th className="px-6 py-4 text-md font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-md font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-center">
                      Thang điểm
                    </th>
                    <th className="px-6 py-4 text-md font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-md font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-center">
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
                            <span className="text-sm text-slate-400 dark:text-slate-500">{exam.subject.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-slate-300 rounded-md text-sm font-semibold">
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
                            className="cursor-pointer p-2 text-slate-600 hover:text-primary dark:hover:text-blue-600 transition-colors"
                            title="Xem"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingExam(exam);
                            }}
                            className="cursor-pointer p-2 text-slate-600 hover:text-primary dark:hover:text-blue-600 transition-colors"
                            title="Sửa"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingExam(exam);
                            }}
                            className="cursor-pointer p-2 text-slate-600 hover:text-primary dark:hover:text-red-600 transition-colors"
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

      {editingExam && <EditExamModal exam={editingExam} onClose={() => setEditingExam(null)} />}

      <DeleteConfirmModal
        open={!!deletingExam}
        onClose={() => setDeletingExam(null)}
        onConfirm={handleConfirmDelete}
        itemName={deletingExam?.name}
        isPending={isDeleting}
      />
    </div>
  );
};

export default MyExamsContent;

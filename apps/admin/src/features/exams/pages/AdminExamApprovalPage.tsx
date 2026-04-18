import { useState } from "react";
import {
  Search,
  CheckSquare,
  Square,
  Check,
  X,
  Eye,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useGetPendingExams, useApproveExam, useRejectExam } from "../queries/useExam";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { ExamBriefResponse, ExamSearchParams, ExamType } from "../types/exam.type";
import { toast } from "@/components/Sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import { ExamDetailModal } from "../components/ExamDetailModal";

const TYPE_LABELS: Record<ExamType, { label: string; className: string }> = {
  EXAM: {
    label: "Đề thi",
    className:
      "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  PRACTICE: {
    label: "Luyện tập",
    className:
      "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
  },
};
interface AdminExamApprovalProps {
  initialPage?: number;
}

const AdminExamApprovalPage: React.FC<AdminExamApprovalProps> = ({ initialPage = 0 }) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [page, setPage] = useState(initialPage);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [detailExamId, setDetailExamId] = useState<number | null>(null);
  const [showBatchRejectForm, setShowBatchRejectForm] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState("");

  const params: ExamSearchParams = { page, size: 20, sort: "createdAt,desc", search: search || undefined };

  const { data: response, isLoading } = useGetPendingExams(params);
  const approveMutation = useApproveExam();
  const rejectMutation = useRejectExam();

  const exams: ExamBriefResponse[] = response?.data || [];
  const totalPages: number = response?.page?.totalPages || 0;
  const totalElements: number = response?.page?.totalElements || 0;

  const filteredExams = exams.filter((e) => !filterType || e.type === filterType);

  const allSelected = filteredExams.length > 0 && filteredExams.every((e) => selectedIds.has(e.id));
  const someSelected = filteredExams.some((e) => selectedIds.has(e.id));

  const toggleSelectAll = () => {
    allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredExams.map((e) => e.id)));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBatchApprove = () => {
    approveMutation.mutate(Array.from(selectedIds), { onSuccess: () => setSelectedIds(new Set()) });
  };

  const handleBatchReject = () => {
    if (!batchRejectReason.trim()) {
      toast.error({ title: "Lỗi", description: "Vui lòng nhập lý do từ chối" });
      return;
    }
    rejectMutation.mutate(
      { examIds: Array.from(selectedIds), rejectReason: batchRejectReason.trim() },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
          setShowBatchRejectForm(false);
          setBatchRejectReason("");
        },
      },
    );
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="p-6 lg:p-8 max-w-350 mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Phê duyệt đề thi
              </h1>
              {totalElements > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {totalElements} chờ duyệt
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400">Xem xét và phê duyệt đề thi từ giảng viên</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-5 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                placeholder="Tìm kiếm đề thi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Loại: Tất cả</option>
                <option value="EXAM">Đề thi</option>
                <option value="PRACTICE">Luyện tập</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
              {showBatchRejectForm ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Từ chối {selectedIds.size} đề thi — nhập lý do:
                  </p>
                  <textarea
                    value={batchRejectReason}
                    onChange={(e) => setBatchRejectReason(e.target.value)}
                    placeholder="Mô tả lý do từ chối..."
                    rows={2}
                    className="w-full text-sm rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none placeholder:text-slate-400"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowBatchRejectForm(false);
                        setBatchRejectReason("");
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Hủy
                    </button>
                    <Button
                      onClick={handleBatchReject}
                      disabled={rejectMutation.isPending}
                      className="cursor-pointer px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium flex items-center gap-2"
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Xác nhận từ chối
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Đã chọn <span className="text-blue-600 font-bold">{selectedIds.size}</span> đề thi
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    Bỏ chọn
                  </button>
                  <Button
                    onClick={() => setShowBatchRejectForm(true)}
                    className="cursor-pointer px-4 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-sm font-medium flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Từ chối
                  </Button>
                  <Button
                    onClick={handleBatchApprove}
                    disabled={approveMutation.isPending}
                    className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-2"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Phê duyệt tất cả
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800"
                  >
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-24 rounded" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                        <th className="px-4 py-3.5 w-10">
                          <button
                            onClick={toggleSelectAll}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {allSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : someSelected ? (
                              <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
                                <div className="w-2 h-0.5 bg-blue-600 rounded" />
                              </div>
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Đề thi
                        </th>
                        <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Mã đề
                        </th>
                        <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Tác giả
                        </th>
                        <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Ngày gửi
                        </th>
                        <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredExams.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center">
                            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-300 dark:text-emerald-700 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                              {search || filterType
                                ? "Không tìm thấy đề thi phù hợp"
                                : "Không có đề thi nào chờ phê duyệt!"}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredExams.map((exam) => {
                          const isSelected = selectedIds.has(exam.id);
                          const typeConf = TYPE_LABELS[exam.type];
                          return (
                            <tr
                              key={exam.id}
                              className={cn(
                                "transition-colors",
                                isSelected
                                  ? "bg-blue-50/50 dark:bg-blue-950/10"
                                  : "hover:bg-slate-50/80 dark:hover:bg-slate-800/20",
                              )}
                            >
                              <td className="px-4 py-3.5">
                                <button
                                  onClick={() => toggleSelect(exam.id)}
                                  className="text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-3.5">
                                <button
                                  onClick={() => setDetailExamId(exam.id)}
                                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
                                >
                                  {exam.name}
                                </button>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                      typeConf.className,
                                    )}
                                  >
                                    {typeConf.label}
                                  </span>
                                  {exam.subject && <span className="text-xs text-slate-400">{exam.subject.name}</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-slate-300 rounded-md text-xs font-semibold font-mono">
                                  {exam.code}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                  {exam.createdBy?.firstName + " " + exam.createdBy?.lastName}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {format(new Date(exam.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() => setDetailExamId(exam.id)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                    title="Xem chi tiết"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => approveMutation.mutate([exam.id])}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                                    title="Phê duyệt"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedIds(new Set([exam.id]));
                                      setShowBatchRejectForm(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                    title="Từ chối"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-sm text-slate-500">{totalElements} đề thi chờ duyệt</span>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ExamDetailModal
        examId={detailExamId}
        onClose={() => setDetailExamId(null)}
        onApprove={(ids) =>
          approveMutation.mutate(ids, {
            onSuccess: () => {
              setDetailExamId(null);
            },
          })
        }
        onReject={(ids, reason) =>
          rejectMutation.mutate(
            { examIds: ids, rejectReason: reason },
            {
              onSuccess: () => {
                setDetailExamId(null);
              },
            },
          )
        }
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </>
  );
};

export default AdminExamApprovalPage;

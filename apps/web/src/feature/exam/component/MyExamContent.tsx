import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  FileText,
  X,
  Loader2,
  CheckSquare,
  Square,
  Send,
  ChevronDown,
} from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { Button } from "@workspace/ui/components/Button";
import { Pagination } from "@/shared/components/Pagination";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";
import { cn } from "@workspace/ui/lib/utils";
import { useMyExams, useDeleteExam, useUpdateExam, useRequestPublishExam } from "../queries/useExam";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import type { ApprovalStatus, ExamBriefResponse, ExamType, ExamUpdateRequest } from "../types/exam.type";

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

const APPROVAL_CONFIG: Record<ApprovalStatus, { label: string; className: string }> = {
  NONE: {
    label: "Chưa gửi",
    className:
      "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
  PENDING: {
    label: "Chờ duyệt",
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  },
  APPROVED: {
    label: "Đã duyệt",
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  REJECTED: {
    label: "Bị từ chối",
    className:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
  },
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
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Mã đề"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Loại</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ExamType)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="EXAM">Chính thức</option>
                  <option value="PRACTICE">Luyện tập</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
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
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};

const MyExamsContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterSubjectId, setFilterSubjectId] = useState<string>("");
  const [filterApproval, setFilterApproval] = useState<string>("");
  const [page, setPage] = useState(0);
  const [editingExam, setEditingExam] = useState<ExamBriefResponse | null>(null);
  const [deletingExam, setDeletingExam] = useState<ExamBriefResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const debouncedSearch = useDebounce(searchInput, 400);
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();
  const requestPublishMutation = useRequestPublishExam();

  const { data: subjectsData } = useSubjectsList();
  const subjects = subjectsData || [];

  const { data: examsData, isLoading } = useMyExams({
    page,
    size: 20,
    sort: "createdAt,desc",
    search: debouncedSearch || undefined,
  });

  const allExams: ExamBriefResponse[] = examsData?.data || [];
  const pagination = examsData?.page;

  const exams = allExams.filter((e) => {
    const matchType = !filterType || e.type === filterType;
    const matchSubject = !filterSubjectId || String(e.subject?.id) === filterSubjectId;
    const matchApproval = !filterApproval || e.approvalStatus === filterApproval;
    return matchType && matchSubject && matchApproval;
  });

  const hasActiveFilter = !!searchInput || !!filterType || !!filterSubjectId || !!filterApproval;

  const allSelected = exams.length > 0 && exams.every((e) => selectedIds.has(e.id));
  const someSelected = exams.some((e) => selectedIds.has(e.id));

  const toggleSelectAll = () => {
    allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(exams.map((e) => e.id)));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRequestPublish = async () => {
    await requestPublishMutation.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleConfirmDelete = () => {
    if (!deletingExam) return;
    deleteExam(deletingExam.id, { onSuccess: () => setDeletingExam(null) });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-6 lg:p-8 mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Đề thi của tôi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý và theo dõi các đề thi đã tạo</p>
          </div>
          <Button
            onClick={() => navigate({ to: "/mentor/exam/generate-from-questions" })}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Tạo đề thi mới
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
              placeholder="Tìm kiếm đề thi..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(0);
                }}
                className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Loại: Tất cả</option>
                <option value="EXAM">Đề thi</option>
                <option value="PRACTICE">Luyện tập</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {subjects.length > 0 && (
              <div className="relative">
                <select
                  value={filterSubjectId}
                  onChange={(e) => {
                    setFilterSubjectId(e.target.value);
                    setPage(0);
                  }}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Môn: Tất cả</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            )}
            <div className="relative">
              <select
                value={filterApproval}
                onChange={(e) => {
                  setFilterApproval(e.target.value);
                  setPage(0);
                }}
                className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Duyệt: Tất cả</option>
                <option value="NONE">Chưa gửi</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {hasActiveFilter && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setFilterType("");
                  setFilterSubjectId("");
                  setFilterApproval("");
                }}
                className="text-sm text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Đã chọn <span className="font-bold">{selectedIds.size}</span> đề thi
            </span>
            <div className="flex-1" />
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Bỏ chọn
            </button>
            <Button
              onClick={handleRequestPublish}
              isDisabled={requestPublishMutation.isPending}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {requestPublishMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu duyệt"}
            </Button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !exams.length ? (
            <div className="p-16 text-center">
              <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                {hasActiveFilter ? "Không tìm thấy đề thi" : "Chưa có đề thi nào"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {hasActiveFilter ? "Thử thay đổi bộ lọc" : "Bắt đầu bằng cách tạo đề thi đầu tiên"}
              </p>
              {!hasActiveFilter && (
                <Button
                  onClick={() => navigate({ to: "/mentor/exam/generate-from-questions" })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Tạo đề thi mới
                </Button>
              )}
            </div>
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
                            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <div className="w-2 h-0.5 bg-blue-600 rounded" />
                            </div>
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Thông tin đề thi
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Mã đề
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Điểm
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {exams.map((exam) => {
                      const isSelected = selectedIds.has(exam.id);
                      const approval = APPROVAL_CONFIG[exam.approvalStatus];
                      const typeConf = TYPE_LABELS[exam.type];
                      return (
                        <tr
                          key={exam.id}
                          onClick={() => navigate({ to: `/mentor/exam/${exam.id}` })}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isSelected
                              ? "bg-blue-50/60 dark:bg-blue-950/20"
                              : "hover:bg-slate-50/80 dark:hover:bg-slate-800/30",
                          )}
                        >
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
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
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{exam.name}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                  typeConf.className,
                                )}
                              >
                                {typeConf.label}
                              </span>
                              {exam.subject && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">{exam.subject.name}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-slate-300 rounded-md text-xs font-semibold font-mono">
                              {exam.code}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Clock className="h-4 w-4 opacity-70" />
                              {exam.durationInMinutes} ph
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                            {exam.totalScore}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                approval.className,
                              )}
                            >
                              {approval.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => navigate({ to: `/mentor/exam/${exam.id}` })}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                title="Xem"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingExam(exam)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                                title="Sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeletingExam(exam)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-500">{pagination.totalElements} đề thi</span>
                  <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
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
